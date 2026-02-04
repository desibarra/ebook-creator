"use client";

import { useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
);

export default function TestInsertPage() {
  const [status, setStatus] = useState("");

  const handleInsert = async () => {
    try {
      setStatus("Inserting...");
      const { error } = await supabase.from("projects").insert([
        {
          user_id: "00000000-0000-0000-0000-000000000000",
          title: "Test con React 18",
          description: "Insert desde entorno estable",
          status: "draft",
        },
      ]);

      if (error) throw error;
      setStatus("✅ Proyecto insertado correctamente");
    } catch (err: unknown) {
      console.error(err);
      const msg = err instanceof Error ? err.message : "Error desconocido";
      setStatus("❌ " + msg);
    }
  };

  return (
    <main style={{ padding: 40 }}>
      <h1>🧩 Test Supabase Insert (React 18 + Next 15.1)</h1>
      <button
        onClick={handleInsert}
        style={{
          backgroundColor: "#111",
          color: "#fff",
          padding: "10px 20px",
          borderRadius: 8,
          cursor: "pointer",
        }}
      >
        Insertar Proyecto
      </button>
      <p style={{ marginTop: 20 }}>{status}</p>
    </main>
  );
}
