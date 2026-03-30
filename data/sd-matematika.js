/**
 * ============================================
 * MODULE: SD MATEMATIKA (KURIKULUM MERDEKA)
 * Platform Administrasi Kelas Digital - SDN 139 Lamanda
 * ============================================
 * 
 * ✅ True Modular Architecture
 * ✅ Renders to #module-container
 * ✅ All functions on window object (onclick compatible)
 * ✅ Kurikulum Merdeka: CP, TP, ATP, Materi, Penilaian
 * ✅ Classes 1-6 SD with phase-appropriate content
 */

console.log('🔴 [SD Matematika] Module START');

// ============================================
// DATABASE MATEMATIKA SD (KURIKULUM MERDEKA)
// Fase A: Kelas 1-2 | Fase B: Kelas 3-4 | Fase C: Kelas 5-6
// ============================================
const MATEMATIKA_SD = {
  // ===== FASE A: KELAS 1 =====
  '1': {
    phase: 'A',
    topics: [
      {
        id: 'bilangan-1-20',
        title: 'Bilangan Cacah 1-20',
        cp: 'Peserta didik dapat menunjukkan pemahaman dan intuisi bilangan (number sense) pada bilangan cacah sampai 20.',
        tp: 'Peserta didik dapat membaca, menulis, menentukan nilai tempat, membandingkan, mengurutkan, dan melakukan komposisi/dekomposisi bilangan cacah sampai 20.',
        atp: [
          'Mengenal dan membaca bilangan 1-20',
          'Menulis lambang bilangan 1-20',
          'Menentukan nilai tempat (puluhan dan satuan)',
          'Membandingkan bilangan (lebih besar/lebih kecil)',
          'Mengurutkan bilangan dari terkecil ke terbesar dan sebaliknya',
          'Komposisi dan dekomposisi bilangan (contoh: 15 = 10 + 5)'
        ],
        materi: [
          'Lambang bilangan 1-20',
          'Nilai tempat: puluhan dan satuan',
          'Garis bilangan 1-20',
          'Perbandingan: >, <, =',
          'Pengelompokan benda berdasarkan jumlah'
        ],
        penilaian: [
          'Tes lisan: menyebutkan bilangan secara acak',
          'Tes tertulis: menulis lambang bilangan',
          'Observasi: kemampuan mengelompokkan benda',
          'Unjuk kerja: mengurutkan kartu bilangan',
          'Portofolio: lembar kerja siswa'
        ],
        alokasi: '6 JP (6 x 35 menit)',
        media: 'Kartu bilangan, manik-manik, garis bilangan, aplikasi hitung interaktif'
      },
      {
        id: 'penjumlahan-pengurangan',
        title: 'Penjumlahan & Pengurangan',
        cp: 'Peserta didik dapat melakukan operasi penjumlahan dan pengurangan yang melibatkan bilangan cacah sampai 20.',
        tp: 'Peserta didik dapat menyelesaikan masalah sehari-hari yang berkaitan dengan penjumlahan dan pengurangan bilangan cacah sampai 20.',
        atp: [
          'Memahami konsep penjumlahan sebagai penggabungan',
          'Memahami konsep pengurangan sebagai pengambilan',
          'Menghitung penjumlahan bilangan 1-20 dengan benda konkret',
          'Menghitung pengurangan bilangan 1-20 dengan benda konkret',
          'Menyelesaikan soal cerita sederhana',
          'Mengenal sifat komutatif penjumlahan (a+b = b+a)'
        ],
        materi: [
          'Konsep penjumlahan (+) dan pengurangan (-)',
          'Fakta dasar penjumlahan 1-20',
          'Fakta dasar pengurangan 1-20',
          'Soal cerita: tambah dan kurang',
          'Hubungan penjumlahan dan pengurangan'
        ],
        penilaian: [
          'Kuis cepat: fakta dasar hitung',
          'Tes tertulis: operasi hitung campuran',
          'Observasi: penggunaan strategi menghitung',
          'Proyek mini: membuat soal cerita sendiri',
          'Self-assessment: refleksi kesulitan belajar'
        ],
        alokasi: '8 JP (8 x 35 menit)',
        media: 'Blok dienes, kartu soal, aplikasi matematika dasar, video animasi'
      },
      {
        id: 'pengukuran-panjang',
        title: 'Pengukuran Panjang',
        cp: 'Peserta didik dapat membandingkan dan mengukur panjang dan berat benda dengan satuan tidak baku.',
        tp: 'Peserta didik dapat membandingkan panjang dua benda atau lebih dan mengukurnya dengan satuan tidak baku.',
        atp: [
          'Membandingkan panjang benda secara langsung (panjang/pendek)',
          'Mengukur panjang dengan satuan tidak baku (jengkal, langkah, klip)',
          'Mencatat hasil pengukuran',
          'Membandingkan hasil pengukuran dengan teman',
          'Menyelesaikan masalah sederhana tentang panjang'
        ],
        materi: [
          'Konsep panjang: lebih panjang, lebih pendek, sama panjang',
          'Satuan tidak baku: jengkal, kaki, langkah, klip kertas',
          'Teknik pengukuran yang benar',
          'Membaca dan mencatat hasil pengukuran'
        ],
        penilaian: [
          'Praktik: mengukur benda di kelas',
          'Lembar kerja: membandingkan panjang gambar',
          'Observasi: ketepatan teknik pengukuran',
          'Presentasi: melaporkan hasil pengukuran kelompok'
        ],
        alokasi: '4 JP (4 x 35 menit)',
        media: 'Benda konkret (pensil, buku, meja), klip kertas, tali, lembar kerja'
      }
    ]
  },

  // ===== FASE A: KELAS 2 =====
  '2': {
    phase: 'A',
    topics: [
      {
        id: 'bilangan-1-100',
        title: 'Bilangan Cacah 1-100',
        cp: 'Peserta didik dapat menunjukkan pemahaman dan intuisi bilangan pada bilangan cacah sampai 100.',
        tp: 'Peserta didik dapat membaca, menulis, menentukan nilai tempat, membandingkan, mengurutkan bilangan cacah sampai 100.',
        atp: [
          'Membaca dan menulis bilangan 1-100',
          'Menentukan nilai tempat (ratusan, puluhan, satuan)',
          'Membandingkan bilangan menggunakan >, <, =',
          'Mengurutkan bilangan dari terkecil ke terbesar',
          'Melompati bilangan (skip counting) 2, 5, 10',
          'Komposisi dan dekomposisi bilangan sampai 100'
        ],
        materi: [
          'Lambang bilangan 1-100',
          'Nilai tempat: ratusan, puluhan, satuan',
          'Garis bilangan 1-100',
          'Pola bilangan: ganjil-genap, kelipatan',
          'Pengelompokan bilangan'
        ],
        penilaian: [
          'Tes tertulis: menulis dan membandingkan bilangan',
          'Kuis lisan: menyebutkan bilangan secara acak',
          'Proyek: membuat poster bilangan 1-100',
          'Observasi: kemampuan skip counting',
          'Portofolio: kumpulan lembar kerja'
        ],
        alokasi: '7 JP',
        media: 'Kartu bilangan, papan ratusan, aplikasi interaktif, video pembelajaran'
      },
      {
        id: 'operasi-hitung-campuran',
        title: 'Operasi Hitung Campuran',
        cp: 'Peserta didik dapat melakukan operasi penjumlahan dan pengurangan yang melibatkan bilangan cacah sampai 100.',
        tp: 'Peserta didik dapat menyelesaikan masalah sehari-hari dengan operasi hitung campuran penjumlahan dan pengurangan.',
        atp: [
          'Menjumlahkan bilangan dua angka tanpa menyimpan',
          'Mengurangkan bilangan dua angka tanpa meminjam',
          'Menjumlahkan dengan teknik menyimpan',
          'Mengurangkan dengan teknik meminjam',
          'Operasi hitung campuran (+ dan -) dalam satu soal',
          'Menyelesaikan soal cerita dua langkah'
        ],
        materi: [
          'Penjumlahan bersusun pendek dan panjang',
          'Pengurangan bersusun dengan meminjam',
          'Urutan operasi: dari kiri ke kanan',
          'Strategi menghitung: membulatkan, memecah bilangan',
          'Soal cerita: transaksi jual beli sederhana'
        ],
        penilaian: [
          'Tes formatif: operasi hitung dasar',
          'Tes sumatif: soal cerita kompleks',
          'Unjuk kerja: presentasi strategi menghitung',
          'Peer assessment: saling mengoreksi jawaban',
          'Refleksi: catatan kesulitan dan pencapaian'
        ],
        alokasi: '10 JP',
        media: 'Blok dienes, kartu soal bertingkat, aplikasi matematika, video tutorial'
      }
    ]
  },

  // ===== FASE B: KELAS 3 =====
  '3': {
    phase: 'B',
    topics: [
      {
        id: 'perkalian-pembagian',
        title: 'Perkalian & Pembagian Dasar',
        cp: 'Peserta didik dapat menunjukkan pemahaman tentang perkalian dan pembagian sebagai operasi invers.',
        tp: 'Peserta didik dapat melakukan operasi perkalian dan pembagian bilangan cacah sampai 100.',
        atp: [
          'Memahami perkalian sebagai penjumlahan berulang',
          'Menghafal fakta dasar perkalian 1-10',
          'Memahami pembagian sebagai pengurangan berulang',
          'Menghubungkan perkalian dan pembagian (invers)',
          'Menyelesaikan soal cerita perkalian dan pembagian',
          'Mengenal sifat komutatif perkalian'
        ],
        materi: [
          'Konsep perkalian: a × b = a + a + ... (b kali)',
          'Tabel perkalian 1-10',
          'Konsep pembagian: a ÷ b = berapa kali b muat dalam a',
          'Hubungan: jika a × b = c, maka c ÷ b = a',
          'Soal cerita: pengelompokan dan pembagian rata'
        ],
        penilaian: [
          'Kuis hafalan: tabel perkalian',
          'Tes tertulis: operasi campuran',
          'Proyek: membuat permainan kartu perkalian',
          'Observasi: pemahaman konsep invers',
          'Portofolio: kumpulan soal buatan siswa'
        ],
        alokasi: '12 JP',
        media: 'Kartu perkalian, aplikasi drill, video animasi konsep, benda konkret untuk pengelompokan'
      },
      {
        id: 'pecahan-sederhana',
        title: 'Pecahan Sederhana',
        cp: 'Peserta didik dapat mengenal dan menyatakan pecahan sederhana (½, ⅓, ¼) sebagai bagian dari keseluruhan.',
        tp: 'Peserta didik dapat membandingkan dan mengurutkan pecahan sederhana dengan penyebut sama.',
        atp: [
          'Mengenal pecahan sebagai bagian dari benda utuh',
          'Menulis dan membaca lambang pecahan ½, ⅓, ¼',
          'Menggambar pecahan dengan arsiran',
          'Membandingkan pecahan dengan penyebut sama',
          'Mengurutkan pecahan dari terkecil ke terbesar',
          'Menyelesaikan masalah sehari-hari tentang pecahan'
        ],
        materi: [
          'Konsep pecahan: pembilang dan penyebut',
          'Pecahan ½, ⅓, ¼, ⅕ dengan model area',
          'Pecahan pada garis bilangan 0-1',
          'Perbandingan: ½ > ⅓ karena bagian lebih besar',
          'Aplikasi: membagi kue, pizza, coklat'
        ],
        penilaian: [
          'Praktik: membagi benda konkret menjadi pecahan',
          'Tes tertulis: menggambar dan membandingkan pecahan',
          'Proyek: membuat poster "Pecahan dalam Kehidupan"',
          'Observasi: pemahaman konsep bagian-keseluruhan',
          'Self-assessment: refleksi pemahaman pecahan'
        ],
        alokasi: '6 JP',
        media: 'Kertas lipat, kue/pizza model, aplikasi pecahan interaktif, video demonstrasi'
      }
    ]
  },

  // ===== FASE B: KELAS 4 =====
  '4': {
    phase: 'B',
    topics: [
      {
        id: 'bilangan-bulat-operasi',
        title: 'Operasi Bilangan Bulat',
        cp: 'Peserta didik dapat melakukan operasi hitung penjumlahan, pengurangan, perkalian, dan pembagian pada bilangan cacah besar.',
        tp: 'Peserta didik dapat menyelesaikan masalah yang melibatkan operasi hitung campuran pada bilangan cacah sampai 10.000.',
        atp: [
          'Menjumlahkan bilangan sampai 4 angka dengan teknik menyimpan',
          'Mengurangkan bilangan sampai 4 angka dengan teknik meminjam',
          'Mengalikan bilangan 2 angka dengan 1 angka',
          'Membagi bilangan 3-4 angka dengan 1 angka (tanpa sisa)',
          'Operasi hitung campuran dengan aturan urutan',
          'Menyelesaikan soal cerita multi-langkah'
        ],
        materi: [
          'Nilai tempat: ribuan, ratusan, puluhan, satuan',
          'Penjumlahan dan pengurangan bersusun panjang',
          'Perkalian bersusun: metode standar',
          'Pembagian bersusun pendek (porogapit)',
          'Aturan operasi: kali/bagi dahulu, lalu tambah/kurang',
          'Estimasi: membulatkan untuk mengecek jawaban'
        ],
        penilaian: [
          'Tes formatif: operasi dasar bertingkat',
          'Tes sumatif: soal cerita kompleks',
          'Proyek: membuat "Toko Kelas" dengan transaksi hitung',
          'Peer teaching: siswa mengajarkan strategi ke teman',
          'Portofolio: kumpulan soal dan solusi terbaik'
        ],
        alokasi: '14 JP',
        media: 'Kartu soal bertingkat, aplikasi kalkulator edukasi, video tutorial langkah demi langkah'
      },
      {
        id: 'bangun-datar',
        title: 'Bangun Datar & Keliling',
        cp: 'Peserta didik dapat mengenal sifat-sifat bangun datar dan menghitung kelilingnya.',
        tp: 'Peserta didik dapat mengidentifikasi bangun datar dan menghitung keliling persegi dan persegi panjang.',
        atp: [
          'Mengenal sifat persegi, persegi panjang, segitiga, lingkaran',
          'Mengidentifikasi sisi, sudut, dan simetri bangun datar',
          'Memahami konsep keliling sebagai panjang tepi',
          'Rumus keliling: K = 4×s (persegi), K = 2×(p+l) (persegi panjang)',
          'Menghitung keliling dengan satuan baku (cm, m)',
          'Menyelesaikan masalah kontekstual tentang keliling'
        ],
        materi: [
          'Jenis bangun datar dan sifat-sifatnya',
          'Sisi, sudut, dan simetri lipat',
          'Konsep keliling: mengukur tepi benda',
          'Rumus keliling persegi dan persegi panjang',
          'Aplikasi: pagar kebun, bingkai foto, lintasan lari'
        ],
        penilaian: [
          'Praktik: mengukur keliling benda di sekitar',
          'Tes tertulis: menghitung keliling dari gambar',
          'Proyek: mendesain taman mini dengan keliling tertentu',
          'Observasi: ketepatan penggunaan rumus',
          'Presentasi: menjelaskan solusi masalah keliling'
        ],
        alokasi: '8 JP',
        media: 'Benda konkret (buku, meja), tali pengukur, aplikasi geometri, video animasi bangun datar'
      }
    ]
  },

  // ===== FASE C: KELAS 5 =====
  '5': {
    phase: 'C',
    topics: [
      {
        id: 'pecahan-desimal-persen',
        title: 'Pecahan, Desimal, dan Persen',
        cp: 'Peserta didik dapat memahami hubungan antara pecahan, desimal, dan persen serta melakukan operasi hitungnya.',
        tp: 'Peserta didik dapat mengubah bentuk pecahan, desimal, dan persen serta menyelesaikan masalah yang melibatkan ketiganya.',
        atp: [
          'Mengenal pecahan desimal (persepuluhan, perseratusan)',
          'Mengubah pecahan biasa ke desimal dan sebaliknya',
          'Mengenal persen sebagai pecahan per 100',
          'Mengubah desimal/pecahan ke persen dan sebaliknya',
          'Membandingkan dan mengurutkan pecahan/desimal/persen',
          'Menyelesaikan masalah diskon, pajak, dan proporsi sederhana'
        ],
        materi: [
          'Pecahan desimal: 0,1 = ¹⁄₁₀, 0,25 = ²⁵⁄₁₀₀',
          'Konversi: ½ = 0,5 = 50%, ¼ = 0,25 = 25%',
          'Garis bilangan desimal 0-1',
          'Perbandingan: 0,3 > 0,25 karena 30 > 25 per 100',
          'Aplikasi: diskon 20%, pajak 10%, proporsi resep'
        ],
        penilaian: [
          'Kuis konversi: pecahan ↔ desimal ↔ persen',
          'Tes tertulis: operasi dan perbandingan',
          'Proyek: "Belanja Cerdas" dengan hitungan diskon',
          'Observasi: pemahaman hubungan ketiga bentuk',
          'Portofolio: kumpulan masalah kontekstual'
        ],
        alokasi: '10 JP',
        media: 'Kartu konversi, aplikasi kalkulator persen, video belanja realistis, lembar kerja kontekstual'
      },
      {
        id: 'volume-bangun-ruang',
        title: 'Volume Kubus dan Balok',
        cp: 'Peserta didik dapat memahami konsep volume bangun ruang dan menghitung volume kubus dan balok.',
        tp: 'Peserta didik dapat menghitung volume kubus dan balok serta menyelesaikan masalah terkait volume.',
        atp: [
          'Memahami volume sebagai isi/banyaknya ruang',
          'Mengenal satuan volume: cm³, m³, liter',
          'Rumus volume kubus: V = s³',
          'Rumus volume balok: V = p × l × t',
          'Menghitung volume dengan satuan berbeda',
          'Menyelesaikan masalah: isi bak mandi, kotak penyimpanan'
        ],
        materi: [
          'Konsep volume: kubus satuan sebagai acuan',
          'Hubungan: 1 liter = 1.000 cm³',
          'Rumus dan penerapannya',
          'Konversi satuan volume',
          'Aplikasi: menghitung isi wadah, kebutuhan material'
        ],
        penilaian: [
          'Praktik: mengukur volume benda dengan air',
          'Tes tertulis: menghitung volume dari dimensi',
          'Proyek: mendesain kotak dengan volume tertentu',
          'Observasi: ketepatan penggunaan rumus dan satuan',
          'Presentasi: solusi masalah volume kontekstual'
        ],
        alokasi: '8 JP',
        media: 'Kubus satuan, wadah transparan, air, aplikasi 3D geometry, video demonstrasi'
      }
    ]
  },

  // ===== FASE C: KELAS 6 =====
  '6': {
    phase: 'C',
    topics: [
      {
        id: 'operasi-pecahan-lanjut',
        title: 'Operasi Pecahan Lanjut',
        cp: 'Peserta didik dapat melakukan operasi hitung penjumlahan, pengurangan, perkalian, dan pembagian pada pecahan.',
        tp: 'Peserta didik dapat menyelesaikan masalah sehari-hari yang melibatkan operasi hitung pecahan.',
        atp: [
          'Menjumlahkan dan mengurangkan pecahan dengan penyebut berbeda',
          'Mengalikan pecahan dengan pecahan/bilangan bulat',
          'Membagi pecahan dengan pecahan/bilangan bulat',
          'Menyederhanakan hasil operasi pecahan',
          'Operasi hitung campuran dengan pecahan',
          'Menyelesaikan soal cerita multi-langkah dengan pecahan'
        ],
        materi: [
          'KPK untuk menyamakan penyebut',
          'Perkalian pecahan: (a/b) × (c/d) = (a×c)/(b×d)',
          'Pembagian pecahan: kalikan dengan kebalikan',
          'Penyederhanaan: FPB pembilang dan penyebut',
          'Urutan operasi dengan pecahan',
          'Strategi: estimasi, mengecek dengan desimal'
        ],
        penilaian: [
          'Tes formatif: operasi dasar pecahan',
          'Tes sumatif: soal cerita kompleks',
          'Proyek: "Resep Masakan" dengan konversi takaran',
          'Peer assessment: saling mengoreksi langkah penyelesaian',
          'Refleksi: strategi mengatasi kesulitan hitung pecahan'
        ],
        alokasi: '12 JP',
        media: 'Kartu pecahan, aplikasi visualisasi operasi, video tutorial langkah demi langkah'
      },
      {
        id: 'skala-koordinat',
        title: 'Skala dan Sistem Koordinat',
        cp: 'Peserta didik dapat memahami skala pada peta/denah dan menggunakan sistem koordinat Kartesius sederhana.',
        tp: 'Peserta didik dapat membaca skala, menghitung jarak sebenarnya, dan menentukan posisi benda pada koordinat.',
        atp: [
          'Memahami skala sebagai perbandingan jarak peta dan sebenarnya',
          'Menghitung jarak sebenarnya dari jarak pada peta',
          'Menggambar denah sederhana dengan skala tertentu',
          'Mengenal sistem koordinat Kartesius (sumbu X dan Y)',
          'Menentukan koordinat titik dan sebaliknya',
          'Menyelesaikan masalah: denah kelas, peta lingkungan'
        ],
        materi: [
          'Konsep skala: 1 : 100.000 berarti 1 cm = 1 km',
          'Rumus: Jarak sebenarnya = Jarak peta × Skala',
          'Sumbu X (horizontal) dan Y (vertikal)',
          'Koordinat titik: (x, y) dengan x horizontal, y vertikal',
          'Aplikasi: denah sekolah, peta wisata, game koordinat'
        ],
        penilaian: [
          'Praktik: mengukur dan menghitung jarak pada peta',
          'Tes tertulis: konversi skala dan koordinat',
          'Proyek: membuat denah kelas dengan skala 1:50',
          'Observasi: ketepatan penentuan koordinat',
          'Presentasi: menjelaskan denah/peta buatan sendiri'
        ],
        alokasi: '8 JP',
        media: 'Peta daerah, denah sekolah, kertas berpetak, aplikasi koordinat interaktif'
      }
    ]
  }
};

