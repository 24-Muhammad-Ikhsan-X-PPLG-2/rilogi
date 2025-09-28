"use server";
import { PostgrestMaybeSingleResponse, User } from "@supabase/supabase-js";
import { createClient } from "./server";
import { ProfileType } from "../types/profile";
import { KontakType, ListKontakType } from "../types/kontak";

export async function getUserProfile(user: User) {
  const supabase = await createClient();
  const { data } = (await supabase
    .from("profiles")
    .select("*")
    .eq("email", user.email)
    .maybeSingle()) as PostgrestMaybeSingleResponse<ProfileType>;
  return data;
}
