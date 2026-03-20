import { createClient } from "./client";
import { createClient as createServerClient } from "./server";
import type { Database } from "./types";

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type ProfileUpdate = Database["public"]["Tables"]["profiles"]["Update"];

export interface SignUpData {
  email: string;
  password: string;
  username: string;
  fullName?: string;
}

export interface SignInData {
  email: string;
  password: string;
}

export interface AuthError {
  message: string;
  status?: number;
}

export interface AuthResult<T = void> {
  data: T | null;
  error: AuthError | null;
}

export async function signUp({
  email,
  password,
  username,
  fullName,
}: SignUpData): Promise<AuthResult> {
  const supabase = createClient();

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        username: username.toLowerCase().replace(/[^a-z0-9_]/g, "_"),
        full_name: fullName || null,
      },
    },
  });

  if (error) {
    return {
      data: null,
      error: { message: mapAuthError(error.message), status: error.status },
    };
  }

  return { data: null, error: null };
}

export async function signIn({
  email,
  password,
}: SignInData): Promise<AuthResult> {
  const supabase = createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return {
      data: null,
      error: { message: mapAuthError(error.message), status: error.status },
    };
  }

  return { data: null, error: null };
}

export async function signOut(): Promise<AuthResult> {
  const supabase = createClient();

  const { error } = await supabase.auth.signOut();

  if (error) {
    return {
      data: null,
      error: { message: error.message },
    };
  }

  return { data: null, error: null };
}

export async function getProfile(userId: string): Promise<AuthResult<Profile>> {
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) {
    return {
      data: null,
      error: { message: error.message },
    };
  }

  return { data, error: null };
}

export async function updateProfile(
  userId: string,
  updates: ProfileUpdate
): Promise<AuthResult<Profile>> {
  const supabase = createClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const profilesTable = supabase.from("profiles") as any;
  const { data, error } = await profilesTable
    .update(updates)
    .eq("id", userId)
    .select("*")
    .single();

  if (error) {
    return {
      data: null,
      error: { message: mapProfileError(error.message) },
    };
  }

  return { data: data as Profile, error: null };
}

export async function checkUsernameAvailable(
  username: string
): Promise<boolean> {
  const supabase = createClient();

  const { data } = await supabase
    .from("profiles")
    .select("id")
    .eq("username", username.toLowerCase())
    .maybeSingle();

  return data === null;
}

function mapAuthError(message: string): string {
  if (message.includes("Invalid login credentials")) {
    return "Onjuist e-mailadres of wachtwoord";
  }
  if (message.includes("Email not confirmed")) {
    return "Bevestig eerst je e-mailadres via de link in je inbox";
  }
  if (message.includes("User already registered")) {
    return "Er bestaat al een account met dit e-mailadres";
  }
  if (message.includes("Password should be")) {
    return "Wachtwoord moet minimaal 6 tekens bevatten";
  }
  if (message.includes("rate limit")) {
    return "Te veel pogingen. Probeer het later opnieuw";
  }
  return message;
}

function mapProfileError(message: string): string {
  if (message.includes("duplicate key") && message.includes("username")) {
    return "Deze gebruikersnaam is al in gebruik";
  }
  if (message.includes("username_length")) {
    return "Gebruikersnaam moet tussen 3 en 30 tekens zijn";
  }
  if (message.includes("username_format")) {
    return "Gebruikersnaam mag alleen kleine letters, cijfers en underscores bevatten";
  }
  return message;
}
