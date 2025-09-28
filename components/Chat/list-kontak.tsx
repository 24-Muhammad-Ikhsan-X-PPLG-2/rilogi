"use client";
import { useTheme } from "@/providers/theme-provider";
import { createClient } from "@/utils/supabase/client";
import { KontakType, ListKontakType } from "@/utils/types/kontak";
import { ProfileType } from "@/utils/types/profile";
import { PostgrestMaybeSingleResponse } from "@supabase/supabase-js";
import React, { FC, Fragment, useEffect, useState } from "react";
import Kontak from "./kontak";
import { useChat } from "@/providers/chat-provider";

type ListKontakProps = {
  profile: ProfileType;
};

const ListKontak: FC<ListKontakProps> = ({ profile }) => {
  const { theme } = useTheme();
  const { kontak } = useChat();
  return (
    <div className="w-full p-2">
      {kontak.map((item, idx) => (
        <Kontak item={item} key={idx} />
      ))}
    </div>
  );
};

export default ListKontak;
