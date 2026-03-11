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

    const { data: rules, error: rError } = await supabase
        .from('maintenance_rules')
        .select('*')
        .eq('vehicle_id', id)
        .order('next_service_km', { ascending: true });

    if (rError) return NextResponse.json({ error: rError.message }, { status: 500 });

    return NextResponse.json(rules || []);
}
