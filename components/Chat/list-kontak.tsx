"use client";
import { createClient } from "@/utils/supabase/client";
import { KontakType } from "@/utils/types/kontak";
import { ProfileType } from "@/utils/types/profile";
import {
  PostgrestMaybeSingleResponse,
  PostgrestResponse,
  RealtimePostgresChangesPayload,
} from "@supabase/supabase-js";
import React, { FC, useEffect, useRef, useState } from "react";
import Kontak from "./kontak";
import { lastReadType, useChat } from "@/providers/chat-provider";
import {
  ChatContact,
  filterMessagesByBlock,
  mergeChatWithContacts,
  useSafeAsyncEffect,
} from "@/utils/lib";
import { MessageType } from "@/utils/types/message";
import { BlockKontakType } from "@/utils/types/block_kontak";
import { db } from "@/utils/db";
import { useLiveQuery } from "dexie-react-hooks";
import { useTheme } from "@/providers/theme-provider";
import KontakLoading from "./kontak-loading";

type ListKontakProps = {
  profile: ProfileType;
};

const ListKontak: FC<ListKontakProps> = ({ profile }) => {
  const supabase = createClient();
  const { theme } = useTheme();
  const { chatWith, setKontakGlobal } = useChat();
  const [isLoadingKontak, setIsLoadingKontak] = useState(false);
  const [kontak, setKontak] = useState<ChatContact[]>([]);
  const chatWithRef = useRef("");
  const messagesGlobal = useLiveQuery(() => db?.messages.toArray()!);
  const messagesGlobalRef = useRef<MessageType[]>(undefined);
  const kontakGlobal = useLiveQuery(() =>
    db?.kontak.filter((item) => item.id === profile.id).first()
  );
  const kontakGlobalRef = useRef<KontakType | undefined>(null);
  useEffect(() => {
    kontakGlobalRef.current = kontakGlobal;
  }, [kontakGlobal]);

  useEffect(() => {
    messagesGlobalRef.current = messagesGlobal;
  }, [messagesGlobal]);
  useEffect(() => {
    chatWithRef.current = chatWith;

    // optimistik reset last_read saat user klik kontak
  }, [chatWith]);

  // initial load
  useSafeAsyncEffect(async () => {
    setIsLoadingKontak(true);
    const { data: DataBlockKontak } = (await supabase
      .from("block_kontak")
      .select("*")) as PostgrestResponse<BlockKontakType>;
    const { data: DataKontak } = (await supabase
      .from("kontak")
      .select("*")
      .eq("id", profile.id)
      .maybeSingle()) as PostgrestMaybeSingleResponse<KontakType>;

    const { data: DataMessages } = (await supabase
      .from("pesan")
      .select("*")) as PostgrestResponse<MessageType>;

    const { data: lastRead } = await supabase
      .from("last_read")
      .select("contact_id, last_read_at")
      .eq("user_id", profile.rilo_id);

    const map: Record<string, string> = {};
    lastRead?.forEach((row) => {
      map[row.contact_id] = row.last_read_at;
    });
    const DataMessagesBaru = filterMessagesByBlock(
      DataMessages ?? [],
      profile.rilo_id,
      DataBlockKontak ?? []
    );
    // await db?.messages.clear();
    await db?.kontak.clear();
    await db?.lastRead.clear();
    await db?.messages.bulkPut(DataMessagesBaru ?? []);
    await db?.kontak.put(DataKontak!);
    await db?.lastRead.bulkPut(lastRead ?? []);
    console.log("DB lokal terupdate");
    const contacts = mergeChatWithContacts(
      DataMessagesBaru ?? [],
      DataKontak?.list_kontak ?? [],
      profile.rilo_id,
      map,
      chatWith
    );
    setKontak(contacts);
    setKontakGlobal(contacts);
    setIsLoadingKontak(false);
  }, []);
  useEffect(() => {
    const kontakChannel = supabase
      .channel("kontak-channel")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "kontak" },
        handleKontak
      )
      .subscribe();

    const lastReadChannel = supabase
      .channel("lastread-channel")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "last_read" },
        handleLastread
      )
      .subscribe();

    return () => {
      supabase.removeChannel(kontakChannel);
      supabase.removeChannel(lastReadChannel);
    };
  }, []);
  useSafeAsyncEffect(async () => {
    if (messagesGlobal?.length == 0) return;
    const messagesFromDB = await db?.messages.orderBy("created_at").toArray();
    const blockKontakFromDB = await db?.blockKontak.toArray();
    const kontakFromDB = await db?.kontak
      .filter((item) => item.id == profile.id)
      .first();
    const lastReadFromDB = await db?.lastRead.toArray();
    console.log("List kontak ke trigger");

    const map: Record<string, string> = {};
    lastReadFromDB?.forEach((row) => {
      map[row.contact_id] = row.last_read_at;
    });
    const DataMessagesBaru = filterMessagesByBlock(
      messagesFromDB ?? [],
      profile.rilo_id,
      blockKontakFromDB ?? []
    );
    const contacts = mergeChatWithContacts(
      DataMessagesBaru ?? [],
      kontakFromDB?.list_kontak ?? [],
      profile.rilo_id,
      map,
      chatWithRef.current
    );
    setKontak(contacts);
    setKontakGlobal(contacts);
  }, [messagesGlobal]);

  const handleKontak = async (
    payload: RealtimePostgresChangesPayload<KontakType>
  ) => {
    if (payload.eventType == "INSERT" || payload.eventType == "UPDATE") {
      if (payload.new.id !== profile.id) return;
      const blockKontakFromDB = await db?.blockKontak.toArray();
      const lastReadFromDB = await db?.lastRead.toArray();

      const map: Record<string, string> = {};
      lastReadFromDB?.forEach((row) => {
        map[row.contact_id] = row.last_read_at;
      });
      const DataMessagesBaru = filterMessagesByBlock(
        messagesGlobalRef.current ?? [],
        profile.rilo_id,
        blockKontakFromDB ?? []
      );

      const contacts = mergeChatWithContacts(
        DataMessagesBaru ?? [],
        payload.new?.list_kontak ?? [],
        profile.rilo_id,
        map,
        chatWithRef.current
      );

      setKontak(contacts ?? []);
      setKontakGlobal(contacts);
      await db?.kontak.put(payload.new);
    }
    if (payload.eventType === "DELETE") {
      if (payload.old.id !== profile.id) return;
      const blockKontakFromDB = await db?.blockKontak.toArray();

      const lastReadFromDB = await db?.lastRead.toArray();

      const map: Record<string, string> = {};
      lastReadFromDB?.forEach((row) => {
        map[row.contact_id] = row.last_read_at;
      });
      const DataMessagesBaru = filterMessagesByBlock(
        messagesGlobalRef.current ?? [],
        profile.rilo_id,
        blockKontakFromDB ?? []
      );

      const contacts = mergeChatWithContacts(
        DataMessagesBaru ?? [],
        [],
        profile.rilo_id,
        map,
        chatWithRef.current
      );
      setKontak(contacts);
      setKontakGlobal(contacts);
      await db?.kontak.clear();
    }
  };

  const handleLastread = async (
    payload: RealtimePostgresChangesPayload<lastReadType>
  ) => {
    const blockKontakFromDB = await db?.blockKontak.toArray();
    const lastReadFromDB = await db?.lastRead.toArray();
    if (payload.eventType === "INSERT" || payload.eventType === "UPDATE") {
      await db?.lastRead.put(payload.new);
    }

    const map: Record<string, string> = {};
    lastReadFromDB?.forEach((row) => {
      map[row.contact_id] = row.last_read_at;
    });
    const DataMessagesBaru = filterMessagesByBlock(
      messagesGlobalRef.current ?? [],
      profile.rilo_id,
      blockKontakFromDB ?? []
    );

    const contacts = mergeChatWithContacts(
      DataMessagesBaru ?? [],
      kontakGlobalRef.current?.list_kontak ?? [],
      profile.rilo_id,
      map,
      chatWithRef.current
    );

    setKontak(contacts);
    setKontakGlobal(contacts);
  };

  return (
    <div className="w-full p-2">
      {/* {kontak.map((item, idx) => (
        <Kontak profile={profile} item={item} key={idx} />
      ))} */}
      {isLoadingKontak
        ? Array.from({ length: 4 }).map((_, idx) => <KontakLoading key={idx} />)
        : kontak &&
          kontak.map((item, idx) => (
            <Kontak profile={profile} item={item} key={idx} />
          ))}
    </div>
  );
};

export default ListKontak;
