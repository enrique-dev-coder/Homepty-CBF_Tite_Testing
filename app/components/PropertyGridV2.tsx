// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-nocheck
import React from 'react';
import { getPropertiesByUser } from '@/lib/db';
import Link from 'next/link';

interface PropertyGridV2Props {
  title?: string;
  userId?: string;
  limit?: number;
}

export default async function PropertyGridV2({ 
  title = "Propiedades Destacadas", 
  userId,
  limit = 12 
}: PropertyGridV2Props) {
  // Si no hay userId, mostrar mensaje
  if (!userId) {
    return (
      <div className="border p-6 rounded-xl bg-slate-100">
        <h2 className="text-xl font-bold">{title}</h2>
        <p className="text-sm mt-2 text-gray-600">
          No se pudo cargar las propiedades. Usuario no identificado.
        </p>
      </div>
    );
  }

  // Obtener propiedades del usuario
  const properties = await getPropertiesByUser(userId, limit);

  if (!properties || properties.length === 0) {
    return (
      <div className="border p-6 rounded-xl bg-slate-100">
        <h2 className="text-xl font-bold">{title}</h2>
        <p className="text-sm mt-2 text-gray-600">
          No hay propiedades disponibles en este momento.
        </p>
      </div>
    );
  }

  return (
    <div className="py-8">
      <h2 className="text-3xl font-bold mb-8">{title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {properties.map((property) => {
          const mainImage = property.imagenes_propiedades?.[0]?.image_url || '/placeholder-property.jpg';
          const priceFormatted = new Intl.NumberFormat('es-MX', {
            style: 'currency',
            currency: 'MXN',
            minimumFractionDigits: 0,
          }).format(property.precio);

          return (
            <Link 
              key={property.id} 
              href={`/propiedad/${property.id}`}
              className="block group"
            >
              <div className="border rounded-xl overflow-hidden bg-white shadow-sm hover:shadow-lg transition-shadow">
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={mainImage}
                    alt={property.nombre}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 right-3 bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                    {priceFormatted}
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-lg mb-2 line-clamp-1">{property.nombre}</h3>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {property.descripcion || 'Sin descripción'}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-gray-700">
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      </svg>
                      {property.habitaciones} rec
                    </span>
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      {property.banios} baños
                    </span>
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                      </svg>
                      {property.area} m²
                    </span>
                  </div>
                  <div className="mt-3 pt-3 border-t text-sm text-gray-600">
                    📍 {property.direccion}, {property.colonia || ''}
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
