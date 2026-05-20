import { createClient } from "@supabase/supabase-js";

/* ============================================================
   Conexión a Supabase
   Las claves se leen de variables de entorno (archivo .env o
   configuradas en Cloudflare Pages). NUNCA escribas tus claves
   directamente aquí.
   ============================================================ */
const URL = import.meta.env.VITE_SUPABASE_URL;
const ANON = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!URL || !ANON) {
  console.error(
    "Faltan VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY. " +
      "Configúralas en el archivo .env (local) y en Cloudflare Pages."
  );
}

export const supabase = createClient(URL || "", ANON || "");

const TABLE = "app_state";

// Marca de tiempo de la última escritura propia por clave, para no
// reaccionar a los cambios en tiempo real que generamos nosotros mismos.
const selfWrites = {};

/* ------------------------------------------------------------
   API compatible con el resto de la app: store.get / store.set
   - get(key)  -> string JSON o null
   - set(key,v)-> guarda string JSON
   ------------------------------------------------------------ */
export const store = {
  async get(key) {
    try {
      const { data, error } = await supabase
        .from(TABLE)
        .select("value")
        .eq("key", key)
        .maybeSingle();
      if (error) {
        console.warn("Supabase get", error.message);
        return null;
      }
      return data ? data.value : null;
    } catch (e) {
      console.warn("Supabase get", e);
      return null;
    }
  },

  async set(key, v) {
    const s = typeof v === "string" ? v : JSON.stringify(v);
    selfWrites[key] = Date.now();
    try {
      const { error } = await supabase
        .from(TABLE)
        .upsert(
          { key, value: s, updated_at: new Date().toISOString() },
          { onConflict: "key" }
        );
      if (error) console.warn("Supabase set", error.message);
    } catch (e) {
      console.warn("Supabase set", e);
    }
  },
};

/* ------------------------------------------------------------
   Suscripción en tiempo real.
   onRemoteChange(key) se llama cuando OTRO dispositivo cambia
   un registro. Se ignoran los cambios propios recientes.
   ------------------------------------------------------------ */
export function subscribeRealtime(onRemoteChange) {
  const channel = supabase
    .channel("app_state_rt")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: TABLE },
      (payload) => {
        const key = payload.new?.key || payload.old?.key;
        if (!key) return;
        const last = selfWrites[key] || 0;
        if (Date.now() - last < 5000) return; // fue un cambio nuestro
        onRemoteChange(key);
      }
    )
    .subscribe();

  return {
    unsubscribe() {
      try {
        supabase.removeChannel(channel);
      } catch {}
    },
  };
}
