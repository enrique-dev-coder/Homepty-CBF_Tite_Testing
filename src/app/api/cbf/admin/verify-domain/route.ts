import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { VercelCore as Vercel } from '@vercel/sdk/core.js';
import { projectsVerifyProjectDomain } from '@vercel/sdk/funcs/projectsVerifyProjectDomain.js';
import { projectsGetProjectDomain } from '@vercel/sdk/funcs/projectsGetProjectDomain.js';

export async function POST(request: NextRequest) {
  try {
    // Verificar CBF_ADMIN_API_KEY
    const apiKey = request.headers.get('x-cbf-admin-api-key');
    if (apiKey !== process.env.CBF_ADMIN_API_KEY) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { user_id } = await request.json();

    if (!user_id) {
      return NextResponse.json(
        { error: 'Missing required field: user_id' },
        { status: 400 }
      );
    }

    // Obtener el sitio del usuario
    const supabase = await createClient();
    const { data: site, error: siteError } = await supabase
      .from('user_sites')
      .select('*')
      .eq('user_id_supabase', user_id)
      .single();

    if (siteError || !site) {
      return NextResponse.json(
        { error: 'Site not found' },
        { status: 404 }
      );
    }

    if (!site.custom_domain) {
      return NextResponse.json(
        { error: 'No custom domain configured' },
        { status: 400 }
      );
    }

    // Verificar dominio en Vercel
    const vercelToken = process.env.VERCEL_TOKEN;
    const vercelProjectId = process.env.VERCEL_PROJECT_ID;
    const vercelTeamId = process.env.VERCEL_TEAM_ID;

    if (!vercelToken || !vercelProjectId) {
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    const vercel = new Vercel({
      bearerToken: vercelToken,
    });

    try {
      // Obtener información del dominio
      const domainInfo = await projectsGetProjectDomain(vercel, {
        idOrName: vercelProjectId,
        teamId: vercelTeamId,
        domain: site.custom_domain,
      });

      // Intentar verificar el dominio
      const verifyResult = await projectsVerifyProjectDomain(vercel, {
        idOrName: vercelProjectId,
        teamId: vercelTeamId,
        domain: site.custom_domain,
      });

      const isVerified = verifyResult.value?.verified || false;

      // Actualizar base de datos si está verificado
      if (isVerified && !site.domain_verified) {
        await supabase
          .from('user_sites')
          .update({ domain_verified: true })
          .eq('id', site.id);
      }

      return NextResponse.json({
        success: true,
        verified: isVerified,
        domain: site.custom_domain,
        verification: verifyResult.value?.verification || null,
        domainInfo: domainInfo.value || null,
      });
    } catch (vercelError: any) {
      console.error('Error verifying domain:', vercelError);
      return NextResponse.json(
        {
          error: 'Failed to verify domain',
          details: vercelError.message,
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
