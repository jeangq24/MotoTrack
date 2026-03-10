import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

// PATCH /api/vehicles/[id]  → update current_km or details
export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const body = await request.json();

    const { data, error } = await supabase
        .from('vehicles')
        .update({
            current_km: body.current_km,
            name: body.name,
            brand: body.brand,
            model: body.model
        })
        .eq('id', id)
        .select()
        .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
}

// DELETE /api/vehicles/[id]
export async function DELETE(
    _request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const { error } = await supabase.from('vehicles').delete().eq('id', id);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
}
