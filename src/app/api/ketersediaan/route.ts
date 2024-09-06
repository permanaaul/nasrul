import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET: Mendapatkan semua data ketersediaan
export async function GET() {
  const ketersediaan = await prisma.ketersediaan.findMany();
  return NextResponse.json(ketersediaan);
}

// POST: Menambahkan data ketersediaan baru
export async function POST(req: Request) {
  const body = await req.json();

  const newKetersediaan = await prisma.ketersediaan.create({
    data: {
      budgetId: parseInt(body.budgetId),
      jenis: body.jenis,
      kebutuhan: body.kebutuhan,
      tersedia: body.tersedia,
    },
  });

  return NextResponse.json(newKetersediaan);
}