// ============================================
// ✅ FUNGSI UTAMA: RENDER MATEMATIKA SD
// ============================================
window.renderSDMatematika = function(kelasId) {
  console.log('🧮 [SD Matematika] Render for Kelas:', kelasId);
  
  // Hide all sections except module-container
  document.querySelectorAll('.section').forEach(section => {
    if (section.id !== 'module-container') {
      section.classList.add('hidden');
    }
  });
  
  // Get container
  const container = document.getElementById('module-container');
  if (!container) {
    console.error('❌ [SD Matematika] Module container not found!');
    return;
  }
  
  const data = MATEMATIKA_SD[kelasId];
  if (!data) {
    container.innerHTML = `<div class="p-8 text-center text-gray-500">Data Matematika untuk Kelas ${kelasId} belum tersedia.</div>`;
    container.classList.remove('hidden');
    return;
  }
  
  // Render UI
  container.innerHTML = `
    <div class="container py-6">
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <div class="flex items-center gap-3">
          <div class="p-3 bg-blue-100 rounded-xl">
            <i class="fas fa-calculator text-blue-600 text-2xl"></i>
          </div>
          <div>
            <h2 class="text-2xl font-bold text-gray-800">Matematika - Kelas ${kelasId}</h2>
            <p class="text-gray-500 text-sm">Fase ${data.phase} • Kurikulum Merdeka</p>
          </div>
        </div>
        <button onclick="backToSDClasses()" class="btn btn-ghost btn-sm">
          <i class="fas fa-arrow-left mr-2"></i>Kembali
        </button>
      </div>
      
      <!-- Topics Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        ${data.topics.map(topic => `
          <article class="bg-white rounded-lg shadow hover:shadow-lg transition cursor-pointer border-l-4 border-blue-500" 
                   onclick="showMatematikaDetail('${topic.id}', '${kelasId}')">
            <div class="p-5">
              <div class="flex items-start justify-between mb-3">
                <h3 class="font-bold text-gray-800 text-lg">${topic.title}</h3>
                <span class="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">${topic.alokasi}</span>
              </div>
              <p class="text-sm text-gray-600 mb-4 line-clamp-2">${truncateText(topic.cp, 120)}</p>
              <div class="flex flex-wrap gap-2">
                <span class="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">CP</span>
                <span class="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">TP</span>
                <span class="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">ATP</span>
              </div>
            </div>
          </article>
        `).join('')}
      </div>
      
      <!-- Info Footer -->
      <div class="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <p class="text-sm text-blue-800">
          <i class="fas fa-info-circle mr-2"></i>
          Klik pada topik untuk melihat detail Capaian Pembelajaran (CP), Tujuan Pembelajaran (TP), 
          Alur Tujuan Pembelajaran (ATP), Materi, dan Penilaian.
        </p>
      </div>
    </div>
  `;
  
  container.classList.remove('hidden');
  console.log('✅ [SD Matematika] Rendered', data.topics.length, 'topics for Kelas', kelasId);
};

