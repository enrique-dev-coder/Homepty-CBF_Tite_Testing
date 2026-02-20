import { NextRequest, NextResponse } from "next/server";
import { authMiddleware } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

/**
 * GET /api/cbf/properties/[id]
 * Obtiene una propiedad específica por ID
 * 
 * Headers requeridos:
 * - Authorization: Bearer <cbf_api_key>
 * 
 * Params:
 * - id: ID de la propiedad
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Autenticar la solicitud
  const authResult = await authMiddleware(request);
  if (authResult instanceof NextResponse) {
    return authResult; // Error de autenticación
  }

  const { userId } = authResult;
  const { id } = await params;

  try {
    const propertyId = parseInt(id);
    if (isNaN(propertyId)) {
      return NextResponse.json(
        { error: "ID de propiedad inválido" },
        { status: 400 }
      );
    }

    // Obtener la propiedad con sus imágenes y amenidades
    const { data, error } = await supabase
      .from("propiedades")
      .select("*, imagenes_propiedades(*), amenidades_propiedades(*)")
      .eq("id", propertyId)
      .eq("id_usuario", userId)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json(
          { error: "Propiedad no encontrada" },
          { status: 404 }
        );
      }
      console.error("Error al obtener propiedad:", error);
      return NextResponse.json(
        { error: "Error al obtener la propiedad" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Error inesperado:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
