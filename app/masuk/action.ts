"use server";
import { formSchemeMasuk } from "@/utils/schema";
import { createClient } from "@/utils/supabase/server";

export async function login(formData: FormData) {
  const supabase = await createClient();
  const data = formSchemeMasuk.parse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  try {
    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });
    if (error) {
      return {
        error: true,
        message: error.message,
      };
    }
    return { error: false, message: "Sign In Success" };
  } catch (e) {
    return {
      error: true,
      message: e instanceof Error ? e.message : "Unknown error",
    };
  }
}
