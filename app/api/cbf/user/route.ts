import { NextRequest, NextResponse } from "next/server";
import { authMiddleware } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

/**
 * GET /api/cbf/user
 * Obtiene la información del usuario autenticado y su configuración de sitio
 * 
 * Headers requeridos:
 * - Authorization: Bearer <cbf_api_key>
 */
export async function GET(request: NextRequest) {
  // Autenticar la solicitud
  const authResult = await authMiddleware(request);
  if (authResult instanceof NextResponse) {
    return authResult; // Error de autenticación
  }

  const { userId } = authResult;

  try {
    // Obtener información del usuario
    const { data: userData, error: userError } = await supabase
      .from("usuarios")
      .select("*")
      .eq("id", userId)
      .single();

    if (userError) {
      console.error("Error al obtener usuario:", userError);
      return NextResponse.json(
        { error: "Error al obtener información del usuario" },
        { status: 500 }
      );
    }

    // Obtener configuración del sitio
    const { data: siteData, error: siteError } = await supabase
      .from("user_sites")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (siteError && siteError.code !== "PGRST116") {
      console.error("Error al obtener configuración del sitio:", siteError);
      // No es error crítico, continuar sin configuración de sitio
    }

    return NextResponse.json({
      success: true,
      data: {
        user: userData,
        site: siteData || null,
      },
    });
  } catch (error) {
    console.error("Error inesperado:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
