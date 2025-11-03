"use client";
import { getInitials } from "@/utils/lib";
import { createClient } from "@/utils/supabase/client";
import { ProfileType } from "@/utils/types/profile";
import { CheckIcon, PencilIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { AnimatePresence, motion } from "motion/react";
import { ChangeEvent, FC, useRef, useState } from "react";
import AvatarEditor from "react-avatar-editor";
import { toast } from "react-toastify";

type ProfileAvatarSettingsProps = {
  profile: ProfileType;
};

const ProfileAvatarSettings: FC<ProfileAvatarSettingsProps> = ({ profile }) => {
  const [image, setImage] = useState<File | null>(null);
  const [scale, setScale] = useState(1.2);
  const editorRef = useRef<AvatarEditor>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };
  const handleSave = async () => {
    if (!editorRef.current) return;
    const supabase = createClient();
    setIsUploading(true);
    try {
      await supabase.storage
        .from("avatars")
        .remove([profile.avatar_url?.split("/").pop() || ""]);
      const canvas = editorRef.current.getImageScaledToCanvas();
      const dataUrl = canvas.toDataURL("image/png");
      const blob = await (await fetch(dataUrl)).blob();
      const filename = `avatar_${profile.id}_ ${Date.now()}.png`;
      const { error } = await supabase.storage
        .from("avatars")
        .upload(filename, blob, {
          upsert: true,
        });
      if (error) throw error;
      const {
        data: { publicUrl },
      } = supabase.storage.from("avatars").getPublicUrl(filename);
      const { error: ErrorUpdate } = await supabase
        .from("profiles")
        .update({
          avatar_url: publicUrl,
        })
        .eq("id", profile.id);
      if (ErrorUpdate) throw ErrorUpdate;
      setImage(null);
    } catch (error) {
      if (error instanceof Error) {
        toast.error("Gagal mengunggah avatar.");
        console.error("Error uploading avatar:", error.message);
        return;
      }
      console.error("Unexpected error:", error);
    } finally {
      setIsUploading(false);
    }
  };
  return (
    <>
      <AnimatePresence mode="wait">
        {image ? (
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 30, opacity: 0 }}
            className="fixed bg-gray-800 z-[999] w-fit h-fit left-0 top-0 rounded-xl"
          >
            <div className="relative flex items-center justify-center">
              <AvatarEditor
                ref={editorRef}
                image={image}
                width={200}
                height={200}
                border={50}
                borderRadius={100} // lingkaran
                color={[255, 255, 255, 0.6]} // warna background border
                scale={scale}
                rotate={0}
                className="rounded-xl"
              />
              <div className="loader"></div>
              {/* Slider Zoom */}
              <div className="absolute bottom-5 flex items-center justify-center w-full left-1/2 transform -translate-x-1/2">
                <input
                  type="range"
                  min="1"
                  max="3"
                  step="0.01"
                  value={scale}
                  onChange={(e) => setScale(parseFloat(e.target.value))}
                  className="w-48"
                />
              </div>

              {/* Tombol Simpan */}
              <button
                onClick={handleSave}
                className="absolute right-2 top-2 cursor-pointer z-[99]"
              >
                <CheckIcon className="w-8 text-gray-800" />
              </button>
              <button
                onClick={() => {
                  setImage(null);
                }}
                className="absolute top-2 left-2 cursor-pointer z-[99]"
              >
                <XMarkIcon className="w-8 text-gray-800" />
              </button>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
      <div
        className={`w-16 h-16 rounded-full ${
          profile.avatar_url ? `` : "bg-primary"
        } flex items-center justify-center text-white font-bold text-2xl relative`}
      >
        {profile.avatar_url ? (
          <img
            loading="lazy"
            src={profile.avatar_url}
            className="w-16 h-16 rounded-full"
            alt="Profil avatar"
          />
        ) : (
          <p>{getInitials(profile.username)}</p>
        )}
        <label
          htmlFor="uploadAvatar"
          className="absolute top-1 right-1 cursor-pointer"
        >
          <PencilIcon className="w-4" />
          <input
            type="file"
            id="uploadAvatar"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </label>
      </div>
    </>
  );
};

export default ProfileAvatarSettings;
