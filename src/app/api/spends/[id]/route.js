import { NextResponse } from 'next/server';
import { getCollection } from '@/lib/mongodb';

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const col = await getCollection('spends');
    const result = await col.deleteOne({ id });
    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Spend record not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
