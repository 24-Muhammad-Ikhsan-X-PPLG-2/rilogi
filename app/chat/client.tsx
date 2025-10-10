"use client";

import AddContact from "@/components/Chat/add-contact";
import Chat from "@/components/Chat/chat";
import ListKontak from "@/components/Chat/list-kontak";
import { useChat } from "@/providers/chat-provider";
import { useTheme } from "@/providers/theme-provider";
import { allMessages, db } from "@/utils/db";
import {
  filterMessagesByBlock,
  updateLastRead,
  useSafeAsyncEffect,
} from "@/utils/lib";
import { createClient } from "@/utils/supabase/client";
import { BlockKontakType } from "@/utils/types/block_kontak";
import { MessageType } from "@/utils/types/message";
import { ProfileType } from "@/utils/types/profile";
import {
  ChatBubbleOvalLeftIcon as ChatBubbleOvalLeftIconOutline,
  Cog8ToothIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";
import { ChatBubbleOvalLeftIcon } from "@heroicons/react/24/solid";
import {
  PostgrestResponse,
  RealtimePostgresChangesPayload,
} from "@supabase/supabase-js";
import { useLiveQuery } from "dexie-react-hooks";
import { FC, useEffect, useRef, useState } from "react";

type ChatClientProps = {
  profile: ProfileType;
};

export type StatusBlockType =
  | "Anda memblokir kontak ini."
  | "Kontak ini memblokir anda.";

const ChatClient: FC<ChatClientProps> = ({ profile }) => {
  const [showAddContact, setShowAddContact] = useState(false);
  const { theme } = useTheme();
  const { chatWith, contextMenuMessage } = useChat();
  const supabase = createClient();
  const [messages, setMessages] = useState<MessageType[]>([]);
  const messagesGlobal = useLiveQuery(
    () => db?.messages.orderBy("created_at").toArray()!
  );
  const blockKontakGlobal = useLiveQuery(() => db?.blockKontak.toArray()!);
  const blockKontakGlobalRef = useRef<BlockKontakType[] | undefined>(undefined);
  const messagesRef = useRef<MessageType[]>([]);
  const chatWithRef = useRef("");
  useEffect(() => {
    blockKontakGlobalRef.current = blockKontakGlobal;
  }, [blockKontakGlobal]);
  useEffect(() => {
    if (!messagesGlobal) return;
    setMessages(messagesGlobal);
  }, [messagesGlobal]);
  useSafeAsyncEffect(async () => {
    setMessages([]);
    console.log("kode fetch data jalan");
    const { data: DataBlockKontak } = (await supabase
      .from("block_kontak")
      .select("*")) as PostgrestResponse<BlockKontakType>;
    await db?.blockKontak.bulkPut(DataBlockKontak!);
    const DataMessagesBaru = filterMessagesByBlock(
      messagesGlobal ?? [],
      profile.rilo_id,
      DataBlockKontak ?? []
    );
    const filtered = DataMessagesBaru?.filter(
      (item) =>
        (item.from === chatWith && item.to === profile.rilo_id) ||
        (item.from === profile.rilo_id && item.to === chatWith)
    );
    setMessages(filtered!);
  }, [chatWith]);
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);
  useEffect(() => {
    chatWithRef.current = chatWith;
  }, [chatWith]);
  useEffect(() => {
    const messagesChannel = supabase
      .channel("pesan-channel")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "pesan" },
        handleMessage
      )
      .subscribe();
    const blockKontakChannel = supabase
      .channel("blockKontak")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "block_kontak" },
        handleBlockKontak
      )
      .subscribe();
    return () => {
      supabase.removeChannel(messagesChannel);
      supabase.removeChannel(blockKontakChannel);
    };
  }, []);
  const handleBlockKontak = async (
    payload: RealtimePostgresChangesPayload<BlockKontakType>
  ) => {
    if (payload.eventType === "INSERT") {
      await db?.blockKontak.put(payload.new);
    }
    if (payload.eventType === "DELETE") {
      await db?.blockKontak.delete(payload.old.id!);
    }
  };
  const handleMessage = async (
    payload: RealtimePostgresChangesPayload<MessageType>
  ) => {
    console.log(payload);
    if (payload.eventType === "INSERT" && messagesRef.current) {
      const messagesFromDB = await db?.messages.toArray();
      const newMessages = [...messagesFromDB!, payload.new];

      if (chatWithRef.current) {
        const filtered = newMessages.filter(
          (item) =>
            (item.from === chatWithRef.current &&
              item.to === profile.rilo_id) ||
            (item.from === profile.rilo_id && item.to === chatWithRef.current)
        );
        setMessages(filtered);
      }
      if (
        (payload.new.from === chatWithRef.current &&
          payload.new.to === profile.rilo_id) ||
        (payload.new.from === profile.rilo_id &&
          payload.new.to === chatWithRef.current)
      ) {
        console.log(
          "update last read untuk user " +
            profile.rilo_id +
            " ke user " +
            chatWithRef.current
        );
        await updateLastRead(profile.rilo_id, chatWithRef.current);
      }
      await db?.messages.put(payload.new);
      console.log("message lokal terupdate");
    }
    if (payload.eventType === "UPDATE") {
      const updatedMessage = payload.new;
      // const messagesFromDB = await db?.messages.toArray();
      // const indexMessage = messagesFromDB?.findIndex((item) => item.id == payload.new.id);
      const existMessage = await db?.messages.get(updatedMessage.id);
      if (existMessage) {
        await db?.messages.put(updatedMessage);
        const messagesFromDB = await db?.messages
          .orderBy("created_at")
          .toArray();
        if (chatWithRef.current) {
          const filtered = messagesFromDB?.filter(
            (item) =>
              (item.from === chatWithRef.current &&
                item.to === profile.rilo_id) ||
              (item.from === profile.rilo_id && item.to === chatWithRef.current)
          );
          setMessages(filtered!);
        }
      }
    }
  };

  return (
    <>
      <AddContact show={showAddContact} setShow={setShowAddContact} />
      <div
        className={`min-h-screen flex gap-4 px-4 items-center bg-gradient-to-br ${
          theme === "dark" ? "from-gray-900" : "from-white"
        } to-[#8B5E3C]`}
      >
        {/* Sidebar kiri */}
        <div
          className={`h-[95vh] w-[500px] rounded-xl ${
            theme === "dark" ? "bg-gray-900 text-white" : "bg-white text-black"
          } flex justify-end`}
        >
          <div className="flex flex-col justify-between py-2 pl-2">
            <div className="">
              <ChatBubbleOvalLeftIcon className="w-8 " />
            </div>
            <div className="flex flex-col gap-3">
              <PlusIcon
                className="w-8  active:scale-90 cursor-pointer transition duration-150"
                onClick={() => setShowAddContact(true)}
              />
              <Cog8ToothIcon className="w-8  cursor-pointer active:scale-90 transition duration-150" />
            </div>
          </div>
          <div className="align-baseline border border-gray-800 ml-2"></div>
          <ListKontak profile={profile} />
        </div>

        {/* Chat container */}
        <Chat messages={messages} profile={profile} />
      </div>
    </>
  );
};

export default ChatClient;
