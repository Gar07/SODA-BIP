import React from 'react';
import { X, Upload, Calculator, FileDown, Move, Eye, Grid } from 'lucide-react';

interface TutorialProps {
  isOpen: boolean;
  onClose: () => void;
}

const Tutorial: React.FC<TutorialProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 md:p-8">
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-full overflow-hidden"> {/* Perubahan di sini: max-h-full */}
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-4 sm:px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2 text-gray-900">
            <Calculator className="h-6 w-6 sm:h-7 sm:w-7 text-blue-600 flex-shrink-0" />
            <span className="truncate">Selamat Datang di SODA-BIP</span>
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Tutup panduan"
          >
            <X className="h-5 w-5 sm:h-6 sm:w-6 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-4 sm:p-6 space-y-6 max-h-[calc(90vh-8rem)]"> {/* Perubahan di sini: tinggi header dan footer */}
          <section className="space-y-3">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900">Apa itu SODA-BIP?</h3>
            <p className="text-gray-600 leading-relaxed">
              SODA-BIP (Sistem Optimalisasi Desain Arsitektur Berbasis Integral Parsial) adalah
              aplikasi yang membantu Anda menganalisis dan mengoptimalkan desain arsitektur
              menggunakan metode integral parsial.
            </p>
          </section>

          <section className="space-y-4">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900">Cara Menggunakan Aplikasi</h3>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {/* Import Model */}
              <div className="bg-blue-50 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-2 text-blue-700">
                  <Upload className="h-5 w-5 flex-shrink-0" />
                  <h4 className="font-medium">1. Impor Model</h4>
                </div>
                <p className="text-sm text-blue-700/80">
                  Klik tombol "Impor Model" untuk mengunggah file model 3D Anda.
                </p>
                <div className="text-xs text-blue-600/70 space-y-1">
                  <p>Format yang didukung:</p>
                  <ul className="list-disc list-inside">
                    <li>.dxf</li>
                    <li>.obj</li>
                    <li>.stl</li>
                    <li>.gltf / .glb</li>
                    <li>.blend</li>
                  </ul>
                </div>
              </div>

              {/* Visualize Model */}
              <div className="bg-green-50 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-2 text-green-700">
                  <Move className="h-5 w-5 flex-shrink-0" />
                  <h4 className="font-medium">2. Visualisasi Model</h4>
                </div>
                <div className="space-y-2 text-sm text-green-700/80">
                  <p>Gunakan kontrol viewer untuk:</p>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2">
                      <Eye className="h-4 w-4 flex-shrink-0" />
                      <span>Mode tampilan</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Grid className="h-4 w-4 flex-shrink-0" />
                      <span>Grid referensi</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Move className="h-4 w-4 flex-shrink-0" />
                      <span>Rotasi & zoom</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Material Properties */}
              <div className="bg-purple-50 rounded-xl p-4 space-y-3">
                <h4 className="font-medium text-purple-700">3. Properti Material</h4>
                <div className="space-y-2 text-sm text-purple-700/80">
                  <p>Sesuaikan parameter:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Nama material</li>
                    <li>Biaya per unit</li>
                    <li>Densitas material</li>
                    <li>Satuan pengukuran</li>
                  </ul>
                </div>
              </div>

              {/* Optimization */}
              <div className="bg-orange-50 rounded-xl p-4 space-y-3">
                <h4 className="font-medium text-orange-700">4. Batasan Optimalisasi</h4>
                <div className="space-y-2 text-sm text-orange-700/80">
                  <p>Tentukan batasan:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Biaya maksimum</li>
                    <li>Volume minimum</li>
                    <li>Berat maksimum</li>
                  </ul>
                </div>
              </div>

              {/* Analysis */}
              <div className="bg-red-50 rounded-xl p-4 space-y-3">
                <h4 className="font-medium text-red-700">5. Analisis Hasil</h4>
                <div className="space-y-2 text-sm text-red-700/80">
                  <p>Lihat hasil perhitungan:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Volume & luas permukaan</li>
                    <li>Berat & biaya material</li>
                    <li>Langkah integral parsial</li>
                    <li>Rekomendasi optimalisasi</li>
                  </ul>
                </div>
              </div>

              {/* Export */}
              <div className="bg-indigo-50 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-2 text-indigo-700">
                  <FileDown className="h-5 w-5 flex-shrink-0" />
                  <h4 className="font-medium">6. Ekspor Laporan</h4>
                </div>
                <div className="space-y-2 text-sm text-indigo-700/80">
                  <p>Format ekspor:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>PDF (detail lengkap)</li>
                    <li>Excel (data numerik)</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900">Metode Perhitungan</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                <h4 className="font-medium text-gray-900">Perhitungan Volume</h4>
                <p className="text-sm text-gray-600">
                  Menggunakan integral lipat tiga dengan metode integral parsial:
                </p>
                <pre className="bg-white p-3 rounded-lg text-sm font-mono overflow-x-auto">
                  V = ∫∫∫ dV = ∫∫∫ dx dy dz
                  ∫u dv = uv - ∫v du
                </pre>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                <h4 className="font-medium text-gray-900">Perhitungan Luas Permukaan</h4>
                <p className="text-sm text-gray-600">
                  Menggunakan integral lipat dua:
                </p>
                <pre className="bg-white p-3 rounded-lg text-sm font-mono overflow-x-auto">
                  A = ∫∫ dA = ∫∫ |∂r/∂u × ∂r/∂v| du dv
                </pre>
              </div>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-100 p-4 sm:p-6 flex justify-end">
          <button
            onClick={onClose}
            className="btn-primary min-w-[120px] sm:min-w-[160px]"
          >
            Mulai Menggunakan
          </button>
        </div>
      </div>
    </div>
  );
};

export default Tutorial;