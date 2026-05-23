import { NextResponse } from 'next/server';
import { getCollection } from '@/lib/mongodb';

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const col = await getCollection('sites');
    const site = await col.findOne({ id });
    if (!site) {
      return NextResponse.json({ error: 'Site not found' }, { status: 404 });
    }
    return NextResponse.json(site);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const col = await getCollection('sites');
    
    const { _id, ...updateData } = body;
    
    const result = await col.updateOne({ id }, { $set: updateData });
    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Site not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const col = await getCollection('sites');
    const result = await col.deleteOne({ id });
    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Site not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
