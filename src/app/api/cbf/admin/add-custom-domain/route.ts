import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { VercelCore as Vercel } from '@vercel/sdk/core.js';
import { projectsAddProjectDomain } from '@vercel/sdk/funcs/projectsAddProjectDomain.js';

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

    const { user_id, custom_domain } = await request.json();

    // Validar inputs
    if (!user_id || !custom_domain) {
      return NextResponse.json(
        { error: 'Missing required fields: user_id, custom_domain' },
        { status: 400 }
      );
    }

    // Validar formato del dominio
    if (!isValidDomain(custom_domain)) {
      return NextResponse.json(
        { error: 'Invalid domain format' },
        { status: 400 }
      );
    }

    // Verificar que el usuario tenga un sitio
    const supabase = await createClient();
    const { data: site, error: siteError } = await supabase
      .from('user_sites')
      .select('*')
      .eq('user_id_supabase', user_id)
      .single();

    if (siteError || !site) {
      return NextResponse.json(
        { error: 'Site not found for this user' },
        { status: 404 }
      );
    }

    // Verificar que el dominio no esté ya en uso
    const { data: existingDomain } = await supabase
      .from('user_sites')
      .select('id')
      .eq('custom_domain', custom_domain)
      .single();

    if (existingDomain) {
      return NextResponse.json(
        { error: 'Domain already in use' },
        { status: 409 }
      );
    }

    // Agregar dominio a Vercel
    const vercelToken = process.env.VERCEL_TOKEN;
    const vercelProjectId = process.env.VERCEL_PROJECT_ID;
    const vercelTeamId = process.env.VERCEL_TEAM_ID;

    if (!vercelToken || !vercelProjectId) {
      console.error('Missing Vercel configuration');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    const vercel = new Vercel({
      bearerToken: vercelToken,
    });

    try {
      await projectsAddProjectDomain(vercel, {
        idOrName: vercelProjectId,
        teamId: vercelTeamId,
        requestBody: {
          name: custom_domain,
        },
      });

      // Actualizar base de datos
      const { error: updateError } = await supabase
        .from('user_sites')
        .update({
          custom_domain,
          domain_verified: false,
        })
        .eq('id', site.id);

      if (updateError) {
        console.error('Error updating database:', updateError);
        return NextResponse.json(
          { error: 'Failed to update database' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'Domain added successfully. Please configure your DNS.',
        domain: custom_domain,
      });
    } catch (vercelError: any) {
      console.error('Error adding domain to Vercel:', vercelError);
      return NextResponse.json(
        { 
          error: 'Failed to add domain to Vercel',
          details: vercelError.message 
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

function isValidDomain(domain: string): boolean {
  // Regex básico para validar dominios
  const regex = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?\.[a-zA-Z]{2,}$/;
  return regex.test(domain);
}
