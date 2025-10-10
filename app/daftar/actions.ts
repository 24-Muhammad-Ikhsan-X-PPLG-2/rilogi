"use server";

import { generateTenDigit } from "@/utils/supabase/lib";
import { formSchemeDaftar } from "@/utils/schema";
import { createClient } from "@/utils/supabase/server";

export async function createUser(formData: FormData) {
  const supabase = await createClient();
  const data = formSchemeDaftar.parse({
    email: formData.get("email"),
    username: formData.get("username"),
    password: formData.get("password"),
  });
  try {
    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          username: data.username,
          email: data.email,
          rilo_id: generateTenDigit(),
        },
        emailRedirectTo: "http://localhost:3000/api/auth/callback",
      },
    });
    if (error) {
      return {
        error: true,
        message: error.message,
      };
    }
    return { error: false, message: "Sign Up Success" };
  } catch (e) {
    return {
      error: true,
      message: e instanceof Error ? e.message : "Unknown error",
    };
  }
}
