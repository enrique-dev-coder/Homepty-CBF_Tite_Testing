import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'homepty.com';

/**
 * Extrae el subdomain del request
 * Soporta:
 * - Local development: tenant.localhost:3000
 * - Production: tenant.homepty.com
 * - Preview URLs: tenant---branch.vercel.app
 * - Custom domains: customdomain.com
 */
async function extractSubdomain(request: NextRequest): Promise<string | null> {
  const host = request.headers.get('host') || '';
  const hostname = host.split(':')[0];
  const url = request.url;

  // Local development
  if (url.includes('localhost') || url.includes('127.0.0.1')) {
    const fullUrlMatch = url.match(/http:\/\/([^.]+)\.localhost/);
    if (fullUrlMatch && fullUrlMatch[1]) {
      return fullUrlMatch[1];
    }
    if (hostname.includes('.localhost')) {
      return hostname.split('.')[0];
    }
    return null;
  }

  // Preview deployment URLs (tenant---branch.vercel.app)
  if (hostname.includes('---') && hostname.endsWith('.vercel.app')) {
    const parts = hostname.split('---');
    return parts.length > 0 ? parts[0] : null;
  }

  // Production: Check if it's a subdomain of homepty.com
  const rootDomainFormatted = ROOT_DOMAIN.split(':')[0];
  const isSubdomain =
    hostname !== rootDomainFormatted &&
    hostname !== `www.${rootDomainFormatted}` &&
    hostname.endsWith(`.${rootDomainFormatted}`);

  if (isSubdomain) {
    return hostname.replace(`.${rootDomainFormatted}`, '');
  }

  // Check if it's a custom domain
  return await getSubdomainFromCustomDomain(hostname);
}

/**
 * Busca en la base de datos si el hostname es un custom domain
 * y devuelve el subdomain correspondiente
 */
async function getSubdomainFromCustomDomain(hostname: string): Promise<string | null> {
  try {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('user_sites')
      .select('subdomain')
      .eq('custom_domain', hostname)
      .eq('domain_verified', true)
      .eq('is_active', true)
      .single();

    if (error || !data) {
      return null;
    }

    return data.subdomain;
  } catch (error) {
    console.error('Error checking custom domain:', error);
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const subdomain = await extractSubdomain(request);

  // Si es un subdomain o custom domain, servir el sitio satélite
  if (subdomain) {
    // Bloquear acceso a rutas admin desde sitios satélite
    if (pathname.startsWith('/api/cbf/admin')) {
      return NextResponse.redirect(new URL('/', request.url));
    }

    // Reescribir a la ruta del sitio
    return NextResponse.rewrite(
      new URL(`/sites/${subdomain}${pathname}`, request.url)
    );
  }

  // Root domain: servir CBF landing page o API
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all paths except for:
     * 1. /api/cbf routes (CBF API)
     * 2. /_next (Next.js internals)
     * 3. /_static (static files)
     * 4. /_vercel (Vercel internals)
     * 5. All root files inside /public (e.g. /favicon.ico)
     */
    '/((?!api/cbf|_next|_static|_vercel|[\\w-]+\\.\\w+).*)',
  ],
};
