"use server";

import { formSchemeAddContact } from "@/utils/schema";
import { createClient } from "@/utils/supabase/server";
import { KontakType, ListKontakType } from "@/utils/types/kontak";
import { PostgrestMaybeSingleResponse } from "@supabase/supabase-js";

export async function AddContactAction(formData: FormData) {
  const supabase = await createClient();
  const data = formSchemeAddContact.parse({
    rilo_id: formData.get("rilo_id"),
    nama_kontak: formData.get("nama_kontak"),
  });
  let kontak: ListKontakType[] = [];
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return {
        error: true,
        message: "Belum login!",
      };
    }
    const { data: DataKontak } = (await supabase
      .from("kontak")
      .select("*")
      .eq("id", user.id)
      .maybeSingle()) as PostgrestMaybeSingleResponse<KontakType>;
    if (!DataKontak) {
      kontak = [
        {
          rilo_id: data.rilo_id,
          nama_kontak: data.nama_kontak,
        },
      ];
      const { error: ErrorInsert } = await supabase.from("kontak").insert({
        id: user.id,
        list_kontak: kontak,
      });
      if (ErrorInsert) {
        return {
          error: true,
          message: ErrorInsert.message,
        };
      }
      return {
        error: false,
        message: "Sukses tambah kontak",
      };
    }
    kontak = DataKontak.list_kontak;
    const sudahAdaKontak = kontak.find((list) => list.rilo_id == data.rilo_id);
    if (sudahAdaKontak) {
      return {
        error: true,
        message: "Kontak sudah pernah disimpan sebelumnya!",
      };
    }
    const newKontak: ListKontakType[] = [
      ...kontak,
      {
        rilo_id: data.rilo_id,
        nama_kontak: data.nama_kontak,
      },
    ];
    const { error: ErrorUpdate } = await supabase
      .from("kontak")
      .update({
        list_kontak: newKontak,
      })
      .eq("id", user.id);
    if (ErrorUpdate) {
      return {
        error: true,
        message: ErrorUpdate.message,
      };
    }
    return {
      error: false,
      message: "Sukses tambah kontak",
    };
  } catch (e) {
    return {
      error: true,
      message: e instanceof Error ? e.message : "Unknown error",
    };
  }
}
