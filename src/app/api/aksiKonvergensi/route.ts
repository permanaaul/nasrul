import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET: Mendapatkan semua data aksi konvergensi
export async function GET() {
    const aksiKonvergensi = await prisma.aksiKonvergensi.findMany({
      include: {
        budget: true, // Include the related Budget data
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
