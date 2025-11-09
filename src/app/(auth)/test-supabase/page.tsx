"use client";

import { createClient } from "@supabase/supabase-js";
import { useEffect, useState } from "react";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// 👇 Crear cliente fuera del componente
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function TestSupabasePage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadProjects() {
      try {
        const { data, error } = await supabase.from("projects").select("*");
        if (error) throw error;
        setProjects(data || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadProjects();
  }, []);

  if (loading) return <p style={{ padding: 40 }}>Loading...</p>;
  if (error) return <p style={{ padding: 40, color: "red" }}>❌ {error}</p>;

  return (
    <div style={{ padding: 40 }}>
      <h1>🧠 Supabase Connection Test</h1>
      {projects.length === 0 ? (
        <p>No projects found.</p>
      ) : (
        <ul>
          {projects.map((p) => (
            <li key={p.id}>
              <strong>{p.title}</strong> — {p.status}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