// ============================================
// ✅ FUNGSI: SHOW DETAIL MODAL
// ============================================
window.showMatematikaDetail = function(topicId, kelasId) {
  console.log('🔍 [SD Matematika] Show detail:', topicId, 'Kelas:', kelasId);
  
  const topic = MATEMATIKA_SD[kelasId]?.topics.find(t => t.id === topicId);
  if (!topic) return;
  
  showCustomModal({
    title: `🧮 ${topic.title}`,
    subtitle: `Kelas ${kelasId} • Fase ${MATEMATIKA_SD[kelasId].phase} • Kurikulum Merdeka`,
    content: `
      <div class="space-y-4">
        <!-- CP -->
        <div class="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
          <h4 class="font-semibold text-blue-800 mb-2">🎯 Capaian Pembelajaran (CP)</h4>
          <p class="text-gray-700 text-sm">${topic.cp}</p>
        </div>
        
        <!-- TP -->
        <div class="p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
          <h4 class="font-semibold text-green-800 mb-2">📌 Tujuan Pembelajaran (TP)</h4>
          <p class="text-gray-700 text-sm">${topic.tp}</p>
        </div>
        
        <!-- ATP -->
        <div class="p-4 bg-purple-50 rounded-lg border-l-4 border-purple-500">
          <h4 class="font-semibold text-purple-800 mb-2">📋 Alur Tujuan Pembelajaran (ATP)</h4>
          <ul class="list-disc pl-5 text-sm text-gray-700 space-y-1">
            ${topic.atp.map(item => `<li>${item}</li>`).join('')}
          </ul>
        </div>
        
        <!-- Materi -->
        <div class="p-4 bg-yellow-50 rounded-lg border-l-4 border-yellow-500">
          <h4 class="font-semibold text-yellow-800 mb-2">📚 Materi Pokok</h4>
          <ul class="list-disc pl-5 text-sm text-gray-700 space-y-1">
            ${topic.materi.map(item => `<li>${item}</li>`).join('')}
          </ul>
        </div>
        
        <!-- Penilaian -->
        <div class="p-4 bg-red-50 rounded-lg border-l-4 border-red-500">
          <h4 class="font-semibold text-red-800 mb-2">📊 Asesmen & Penilaian</h4>
          <ul class="list-disc pl-5 text-sm text-gray-700 space-y-1">
            ${topic.penilaian.map(item => `<li>${item}</li>`).join('')}
          </ul>
        </div>
        
        <!-- Info Tambahan -->
        <div class="grid grid-cols-2 gap-4 text-sm">
          <div class="p-3 bg-gray-50 rounded">
            <p class="text-gray-500">Alokasi Waktu</p>
            <p class="font-semibold text-gray-800">${topic.alokasi}</p>
          </div>
          <div class="p-3 bg-gray-50 rounded">
            <p class="text-gray-500">Media Pembelajaran</p>
            <p class="font-semibold text-gray-800 text-xs">${truncateText(topic.media, 60)}</p>
          </div>
        </div>
      </div>
    `,
    confirmText: 'Tutup',
    actions: `
      <button onclick="exportMatematikaTopic('${topicId}', '${kelasId}')" 
              class="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm flex items-center justify-center gap-2">
        <i class="fas fa-download"></i> Export
      </button>
      <button onclick="printMatematikaTopic('${topicId}', '${kelasId}')" 
              class="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded text-sm flex items-center justify-center gap-2">
        <i class="fas fa-print"></i> Print
      </button>
    `
  });
};

