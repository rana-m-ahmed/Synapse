"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

export async function signup(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (password !== confirmPassword) {
    redirect(`/register?error=${encodeURIComponent("Passwords do not match.")}`);
  }

  if (password.length < 6) {
    redirect(`/register?error=${encodeURIComponent("Password must be at least 6 characters.")}`);
  }

  const data = {
    email,
    password,
  };

  const { data: authData, error } = await supabase.auth.signUp(data);

  if (error) {
    redirect(`/register?error=${encodeURIComponent(error.message)}`);
  }

  if (!authData.session) {
    redirect(`/login?error=${encodeURIComponent("Account created. Please verify your email before logging in.")}`);
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}
