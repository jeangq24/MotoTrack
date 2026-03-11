import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

// POST /api/maintenance-rules
export async function POST(request: Request) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    
    // next_service_km is calculated internally here or passed by client
    const next_service_km = body.last_service_km + body.interval_km;

    const { data, error } = await supabase
        .from('maintenance_rules')
        .insert({
            id: body.id,
            vehicle_id: body.vehicle_id,
            name: body.name,
            interval_km: body.interval_km,
            last_service_km: body.last_service_km,
            next_service_km: next_service_km,
            custom_warning_km: body.custom_warning_km || 500,
        })
        .select()
        .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data, { status: 201 });
}
