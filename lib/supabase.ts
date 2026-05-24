import { createClient } from "@supabase/supabase-js";
import type { BuildOrder } from "@/data/build-orders";

const url     = process.env.NEXT_PUBLIC_SUPABASE_URL      ?? "";
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

// Returns null when env vars are not configured — UI handles gracefully
export const supabase = url && anonKey ? createClient(url, anonKey) : null;

export type SupabaseBuildRow = {
  id: string;
  user_id: string;
  data: BuildOrder;
  created_at: string;
};

// ── Auth helpers ───────────────────────────────────────────────────────────

export async function signUpWithPassword(email: string, password: string) {
  if (!supabase) return { error: "Supabase not configured" };
  const { error } = await supabase.auth.signUp({ email, password });
  return { error: error?.message ?? null };
}

export async function signInWithPassword(email: string, password: string) {
  if (!supabase) return { error: "Supabase not configured" };
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  return { error: error?.message ?? null };
}

export async function signInWithGoogle() {
  if (!supabase) return { error: "Supabase not configured" };
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: `${window.location.origin}/builder` },
  });
  return { error: error?.message ?? null };
}

export async function signInWithMagicLink(email: string) {
  if (!supabase) return { error: "Supabase not configured" };
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: `${window.location.origin}/builder` },
  });
  return { error: error?.message ?? null };
}

export async function signOut() {
  if (!supabase) return;
  await supabase.auth.signOut();
}

export async function getSession() {
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  return data.session;
}

// ── Cloud build operations ─────────────────────────────────────────────────

export async function getCloudBuilds(userId: string): Promise<BuildOrder[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("custom_builds")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error || !data) return [];
  return data.map((row: SupabaseBuildRow) => ({
    ...row.data,
    authorId: row.user_id,
    createdAt: row.created_at,
  }));
}

export async function upsertCloudBuild(build: BuildOrder): Promise<boolean> {
  if (!supabase) return false;
  const { error } = await supabase
    .from("custom_builds")
    .upsert({ id: build.id, data: build }, { onConflict: "id" });
  return !error;
}

export async function deleteCloudBuild(id: string): Promise<boolean> {
  if (!supabase) return false;
  const { error } = await supabase.from("custom_builds").delete().eq("id", id);
  return !error;
}
