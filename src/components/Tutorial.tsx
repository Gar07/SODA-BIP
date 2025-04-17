import React from 'react';
import { X, Upload, Calculator, FileDown, Move, Eye, Grid } from 'lucide-react';

interface TutorialProps {
  isOpen: boolean;
  onClose: () => void;
}

const Tutorial: React.FC<TutorialProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Calculator className="h-6 w-6 text-blue-600" />
              Selamat Datang di SODA-BIP
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="space-y-6">
            <section>
              <h3 className="text-lg font-semibold mb-2">Apa itu SODA-BIP?</h3>
              <p className="text-gray-600">
                SODA-BIP (Sistem Optimalisasi Desain Arsitektur Berbasis Integral Parsial) adalah
                aplikasi yang membantu Anda menganalisis dan mengoptimalkan desain arsitektur
                menggunakan metode integral parsial.
              </p>
            </section>

            <section className="space-y-4">
              <h3 className="text-lg font-semibold">Cara Menggunakan Aplikasi</h3>
              
              <div className="border-l-4 border-blue-500 pl-4">
                <h4 className="font-medium flex items-center gap-2">
                  <Upload className="h-5 w-5 text-blue-600" />
                  1. Impor Model
                </h4>
                <p className="text-gray-600 mt-1">
                  Klik tombol "Impor Model" untuk mengunggah file model 3D Anda.
                  Format yang didukung: .dxf, .obj, .stl, .gltf, .glb, .blend
                </p>
              </div>

              <div className="border-l-4 border-green-500 pl-4">
                <h4 className="font-medium flex items-center gap-2">
                  <Move className="h-5 w-5 text-green-600" />
                  2. Visualisasi Model
                </h4>
                <p className="text-gray-600 mt-1">
                  Gunakan kontrol di sebelah kiri viewer untuk:
                </p>
                <ul className="mt-2 space-y-2">
                  <li className="flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    Mengubah mode tampilan (solid/wireframe)
                  </li>
                  <li className="flex items-center gap-2">
                    <Grid className="h-4 w-4" />
                    Menampilkan/sembunyikan grid
                  </li>
                  <li className="flex items-center gap-2">
                    <Move className="h-4 w-4" />
                    Rotasi, zoom, dan pan model
                  </li>
                </ul>
              </div>

              <div className="border-l-4 border-purple-500 pl-4">
                <h4 className="font-medium">3. Atur Parameter Material</h4>
                <p className="text-gray-600 mt-1">
                  Sesuaikan properti material seperti:
                </p>
                <ul className="mt-2 list-disc list-inside text-gray-600">
                  <li>Nama material</li>
                  <li>Biaya per unit</li>
                  <li>Densitas material</li>
                  <li>Satuan pengukuran</li>
                </ul>
              </div>

              <div className="border-l-4 border-orange-500 pl-4">
                <h4 className="font-medium">4. Tentukan Batasan Optimalisasi</h4>
                <p className="text-gray-600 mt-1">
                  Atur batasan-batasan untuk optimalisasi:
                </p>
                <ul className="mt-2 list-disc list-inside text-gray-600">
                  <li>Biaya maksimum</li>
                  <li>Volume minimum</li>
                  <li>Berat maksimum</li>
                </ul>
              </div>

              <div className="border-l-4 border-red-500 pl-4">
                <h4 className="font-medium">5. Analisis Hasil</h4>
                <p className="text-gray-600 mt-1">
                  Lihat hasil analisis yang mencakup:
                </p>
                <ul className="mt-2 list-disc list-inside text-gray-600">
                  <li>Volume dan luas permukaan</li>
                  <li>Berat dan biaya material</li>
                  <li>Langkah-langkah perhitungan integral parsial</li>
                  <li>Rekomendasi optimalisasi</li>
                </ul>
              </div>

              <div className="border-l-4 border-indigo-500 pl-4">
                <h4 className="font-medium flex items-center gap-2">
                  <FileDown className="h-5 w-5 text-indigo-600" />
                  6. Ekspor Laporan
                </h4>
                <p className="text-gray-600 mt-1">
                  Ekspor hasil analisis dalam format PDF dan Excel yang mencakup:
                </p>
                <ul className="mt-2 list-disc list-inside text-gray-600">
                  <li>Detail perhitungan lengkap</li>
                  <li>Langkah-langkah integral parsial</li>
                  <li>Hasil optimalisasi</li>
                  <li>Rekomendasi perbaikan</li>
                </ul>
              </div>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-2">Metode Perhitungan</h3>
              <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                <div>
                  <h4 className="font-medium">Perhitungan Volume</h4>
                  <p className="text-gray-600 mt-1">
                    Menggunakan integral lipat tiga dengan metode integral parsial:
                  </p>
                  <pre className="bg-white p-2 rounded mt-1 font-mono text-sm">
                    V = ∫∫∫ dV = ∫∫∫ dx dy dz
                    ∫u dv = uv - ∫v du
                  </pre>
                </div>
                
                <div>
                  <h4 className="font-medium">Perhitungan Luas Permukaan</h4>
                  <p className="text-gray-600 mt-1">
                    Menggunakan integral lipat dua:
                  </p>
                  <pre className="bg-white p-2 rounded mt-1 font-mono text-sm">
                    A = ∫∫ dA = ∫∫ |∂r/∂u × ∂r/∂v| du dv
                  </pre>
                </div>
              </div>
            </section>
          </div>

          <div className="mt-8 flex justify-end">
            <button
              onClick={onClose}
              className="btn-primary"
            >
              Mulai Menggunakan Aplikasi
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Tutorial;