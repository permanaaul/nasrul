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

// DELETE: Menghapus ketersediaan berdasarkan ID
export async function DELETE(req: Request) {
  const { id } = await req.json();

  try {
    const deletedKetersediaan = await prisma.ketersediaan.delete({
      where: { id: Number(id) },
    });
    return NextResponse.json(deletedKetersediaan, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete ketersediaan' }, { status: 500 });
  }
}
