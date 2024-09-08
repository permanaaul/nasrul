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
  getPaginationRowModel,
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

interface SPI {
  id: number;
  unsurSpi: string;
  hasilPengawasan: string;
}

export default function Home() {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [aksiKonvergensi, setAksiKonvergensi] = useState<AksiKonvergensi[]>([]);
  const [ketersediaan, setKetersediaan] = useState<Ketersediaan[]>([]);
  const [spi, setSpi] = useState<SPI[]>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [globalFilterAksi, setGlobalFilterAksi] = useState('');
  const [globalFilterKetersediaan, setGlobalFilterKetersediaan] = useState('');
  const [globalFilterSpi, setGlobalFilterSpi] = useState('');
  
  // Form input state management
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
  const [formSPI, setFormSPI] = useState({
    unsurSpi: '',
    hasilPengawasan: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [budgetsRes, aksiRes, ketersediaanRes, spiRes] = await Promise.all([
          axios.get('/api/budget'),
          axios.get('/api/aksiKonvergensi'),
          axios.get('/api/ketersediaan'),
          axios.get('/api/spi'),
        ]);
        setBudgets(budgetsRes.data);
        setAksiKonvergensi(aksiRes.data);

        const updatedKetersediaan = ketersediaanRes.data.map((item: Ketersediaan) => {
          const budget = budgetsRes.data.find((budget: Budget) => budget.id === item.budgetId);
          return { ...item, budget };
        });
        setKetersediaan(updatedKetersediaan);

        console.log("SPI data: ", spiRes.data);  // Log untuk melihat data SPI
        setSpi(spiRes.data);
      } catch (err) {
        console.error(err);
        alert('Terjadi kesalahan saat memuat data, silakan coba lagi.');
      }
    };

    fetchData();
  }, []);



  // Form input handler
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>, formType: 'budget' | 'aksi' | 'ketersediaan' | 'spi') => {
    const { name, value } = e.target;

    if (formType === 'budget') {
      setFormBudget({ ...formBudget, [name]: value });
    } else if (formType === 'aksi') {
      setFormAksi({ ...formAksi, [name]: value });
    } else if (formType === 'spi') {
      setFormSPI({ ...formSPI, [name]: value });
    } else {
      setFormKetersediaan({ ...formKetersediaan, [name]: value });
    }
  };

  // Form submit handler
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>, formType: 'budget' | 'aksi' | 'ketersediaan' | 'spi') => {
    e.preventDefault();
  
    try {
      if (formType === 'budget') {
        await axios.post('/api/budget', formBudget);
        setFormBudget({ provinsi: '', kabupaten: '', opd: '', anggaran: '', realisasi: '' });
      } else if (formType === 'aksi') {
        const data = { ...formAksi, budgetId: parseInt(formAksi.budgetId) };
        await axios.post('/api/aksiKonvergensi', data);
        setFormAksi({ budgetId: '', aksi: '', hasilPengawasan: '' });
      } else if (formType === 'spi') {
        await axios.post('/api/spi', formSPI);
        setFormSPI({ unsurSpi: '', hasilPengawasan: '' });
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

  // Form delete handler
  const handleDelete = async (formType: 'budget' | 'aksi' | 'ketersediaan' | 'spi', id: number) => {
    try {
      await axios.delete(`/api/${formType}/${id}`);
      if (formType === 'budget') setBudgets(budgets.filter((item) => item.id !== id));
      if (formType === 'aksi') setAksiKonvergensi(aksiKonvergensi.filter((item) => item.id !== id));
      if (formType === 'ketersediaan') setKetersediaan(ketersediaan.filter((item) => item.id !== id));
      if (formType === 'spi') setSpi(spi.filter((item) => item.id !== id));
    } catch (err) {
      console.error(`Terjadi kesalahan saat menghapus data: ${err}`);
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
      {
        accessorKey: 'deleteAction',
        header: 'Aksi',
        cell: ({ row }: any) => <button onClick={() => handleDelete('budget', row.original.id)}>Hapus</button>,
      },
    ],
    [budgets]
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
    getPaginationRowModel: getPaginationRowModel(), 
    onGlobalFilterChange: setGlobalFilter,
    pageCount: 10, 
  });

  // Table for Aksi Konvergensi
  const aksiKonvergensiColumns = useMemo(
    () => [
      { accessorKey: 'budget.provinsi', header: 'Provinsi' },
      { accessorKey: 'budget.kabupaten', header: 'Kabupaten/Kota' },
      { accessorKey: 'budget.opd', header: 'OPD' },
      { accessorKey: 'aksi', header: 'Aksi Konvergensi' },
      { accessorKey: 'hasilPengawasan', header: 'Hasil Pengawasan' },
      {
        accessorKey: 'deleteAction',
        header: 'Aksi',
        cell: ({ row }: any) => <button onClick={() => handleDelete('aksi', row.original.id)}>Hapus</button>,
      },
    ],
    [aksiKonvergensi]
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
    getPaginationRowModel: getPaginationRowModel(), 
    onGlobalFilterChange: setGlobalFilterAksi,
    pageCount: 10, 
  });

  

  // Table for Ketersediaan
  const ketersediaanColumns = useMemo(
    () => [
      { accessorKey: 'budget.provinsi', header: 'Provinsi' },
      { accessorKey: 'budget.kabupaten', header: 'Kabupaten/Kota' },
      { accessorKey: 'jenis', header: 'Ketersediaan' },
      { accessorKey: 'kebutuhan', header: 'Kebutuhan' },
      { accessorKey: 'tersedia', header: 'Tersedia' },
      {
        accessorKey: 'deleteAction',
        header: 'Aksi',
        cell: ({ row }: any) => <button onClick={() => handleDelete('ketersediaan', row.original.id)}>Hapus</button>,
      },
    ],
    [ketersediaan]
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
    getPaginationRowModel: getPaginationRowModel(), 
    onGlobalFilterChange: setGlobalFilterKetersediaan,
    pageCount: 10, 
  });

  // Tabel SPI columns
  const spiColumns = useMemo(
    () => [
      { accessorKey: 'unsur', header: 'Unsur SPI' },  // Ubah accessorKey menjadi 'unsur'
      { accessorKey: 'hasilPengawasan', header: 'Hasil Pengawasan' },
      {
        accessorKey: 'deleteAction',
        header: 'Aksi',
        cell: ({ row }: any) => <button onClick={() => handleDelete('spi', row.original.id)}>Hapus</button>,
      },
    ],
    [spi]
  );
  
  

