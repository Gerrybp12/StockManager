"use client";
import { createSupabaseService } from "@/services/supabaseService";
import { useParams } from "next/navigation";

export default function editPage() {
  const params = useParams<{ id: string }>();
  const supabaseService = createSupabaseService();
}
