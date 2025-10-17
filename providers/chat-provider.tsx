"use client";
import { ChatContact } from "@/utils/lib";
import {
  createContext,
  Dispatch,
  FC,
  PropsWithChildren,
  SetStateAction,
  useContext,
  useState,
} from "react";

interface ChatContextProps {
  chatWith: string;
  setChatWith: Dispatch<SetStateAction<string>>;
  kontakGlobal: ChatContact[];
  setKontakGlobal: Dispatch<SetStateAction<ChatContact[]>>;
  contextMenuMessage: boolean;
  setContextMenuMessage: Dispatch<SetStateAction<boolean>>;
}

export type lastReadType = {
  id: string;
  user_id: string;
  contact_id: string;
  last_read_at: string;
};

const ChatContext = createContext<ChatContextProps | undefined>(undefined);

export const ChatProvider: FC<PropsWithChildren> = ({ children }) => {
  const [chatWith, setChatWith] = useState("");
  const [kontakGlobal, setKontakGlobal] = useState<ChatContact[]>([]);
  const [contextMenuMessage, setContextMenuMessage] = useState(false);

  // refs untuk realtime update

  // Hanya pakai payload, tanpa fetch ulang last_read

  return (
    <ChatContext.Provider
      value={{
        chatWith,
        setChatWith,
        kontakGlobal,
        setKontakGlobal,
        contextMenuMessage,
        setContextMenuMessage,
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
