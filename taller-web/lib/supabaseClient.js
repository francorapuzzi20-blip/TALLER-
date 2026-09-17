import { createClient } from "@supabase/supabase-js";

// Estos valores son públicos por diseño (clave "publishable"):
// solo funcionan de forma segura junto con las políticas de RLS
// que configuramos en la base de datos.
const SUPABASE_URL = "https://bbivmwbqiqvhgzcewtoy.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_G5QgiFO2gBAApZYWA-NlXg_scE7YKNY";

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