// Gunakan data SPI
const spiData = useMemo(() => spi, [spi]);

const spiTable = useReactTable({
  data: spiData,
  columns: spiColumns,
  state: {
    globalFilter: globalFilterSpi,
  },
  getCoreRowModel: getCoreRowModel(),
  getSortedRowModel: getSortedRowModel(),
  getFilteredRowModel: getFilteredRowModel(),
  getPaginationRowModel: getPaginationRowModel(),
  onGlobalFilterChange: setGlobalFilterSpi,
  pageCount: 10,
});


  // Data for Anggaran and Realisasi Chart
  const anggaranData = useMemo(() => {
    return {
      labels: budgets.map((budget) => `${budget.provinsi} - ${budget.kabupaten}`),
      datasets: [
        {
          label: 'Anggaran',
          data: budgets.map((budget) => budget.anggaran),
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1,
        },
        {
          label: 'Realisasi',
          data: budgets.map((budget) => budget.realisasi),
          backgroundColor: 'rgba(255, 99, 132, 0.2)',
          borderColor: 'rgba(255, 99, 132, 1)',
          borderWidth: 1,
        },
      ],
    };
  }, [budgets]);

  // Data for Aksi Konvergensi Chart
const aksiKonvergensiChartData = useMemo(() => {
  // Group data by Provinsi-Kabupaten/Kota
  const dataByRegion = aksiKonvergensi.reduce((acc: any, curr: AksiKonvergensi) => {
    const regionKey = `${curr.budget?.provinsi ?? 'Unknown'} - ${curr.budget?.kabupaten ?? 'Unknown'}`;

    if (!acc[regionKey]) {
      acc[regionKey] = {};
    }

    // Map each Aksi and its corresponding hasilPengawasan to the region
    acc[regionKey][curr.aksi] = curr.hasilPengawasan;

    return acc;
  }, {});

  // Extract labels (Provinsi - Kabupaten/Kota) for X-axis
  const labels = Object.keys(dataByRegion);

  // Prepare datasets for each Aksi Konvergensi
  const aksiNames = [
    'AKSI 1: Analisa Situasi Stunting',
    'AKSI 2: Rencana Kegiatan',
    'AKSI 3: Rembug Stunting',
    'AKSI 4: Regulasi terkait Stunting',
    'AKSI 5: Pembinaan Unsur Pelaku',
    'AKSI 6: Sistem Manajemen Data',
    'AKSI 7: Data Cakupan Sasaran dan Publikasi Data',
    'AKSI 8: Review Kerja'
  ];

  const datasets = aksiNames.map((aksiName, index) => ({
    label: aksiName, // Nama Aksi sebagai label untuk setiap dataset
    data: labels.map((label) => dataByRegion[label][aksiName] || 0), // Plot hasilPengawasan untuk setiap Provinsi-Kabupaten/Kota
    backgroundColor: `rgba(${(index + 1) * 30}, 162, 235, 0.2)`, // Warna batang
    borderColor: `rgba(${(index + 1) * 30}, 162, 235, 1)`, // Warna garis batang
    borderWidth: 1,
  }));

  return {
    labels, // Provinsi - Kabupaten/Kota sebagai X-axis
    datasets, // Batang yang menampilkan hasil pengawasan untuk setiap Aksi Konvergensi
  };
}, [aksiKonvergensi]);

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

      {/* Form Input Aksi Konvergensi */}
