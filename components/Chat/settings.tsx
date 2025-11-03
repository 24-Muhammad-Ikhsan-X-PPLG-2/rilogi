"use client";
import { ProfileType } from "@/utils/types/profile";
import { CheckIcon, PencilIcon } from "@heroicons/react/24/outline";
import { AnimatePresence, motion } from "motion/react";
import {
  Dispatch,
  FC,
  SetStateAction,
  useEffect,
  useRef,
  useState,
} from "react";
import ProfileSettings from "./Settings/profile-settings";
import { ArrowLeftStartOnRectangleIcon } from "@heroicons/react/24/solid";
import { ChevronRightIcon } from "@heroicons/react/24/solid";
import { useRouter } from "next/navigation";

type PropsSettings = {
  setShow: Dispatch<SetStateAction<boolean>>;
  show: boolean;
  profile: ProfileType;
};

const Settings: FC<PropsSettings> = ({ setShow, show, profile }) => {
  const settingsRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [editBioMode, setEditBioMode] = useState(false);
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        settingsRef.current &&
        !settingsRef.current.contains(e.target as Node)
      ) {
        setShow(false);
        setEditBioMode(false);
      }
    };
    window.addEventListener("mousedown", handleClickOutside);
    return () => window.removeEventListener("mousedown", handleClickOutside);
  }, []);
  return (
    <AnimatePresence mode="wait">
      {show ? (
        <motion.div
          initial={{
            scale: 0,
            y: 200,
            x: -100,
            opacity: 0,
          }}
          animate={{ scale: 1, y: 0, x: 0, opacity: 1 }}
          exit={{
            scale: 0,
            y: 200,
            x: -100,
            opacity: 0,
          }}
          key="settingsSection"
          ref={settingsRef}
          className={`absolute bottom-10 left-5 bg-gray-800/70 z-[99] backdrop-blur-md backdrop-filter rounded-tl-xl rounded-tr-xl rounded-br-xl shadow w-[500px] h-[500px]`}
        >
          <ProfileSettings
            profile={profile}
            setEditBioMode={setEditBioMode}
            editBioMode={editBioMode}
          />
          <hr className="text-gray-700" />
          <div
            className="flex mt-2 mx-4 rounded-xl transition duration-150 cursor-pointer p-1 items-center hover:bg-gray-700 justify-between"
            onClick={() => {
              router.push("/api/auth/logout");
            }}
          >
            <div className="flex items-center gap-2">
              <ArrowLeftStartOnRectangleIcon className="w-12 text-gray-500" />
              <div className="flex flex-col">
                <p className="font-semibold">Logout</p>
                <p className="text-gray-500 text-sm">Klik untuk keluar</p>
              </div>
            </div>
            <ChevronRightIcon className="w-8 text-gray-800" />
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
};

export default Settings;
