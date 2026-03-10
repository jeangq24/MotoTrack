import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

// GET /api/expenses  →  list all records ordered newest first (paginated)
export async function GET(request: Request) {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    const { data: { user }, error: authErr } = await supabase.auth.getUser();
    if (authErr || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: records, error } = await supabase
        .from('expenses')
        .select('*')
        .order('timestamp', { ascending: false })
        .range(offset, offset + limit - 1);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const { data: totalData } = await supabase.rpc('get_expenses_total', { user_uuid: user.id });

    return NextResponse.json({
        records: records || [],
        grandTotal: totalData || 0
    });
}

// POST /api/expenses  →  insert a new record
export async function POST(request: Request) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();

    const { data, error } = await supabase
        .from('expenses')
        .insert({
            id: body.id,
            type: body.type,
            amount: body.amount,
            note: body.note ?? null,
            timestamp: body.timestamp,
            date: body.date,
            user_id: user.id,
        })
        .select()
        .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data, { status: 201 });
}
