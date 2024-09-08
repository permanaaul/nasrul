import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET: Mendapatkan semua data aksi konvergensi
export async function GET() {
  const aksiKonvergensi = await prisma.aksiKonvergensi.findMany({
    include: {
      budget: true, 
    },
  });
  return NextResponse.json(aksiKonvergensi);
}

// POST: Menambahkan data aksi konvergensi baru
export async function POST(req: Request) {
  const body = await req.json();
  
  const newAksiKonvergensi = await prisma.aksiKonvergensi.create({
    data: {
      budgetId: parseInt(body.budgetId),
      aksi: body.aksi,
      hasilPengawasan: body.hasilPengawasan,
    },
  });

  return NextResponse.json(newAksiKonvergensi);
}

// DELETE: Menghapus aksi konvergensi berdasarkan ID
export async function DELETE(req: Request) {
  const { id } = await req.json();

  try {
    const deletedAksiKonvergensi = await prisma.aksiKonvergensi.delete({
      where: { id: Number(id) },
    });
    return NextResponse.json(deletedAksiKonvergensi, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete Aksi Konvergensi' }, { status: 500 });
  }
}
