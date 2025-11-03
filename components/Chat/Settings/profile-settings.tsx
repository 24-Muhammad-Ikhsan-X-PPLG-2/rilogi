"use client";
import { getInitials } from "@/utils/lib";
import { createClient } from "@/utils/supabase/client";
import { ProfileType } from "@/utils/types/profile";
import { CheckIcon, PencilIcon } from "@heroicons/react/24/outline";
import { Dispatch, FC, SetStateAction, useState } from "react";
import { toast } from "react-toastify";
import ProfileAvatarSettings from "./profile-avatar-settings";

type ProfileSettingsProps = {
  profile: ProfileType;
  editBioMode: boolean;
  setEditBioMode: Dispatch<SetStateAction<boolean>>;
};

const ProfileSettings: FC<ProfileSettingsProps> = ({
  editBioMode,
  profile,
  setEditBioMode,
}) => {
  const [profileBio, setProfileBio] = useState(profile.bio);
  const handleEditBio = async () => {
    if (profileBio.trim() === "") {
      toast.error("Bio tidak boleh kosong.");
      setProfileBio(profile.bio);
      setEditBioMode(false);
      return;
    }
    const supabase = createClient();
    const { error: ErrorUpdate } = await supabase
      .from("profiles")
      .update({ bio: profileBio })
      .eq("id", profile.id);
    if (ErrorUpdate) {
      toast.error("Gagal memperbarui bio.");
      console.error("Error updating bio:", ErrorUpdate);
      setProfileBio(profile.bio);
      return;
    }
    setEditBioMode(false);
  };
  return (
    <div className="flex gap-2 items-center p-4">
      <ProfileAvatarSettings profile={profile} />
      <div className="flex flex-col">
        <h1 className="text-xl font-semibold">{profile.username}</h1>
        <div className="flex gap-1">
          {editBioMode ? (
            <>
              <input
                placeholder="Bio..."
                className="placeholder:text-sm text-sm outline-none w-fit max-w-full"
                autoFocus
                value={profileBio}
                onChange={({ target: { value } }) => setProfileBio(value)}
              />
              <CheckIcon
                className="w-4 cursor-pointer"
                onClick={handleEditBio}
              />
            </>
          ) : (
            <>
              <p className="text-sm text-gray-500">{profileBio}</p>
              <PencilIcon
                className="w-4 cursor-pointer"
                onClick={() => setEditBioMode(true)}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileSettings;
