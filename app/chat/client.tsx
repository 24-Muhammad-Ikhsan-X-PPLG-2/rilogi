"use client";

import AddContact from "@/components/Chat/add-contact";
import Chat from "@/components/Chat/chat";
import ListKontak from "@/components/Chat/list-kontak";
import { useTheme } from "@/providers/theme-provider";
import { ProfileType } from "@/utils/types/profile";
import {
  ChatBubbleOvalLeftIcon as ChatBubbleOvalLeftIconOutline,
  Cog8ToothIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";
import { ChatBubbleOvalLeftIcon } from "@heroicons/react/24/solid";
import { FC, useEffect, useState } from "react";

type ChatClientProps = {
  profile: ProfileType;
};

const ChatClient: FC<ChatClientProps> = ({ profile }) => {
  const [showAddContact, setShowAddContact] = useState(false);
  const { theme } = useTheme();
  console.log(theme);

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
        <Chat />
      </div>
    </>
  );
};

export default ChatClient;
