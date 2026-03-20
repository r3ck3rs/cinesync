export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string;
          full_name: string | null;
          avatar_url: string | null;
          bio: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          username: string;
          full_name?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          username?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          updated_at?: string;
        };
      };
      plans: {
        Row: {
          id: string;
          created_by: string;
          title: string;
          tmdb_movie_id: number | null;
          movie_title: string | null;
          movie_poster_path: string | null;
          scheduled_at: string | null;
          location: string | null;
          cinema_id: string | null;
          cinema_name: string | null;
          notes: string | null;
          is_public: boolean;
          max_spots: number | null;
          status: "planning" | "confirmed" | "done" | "cancelled";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          created_by: string;
          title: string;
          tmdb_movie_id?: number | null;
          movie_title?: string | null;
          movie_poster_path?: string | null;
          scheduled_at?: string | null;
          location?: string | null;
          cinema_id?: string | null;
          cinema_name?: string | null;
          notes?: string | null;
          is_public?: boolean;
          max_spots?: number | null;
          status?: "planning" | "confirmed" | "done" | "cancelled";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          title?: string;
          tmdb_movie_id?: number | null;
          movie_title?: string | null;
          movie_poster_path?: string | null;
          scheduled_at?: string | null;
          location?: string | null;
          cinema_id?: string | null;
          cinema_name?: string | null;
          notes?: string | null;
          is_public?: boolean;
          max_spots?: number | null;
          status?: "planning" | "confirmed" | "done" | "cancelled";
          updated_at?: string;
        };
      };
      plan_members: {
        Row: {
          id: string;
          plan_id: string;
          user_id: string;
          role: "owner" | "member";
          rsvp: "pending" | "accepted" | "declined";
          joined_at: string;
        };
        Insert: {
          id?: string;
          plan_id: string;
          user_id: string;
          role?: "owner" | "member";
          rsvp?: "pending" | "accepted" | "declined";
          joined_at?: string;
        };
        Update: {
          rsvp?: "pending" | "accepted" | "declined";
        };
      };
      friendships: {
        Row: {
          id: string;
          requester_id: string;
          addressee_id: string;
          status: "pending" | "accepted" | "blocked";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          requester_id: string;
          addressee_id: string;
          status?: "pending" | "accepted" | "blocked";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          status?: "pending" | "accepted" | "blocked";
          updated_at?: string;
        };
      };
      messages: {
        Row: {
          id: string;
          plan_id: string;
          sender_id: string;
          content: string;
          created_at: string;
          edited_at: string | null;
        };
        Insert: {
          id?: string;
          plan_id: string;
          sender_id: string;
          content: string;
          created_at?: string;
          edited_at?: string | null;
        };
        Update: {
          content?: string;
          edited_at?: string | null;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
