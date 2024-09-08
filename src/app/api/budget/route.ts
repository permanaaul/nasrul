import { NextResponse } from 'next/server';
import prisma from '../../../lib/prisma'; 

// GET: Mengambil semua data budget
export async function GET() {
  try {
    const budgets = await prisma.budget.findMany(); 
    return NextResponse.json(budgets, { status: 200 });
  } catch (error) {
    console.error('Failed to retrieve budgets', error);
    return NextResponse.json({ error: 'Failed to retrieve budgets' }, { status: 500 });
  }
}

// POST: Menambah data budget baru
export async function POST(req: Request) {
  try {
    const { provinsi, kabupaten, opd, anggaran, realisasi } = await req.json();

    const newBudget = await prisma.budget.create({
      data: {
        provinsi,
        kabupaten,
        opd,
        anggaran: parseInt(anggaran.replace(/\./g, '')), 
        realisasi: parseInt(realisasi.replace(/\./g, '')), 
      },
    });

    return NextResponse.json(newBudget, { status: 201 });
  } catch (error) {
    console.error('Failed to add budget', error);
    return NextResponse.json({ error: 'Failed to add budget' }, { status: 500 });
  }
}

// DELETE: Menghapus budget berdasarkan ID
export async function DELETE(req: Request) {
  const { id } = await req.json();

  try {
    const deletedBudget = await prisma.budget.delete({
      where: { id: Number(id) },
    });
    return NextResponse.json(deletedBudget, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete budget' }, { status: 500 });
  }
}