<h2 className="text-xl font-bold mb-4">Tambah Aksi Konvergensi</h2>
<form onSubmit={(e) => handleSubmit(e, 'aksi')} className="mb-8">
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
    
    {/* Dropdown for selecting the budget */}
    <select
      name="budgetId"
      value={formAksi.budgetId}
      onChange={(e) => handleInputChange(e, 'aksi')}
      className="border p-2"
      required
    >
      <option value="">Pilih Provinsi dan Kabupaten/Kota</option>
      {budgets.map((budget) => (
        <option key={budget.id} value={budget.id}>
          {budget.provinsi} - {budget.kabupaten} - {budget.opd}
        </option>
      ))}
    </select>

    {/* Dropdown for selecting the Aksi Konvergensi */}
    <select
      name="aksi"
      value={formAksi.aksi}
      onChange={(e) => handleInputChange(e, 'aksi')}
      className="border p-2"
      required
    >
      <option value="">Pilih Aksi Konvergensi</option>
      <option value="AKSI 1: Analisa Situasi Stunting">AKSI 1: Analisa Situasi Stunting</option>
      <option value="AKSI 2: Rencana Kegiatan">AKSI 2: Rencana Kegiatan</option>
      <option value="AKSI 3: Rembug Stunting">AKSI 3: Rembug Stunting</option>
      <option value="AKSI 4: Regulasi terkait Stunting">AKSI 4: Regulasi terkait Stunting</option>
      <option value="AKSI 5: Pembinaan Unsur Pelaku">AKSI 5: Pembinaan Unsur Pelaku</option>
      <option value="AKSI 6: Sistem Manajemen Data">AKSI 6: Sistem Manajemen Data</option>
      <option value="AKSI 7: Data Cakupan Sasaran dan Publikasi Data">AKSI 7: Data Cakupan Sasaran dan Publikasi Data</option>
      <option value="AKSI 8: Review Kerja">AKSI 8: Review Kerja</option>
    </select>

    {/* Input for Hasil Pengawasan as an integer */}
    <input
      name="hasilPengawasan"
      type="number"
      value={formAksi.hasilPengawasan}
      onChange={(e) => handleInputChange(e, 'aksi')}
      placeholder="Hasil Pengawasan (nilai poin)"
      className="border p-2"
      required
    />
  </div>

  {/* Submit Button */}
  <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
    Tambah Aksi Konvergensi
  </button>
</form>


      {/* Form Input Ketersediaan */}
<h2 className="text-xl font-bold mb-4">Tambah Ketersediaan</h2>
<form onSubmit={(e) => handleSubmit(e, 'ketersediaan')} className="mb-8">
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
    {/* Dropdown untuk Budget */}
    <select
      name="budgetId"
      value={formKetersediaan.budgetId}
      onChange={(e) => handleInputChange(e, 'ketersediaan')}
      className="border p-2"
      required
    >
      <option value="">Pilih Provinsi dan Kabupaten/Kota</option>
      {budgets.map((budget) => (
        <option key={budget.id} value={budget.id}>
          {budget.provinsi} - {budget.kabupaten} - {budget.opd}
        </option>
      ))}
    </select>

    {/* Dropdown untuk Jenis Ketersediaan */}
    <select
      name="jenis"
      value={formKetersediaan.jenis}
      onChange={(e) => handleInputChange(e, 'ketersediaan')}
      className="border p-2"
      required
    >
      <option value="">Pilih Jenis Ketersediaan</option>
      <option value="Bidan">Bidan</option>
      <option value="USG">USG</option>
      <option value="Antropometri">Antropometri</option>
    </select>

    {/* Input untuk Kebutuhan */}
    <input
      name="kebutuhan"
      value={formKetersediaan.kebutuhan}
      onChange={(e) => handleInputChange(e, 'ketersediaan')}
      placeholder="Kebutuhan"
      className="border p-2"
      required
    />

    {/* Input untuk Tersedia */}
    <input
      name="tersedia"
      value={formKetersediaan.tersedia}
      onChange={(e) => handleInputChange(e, 'ketersediaan')}
      placeholder="Tersedia"
      className="border p-2"
      required
    />
  </div>

  {/* Tombol Submit */}
  <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
    Tambah Ketersediaan
  </button>
