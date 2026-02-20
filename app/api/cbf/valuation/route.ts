import { NextRequest, NextResponse } from "next/server";
import { authMiddleware } from "@/lib/auth";
import { getPropertyValuation } from "@/lib/brain-client";

/**
 * POST /api/cbf/valuation
 * Obtiene la valuación estimada de una propiedad usando ML
 * Proxy al Homepty Brain
 * 
 * Headers requeridos:
 * - Authorization: Bearer <cbf_api_key>
 * 
 * Body (JSON):
 * {
 *   "area": number,
 *   "habitaciones": number,
 *   "banios": number,
 *   "id_estado": number,
 *   "id_ciudad": number,
 *   "tipo": string
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
    const requiredFields = ["area", "habitaciones", "banios", "id_estado", "id_ciudad", "tipo"];
    const missingFields = requiredFields.filter((field) => !(field in body));

    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Campos requeridos faltantes: ${missingFields.join(", ")}` },
        { status: 400 }
      );
    }

    // Llamar al Brain para obtener valuación
    const valuation = await getPropertyValuation({
      area: body.area,
      habitaciones: body.habitaciones,
      banios: body.banios,
      id_estado: body.id_estado,
      id_ciudad: body.id_ciudad,
      tipo: body.tipo,
    });

    if (!valuation) {
      return NextResponse.json(
        { error: "No se pudo obtener la valuación" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: valuation,
    });
  } catch (error) {
    console.error("Error inesperado:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
