"use client";
import { StatusBlockType } from "@/app/chat/client";
import { useChat } from "@/providers/chat-provider";
import { useTheme } from "@/providers/theme-provider";
import { db } from "@/utils/db";
import { getInitials, sendMessage, useSafeAsyncEffect } from "@/utils/lib";
import { createClient } from "@/utils/supabase/client";
import { KontakType } from "@/utils/types/kontak";
import { MessageType } from "@/utils/types/message";
import { ProfileType } from "@/utils/types/profile";
import {
  Bars3Icon,
  ChatBubbleLeftRightIcon,
  PaperAirplaneIcon,
  PhotoIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";
import { PostgrestMaybeSingleResponse } from "@supabase/supabase-js";
import { useLiveQuery } from "dexie-react-hooks";
import { FC, FormEventHandler, useEffect, useRef, useState } from "react";
import TextareaAutoSize from "react-textarea-autosize";
import Message from "./message";
import { toast } from "react-toastify";
import ChatInsert from "./chat-insert";

type ChatProps = {
  profile: ProfileType;
  messages: MessageType[];
};

const Chat: FC<ChatProps> = ({ profile, messages }) => {
  const chatRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();
  const [isLoading, setIsLoading] = useState(false);
  const [messageInput, setMessageInput] = useState("");
  const [showChatInsert, setShowChatInsert] = useState(false);
  const [fileImg, setFileImg] = useState<File | null>(null);
  const { chatWith, kontakGlobal, contextMenuMessage } = useChat();
  const blockKontakGlobal = useLiveQuery(() => db?.blockKontak.toArray()!);
  const [statusBlock, setStatusBlock] = useState("");
  const [profileLawanBicara, setProfileLawanBicara] = useState<{
    nama_kontak: string;
    rilo_id: string;
  } | null>(null);
  const { theme } = useTheme();

  const scrollSampeBawah = () => {
    if (chatRef.current) {
      chatRef.current.scrollTo({
        top: chatRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  };

  useSafeAsyncEffect(async () => {
    if (!chatWith) return;
    const { data } = (await supabase
      .from("kontak")
      .select()
      .eq("id", profile.id)
      .maybeSingle()) as PostgrestMaybeSingleResponse<KontakType>;
    if (!data) {
      setProfileLawanBicara({
        rilo_id: chatWith,
        nama_kontak: chatWith,
      });
      return;
    }
    const lawanBicara = data.list_kontak.filter(
      (item) => item.rilo_id == chatWith
    );
    if (lawanBicara.length === 0) {
      setProfileLawanBicara({
        rilo_id: chatWith,
        nama_kontak: chatWith,
      });
      return;
    }
    setProfileLawanBicara({
      rilo_id: lawanBicara.at(0)?.rilo_id ?? "",
      nama_kontak: lawanBicara.at(0)?.nama_kontak ?? "",
    });
    const blockKontakFilter = blockKontakGlobal
      ?.filter(
        (val) =>
          (val.user == profile.rilo_id && val.to_user == chatWith) ||
          (val.user == chatWith && val.to_user == profile.rilo_id)
      )
      .at(0);
    if (blockKontakFilter && blockKontakFilter.user == profile.rilo_id) {
      setStatusBlock("Anda memblokir kontak ini.");
    } else {
      setStatusBlock("");
    }
  }, [chatWith, blockKontakGlobal]);

  useEffect(() => {
    if (kontakGlobal.length === 0) return;
    const lawanBicara = kontakGlobal.filter((item) => item.rilo_id == chatWith);
    if (lawanBicara.length === 0) {
      setProfileLawanBicara({
        rilo_id: chatWith,
        nama_kontak: chatWith,
      });
      return;
    }
    setProfileLawanBicara({
      rilo_id: lawanBicara.at(0)?.rilo_id ?? "",
      nama_kontak: lawanBicara.at(0)?.nama_kontak ?? "",
    });
  }, [kontakGlobal]);

  useEffect(() => {
    if (messages.length > 0) {
      scrollSampeBawah();
    }
  }, [messages]);

  const onSubmitMessage: FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    if (messageInput.trim() === "") {
      toast.error("Pesan tidak boleh kosong!");
      return;
    }
    setIsLoading(true);
    await sendMessage(
      profile?.rilo_id ?? "",
      chatWith,
      messageInput,
      fileImg ?? undefined
    );
    setFileImg(null);
    setMessageInput("");
    setIsLoading(false);
  };

  return (
    <>
      <div
        className={`w-full h-[95vh] max-h-[95vh] rounded-xl bg-gray-900 bg-[url('/svg/bg-chat-gray.svg')] bg-repeat bg-[length:200px_200px] backdrop-blur-lg p-5 flex flex-col relative z-[0]`}
      >
        {chatWith.trim() === "" ? (
          <div className="w-full h-full flex flex-col text-white justify-center items-center">
            <ChatBubbleLeftRightIcon className="w-20" />
            <p className="font-semibold text-xl mt-1">Mulai obrolan...</p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div
              className={`w-full sticky top-0 shadow-xl ${
                theme === "dark"
                  ? "bg-gray-800 text-white"
                  : "bg-secondary text-black"
              } p-3 rounded-xl flex justify-between items-center z-10`}
            >
              <div className="flex items-center gap-4">
                <div
                  className={`h-10 w-10 rounded-full ${
                    profileLawanBicara
                      ? "bg-primary"
                      : "bg-gray-500 animate-pulse"
                  } flex justify-center items-center text-white font-semibold`}
                >
                  {profileLawanBicara &&
                    getInitials(profileLawanBicara.nama_kontak)}
                </div>
                {profileLawanBicara ? (
                  <div>
                    <p className="text-base font-semibold">
                      {profileLawanBicara?.nama_kontak}
                    </p>
                  </div>
                ) : (
                  <div className="w-40 h-10 bg-gray-500 rounded-full animate-pulse"></div>
                )}
              </div>
              <Bars3Icon className="w-8" />
            </div>

            {/* Chat messages */}
            <div
              className={`flex-1 mt-3 flex flex-col gap-3 pr-2 ${
                contextMenuMessage ? "overflow-hidden" : "overflow-auto"
              }`}
              ref={chatRef}
            >
              {messages.map((message, idx) => (
                <Message message={message} key={idx} />
              ))}
              {statusBlock.trim() !== "" && (
                <div className="bg-gray-400 font-semibold mx-auto w-fit max-w-xs px-4 py-2 rounded-2xl">
                  <p className="text-sm">{statusBlock}</p>
                </div>
              )}

              <div className="p-2"></div>
            </div>
            {/* Chat input: sticky di bawah */}
            {statusBlock !== "Anda memblokir kontak ini." && (
              <form
                onSubmit={onSubmitMessage}
                className={`w-[90%] ${
                  theme === "dark"
                    ? "bg-gray-800 text-white"
                    : "bg-secondary text-black"
                } shadow-xl h-fit max-h-32 overflow-y-visible p-5 flex items-end gap-4 rounded-2xl mx-auto mt-1 relative`}
              >
                <ChatInsert
                  setFileImg={setFileImg}
                  fileImg={fileImg}
                  setShow={setShowChatInsert}
                  show={showChatInsert}
                />
                <PlusIcon
                  className="w-7 cursor-pointer text-primary"
                  onClick={() => setShowChatInsert((prev) => !prev)}
                />
                <TextareaAutoSize
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  minRows={1}
                  className="outline-none w-full resize-none bg-transparent max-h-24"
                  placeholder="Tulis pesan..."
                />
                <button type="submit" disabled={isLoading}>
                  <PaperAirplaneIcon className="w-6 text-primary cursor-pointer" />
                </button>
              </form>
            )}
          </>
        )}
      </div>
    </>
  );
};

export default Chat;
