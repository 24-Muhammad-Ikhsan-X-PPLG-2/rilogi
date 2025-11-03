"use client";
import { useTheme } from "@/providers/theme-provider";
import {
  DocumentIcon,
  PhotoIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { AnimatePresence, motion } from "motion/react";
import {
  ChangeEvent,
  Dispatch,
  FC,
  SetStateAction,
  useEffect,
  useRef,
  useState,
} from "react";

type ChatInsertProps = {
  setShow: Dispatch<SetStateAction<boolean>>;
  show: boolean;
  setFileImg: Dispatch<SetStateAction<File | null>>;
  fileImg: File | null;
};

const ChatInsert: FC<ChatInsertProps> = ({
  setShow,
  show,
  fileImg,
  setFileImg,
}) => {
  const targetRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();
  const [previewImg, setPreviewImg] = useState<string | null>(null);
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setShow(false);
      setFileImg(selected);
      setPreviewImg(URL.createObjectURL(selected));
    }
  };
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (targetRef.current && !targetRef.current.contains(e.target as Node)) {
        setShow(false);
      }
    };
    window.addEventListener("mousedown", handleClickOutside);
    return () => window.removeEventListener("mousedown", handleClickOutside);
  }, []);
  useEffect(() => {
    if (!fileImg) {
      setPreviewImg(null);
    }
  }, [fileImg]);
  const handleCancelPreview = () => {
    setPreviewImg(null);
    if (fileImg) {
      URL.revokeObjectURL(fileImg.name);
      setFileImg(null);
    }
  };
  return (
    <AnimatePresence mode="wait">
      {previewImg ? (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          key="previewImgMenu"
          className="w-full shadow-xl p-5 bg-gray-800 h-96 absolute bottom-20 z-[999] rounded-xl -left-1 transform translate-x-1 flex items-center justify-center"
        >
          <XMarkIcon
            className="w-8 cursor-pointer absolute top-5 left-5"
            onClick={handleCancelPreview}
          />
          <img src={previewImg} className="w-64 rounded-lg" alt="" />
        </motion.div>
      ) : null}
      {show ? (
        <motion.div
          ref={targetRef}
          key="insertMenu"
          initial={{ scale: 0, y: 100, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0, y: 100, opacity: 0 }}
          className={`absolute bottom-20 -left-5 ${
            theme === "dark" ? "bg-gray-800" : "bg-white"
          } flex flex-col gap-1 w-fit h-fit rounded-lg shadow p-2 z-[999]`}
        >
          <label
            htmlFor="fotoInput"
            className="flex gap-1 items-center p-1 cursor-pointer hover:bg-gray-600 rounded-lg transition duration-150"
          >
            <PhotoIcon className="w-7" />
            <p className="font-medium">Foto</p>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              id="fotoInput"
              onChange={handleFileChange}
            />
          </label>
          <div className="flex gap-1 items-center p-1 cursor-pointer hover:bg-gray-600 rounded-lg transition duration-150">
            <DocumentIcon className="w-7" />
            <p className="font-medium">Dokumen</p>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
};

export default ChatInsert;
