import { ZodNull } from "zod/v3";
import { createClient } from "./supabase/client";
import { KontakType, ListKontakType } from "./types/kontak";
import { MessageType } from "./types/message";

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
  currentUserId: string // id user yang sedang login
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

export function mergeChatWithContacts(
  messages: MessageType[],
  kontak: ListKontakType[],
  currentUserId: string,
  lastReadMap: Record<string, string> // key = rilo_id, value = ISO string last read
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

    // Update last message
    const existing = lastMessageMap.get(partnerKey);
    if (!existing || new Date(msg.created_at) > new Date(existing.created_at)) {
      lastMessageMap.set(partnerKey, { ...msg, partnerRaw });
    }

    // Hitung unread
    const lastReadTime = lastReadMap[partnerKey] ?? "1970-01-01";
    if (
      new Date(msg.created_at) > new Date(lastReadTime) &&
      msg.from !== curKey
    ) {
      unreadCountMap.set(partnerKey, (unreadCountMap.get(partnerKey) ?? 0) + 1);
    }
  }

  const result: ChatContact[] = kontak.map((c) => {
    const key = normalize(c.rilo_id);
    const lastMsg = lastMessageMap.get(key);

    return {
      rilo_id: c.rilo_id,
      nama_kontak: c.nama_kontak,
      lastMessage: lastMsg?.pesan ?? null,
      lastMessageTime: lastMsg?.created_at ?? null,
      unreadCount: unreadCountMap.get(key) ?? 0,
    };
  });

  result.sort((a, b) => {
    if (!a.lastMessageTime && !b.lastMessageTime) return 0;
    if (!a.lastMessageTime) return 1;
    if (!b.lastMessageTime) return -1;
    return (
      new Date(b.lastMessageTime).getTime() -
      new Date(a.lastMessageTime).getTime()
    );
  });

  return result;
}