</form>

      {/* Form SPI */}
<h2 className="text-xl font-bold mb-4">Tambah SPI</h2>
<form onSubmit={(e) => handleSubmit(e, 'spi')} className="mb-8">
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
    <select
      name="unsurSpi"
      value={formSPI.unsurSpi}
      onChange={(e) => handleInputChange(e, 'spi')}
      className="border p-2"
      required
    >
      <option value="Lingkungan Pengendalian">Lingkungan Pengendalian</option>
      <option value="Penilaian Risiko">Penilaian Risiko</option>
      <option value="Kegiatan Pengendalian">Kegiatan Pengendalian</option>
      <option value="Informasi dan Komunikasi">Informasi dan Komunikasi</option>
      <option value="Pemantauan">Pemantauan</option>
    </select>
    <input
      name="hasilPengawasan"
      value={formSPI.hasilPengawasan}
      onChange={(e) => handleInputChange(e, 'spi')}
      placeholder="Hasil Pengawasan"
      className="border p-2"
      required
    />
  </div>
  <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
    Tambah SPI
  </button>
</form>

<h2 className="text-xl font-bold mb-4">Tabel Anggaran dan Realisasi</h2>
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

       {/* Anggaran and Realisasi Chart */}
       <Bar data={anggaranData} options={{ responsive: true }} className="mb-8" />
      

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

       {/* Aksi Konvergensi Chart */}
      <Bar data={aksiKonvergensiChartData} options={{ responsive: true }} className="mb-8" />

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

      {/* Tabel SPI */}
<h2 className="text-xl font-bold mb-4">Tabel SPI</h2>

{/* Search Box SPI */}
<div className="mb-4">
  <input
    type="text"
    value={globalFilterSpi ?? ''}
    onChange={(e) => setGlobalFilterSpi(e.target.value)}
    placeholder="Cari berdasarkan Unsur SPI"
    className="border p-2 w-full"
  />
</div>

<table className="table-auto w-full text-left border-collapse border border-gray-400 mb-8">
  <thead>
    {spiTable.getHeaderGroups().map((headerGroup) => (
      <tr key={headerGroup.id} className="bg-gray-200">
        {headerGroup.headers.map((header) => (
          <th
            key={header.id}
            onClick={header.column.getToggleSortingHandler()}
            className="border border-gray-400 px-4 py-2 cursor-pointer"
          >
            {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
            {header.column.getIsSorted() ? (header.column.getIsSorted() === 'desc' ? ' 🔽' : ' 🔼') : null}
          </th>
        ))}
      </tr>
    ))}
  </thead>
  <tbody>
    {spiTable.getRowModel().rows.length > 0 ? (
      spiTable.getRowModel().rows.map((row) => (
        <tr key={row.id} className="odd:bg-white even:bg-gray-100">
          {row.getVisibleCells().map((cell) => (
            <td key={cell.id} className="border border-gray-400 px-4 py-2">
              {flexRender(cell.column.columnDef.cell, cell.getContext())}
            </td>
          ))}
        </tr>
      ))
    ) : (
      <tr>
        <td colSpan={spiTable.getHeaderGroups()[0].headers.length} className="text-center py-4">
          Tidak ada data SPI yang ditemukan
        </td>
      </tr>
    )}
  </tbody>
</table>


      {/* Pagination Controls for SPI Table */}
      <div className="flex justify-between items-center">
        <button onClick={() => spiTable.previousPage()} disabled={!spiTable.getCanPreviousPage()}>
          Previous
        </button>
        <span>
          Page {spiTable.getState().pagination.pageIndex + 1} of {spiTable.getPageCount()}
        </span>
        <button onClick={() => spiTable.nextPage()} disabled={!spiTable.getCanNextPage()}>
          Next
        </button>
      </div>
    </div>
  );
}
