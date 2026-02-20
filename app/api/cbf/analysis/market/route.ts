import { NextRequest, NextResponse } from "next/server";
import { authMiddleware } from "@/lib/auth";
import { getMarketAnalysis } from "@/lib/brain-client";

/**
 * GET /api/cbf/analysis/market
 * Obtiene análisis de mercado para una zona específica
 * Proxy al Homepty Brain
 * 
 * Headers requeridos:
 * - Authorization: Bearer <cbf_api_key>
 * 
 * Query params:
 * - id_estado: ID del estado (requerido)
 * - id_ciudad: ID de la ciudad (requerido)
 * - colonia: Colonia (opcional)
 */
export async function GET(request: NextRequest) {
  // Autenticar la solicitud
  const authResult = await authMiddleware(request);
  if (authResult instanceof NextResponse) {
    return authResult; // Error de autenticación
  }

  try {
    // Obtener parámetros de query
    const { searchParams } = new URL(request.url);
    const idEstado = searchParams.get("id_estado");
    const idCiudad = searchParams.get("id_ciudad");
    const colonia = searchParams.get("colonia");

    if (!idEstado || !idCiudad) {
      return NextResponse.json(
        { error: "Parámetros id_estado e id_ciudad son requeridos" },
        { status: 400 }
      );
    }

    // Llamar al Brain para obtener análisis de mercado
    const analysis = await getMarketAnalysis({
      id_estado: parseInt(idEstado),
      id_ciudad: parseInt(idCiudad),
      colonia: colonia || undefined,
    });

    if (!analysis) {
      return NextResponse.json(
        { error: "No se pudo obtener el análisis de mercado" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: analysis,
    });
  } catch (error) {
    console.error("Error inesperado:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
