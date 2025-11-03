"use client";
import { ZodNull } from "zod/v3";
import { createClient } from "./supabase/client";
import { KontakType, ListKontakType } from "./types/kontak";
import { MessageType } from "./types/message";
import {
  PostgrestMaybeSingleResponse,
  PostgrestResponse,
} from "@supabase/supabase-js";
import { BlockKontakType } from "./types/block_kontak";
import { useEffect } from "react";
import { db } from "./db";

export function generateTenDigit(): string {
  return Math.floor(Math.random() * 1_000_000_0000) // 0 s/d 9,999,999,999
    .toString()
    .padStart(10, "0");
}

export type Chat = KontakType & {
  lastMessage: string | null;
  lastMessageTime: string | null;
};

export async function getRecentContacts(
  listKontak: ListKontakType[],
  currentUserId: string, // id user yang sedang login
): Promise<ListKontakType[]> {
  const supabase = createClient();
  // Ambil semua pesan yang terkait dengan kontak-kontak ini
  const riloIds = listKontak.map((k) => k.rilo_id);

  const { data: messages, error } = await supabase
    .from("pesan")
    .select("*")
    .or(riloIds.map((id) => `from.eq.${id},to.eq.${id}`).join(","));

  if (error) {
    console.error("Error fetching messages:", error);
    return [];
  }

  if (!messages) return [];

  // Ambil pesan terakhir per kontak
  const lastMessageMap: Record<string, MessageType> = {};

  (messages as MessageType[]).forEach((msg) => {
    // cari siapa lawan bicara (bukan currentUser)
    const partnerId = msg.from === currentUserId ? msg.to : msg.from;

    // update hanya kalau belum ada atau created_at lebih baru
    if (
      !lastMessageMap[partnerId] ||
      new Date(msg.created_at) > new Date(lastMessageMap[partnerId].created_at)
    ) {
      lastMessageMap[partnerId] = msg;
    }
  });

  // urutkan kontak berdasarkan pesan terakhir
  const sorted = [...listKontak].sort((a, b) => {
    const msgA = lastMessageMap[a.rilo_id];
    const msgB = lastMessageMap[b.rilo_id];

    if (!msgA) return 1;
    if (!msgB) return -1;

    return (
      new Date(msgB.created_at).getTime() - new Date(msgA.created_at).getTime()
    );
  });

  return sorted;
}

export type ChatContact = {
  rilo_id: string;
  nama_kontak: string;
  lastMessage: string | null;
  lastMessageTime: string | null;
  unreadCount: number;
};

export function normalizeDate(date: string | Date) {
  return new Date(date).getTime();
}

export function mergeChatWithContacts(
  messages: MessageType[],
  kontak: ListKontakType[],
  currentUserId: string,
  lastReadMap: Record<string, string>, // key = rilo_id, value = ISO string last read
  activeChatId?: string,
): ChatContact[] {
  const normalize = (s: string) => s.replace(/\s+/g, "").replace(/^\+/, "");
  const curKey = normalize(currentUserId);

  const contactMap = new Map<string, ListKontakType>();
  for (const k of kontak) {
    contactMap.set(normalize(k.rilo_id), k);
  }

  const lastMessageMap = new Map<
    string,
    MessageType & { partnerRaw: string }
  >();
  const unreadCountMap = new Map<string, number>();

  for (const msg of messages) {
    const fromN = normalize(msg.from);
    const toN = normalize(msg.to);

    if (fromN !== curKey && toN !== curKey) continue;
    if (fromN === curKey && toN === curKey) continue;

    const partnerRaw = fromN === curKey ? msg.to : msg.from;
    const partnerKey = normalize(partnerRaw);

    // update last message
    const existing = lastMessageMap.get(partnerKey);
    if (
      !existing ||
      Date.parse(msg.created_at) > Date.parse(existing.created_at)
    ) {
      lastMessageMap.set(partnerKey, { ...msg, partnerRaw });
    }

    // hitung unread
    const lastReadTime = lastReadMap[partnerKey] ?? "1970-01-01T00:00:00.000Z";
    const msgTime = normalizeDate(msg.created_at);
    const readTime = normalizeDate(lastReadTime);

    if (msgTime > readTime + 3000 && msg.from !== curKey) {
      unreadCountMap.set(partnerKey, (unreadCountMap.get(partnerKey) ?? 0) + 1);
    }
  }

  const result: ChatContact[] = [];

  // helper untuk format lastMessage
  const formatLastMessage = (msg?: MessageType | null) => {
    if (!msg) return null;

    const isFromMe = normalize(msg.from) === curKey;
    const prefix = isFromMe ? "You: " : "";

    if (msg.delete) return `${prefix}Pesan dihapus`;
    if (msg.pesan.length > 20) return `${prefix}${msg.pesan.slice(0, 20)}...`;
    return `${prefix}${msg.pesan}`;
  };

  // semua kontak
  for (const c of kontak) {
    const key = normalize(c.rilo_id);
    const lastMsg = lastMessageMap.get(key);

    result.push({
      rilo_id: c.rilo_id,
      nama_kontak: c.nama_kontak,
      lastMessage: formatLastMessage(lastMsg) ?? null,
      lastMessageTime: lastMsg?.created_at ?? null,
      unreadCount:
        activeChatId && normalize(activeChatId) === key
          ? 0
          : (unreadCountMap.get(key) ?? 0),
    });
  }

  // kontak dari chat asing (tidak ada di phonebook)
  for (const [key, lastMsg] of lastMessageMap) {
    if (!contactMap.has(key)) {
      result.push({
        rilo_id: lastMsg.partnerRaw,
        nama_kontak: lastMsg.partnerRaw,
        lastMessage: formatLastMessage(lastMsg) ?? null,
        lastMessageTime: lastMsg.created_at ?? null,
        unreadCount:
          activeChatId && normalize(activeChatId) === key
            ? 0
            : (unreadCountMap.get(key) ?? 0),
      });
    }
  }

  result.sort((a, b) => {
    if (!a.lastMessageTime && !b.lastMessageTime) return 0;
    if (!a.lastMessageTime) return 1;
    if (!b.lastMessageTime) return -1;
    return Date.parse(b.lastMessageTime) - Date.parse(a.lastMessageTime);
  });

  return result;
}

