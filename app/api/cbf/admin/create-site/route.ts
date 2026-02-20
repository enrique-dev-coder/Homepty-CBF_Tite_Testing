import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

/**
 * Endpoint ADMIN para crear un sitio satélite para un usuario
 * 
 * Este endpoint es llamado por el equipo de Homepty para activar
 * un sitio satélite para un usuario específico.
 * 
 * POST /api/cbf/admin/create-site
 * 
 * Body:
 * {
 *   "user_id_supabase": "uuid-del-usuario",
 *   "site_name": "Nombre del Sitio",
 *   "subdomain": "subdominio-opcional",
 *   "custom_domain": "dominio-opcional.com"
 * }
 * 
 * Headers:
 * - Authorization: Bearer [ADMIN_API_KEY]
 * 
 * Response:
 * {
 *   "ok": true,
 *   "message": "Sitio creado exitosamente",
 *   "data": {
 *     "site_id": "uuid",
 *     "cbf_api_key": "cbf_live_...",
 *     "site_url": "https://..."
 *   }
 * }
 */

// Generar API Key única para el sitio
function generateCBFApiKey(userId: string): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 15);
  const userPart = userId.substring(0, 8);
  return `cbf_live_${userPart}${timestamp}${random}`;
}

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticación de admin
    const authHeader = request.headers.get("authorization");
    const adminKey = process.env.CBF_ADMIN_API_KEY;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { ok: false, message: "No autorizado" },
        { status: 401 }
      );
    }

    const providedKey = authHeader.substring(7);
    
    // Si no hay admin key configurada, rechazar
    if (!adminKey) {
      return NextResponse.json(
        { ok: false, message: "Servicio no configurado" },
        { status: 500 }
      );
    }

    if (providedKey !== adminKey) {
      return NextResponse.json(
        { ok: false, message: "API Key inválida" },
        { status: 401 }
      );
    }

    // Parsear el body
    const body = await request.json();
    const { user_id_supabase, site_name, subdomain, custom_domain } = body;

    // Validar campos requeridos
    if (!user_id_supabase || !site_name) {
      return NextResponse.json(
        {
          ok: false,
          message: "Faltan campos requeridos: user_id_supabase, site_name",
        },
        { status: 400 }
      );
    }

    // Usar el cliente de Supabase

    // Verificar que el usuario existe
    const { data: user, error: userError } = await supabase
      .from("usuarios")
      .select("id_usuario, nombre_usuario")
      .eq("id_usuario_supabase", user_id_supabase)
      .single();

    if (userError || !user) {
      return NextResponse.json(
        { ok: false, message: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    // Verificar que el usuario no tenga ya un sitio
    const { data: existingSite } = await supabase
      .from("user_sites")
      .select("id")
      .eq("user_id_supabase", user_id_supabase)
      .single();

    if (existingSite) {
      return NextResponse.json(
        { ok: false, message: "El usuario ya tiene un sitio creado" },
        { status: 400 }
      );
    }

    // Generar API Key única
    const cbfApiKey = generateCBFApiKey(user_id_supabase);

    // Crear el sitio en la base de datos
    const { data: newSite, error: createError } = await supabase
      .from("user_sites")
      .insert({
        user_id_supabase,
        site_name,
        subdomain,
        custom_domain,
        cbf_api_key: cbfApiKey,
        is_active: true,
        theme_config: {
          primaryColor: "#3B82F6",
          secondaryColor: "#10B981",
          fontFamily: "Inter",
        },
        seo_config: {
          title: site_name,
          description: `Sitio web de ${user.nombre_usuario}`,
        },
      })
      .select()
      .single();

    if (createError) {
      console.error("Error al crear sitio:", createError);
      return NextResponse.json(
        { ok: false, message: "Error al crear el sitio" },
        { status: 500 }
      );
    }

    // Construir URL del sitio
    const siteUrl = custom_domain
      ? `https://${custom_domain}`
      : subdomain
      ? `https://${subdomain}.homepty.com`
      : null;

    // Retornar respuesta exitosa
    return NextResponse.json({
      ok: true,
      message: "Sitio creado exitosamente",
      data: {
        site_id: newSite.id,
        user_name: user.nombre_usuario,
        site_name: newSite.site_name,
        cbf_api_key: cbfApiKey,
        site_url: siteUrl,
        is_active: newSite.is_active,
      },
    });
  } catch (error) {
    console.error("Error en create-site:", error);
    return NextResponse.json(
      { ok: false, message: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
