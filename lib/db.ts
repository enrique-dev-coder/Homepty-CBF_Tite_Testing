import { supabase, UserSite } from "./supabase";

/**
 * Obtiene la configuración del sitio por dominio
 * @param domain - Dominio del sitio (puede ser custom_domain o subdomain)
 * @returns Configuración del sitio o null si no existe
 */
export async function getSiteByDomain(domain: string) {
  try {
    // Intentar encontrar por custom_domain primero
    let { data, error } = await supabase
      .from("user_sites")
      .select("*")
      .eq("custom_domain", domain)
      .eq("is_active", true)
      .single();

    // Si no se encuentra, intentar por subdomain
    if (error && error.code === "PGRST116") {
      // Extraer subdomain si el dominio incluye .homepty.com
      const subdomain = domain.replace(".homepty.com", "");
      
      const subdomainResult = await supabase
        .from("user_sites")
        .select("*")
        .eq("subdomain", subdomain)
        .eq("is_active", true)
        .single();

      data = subdomainResult.data;
      error = subdomainResult.error;
    }

    if (error || !data) {
      console.error("Sitio no encontrado para dominio:", domain);
      return null;
    }

    const siteConfig = data as UserSite;

    // Retornar configuración en el formato esperado por el PageRenderer
    return {
      domain,
      userId: siteConfig.user_id,
      config: {
        theme: {
          primary_color: siteConfig.theme_config.primaryColor,
          secondary_color: siteConfig.theme_config.secondaryColor,
          font_family: siteConfig.theme_config.fontFamily,
          logo: siteConfig.theme_config.logo,
          banner: siteConfig.theme_config.banner,
        },
        seo: {
          title: siteConfig.seo_config.title || siteConfig.site_name,
          description: siteConfig.seo_config.description || "",
          keywords: siteConfig.seo_config.keywords || [],
        },
        // Configuración por defecto de páginas
        // Esto puede ser customizable en el futuro desde la tabla user_sites
        pages: [
          {
            route: "/",
            title: "Inicio",
            slots: [
              {
                slot_name: "hero",
                component_id: "HeroSearchV1",
                props: {
                  title: siteConfig.site_name,
                },
              },
              {
                slot_name: "grid",
                component_id: "PropertyGridV2",
                props: {
                  title: "Propiedades Destacadas",
                },
              },
            ],
          },
          {
            route: "/propiedad/[id]",
            title: "Detalle de Propiedad",
            slots: [
              {
                slot_name: "details",
                component_id: "PropertyDetailsV3",
                props: {},
              },
              {
                slot_name: "form",
                component_id: "LeadCaptureFormV2",
                props: {},
              },
            ],
          },
        ],
      },
    };
  } catch (error) {
    console.error("Error al obtener configuración del sitio:", error);
    return null;
  }
}

/**
 * Obtiene las propiedades del usuario propietario del sitio
 * @param userId - ID del usuario
 * @param limit - Límite de resultados
 * @returns Lista de propiedades con imágenes
 */
export async function getPropertiesByUser(userId: string, limit: number = 50) {
  try {
    const { data, error } = await supabase
      .from("propiedades")
      .select("*, imagenes_propiedades(*)")
      .eq("id_usuario", userId)
      .eq("is_unit", false) // Solo propiedades principales, no unidades
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Error al obtener propiedades:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Error inesperado al obtener propiedades:", error);
    return [];
  }
}

/**
 * Obtiene una propiedad específica por ID
 * @param propertyId - ID de la propiedad
 * @param userId - ID del usuario (para verificar permisos)
 * @returns Propiedad con imágenes y amenidades
 */
export async function getPropertyById(propertyId: number, userId: string) {
  try {
    const { data, error } = await supabase
      .from("propiedades")
      .select("*, imagenes_propiedades(*), amenidades_propiedades(*)")
      .eq("id", propertyId)
      .eq("id_usuario", userId)
      .single();

    if (error) {
      console.error("Error al obtener propiedad:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Error inesperado al obtener propiedad:", error);
    return null;
  }
}
