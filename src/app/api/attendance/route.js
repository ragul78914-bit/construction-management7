import { NextResponse } from 'next/server';
import { getCollection } from '@/lib/mongodb';

export async function GET() {
  try {
    const col = await getCollection('attendance');
    const attendance = await col.find({}).toArray();
    return NextResponse.json(attendance);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const col = await getCollection('attendance');
    
    // Check for upsert scenario (by workerId and date)
    if (body.workerId && body.date) {
      const existing = await col.findOne({ workerId: body.workerId, date: body.date });
      if (existing) {
        const { _id, ...updateData } = body;
        await col.updateOne({ id: existing.id }, { $set: updateData });
        const updated = await col.findOne({ id: existing.id });
        return NextResponse.json(updated, { status: 200 });
      }
    }
    
    if (!body.id) {
      body.id = `att_${Date.now()}`;
    }
    await col.insertOne(body);
    return NextResponse.json(body, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
