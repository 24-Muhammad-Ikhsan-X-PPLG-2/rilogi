import { useChat } from "@/providers/chat-provider";
import { useTheme } from "@/providers/theme-provider";
import { ChatContact } from "@/utils/lib";
import { ListKontakType } from "@/utils/types/kontak";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import React, {
  FC,
  MouseEvent as MouseEventReact,
  useEffect,
  useRef,
  useState,
} from "react";

type KontakProps = {
  item: ChatContact;
};

type MenuPositionType = {
  x: number;
  y: number;
} | null;

const Kontak: FC<KontakProps> = ({ item }) => {
  const { theme } = useTheme();
  const [menuPos, setMenuPos] = useState<MenuPositionType>(null);
  const { setChatWith } = useChat();
  const contextMenuRef = useRef<HTMLDivElement>(null);
  const targetRef = useRef<HTMLDivElement>(null);
  const handleOnContextMenu = (e: MouseEventReact<HTMLDivElement>) => {
    e.preventDefault();
    if (targetRef.current) {
      const rect = targetRef.current.getBoundingClientRect();
      setMenuPos({
        x: rect.x + 30,
        y: rect.y + 60,
      });
    }
  };
  useEffect(() => {
    const handleClose = (e: MouseEvent) => {
      if (
        contextMenuRef.current &&
        !contextMenuRef.current.contains(e.target as Node)
      ) {
        setMenuPos(null);
      }
    };
    window.addEventListener("mousedown", handleClose);
    return () => {
      window.removeEventListener("mousedown", handleClose);
    };
  }, []);
  return (
    <>
      <div
        className={`p-2 w-full h-fit rounded-xl transition duration-150 cursor-pointer active:scale-90 ${
          theme === "dark" ? "hover:bg-gray-800" : "hover:bg-gray-200"
        }`}
        ref={targetRef}
        onClick={() => setChatWith(item.rilo_id)}
        onContextMenu={handleOnContextMenu}
      >
        <div className="p-2 flex items-center w-full h-fit rounded-xl justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-primary w-10 h-10 rounded-full"></div>
            <div className="flex flex-col">
              <p className="text-sm font-semibold ">{item.nama_kontak}</p>
              <p className="text-sm text-gray-500">{item.lastMessage}</p>
            </div>
          </div>
          {item.unreadCount !== 0 && (
            <div className="bg-accent w-5 h-5 rounded-full flex justify-center items-center">
              <p className="text-sm">{item.unreadCount}</p>
            </div>
          )}
        </div>
      </div>
      {menuPos && (
        <div
          className="absolute bg-gray-950/50 backdrop-filter backdrop-blur-md w-fit h-fit p-2 z-[9999] rounded-tr-xl rounded-bl-xl rounded-br-xl"
          ref={contextMenuRef}
          style={{
            top: menuPos.y,
            left: menuPos.x,
          }}
        >
          <div className="text-red-600 flex gap-1 hover:bg-gray-800 p-2 rounded cursor-pointer transition duration-200 active:scale-90">
            <TrashIcon className="w-5" />
            <p className="text-sm">Hapus kontak ini.</p>
          </div>
          <div className="flex gap-1 hover:bg-gray-800 p-2 rounded cursor-pointer transition duration-200 active:scale-90">
            <PencilIcon className="w-5" />
            <p className="text-sm">Edit kontak ini.</p>
          </div>
        </div>
      )}
    </>
  );
};

export default Kontak;
