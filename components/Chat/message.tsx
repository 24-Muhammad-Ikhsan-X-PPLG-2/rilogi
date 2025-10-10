"use client";
import { useChat } from "@/providers/chat-provider";
import { MessageType } from "@/utils/types/message";
import React, {
  FC,
  useRef,
  useState,
  MouseEvent as MouseEventReact,
  useEffect,
  ReactNode,
  MouseEventHandler,
} from "react";
import { MenuPositionType } from "./kontak";
import { AnimatePresence, motion } from "motion/react";
import {
  ArrowTurnUpLeftIcon,
  ClipboardIcon,
  NoSymbolIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { toast } from "react-toastify";
import { createClient } from "@/utils/supabase/client";
import { db } from "@/utils/db";

type MessageProps = {
  message: MessageType;
};

const Message: FC<MessageProps> = ({ message }) => {
  const { chatWith, setContextMenuMessage } = useChat();
  const isFromChatWith = message.from === chatWith;
  const containerClasses = `w-fit max-w-xs px-4 py-2 rounded-2xl z-[999] ${
    isFromChatWith
      ? "bg-secondary rounded-tl-none"
      : "bg-primary ml-auto rounded-tr-none"
  }`;
  const textClasses = `text-sm ${isFromChatWith ? "" : "text-secondary"}`;
  const [menuPos, setMenuPos] = useState<MenuPositionType>(null);
  const targetRef = useRef<HTMLDivElement>(null);
  const contextMenuRef = useRef<HTMLDivElement>(null);
  const handleOnContextMenu = (e: MouseEventReact<HTMLDivElement>) => {
    e.preventDefault();
    if (targetRef.current && !message.delete) {
      const rect = targetRef.current.getBoundingClientRect();
      if (isFromChatWith) {
        setMenuPos({
          x: rect.x - 390,
          y: rect.y + 30,
        });
      } else {
        setMenuPos({
          x: rect.x - 570,
          y: rect.y + 30,
        });
      }
      setContextMenuMessage(true);
    }
  };
  useEffect(() => {
    const handleClose = (e: MouseEvent) => {
      if (
        contextMenuRef.current &&
        !contextMenuRef.current.contains(e.target as Node)
      ) {
        setMenuPos(null);
        setContextMenuMessage(false);
      }
    };
    window.addEventListener("mousedown", handleClose);
    return () => {
      window.removeEventListener("mousedown", handleClose);
    };
  }, []);
  const copyMessage = async () => {
    setMenuPos(null);
    setContextMenuMessage(false);

    try {
      await navigator.clipboard.writeText(message.pesan);
      toast.success("Teks berhasi disalin");
    } catch (err) {
      if (err instanceof Error) {
        toast.error(err.message);
        return;
      }
      toast.error("Unexpected error");
      console.error(err);
    }
  };
  const handleDeleteMessage = async () => {
    setMenuPos(null);
    setContextMenuMessage(false);

    const supabase = createClient();
    const { data: DataPesan } = await supabase
      .from("pesan")
      .select("*")
      .eq("id", message.id)
      .maybeSingle();
    if (!DataPesan) {
      await db?.messages.put({
        ...message,
        delete: true,
      });
      return;
    }
    const { error } = await supabase
      .from("pesan")
      .update({
        delete: true,
      })
      .eq("id", message.id);
    if (error) {
      toast.error(error.message);
      return;
    }
  };

  return (
    <>
      <div
        className={containerClasses}
        ref={targetRef}
        onContextMenu={handleOnContextMenu}
      >
        {message.delete ? (
          <div className="flex gap-1 items-center">
            <NoSymbolIcon className="w-5" />
            <p className={textClasses}>Pesan dihapus</p>
          </div>
        ) : (
          <p className={textClasses}>{message.pesan}</p>
        )}
      </div>
      <AnimatePresence>
        {menuPos ? (
          <motion.div
            initial={{
              y: 20,
              opacity: 0,
            }}
            animate={{
              y: 0,
              opacity: 1,
            }}
            exit={{
              y: 20,
              opacity: 0,
            }}
            key={message.id}
            ref={contextMenuRef}
            className={`absolute bg-gray-500/50 rounded backdrop-filter backdrop-blur-lg z-[9999] w-64 h-fit shadow text-gray-200`}
            style={{
              top: menuPos.y,
              left: menuPos.x,
            }}
          >
            <div className="p-2">
              <ContextMenuList
                icon={<ArrowTurnUpLeftIcon className="w-6" />}
                text="Reply"
              />
            </div>
            <div className="p-2">
              <ContextMenuList
                icon={<ClipboardIcon className="w-6" />}
                text="Copy"
                onClick={copyMessage}
              />
            </div>
            {message.from !== chatWith && (
              <>
                <hr />
                <div className="p-2">
                  <ContextMenuList
                    icon={<TrashIcon className="w-6" />}
                    text="Delete this message"
                    classNameText="text-red-600"
                    classNameIcon="text-red-600"
                    onClick={handleDeleteMessage}
                  />
                </div>
              </>
            )}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
};

type ContextMenuListProps = {
  icon: ReactNode;
  text: string;
  classNameText?: string;
  classNameIcon?: string;
  onClick?: MouseEventHandler<HTMLDivElement>;
};

const ContextMenuList: FC<ContextMenuListProps> = ({
  icon,
  text,
  classNameText = "",
  classNameIcon = "",
  onClick = () => {},
}) => {
  return (
    <div
      className={`flex cursor-pointer active:scale-95 items-center gap-2 transition duration-150 ${classNameIcon}`}
      onClick={onClick}
    >
      {icon}
      <p className={`text-sm font-semibold ${classNameText}`}>{text}</p>
    </div>
  );
};

export default Message;
