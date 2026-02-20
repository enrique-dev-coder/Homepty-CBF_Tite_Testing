# Integración con Homepty Brain

Este documento describe cómo el CBF se integra con Homepty Brain para proporcionar análisis avanzados y predicciones a los sitios satélite.

## Arquitectura

```
Sitio Satélite → CBF API → Homepty Brain (tRPC)
```

El CBF actúa como un **proxy** entre los sitios satélite y Homepty Brain, proporcionando:
- Autenticación centralizada (CBF_API_KEY)
- Rate limiting y control de acceso
- Transformación de datos
- Caché de respuestas (futuro)

## Endpoints Disponibles

### POST /api/cbf/valuation

Obtiene la valuación estimada de una propiedad usando modelos de ML.

**Headers:**
```
Authorization: Bearer cbf_live_xxxxx
Content-Type: application/json
```

**Body:**
```json
{
  "area": 150,
  "habitaciones": 3,
  "banios": 2,
  "id_estado": 1,
  "id_ciudad": 5,
  "tipo": "Casa"
}
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "propertyId": 0,
    "estimatedPrice": 2500000,
    "confidence": 0.85,
    "factors": {
      "location": 0.4,
      "size": 0.3,
      "amenities": 0.2,
      "market": 0.1
    }
  }
}
```

### GET /api/cbf/analysis/market

Obtiene análisis de mercado para una zona específica.

**Headers:**
```
Authorization: Bearer cbf_live_xxxxx
```

**Query Params:**
- `id_estado` (requerido): ID del estado
- `id_ciudad` (requerido): ID de la ciudad
- `colonia` (opcional): Nombre de la colonia

**Ejemplo:**
```bash
curl -H "Authorization: Bearer cbf_live_xxxxx" \
  "http://localhost:3000/api/cbf/analysis/market?id_estado=1&id_ciudad=5&colonia=Centro"
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "area": "Centro, Ciudad",
    "averagePrice": 3500000,
    "pricePerSqm": 23000,
    "trend": "up",
    "recommendations": [
      "El mercado está en crecimiento",
      "Buena zona para inversión"
    ]
  }
}
```

### POST /api/cbf/recommendations

Obtiene recomendaciones de propiedades basadas en preferencias del usuario.

**Headers:**
```
Authorization: Bearer cbf_live_xxxxx
Content-Type: application/json
```

**Body:**
```json
{
  "budget": 3000000,
  "area": 120,
  "habitaciones": 3,
  "id_estado": 1
}
```

**Respuesta:**
```json
{
  "success": true,
  "data": [
    {
      "propertyId": 123,
      "score": 0.92,
      "reasons": [
        "Dentro del presupuesto",
        "Ubicación cercana a servicios",
        "Tamaño adecuado"
      ]
    }
  ]
}
```

## Configuración

### Variables de Entorno

Agregar al `.env.local`:

```env
# Homepty Brain Configuration
BRAIN_API_URL=http://localhost:3001/trpc
```

### Desarrollo Local

Para probar la integración en desarrollo local:

1. Iniciar Homepty Brain:
```bash
cd homepty-brain-v1
npm run dev
# Corre en http://localhost:3001
```

2. Iniciar Homepty CBF:
```bash
cd Homepty-CBF_Tite_Testing
npm run dev
# Corre en http://localhost:3000
```

3. Probar endpoints:
```bash
# Obtener valuación
curl -X POST http://localhost:3000/api/cbf/valuation \
  -H "Authorization: Bearer cbf_live_xxxxx" \
  -H "Content-Type: application/json" \
  -d '{"area": 150, "habitaciones": 3, "banios": 2, "id_estado": 1, "id_ciudad": 5, "tipo": "Casa"}'
```

## Routers del Brain Disponibles

El CBF puede consumir los siguientes routers del Brain:

| Router | Descripción | Endpoints Implementados |
|--------|-------------|------------------------|
| `mlRouter` | Modelos de ML | ✅ `predictPrice` (valuación) |
| `aiRouter` | Servicios de IA | ✅ `recommendProperties` |
| `analysisRouter` | Análisis de mercado | ✅ `marketAnalysis` |
| `financialRouter` | Análisis financiero | 🔄 Por implementar |
| `spatialRouter` | Análisis espacial | 🔄 Por implementar |
| `semanticSearchRouter` | Búsqueda semántica | 🔄 Por implementar |

## Próximos Pasos

1. **Implementar caché**: Agregar Redis para cachear respuestas del Brain
2. **Rate limiting**: Limitar llamadas al Brain por usuario
3. **Monitoreo**: Agregar logging y métricas de uso
4. **Webhooks**: Notificaciones cuando hay nuevos análisis disponibles

## Notas Técnicas

- El cliente tRPC se configura en `lib/brain-client.ts`
- Los endpoints del CBF actúan como proxies en `app/api/cbf/`
- La autenticación se maneja en `lib/auth.ts`
- Los tipos del Brain deben sincronizarse manualmente por ahora

## Troubleshooting

### Error: "Cannot connect to Brain"

Verificar que:
1. Homepty Brain esté corriendo
2. `BRAIN_API_URL` esté configurado correctamente
3. No haya firewalls bloqueando la conexión

### Error: "Invalid API Key"

Verificar que:
1. El `CBF_API_KEY` sea válido
2. El sitio del usuario esté activo en `user_sites`
3. El header `Authorization` tenga el formato correcto
