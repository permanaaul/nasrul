import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma'; 

// GET: Mendapatkan semua data SPI
export async function GET() {
  try {
    const spiData = await prisma.sPI.findMany({
        include: {
            budget: true,
        },
    });
    return NextResponse.json(spiData);
  } catch (error) {
    return NextResponse.json({ message: 'Gagal mendapatkan data SPI', error }, { status: 500 });
  }
}

// POST: Menambahkan data SPI baru
export async function POST(request: Request) {
  try {
    const { unsurSpi, hasilPengawasan, budgetId } = await request.json();  // Tangkap budgetId dari body
    
    const newSPI = await prisma.sPI.create({
      data: {
        budgetId: parseInt(budgetId),  // Gunakan budgetId dari body
        unsur: unsurSpi,  // Simpan sebagai `unsur` di database
        hasilPengawasan,
      },
    });

    return NextResponse.json(newSPI, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: 'Gagal menambahkan data SPI', error }, { status: 500 });
  }
}

// PUT: Mengupdate data SPI berdasarkan ID
export async function PUT(request: Request) {
  try {
    const { id, unsurSpi, hasilPengawasan } = await request.json();

    const updatedSPI = await prisma.sPI.update({
      where: { id: Number(id) },
      data: {
        unsur: unsurSpi,  // Pastikan unsurSpi di-update dengan benar
        hasilPengawasan,
      },
    });

    return NextResponse.json(updatedSPI);
  } catch (error) {
    return NextResponse.json({ message: 'Gagal memperbarui data SPI', error }, { status: 500 });
  }
}

// DELETE: Menghapus data SPI berdasarkan ID
export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();

    const deletedSPI = await prisma.sPI.delete({
      where: { id: Number(id) },
    });

    return NextResponse.json(deletedSPI);
  } catch (error) {
    return NextResponse.json({ message: 'Gagal menghapus data SPI', error }, { status: 500 });
  }
}
