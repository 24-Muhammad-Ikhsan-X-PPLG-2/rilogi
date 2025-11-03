import { useChat } from "@/providers/chat-provider";
import { useTheme } from "@/providers/theme-provider";
import { ChatContact, updateLastRead, useSafeAsyncEffect } from "@/utils/lib";
import { ProfileType } from "@/utils/types/profile";
import {
  NoSymbolIcon,
  PencilIcon,
  TrashIcon,
  UserPlusIcon,
} from "@heroicons/react/24/outline";
import React, {
  FC,
  FormEventHandler,
  MouseEvent as MouseEventReact,
  useEffect,
  useRef,
  useState,
} from "react";
import { AddContactAction } from "./action-add-contact";
import { toast } from "react-toastify";
import { createClient } from "@/utils/supabase/client";
import { db } from "@/utils/db";
import { useLiveQuery } from "dexie-react-hooks";
import { AnimatePresence, motion } from "motion/react";

type KontakProps = {
  item: ChatContact;
  profile: ProfileType;
};

export type MenuPositionType = {
  x: number;
  y: number;
} | null;

const Kontak: FC<KontakProps> = ({ item, profile }) => {
  const { theme } = useTheme();
  const [menuPos, setMenuPos] = useState<MenuPositionType>(null);
  const { setChatWith } = useChat();
  const [showAddContact, setShowAddContact] = useState(false);
  const [namaKontak, setNamaKontak] = useState("");
  const contextMenuRef = useRef<HTMLDivElement>(null);
  const [isLoadingAddContact, setIsLoadingAddContact] = useState(false);
  const blockKontakGlobal = useLiveQuery(() => db?.blockKontak.toArray()!);
  const [isBlockByMe, setIsBlockByMe] = useState(false);
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
  useSafeAsyncEffect(async () => {
    const blockKontakFromDB = blockKontakGlobal?.filter(
      (val) => val.user == profile.rilo_id && val.to_user == item.rilo_id
    );
    if (blockKontakFromDB?.length !== 0) {
      setIsBlockByMe(true);
    } else {
      setIsBlockByMe(false);
    }
  }, [blockKontakGlobal]);

  useEffect(() => {
    const handleClose = (e: MouseEvent) => {
      if (
        contextMenuRef.current &&
        !contextMenuRef.current.contains(e.target as Node)
      ) {
        setMenuPos(null);
        setShowAddContact(false);
        setNamaKontak("");
      }
    };
    window.addEventListener("mousedown", handleClose);
    return () => {
      window.removeEventListener("mousedown", handleClose);
    };
  }, []);
  const handleSaveContact: FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    setIsLoadingAddContact(true);
    const formData = new FormData();
    formData.set("rilo_id", item.rilo_id);
    formData.set("nama_kontak", namaKontak);
    const res = await AddContactAction(formData);
    setIsLoadingAddContact(false);
    if (res.error) {
      toast.error(res.message);
      return;
    }
    toast.success(res.message);
    setNamaKontak("");
    setShowAddContact(false);
    setMenuPos(null);
  };
  const handleOpenBlockKontak = async () => {
    const supabase = createClient();
    const { error } = await supabase
      .from("block_kontak")
      .delete()
      .eq("user", profile.rilo_id)
      .eq("to_user", item.rilo_id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Berhasil buka blok " + item.nama_kontak);
    setMenuPos(null);
  };
  const handleBlockKontak = async () => {
    const supabase = createClient();
    const { error } = await supabase.from("block_kontak").insert({
      user: profile.rilo_id,
      to_user: item.rilo_id,
    });
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Berhasil blokir " + item.nama_kontak);
    setMenuPos(null);
  };
  return (
    <>
      <div
        className={`p-2 w-full h-fit rounded-xl transition duration-150 cursor-pointer active:scale-90 ${
          theme === "dark" ? "hover:bg-gray-800" : "hover:bg-gray-200"
        }`}
        ref={targetRef}
        onClick={async () => {
          await updateLastRead(profile?.rilo_id ?? "", item.rilo_id);
          setChatWith(item.rilo_id);
        }}
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
      <AnimatePresence mode="wait">
        {menuPos && (
          <motion.div
            key={item.rilo_id}
            className="absolute bg-gray-950/50 backdrop-filter backdrop-blur-md w-fit h-fit p-2 z-[9999] rounded-tr-xl rounded-bl-xl rounded-br-xl"
            ref={contextMenuRef}
            style={{
              top: menuPos.y,
              left: menuPos.x,
            }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
          >
            {item.rilo_id !== item.nama_kontak ? (
              <>
                <div className="text-red-600 flex gap-1 hover:bg-gray-800 p-2 rounded cursor-pointer transition duration-200 active:scale-90">
                  <TrashIcon className="w-5" />
                  <p className="text-sm">Hapus kontak ini.</p>
                </div>
                {isBlockByMe ? (
                  <div
                    className="text-red-600 flex gap-1 hover:bg-gray-800 p-2 rounded cursor-pointer transition duration-200 active:scale-90"
                    onClick={handleOpenBlockKontak}
                  >
                    <NoSymbolIcon className="w-5" />
                    <p className="text-sm">Buka blok kontak ini.</p>
                  </div>
                ) : (
                  <div
                    className="text-red-600 flex gap-1 hover:bg-gray-800 p-2 rounded cursor-pointer transition duration-200 active:scale-90"
                    onClick={handleBlockKontak}
                  >
                    <NoSymbolIcon className="w-5" />
                    <p className="text-sm">Blok kontak ini.</p>
                  </div>
                )}
                <div className="flex gap-1 hover:bg-gray-800 p-2 rounded cursor-pointer transition duration-200 active:scale-90">
                  <PencilIcon className="w-5" />
                  <p className="text-sm">Edit kontak ini.</p>
                </div>
              </>
            ) : showAddContact ? (
              <>
                <form
                  onSubmit={handleSaveContact}
                  className="flex gap-1 p-2 rounded cursor-pointer transition duration-200 h-12"
                >
                  <input
                    type="text"
                    className="w-full outline-none border border-accent py-1 px-1 rounded placeholder:text-gray-500"
                    placeholder="Nama kontak"
                    value={namaKontak}
                    readOnly={isLoadingAddContact}
                    onChange={({ target: { value } }) => setNamaKontak(value)}
                  />
                  <button
                    className="bg-primary active:scale-95 transition duration-200 text-sm py-1 px-3 rounded font-semibold cursor-pointer disabled:bg-gray-500"
                    disabled={isLoadingAddContact}
                  >
                    Simpan
                  </button>
                </form>
              </>
            ) : (
              <>
                <div className="text-red-600 flex gap-1 hover:bg-gray-800 p-2 rounded cursor-pointer transition duration-200 active:scale-90">
                  <NoSymbolIcon className="w-5" />
                  <p className="text-sm">Blok kontak ini.</p>
                </div>
                <div
                  className="flex gap-1 hover:bg-gray-800 p-2 rounded cursor-pointer transition duration-200 active:scale-90"
                  onClick={() => {
                    setShowAddContact(true);
                  }}
                >
                  <UserPlusIcon className="w-5" />
                  <p className="text-sm">Tambah ke kontak.</p>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Kontak;