export function filterMessagesByBlock(
  messages: MessageType[],
  currentUser: string,
  blocks: BlockKontakType[],
): MessageType[] {
  // Jika tidak ada blok sama sekali, kembalikan semua pesan
  if (!blocks || blocks.length === 0) return messages;

  // Buat map user yang punya relasi blok dengan currentUser
  const relatedBlocks = blocks.filter(
    (b) => b.user === currentUser || b.to_user === currentUser,
  );

  // Jika currentUser tidak terlibat dalam blok apa pun
  if (relatedBlocks.length === 0) return messages;

  // Filter pesan berdasarkan waktu blok dan siapa yang memblok siapa
  return messages.filter((msg) => {
    // Cari apakah pesan ini melibatkan user yang pernah diblok/diblokir
    const block = relatedBlocks.find(
      (b) =>
        (b.user === msg.from && b.to_user === msg.to) ||
        (b.user === msg.to && b.to_user === msg.from),
    );

    // Kalau tidak ada blok yang relevan dengan pesan ini → tampilkan
    if (!block) return true;

    const blockTime = new Date(block.created_at).getTime();
    const msgTime = new Date(msg.created_at).getTime();

    // Logika filtering:
    // 1️⃣ Jika currentUser adalah yang diblok → dia tidak bisa lihat pesan baru dari pemblokir
    if (block.user !== currentUser && block.to_user === currentUser) {
      return msgTime <= blockTime || msg.from === currentUser;
    }

    // 2️⃣ Jika currentUser yang memblok → dia tidak bisa lihat pesan baru dari target
    if (block.user === currentUser) {
      return msgTime <= blockTime || msg.from === currentUser;
    }

    // Default: tampilkan jika tidak melibatkan blok
    return true;
  });
}

export function useSafeAsyncEffect(
  effect: (isMounted: () => boolean) => void | Promise<void>,
  deps: any[],
) {
  useEffect(() => {
    let active = true;
    const isMounted = () => active;

    effect(isMounted);
    return () => {
      active = false;
    };
  }, deps);
}

export async function updateLastRead(user_id: string, contact_id: string) {
  const supabase = createClient();
  const { error } = await supabase.from("last_read").upsert(
    {
      user_id,
      contact_id,
      last_read_at: new Date().toISOString(),
    },
    {
      onConflict: "user_id, contact_id",
    },
  );
  if (error) {
    console.error(error);
  }
}

export function generateFiveDigitNumber(): number {
  return Math.floor(10000 + Math.random() * 90000);
}

export async function sendMessage(user_id: string, to: string, pesan: string, images?: File) {
  const supabase = createClient();
  const { data: DataBlockKontak } = (await supabase
    .from("block_kontak")
    .select("*")) as PostgrestResponse<BlockKontakType>;
  const blockKontak = DataBlockKontak?.find(
    (val) =>
      (val.user === user_id && val.to_user === to) ||
      (val.user === to && val.to_user === user_id),
  );
  if (blockKontak) {
    await db?.messages.put({
      id: generateFiveDigitNumber(),
      from: user_id,
      to,
      pesan,
      delete: false,
      created_at: new Date().toISOString(),
    });
    return;
  }
  if(images) {
    const { error, data } = await supabase.storage.from("foto").upload(`${user_id}/${Date.now()}_${Math.random().toString(36).substring(2, 15)}.jpg`, images);
    if (error) {
      console.error(error);
      return;
    }
    const imageUrl = supabase.storage.from("foto").getPublicUrl(data.path).data.publicUrl;
    const { error: insertError } = await supabase.from("pesan").insert({
      from: user_id,
      to,
      pesan,
      image: imageUrl,
    });
    if (insertError) {
      console.error(insertError);
    }
    return;
  }
  const { error } = await supabase.from("pesan").insert({
    from: user_id,
    to,
    pesan,
  });
  if (error) {
    console.error(error);
  }
}

export async function updateContact(
  userRiloId: string,
  userId: string,
  messages: MessageType[],
) {
  const supabase = createClient();
  const { data: DataKontak } = (await supabase
    .from("kontak")
    .select("*")
    .eq("id", userId)
    .maybeSingle()) as PostgrestMaybeSingleResponse<KontakType>;
  const { data: lastRead } = await supabase
    .from("last_read")
    .select("contact_id, last_read_at")
    .eq("user_id", userRiloId);

  const map: Record<string, string> = {};
  lastRead?.forEach((row) => {
    map[row.contact_id] = row.last_read_at;
  });
  const contacts = mergeChatWithContacts(
    messages,
    DataKontak?.list_kontak ?? [],
    userRiloId,
    map,
  );
  return contacts;
}

export function getInitials(name: string): string {
  return (
    name
      ?.trim()
      .split(/\s+/)
      .filter(Boolean)
      .map((word) => word.charAt(0).toUpperCase())
      .join("") || ""
  );
}
