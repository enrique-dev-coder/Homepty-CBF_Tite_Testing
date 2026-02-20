# Homepty CBF (Core Backend Framework)

Backend base para sitios satélite del ecosistema Homepty. Este framework proporciona la infraestructura necesaria para que los usuarios de Homepty puedan tener sus propios sitios web personalizados, conectados a la base de datos central y con acceso a la inteligencia de Homepty Brain.

## Características

- ✅ **API REST** para consumo de datos desde sitios satélite
- ✅ **Autenticación** mediante CBF API Key
- ✅ **Conexión a Supabase** (base de datos central de Homepty)
- ✅ **Sistema de componentes dinámicos** (PageRenderer)
- ✅ **Multi-tenant** (cada usuario tiene su propio sitio)
- ✅ **Personalización** de tema y SEO por usuario

## Requisitos

- Node.js 18+
- npm o pnpm
- Cuenta en Supabase (compartida con app.homepty.com)

## Instalación

1. Clonar el repositorio:
```bash
git clone https://github.com/LaloVO/Homepty-CBF_Tite_Testing.git
cd Homepty-CBF_Tite_Testing
```

2. Instalar dependencias:
```bash
npm install
```

3. Configurar variables de entorno:
```bash
cp .env.example .env.local
```

Editar `.env.local` con tus credenciales de Supabase:
```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
```

4. Ejecutar en desarrollo:
```bash
npm run dev
```

## API Endpoints

### Autenticación

Todos los endpoints de la CBF API requieren autenticación mediante el header `Authorization`:

```
Authorization: Bearer cbf_live_xxxxxxxxxxxxx
```

### GET /api/cbf/properties

Obtiene las propiedades del usuario autenticado.

**Query params:**
- `limit` (opcional): Número de resultados (default: 50, max: 100)
- `offset` (opcional): Offset para paginación (default: 0)
- `tipo` (opcional): Filtrar por tipo de propiedad
- `id_tipo_accion` (opcional): Filtrar por tipo de acción (1=Venta, 2=Renta)
- `is_unit` (opcional): Filtrar por unidades (true/false)

**Ejemplo:**
```bash
curl -H "Authorization: Bearer cbf_live_xxxxx" \
  "http://localhost:3000/api/cbf/properties?limit=10"
```

**Respuesta:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "nombre": "Casa en Venta",
      "precio": 2500000,
      "habitaciones": 3,
      "banios": 2,
      "area": 150,
      "imagenes_propiedades": [...]
    }
  ],
  "pagination": {
    "limit": 10,
    "offset": 0,
    "total": 25
  }
}
```

### GET /api/cbf/properties/[id]

Obtiene una propiedad específica por ID.

**Ejemplo:**
```bash
curl -H "Authorization: Bearer cbf_live_xxxxx" \
  "http://localhost:3000/api/cbf/properties/123"
```

### GET /api/cbf/user

Obtiene la información del usuario autenticado y su configuración de sitio.

**Ejemplo:**
```bash
curl -H "Authorization: Bearer cbf_live_xxxxx" \
  "http://localhost:3000/api/cbf/user"
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "nombre_usuario": "Juan Pérez",
      "email_usuario": "juan@example.com"
    },
    "site": {
      "site_name": "Mi Inmobiliaria",
      "subdomain": "juan-perez",
      "theme_config": {
        "primaryColor": "#3B82F6",
        "secondaryColor": "#1E40AF"
      }
    }
  }
}
```

## Arquitectura

```
Homepty-CBF/
├── app/
│   ├── api/cbf/          # Endpoints de la CBF API
│   ├── components/       # Componentes dinámicos
│   ├── page.tsx          # Página principal
│   └── layout.tsx        # Layout principal
├── lib/
│   ├── supabase.ts       # Cliente de Supabase
│   ├── auth.ts           # Middleware de autenticación
│   └── db.ts             # Funciones de base de datos
└── README.md
```

## Sistema de Componentes Dinámicos

El CBF utiliza un sistema de componentes dinámicos que permite a cada usuario personalizar la estructura de su sitio. Los componentes disponibles son:

- `HeroSearchV1`: Hero con buscador
- `PropertyGridV2`: Grid de propiedades
- `PropertyDetailsV3`: Detalle de propiedad
- `LeadCaptureFormV2`: Formulario de captura de leads
- `ValuationChartV1`: Gráfico de valuación

## Integración con Homepty Brain

(Por implementar en Fase 2.1)

El CBF se conectará con `homepty-brain-v1` para proporcionar:
- Análisis de mercado
- Predicciones de precios
- Recomendaciones de propiedades
- Insights de inversión

## Contribuir

Este es un proyecto privado del ecosistema Homepty. Para contribuir, contacta al equipo de desarrollo.

## Licencia

Privado - Homepty © 2025