// ============================================
// ✅ FUNGSI: EXPORT TO PDF/WORD
// ============================================
window.exportMatematikaTopic = function(topicId, kelasId) {
  const topic = MATEMATIKA_SD[kelasId]?.topics.find(t => t.id === topicId);
  if (!topic) return;
  
  const content = `
MATEMATIKA - KELAS ${kelasId}
${topic.title}
${'='.repeat(50)}

CAPAIAN PEMBELAJARAN (CP):
${topic.cp}

TUJUAN PEMBELAJARAN (TP):
${topic.tp}

ALUR TUJUAN PEMBELAJARAN (ATP):
${topic.atp.map((item, i) => `${i+1}. ${item}`).join('\n')}

MATERI POKOK:
${topic.materi.map((item, i) => `• ${item}`).join('\n')}

ASESMEN & PENILAIAN:
${topic.penilaian.map((item, i) => `• ${item}`).join('\n')}

Alokasi Waktu: ${topic.alokasi}
Media: ${topic.media}
  `.trim();
  
  // Copy to clipboard
  navigator.clipboard.writeText(content).then(() => {
    alert('✅ Data Matematika berhasil disalin!\n\nTips: Paste ke Word/Google Docs untuk edit lebih lanjut.');
  }).catch(() => {
    // Fallback: open in new window
    const win = window.open('', '_blank');
    win.document.write(`<pre style="font-family:monospace;font-size:12px;white-space:pre-wrap;">${content}</pre>`);
    win.document.close();
  });
};

