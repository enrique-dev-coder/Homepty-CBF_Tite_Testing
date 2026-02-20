import { NextRequest, NextResponse } from "next/server";
import { supabase } from "./supabase";

/**
 * Verifica que la API Key proporcionada sea válida
 * @param apiKey - CBF API Key del header Authorization
 * @returns userId si es válida, null si no lo es
 */
export async function verifyApiKey(apiKey: string): Promise<string | null> {
  if (!apiKey || !apiKey.startsWith("cbf_live_")) {
    return null;
  }

  try {
    // Buscar el sitio con esta API Key
    const { data, error } = await supabase
      .from("user_sites")
      .select("user_id, is_active")
      .eq("cbf_api_key", apiKey)
      .single();

    if (error || !data) {
      console.error("API Key no encontrada:", error);
      return null;
    }

    // Verificar que el sitio esté activo
    if (!data.is_active) {
      console.error("Sitio inactivo para API Key:", apiKey.substring(0, 15) + "...");
      return null;
    }

    return data.user_id;
  } catch (error) {
    console.error("Error al verificar API Key:", error);
    return null;
  }
}

/**
 * Middleware para proteger rutas de la CBF API
 * Extrae y valida la API Key del header Authorization
 */
export async function authMiddleware(
  request: NextRequest
): Promise<{ userId: string } | NextResponse> {
  const authHeader = request.headers.get("Authorization");

  if (!authHeader) {
    return NextResponse.json(
      { error: "Missing Authorization header" },
      { status: 401 }
    );
  }

  // Formato esperado: "Bearer cbf_live_xxxxx"
  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") {
    return NextResponse.json(
      { error: "Invalid Authorization header format. Expected: Bearer <api_key>" },
      { status: 401 }
    );
  }

  const apiKey = parts[1];
  const userId = await verifyApiKey(apiKey);

  if (!userId) {
    return NextResponse.json(
      { error: "Invalid or inactive API Key" },
      { status: 401 }
    );
  }

  return { userId };
}
