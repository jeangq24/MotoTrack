import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

// POST /api/maintenance-rules/[id]/log
export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const body = await request.json(); // expected: { km: number, notes?: string, id: string }

    // Fetch the current rule to calculate new values
    const { data: rule, error: fetchError } = await supabase
        .from('maintenance_rules')
        .select('*')
        .eq('id', id)
        .single();
        
    if (fetchError || !rule) return NextResponse.json({ error: fetchError?.message || 'Rule not found' }, { status: 404 });

    const next_service_km = body.km + rule.interval_km;

    // We do two operations (RPC or 2 queries is fine, Supabase has transactions via RPC but let's do sequentially for simplicity and speed)
    
    // 1. Insert log
    const { error: logError } = await supabase
        .from('maintenance_logs')
        .insert({
            id: body.id,
            rule_id: id,
            km: body.km,
            notes: body.notes || ''
        });

    if (logError) return NextResponse.json({ error: logError.message }, { status: 500 });

    // 2. Update rule
    const { data: updatedRule, error: ruleError } = await supabase
        .from('maintenance_rules')
        .update({
            last_service_km: body.km,
            next_service_km: next_service_km
        })
        .eq('id', id)
        .select()
        .single();

    if (ruleError) return NextResponse.json({ error: ruleError.message }, { status: 500 });

    return NextResponse.json(updatedRule, { status: 201 });
}
