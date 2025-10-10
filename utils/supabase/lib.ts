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
export async function generateTenDigit(): Promise<string> {
  return Math.floor(Math.random() * 1_000_000_0000) // 0 s/d 9,999,999,999
    .toString()
    .padStart(10, "0");
}
