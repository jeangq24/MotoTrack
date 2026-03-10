import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import { calculateMaintenanceStatus } from '@/lib/maintenance';

// GET /api/vehicles/[id]/maintenance
export async function GET(
    _request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const supabase = await createClient();
    const { data: { user }, error: authErr } = await supabase.auth.getUser();
    if (authErr || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;

    // Fetch vehicle for current_km
    const { data: vehicle, error: vError } = await supabase
        .from('vehicles')
        .select('current_km')
        .eq('id', id)
        .single();

    if (vError || !vehicle) return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 });

    const { data: rules, error: rError } = await supabase
        .from('maintenance_rules')
        .select('*')
        .eq('vehicle_id', id)
        .order('next_service_km', { ascending: true }); // Prioritize nearest

    if (rError) return NextResponse.json({ error: rError.message }, { status: 500 });

    // Use lib to calculate dynamic statuses
    const statuses = (rules || []).map(rule => calculateMaintenanceStatus(rule, vehicle.current_km));

    return NextResponse.json(statuses);
}
