"use client";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Home() {
  const router = useRouter();
  return (
    <div className="flex justify-center items-center h-screen flex-col">
      <Button
        className="py-10 px-20"
        onClick={() => router.push("/addproduct")}
      >
        "Add Product"
      </Button>
      <Button
        className="py-10 px-20 my-10"
        onClick={() => router.push("/dashboard")}
      >
        "Dashboard"
      </Button>
    </div>
  );
}
