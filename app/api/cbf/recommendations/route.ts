import { NextRequest, NextResponse } from "next/server";
import { authMiddleware } from "@/lib/auth";
import { getPropertyRecommendations } from "@/lib/brain-client";

/**
 * POST /api/cbf/recommendations
 * Obtiene recomendaciones de propiedades basadas en preferencias del usuario
 * Proxy al Homepty Brain
 * 
 * Headers requeridos:
 * - Authorization: Bearer <cbf_api_key>
 * 
 * Body (JSON):
 * {
 *   "budget": number,
 *   "area": number,
 *   "habitaciones": number,
 *   "id_estado": number
 * }
 */
export async function POST(request: NextRequest) {
  // Autenticar la solicitud
  const authResult = await authMiddleware(request);
  if (authResult instanceof NextResponse) {
    return authResult; // Error de autenticación
  }

  try {
    const body = await request.json();

    // Validar campos requeridos
    const requiredFields = ["budget", "area", "habitaciones", "id_estado"];
    const missingFields = requiredFields.filter((field) => !(field in body));

    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Campos requeridos faltantes: ${missingFields.join(", ")}` },
        { status: 400 }
      );
    }

    // Llamar al Brain para obtener recomendaciones
    const recommendations = await getPropertyRecommendations({
      budget: body.budget,
      area: body.area,
      habitaciones: body.habitaciones,
      id_estado: body.id_estado,
    });

    return NextResponse.json({
      success: true,
      data: recommendations,
    });
  } catch (error) {
    console.error("Error inesperado:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
