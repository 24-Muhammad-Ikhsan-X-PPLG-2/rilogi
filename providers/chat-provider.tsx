"use client";
import {
  ChatContact,
  getRecentContacts,
  mergeChatWithContacts,
} from "@/utils/lib";
import { createClient } from "@/utils/supabase/client";
import { KontakType, ListKontakType } from "@/utils/types/kontak";
import { MessageType } from "@/utils/types/message";
import { ProfileType } from "@/utils/types/profile";
import {
  PostgrestMaybeSingleResponse,
  PostgrestResponse,
  RealtimePostgresChangesPayload,
} from "@supabase/supabase-js";
import {
  createContext,
  Dispatch,
  FC,
  PropsWithChildren,
  SetStateAction,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { Message } from "react-hook-form";

interface ChatContextProps {
  chatWith: string;
  setChatWith: Dispatch<SetStateAction<string>>;
  kontak: ChatContact[];
  setKontak: Dispatch<SetStateAction<ChatContact[]>>;
  messages: MessageType[];
  setMessages: Dispatch<SetStateAction<MessageType[]>>;
}

const ChatContext = createContext<ChatContextProps | undefined>(undefined);

export const ChatProvider: FC<PropsWithChildren> = ({ children }) => {
  const supabase = createClient();
  const [chatWith, setChatWith] = useState("");
  const [kontak, setKontak] = useState<ChatContact[]>([]);
  const [profile, setProfile] = useState<ProfileType | null>(null);
  const [messages, setMessages] = useState<MessageType[]>([]);
  const profileRef = useRef<ProfileType>(null);
  const messagesRef = useRef<MessageType[]>(null);
  const kontakRef = useRef<ChatContact[]>(null);
  useEffect(() => {
    profileRef.current = profile;
  }, [profile]);
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);
  useEffect(() => {
    kontakRef.current = kontak;
  }, [kontak]);
  useEffect(() => {
    supabase.auth.getUser().then(async (data) => {
      const {
        data: { user },
      } = data;
      if (!user) return;
      const { data: DataProfile } = (await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle()) as PostgrestMaybeSingleResponse<ProfileType>;
      const { data: DataKontak } = (await supabase
        .from("kontak")
        .select("*")
        .eq("id", user.id)
        .maybeSingle()) as PostgrestMaybeSingleResponse<KontakType>;
      const { data: DataMessages } = (await supabase
        .from("pesan")
        .select("*")) as PostgrestResponse<MessageType>;
      setProfile(DataProfile);
      setMessages(DataMessages ?? []);
      const { data: lastRead } = await supabase
        .from("last_read")
        .select("contact_id, last_read_at")
        .eq("user_id", DataProfile?.rilo_id);

      const lastReadMap: Record<string, string> = {};
      lastRead?.forEach((row) => {
        lastReadMap[row.contact_id] = row.last_read_at;
      });
      const contacts = mergeChatWithContacts(
        DataMessages ?? [],
        DataKontak?.list_kontak ?? [],
        DataProfile?.rilo_id ?? "",
        lastReadMap
      );
      console.log(contacts);
      setKontak(contacts ?? []);
    });
    const kontakChannel = supabase
      .channel("kontak-channel")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "kontak" },
        handleKontak
      )
      .subscribe();

    const messagesChannel = supabase
      .channel("pesan-channel")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "pesan" },
        handleMessage
      )
      .subscribe();
    return () => {
      supabase.removeChannel(kontakChannel);
      supabase.removeChannel(messagesChannel);
    };
  }, []);
  const handleKontak = async (
    payload: RealtimePostgresChangesPayload<KontakType>
  ) => {
    if (
      payload.eventType === "UPDATE" &&
      profileRef.current &&
      messagesRef.current
    ) {
      const { data: lastRead } = await supabase
        .from("last_read")
        .select("contact_id, last_read_at")
        .eq("user_id", profileRef.current.rilo_id);

      const lastReadMap: Record<string, string> = {};
      lastRead?.forEach((row) => {
        lastReadMap[row.contact_id] = row.last_read_at;
      });
      const contacts = mergeChatWithContacts(
        messagesRef.current ?? [],
        payload.new?.list_kontak ?? [],
        profileRef.current?.rilo_id ?? "",
        lastReadMap
      );
      setKontak(contacts ?? []);
    }
  };
  const handleMessage = async (
    payload: RealtimePostgresChangesPayload<MessageType>
  ) => {
    if (
      payload.eventType === "INSERT" &&
      messagesRef.current &&
      kontakRef.current &&
      profileRef.current
    ) {
      const { data: lastRead } = await supabase
        .from("last_read")
        .select("contact_id, last_read_at")
        .eq("user_id", profileRef.current.rilo_id);

      const lastReadMap: Record<string, string> = {};
      lastRead?.forEach((row) => {
        lastReadMap[row.contact_id] = row.last_read_at;
      });
      const messages = [...messagesRef.current, payload.new];
      const contacts = mergeChatWithContacts(
        messages ?? [],
        kontakRef.current,
        profileRef.current.rilo_id,
        lastReadMap
      );
      setKontak(contacts);
      setMessages(messages);
    }
  };
  return (
    <ChatContext.Provider
      value={{
        chatWith,
        setChatWith,
        kontak,
        setKontak,
        messages,
        setMessages,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export function useChat() {
  const context = useContext(ChatContext);
  if (!context) throw new Error("useChat must be used within ChatProvider");
  return context;
}
