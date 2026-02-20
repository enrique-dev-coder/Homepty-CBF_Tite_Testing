import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Faltan las variables de entorno de Supabase. Verifica tu archivo .env.local"
  );
}

/**
 * Cliente de Supabase para el CBF
 * Este cliente se conecta a la base de datos central de Homepty
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Tipos de base de datos (sincronizados con app.homepty.com)
 */
export interface Property {
  id: number;
  nombre: string;
  descripcion: string | null;
  tipo: string;
  precio: number;
  area: number;
  area_construida: number | null;
  habitaciones: number;
  banios: number;
  estacionamientos: number | null;
  direccion: string;
  colonia: string | null;
  codigo_postal: string | null;
  id_estado: number;
  id_ciudad: number;
  id_tipo_accion: number;
  id_tipo_uso: number;
  id_usuario: string;
  is_unit: boolean;
  parent_id: number | null;
  descripcion_estado: string | null;
  descripcion_inversion: string | null;
  caracteristicas: string | null;
  created_at: string;
}

export interface PropertyImage {
  id: number;
  id_propiedad: number;
  image_url: string;
  created_at: string;
}

export interface PropertyWithImages extends Property {
  imagenes_propiedades: PropertyImage[];
}

export interface User {
  id: string;
  email_usuario: string;
  nombre_usuario: string | null;
  telefono_usuario: string | null;
  actividad_usuario: string | null;
  imagen_perfil_usuario: string | null;
  banner_usuario: string | null;
  descripcion_usuario: string | null;
  id_estado: number | null;
  id_ciudad: number | null;
  estado_usuario: boolean;
  fecha_creacion_usuario: string;
}

export interface UserSite {
  id: string;
  user_id: string;
  site_name: string;
  custom_domain: string | null;
  subdomain: string | null;
  cbf_api_key: string;
  is_active: boolean;
  theme_config: {
    primaryColor: string;
    secondaryColor: string;
    logo: string | null;
    banner: string | null;
    fontFamily: string;
  };
  seo_config: {
    title: string | null;
    description: string | null;
    keywords: string[];
  };
  created_at: string;
  updated_at: string;
}