// ============================================
// ✅ FUNGSI: PRINT TOPIC
// ============================================
window.printMatematikaTopic = function(topicId, kelasId) {
  const topic = MATEMATIKA_SD[kelasId]?.topics.find(t => t.id === topicId);
  if (!topic) return;
  
  const printContent = `
    <html>
    <head>
      <title>Matematika Kelas ${kelasId} - ${topic.title}</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
        h1 { color: #2563eb; border-bottom: 3px solid #2563eb; padding-bottom: 10px; }
        h2 { color: #1e40af; margin: 20px 0 10px; }
        .section { margin: 15px 0; padding: 15px; border-left: 4px solid #3b82f6; background: #f8fafc; }
        ul { padding-left: 20px; }
        li { margin: 5px 0; }
        .meta { display: flex; gap: 20px; margin: 20px 0; }
        .meta div { background: #f1f5f9; padding: 10px; border-radius: 4px; }
        @media print { body { padding: 20px; } }
      </style>
    </head>
    <body>
      <h1>🧮 Matematika - Kelas ${kelasId}</h1>
      <p style="color:#64748b">Fase ${MATEMATIKA_SD[kelasId].phase} • Kurikulum Merdeka</p>
      <h2>${topic.title}</h2>
      
      <div class="section" style="border-color:#3b82f6">
        <strong>🎯 Capaian Pembelajaran (CP)</strong>
        <p>${topic.cp}</p>
      </div>
      
      <div class="section" style="border-color:#22c55e">
        <strong>📌 Tujuan Pembelajaran (TP)</strong>
        <p>${topic.tp}</p>
      </div>
      
      <div class="section" style="border-color:#a855f7">
        <strong>📋 Alur Tujuan Pembelajaran (ATP)</strong>
        <ul>${topic.atp.map(item => `<li>${item}</li>`).join('')}</ul>
      </div>
      
      <div class="section" style="border-color:#eab308">
        <strong>📚 Materi Pokok</strong>
        <ul>${topic.materi.map(item => `<li>${item}</li>`).join('')}</ul>
      </div>
      
      <div class="section" style="border-color:#ef4444">
        <strong>📊 Asesmen & Penilaian</strong>
        <ul>${topic.penilaian.map(item => `<li>${item}</li>`).join('')}</ul>
      </div>
      
      <div class="meta">
        <div><strong>⏱️ Alokasi</strong><br>${topic.alokasi}</div>
        <div><strong>📦 Media</strong><br>${topic.media}</div>
      </div>
      
      <p style="margin-top:40px;font-size:12px;color:#64748b;text-align:center">
        SDN 139 Lamanda • Platform Administrasi Kelas Digital
      </p>
    </body>
    </html>
  `;
  
  const printWindow = window.open('', '_blank');
  printWindow.document.write(printContent);
  printWindow.document.close();
  printWindow.print();
};

