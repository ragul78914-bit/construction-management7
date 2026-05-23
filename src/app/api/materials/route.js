import { NextResponse } from 'next/server';
import { getCollection } from '@/lib/mongodb';

export async function GET() {
  try {
    const col = await getCollection('materials');
    const materials = await col.find({}).toArray();
    return NextResponse.json(materials);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const col = await getCollection('materials');
    if (!body.id) {
      body.id = `mat_${Date.now()}`;
    }
    await col.insertOne(body);
    return NextResponse.json(body, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
