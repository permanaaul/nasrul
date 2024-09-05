'use client';

import { useState, useEffect, useMemo } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import axios from 'axios';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
} from '@tanstack/react-table';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface Budget {
  id: number;
  provinsi: string;
  kabupaten: string;
  opd: string;
  anggaran: number;
  realisasi: number;
}

export default function Home() {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [formData, setFormData] = useState({
    provinsi: '',
    kabupaten: '',
    opd: '',
    anggaran: '',
    realisasi: '',
  });
  const [globalFilter, setGlobalFilter] = useState('');

  useEffect(() => {
    const fetchBudgets = async () => {
      try {
        const res = await axios.get('/api/budget');
        setBudgets(res.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchBudgets();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === 'anggaran' || name === 'realisasi') {
      const formattedValue = Number(value.replace(/[^0-9]/g, '')).toLocaleString('id-ID');
      setFormData({
        ...formData,
        [name]: formattedValue,
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const res = await axios.post('/api/budget', {
        ...formData,
        anggaran: formData.anggaran.replace(/\./g, ''),
        realisasi: formData.realisasi.replace(/\./g, ''),
      });

      if (res.status === 200) {
        const newBudget = res.data;
        setBudgets([...budgets, newBudget]);
        setFormData({
          provinsi: '',
          kabupaten: '',
          opd: '',
          anggaran: '',
          realisasi: '',
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const columns = useMemo(
    () => [
      { accessorKey: 'provinsi', header: 'Provinsi' },
      { accessorKey: 'kabupaten', header: 'Kabupaten/Kota' },
      { accessorKey: 'opd', header: 'OPD' },
      {
        accessorKey: 'anggaran',
        header: 'Anggaran (Rupiah)',
        cell: ({ getValue }: any) => `Rp ${Number(getValue()).toLocaleString('id-ID')}`,
      },
      {
        accessorKey: 'realisasi',
        header: 'Realisasi (Rupiah)',
        cell: ({ getValue }: any) => `Rp ${Number(getValue()).toLocaleString('id-ID')}`,
      },
    ],
    []
  );

  const data = useMemo(() => budgets, [budgets]);

  const table = useReactTable({
    data,
    columns,
    state: {
      globalFilter,
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onGlobalFilterChange: setGlobalFilter,
  });

  // Data untuk grafik
  const dataChart = {
    labels: budgets.map((row) => `${row.kabupaten} (${row.opd})`),
    datasets: [
      {
        label: 'Anggaran (Rupiah)',
        data: budgets.map((row) => row.anggaran),
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
      },
      {
        label: 'Realisasi (Rupiah)',
        data: budgets.map((row) => row.realisasi),
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
      },
    ],
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-8">
        Fokus Pemda: Total Anggaran/Realisasi
      </h1>

      {/* Form untuk input data baru */}
      <form onSubmit={handleSubmit} className="mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <input
            name="provinsi"
            value={formData.provinsi}
            onChange={handleInputChange}
            placeholder="Provinsi"
            className="border p-2"
            required
          />
          <input
            name="kabupaten"
            value={formData.kabupaten}
            onChange={handleInputChange}
            placeholder="Kabupaten"
            className="border p-2"
            required
          />
          <input
            name="opd"
            value={formData.opd}
            onChange={handleInputChange}
            placeholder="OPD"
            className="border p-2"
            required
          />
          <input
            name="anggaran"
            value={formData.anggaran}
            onChange={handleInputChange}
            placeholder="Anggaran (Rupiah)"
            className="border p-2"
            required
          />
          <input
            name="realisasi"
            value={formData.realisasi}
            onChange={handleInputChange}
            placeholder="Realisasi (Rupiah)"
            className="border p-2"
            required
          />
        </div>
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
          Tambah Data
        </button>
      </form>

      {/* Search Box */}
      <div className="mb-4">
        <input
          type="text"
          value={globalFilter ?? ''}
          onChange={(e) => setGlobalFilter(e.target.value)}
          placeholder="Cari berdasarkan Provinsi/Kabupaten/Kota"
          className="border p-2 w-full"
        />
      </div>

      {/* Tabel Anggaran dan Realisasi */}
      <table className="table-auto w-full text-left border-collapse border border-gray-400 mb-8">
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id} className="bg-gray-200">
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  onClick={header.column.getToggleSortingHandler()}
                  className="border border-gray-400 px-4 py-2"
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                  {header.column.getIsSorted() ? (
                    header.column.getIsSorted() === 'desc' ? ' 🔽' : ' 🔼'
                  ) : null}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id} className="odd:bg-white even:bg-gray-100">
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="border border-gray-400 px-4 py-2">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Grafik Anggaran vs Realisasi */}
      <div className="w-full max-w-4xl mx-auto mb-8">
        <Bar
          data={dataChart}
          options={{
            responsive: true,
            plugins: {
              legend: {
                position: 'top',
              },
              title: {
                display: true,
                text: 'Perbandingan Anggaran dan Realisasi per Kabupaten/OPD',
              },
            },
          }}
        />
      </div>
    </div>
  );
}