// ============================================
// ✅ FUNGSI HELPER: Custom Modal (Reusable)
// ============================================
function showCustomModal({ title, subtitle, content, confirmText = 'Tutup', actions = '', onConfirm }) {
  // Remove existing modal
  document.getElementById('custom-modal-overlay')?.remove();
  
  const overlay = document.createElement('div');
  overlay.id = 'custom-modal-overlay';
  overlay.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
  overlay.onclick = (e) => { if (e.target === overlay) closeCustomModal(); };
  
  overlay.innerHTML = `
    <div class="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col animate-fade-in">
      <!-- Header -->
      <div class="bg-gradient-to-r from-blue-600 to-indigo-600 p-5 text-white flex-shrink-0">
        <h3 class="text-xl font-bold">${title}</h3>
        ${subtitle ? `<p class="text-blue-100 text-sm mt-1">${subtitle}</p>` : ''}
      </div>
      
      <!-- Scrollable Content -->
      <div class="p-6 overflow-y-auto flex-1">
        ${content}
      </div>
      
      <!-- Actions -->
      ${actions ? `<div class="px-6 pb-6 flex gap-3 flex-shrink-0">${actions}</div>` : ''}
      
      <!-- Confirm Button -->
      <div class="px-6 pb-6 ${actions ? 'hidden' : ''}">
        <button onclick="closeCustomModal()" 
                class="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition">
          ${confirmText}
        </button>
      </div>
    </div>
  `;
  
  document.body.appendChild(overlay);
  
  // Add animation CSS if not exists
  if (!document.getElementById('modal-animations')) {
    const style = document.createElement('style');
    style.id = 'modal-animations';
    style.textContent = `
      @keyframes fadeIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
      .animate-fade-in { animation: fadeIn 0.2s ease-out; }
      .line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
    `;
    document.head.appendChild(style);
  }
  
  window.closeCustomModal = function() {
    overlay.style.opacity = '0';
    overlay.style.transition = 'opacity 0.2s ease';
    setTimeout(() => {
      overlay.remove();
      if (onConfirm) onConfirm();
    }, 200);
  };
}

// ============================================
// ✅ FUNGSI HELPER: Truncate Text
// ============================================
function truncateText(text, maxLength) {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
}

// ============================================
// ✅ FUNGSI: Back to SD Classes
// ============================================
window.backToSDMatematika = function() {
  console.log('🏠 [SD Matematika] Back to SD Classes');
  const container = document.getElementById('module-container');
  if (container) {
    container.classList.add('hidden');
    container.innerHTML = '';
  }
  const sdSection = document.getElementById('sd-section');
  if (sdSection) sdSection.classList.remove('hidden');
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

// ============================================
// CONFIRM: Functions Registered
// ============================================
console.log('🟢 [SD Matematika] window.renderSDMatematika:', typeof window.renderSDMatematika);
console.log('🟢 [SD Matematika] window.showMatematikaDetail:', typeof window.showMatematikaDetail);
console.log('🟢 [SD Matematika] window.exportMatematikaTopic:', typeof window.exportMatematikaTopic);
console.log('💡 [SD Matematika] TEST: window.renderSDMatematika("1")');
console.log('🟢 [SD Matematika] Module FINISHED');

// ============================================
// EXPORT (Optional)
// ============================================
export { MATEMATIKA_SD };
