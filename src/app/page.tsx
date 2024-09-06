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
  getPaginationRowModel,  // Import pagination row model
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

interface AksiKonvergensi {
  id: number;
  budgetId: number;
  aksi: string;
  hasilPengawasan: string;
  budget: Budget; // Relasi ke budget
}

interface Ketersediaan {
  id: number;
  budgetId: number;
  jenis: string;
  kebutuhan: number;
  tersedia: number;
  budget: Budget; // Relasi ke budget
}

export default function Home() {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [aksiKonvergensi, setAksiKonvergensi] = useState<AksiKonvergensi[]>([]);
  const [ketersediaan, setKetersediaan] = useState<Ketersediaan[]>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [globalFilterAksi, setGlobalFilterAksi] = useState('');
  const [globalFilterKetersediaan, setGlobalFilterKetersediaan] = useState('');
  const [formBudget, setFormBudget] = useState({
    provinsi: '',
    kabupaten: '',
    opd: '',
    anggaran: '',
    realisasi: '',
  });
  const [formAksi, setFormAksi] = useState({
    budgetId: '',
    aksi: '',
    hasilPengawasan: '',
  });
  const [formKetersediaan, setFormKetersediaan] = useState({
    budgetId: '',
    jenis: '',
    kebutuhan: '',
    tersedia: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [budgetsRes, aksiRes, ketersediaanRes] = await Promise.all([
          axios.get('/api/budget'),
          axios.get('/api/aksiKonvergensi'),
          axios.get('/api/ketersediaan'),
        ]);
        setBudgets(budgetsRes.data);
        setAksiKonvergensi(aksiRes.data);
        // Properly associate the related `budget` for each `ketersediaan`
        const updatedKetersediaan = ketersediaanRes.data.map((item: Ketersediaan) => {
          const budget = budgetsRes.data.find((budget: Budget) => budget.id === item.budgetId);
          return { ...item, budget };
        });
        setKetersediaan(updatedKetersediaan);
      } catch (err) {
        console.error(err);
        alert('Terjadi kesalahan saat memuat data, silakan coba lagi.');
      }
    };

    fetchData();
  }, []);

  // Form input handling
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>, formType: 'budget' | 'aksi' | 'ketersediaan') => {
    const { name, value } = e.target;

    if (formType === 'budget') {
      setFormBudget({ ...formBudget, [name]: value });
    } else if (formType === 'aksi') {
      setFormAksi({ ...formAksi, [name]: value });
    } else {
      setFormKetersediaan({ ...formKetersediaan, [name]: value });
    }
  };

  // Submit handling
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>, formType: 'budget' | 'aksi' | 'ketersediaan') => {
    e.preventDefault();
  
    try {
      if (formType === 'budget') {
        await axios.post('/api/budget', formBudget);
        setFormBudget({ provinsi: '', kabupaten: '', opd: '', anggaran: '', realisasi: '' });
      } else if (formType === 'aksi') {
        const data = { ...formAksi, budgetId: parseInt(formAksi.budgetId) };
        await axios.post('/api/aksiKonvergensi', data);
        setFormAksi({ budgetId: '', aksi: '', hasilPengawasan: '' });
      } else {
        const data = { 
          ...formKetersediaan, 
          budgetId: parseInt(formKetersediaan.budgetId),
          kebutuhan: parseInt(formKetersediaan.kebutuhan),  
          tersedia: parseInt(formKetersediaan.tersedia)     
        };
        await axios.post('/api/ketersediaan', data);
        setFormKetersediaan({ budgetId: '', jenis: '', kebutuhan: '', tersedia: '' });
      }
    } catch (err) {
      console.error('Terjadi kesalahan saat mengirim data:', err);
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
    getPaginationRowModel: getPaginationRowModel(), // Menambahkan pagination model
    onGlobalFilterChange: setGlobalFilter,
    pageCount: 10, // Menetapkan 10 data per halaman
  });

  // Data untuk grafik anggaran vs realisasi
  const dataChart = useMemo(
    () => ({
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
    }),
    [budgets]
  );

  // Tabel Aksi Konvergensi
  const aksiKonvergensiColumns = useMemo(
    () => [
      { accessorKey: 'budget.provinsi', header: 'Provinsi' },
      { accessorKey: 'budget.kabupaten', header: 'Kabupaten/Kota' },
      { accessorKey: 'budget.opd', header: 'OPD' },
      { accessorKey: 'aksi', header: 'Aksi Konvergensi' },
      { accessorKey: 'hasilPengawasan', header: 'Hasil Pengawasan' },
    ],
    []
  );

  const aksiKonvergensiData = useMemo(() => aksiKonvergensi, [aksiKonvergensi]);

  const aksiTable = useReactTable({
    data: aksiKonvergensiData,
    columns: aksiKonvergensiColumns,
    state: {
      globalFilter: globalFilterAksi,
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(), // Menambahkan pagination model
    onGlobalFilterChange: setGlobalFilterAksi,
    pageCount: 10, // Menetapkan 10 data per halaman
  });

  // Tabel Ketersediaan
  const ketersediaanColumns = useMemo(
    () => [
      { accessorKey: 'budget.provinsi', header: 'Provinsi' },
      { accessorKey: 'budget.kabupaten', header: 'Kabupaten/Kota' },
      { accessorKey: 'jenis', header: 'Ketersediaan' },
      { accessorKey: 'kebutuhan', header: 'Kebutuhan' },
      { accessorKey: 'tersedia', header: 'Tersedia' },
    ],
    []
  );

  const ketersediaanData = useMemo(() => ketersediaan, [ketersediaan]);

  const ketersediaanTable = useReactTable({
    data: ketersediaanData,
    columns: ketersediaanColumns,
    state: {
      globalFilter: globalFilterKetersediaan,
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(), // Menambahkan pagination model
    onGlobalFilterChange: setGlobalFilterKetersediaan,
    pageCount: 10, // Menetapkan 10 data per halaman
  });

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-8">
        Fokus Pemda: Total Anggaran/Realisasi
      </h1>

      {/* Form Input Budget */}
      <h2 className="text-xl font-bold mb-4">Tambah Budget</h2>
      <form onSubmit={(e) => handleSubmit(e, 'budget')} className="mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <input
            name="provinsi"
            value={formBudget.provinsi}
            onChange={(e) => handleInputChange(e, 'budget')}
            placeholder="Provinsi"
            className="border p-2"
            required
          />
          <input
            name="kabupaten"
            value={formBudget.kabupaten}
            onChange={(e) => handleInputChange(e, 'budget')}
            placeholder="Kabupaten"
            className="border p-2"
            required
          />
          <input
            name="opd"
            value={formBudget.opd}
            onChange={(e) => handleInputChange(e, 'budget')}
            placeholder="OPD"
            className="border p-2"
            required
          />
          <input
            name="anggaran"
            value={formBudget.anggaran}
            onChange={(e) => handleInputChange(e, 'budget')}
            placeholder="Anggaran (Rupiah)"
            className="border p-2"
            required
          />
          <input
            name="realisasi"
            value={formBudget.realisasi}
            onChange={(e) => handleInputChange(e, 'budget')}
            placeholder="Realisasi (Rupiah)"
            className="border p-2"
            required
          />
        </div>
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
          Tambah Budget
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

      {/* Pagination Controls for Budget Table */}
      <div className="flex justify-between items-center">
        <button onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
          Previous
        </button>
        <span>
          Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
        </span>
        <button onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
          Next
        </button>
      </div>

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

      {/* Tabel Aksi Konvergensi */}
      <h2 className="text-xl font-bold mb-4">Tabel Aksi Konvergensi</h2>

      {/* Search Box Aksi Konvergensi */}
      <div className="mb-4">
        <input
          type="text"
          value={globalFilterAksi ?? ''}
          onChange={(e) => setGlobalFilterAksi(e.target.value)}
          placeholder="Cari berdasarkan Provinsi/Kabupaten/Kota"
          className="border p-2 w-full"
        />
      </div>

      <table className="table-auto w-full text-left border-collapse border border-gray-400 mb-8">
        <thead>
          {aksiTable.getHeaderGroups().map((headerGroup) => (
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
          {aksiTable.getRowModel().rows.map((row) => (
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

      {/* Pagination Controls for Aksi Konvergensi Table */}
      <div className="flex justify-between items-center">
        <button onClick={() => aksiTable.previousPage()} disabled={!aksiTable.getCanPreviousPage()}>
          Previous
        </button>
        <span>
          Page {aksiTable.getState().pagination.pageIndex + 1} of {aksiTable.getPageCount()}
        </span>
        <button onClick={() => aksiTable.nextPage()} disabled={!aksiTable.getCanNextPage()}>
          Next
        </button>
      </div>

      {/* Tabel Ketersediaan */}
      <h2 className="text-xl font-bold mb-4">Tabel Ketersediaan</h2>

      {/* Search Box Ketersediaan */}
      <div className="mb-4">
        <input
          type="text"
          value={globalFilterKetersediaan ?? ''}
          onChange={(e) => setGlobalFilterKetersediaan(e.target.value)}
          placeholder="Cari berdasarkan Provinsi/Kabupaten/Kota"
          className="border p-2 w-full"
        />
      </div>

      <table className="table-auto w-full text-left border-collapse border border-gray-400 mb-8">
        <thead>
          {ketersediaanTable.getHeaderGroups().map((headerGroup) => (
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
          {ketersediaanTable.getRowModel().rows.map((row) => (
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

      {/* Pagination Controls for Ketersediaan Table */}
      <div className="flex justify-between items-center">
        <button onClick={() => ketersediaanTable.previousPage()} disabled={!ketersediaanTable.getCanPreviousPage()}>
          Previous
        </button>
        <span>
          Page {ketersediaanTable.getState().pagination.pageIndex + 1} of {ketersediaanTable.getPageCount()}
        </span>
        <button onClick={() => ketersediaanTable.nextPage()} disabled={!ketersediaanTable.getCanNextPage()}>
          Next
        </button>
      </div>
    </div>
  );
}
