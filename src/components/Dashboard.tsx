import React, { useState, useRef, Suspense } from 'react';
import { FileDown, Upload } from 'lucide-react';
import { ModelMetrics, Material, OptimizationConstraints } from '../types';
import { GeometricCalculator } from '../utils/calculations';
import { ReportGenerator } from '../utils/reportGenerator';
import { FileHandler } from '../utils/fileHandlers';
import * as THREE from 'three';
import * as XLSX from 'xlsx';

const Viewer3D = React.lazy(() => import('./Viewer3D'));

const Dashboard: React.FC = () => {
  const [activeModel, setActiveModel] = useState<ModelMetrics | null>(null);
  const [modelGeometry, setModelGeometry] = useState<THREE.BufferGeometry | THREE.Group | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [material, setMaterial] = useState<Material>({
    name: 'Baja',
    cost: 5.0,
    density: 7.85,
    unit: 'kg'
  });

  const [constraints, setConstraints] = useState<OptimizationConstraints>({
    maxCost: 1000,
    minVolume: 100,
    maxWeight: 500,
    materialConstraints: []
  });

  const handleFileImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const extension = file.name.split('.').pop()?.toLowerCase();
      const buffer = await file.arrayBuffer();

      let geometry;
      switch (extension) {
        case 'dxf':
          geometry = await FileHandler.loadDXF(buffer);
          break;
        case 'obj':
          geometry = await FileHandler.loadOBJ(buffer);
          break;
        case 'stl':
          geometry = await FileHandler.loadSTL(buffer);
          break;
        case 'gltf':
        case 'glb':
        case 'blend':
          geometry = await FileHandler.loadGLTF(buffer);
          break;
        default:
          throw new Error('Format file tidak didukung');
      }

      setModelGeometry(geometry);

      let metrics: ModelMetrics;
      if (geometry instanceof THREE.BufferGeometry) {
        metrics = GeometricCalculator.calculateMetricsFromGeometry(geometry, material);
      } else {
        const combinedGeometry = new THREE.BufferGeometry();
        const positions: number[] = [];
        
        geometry.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            const position = child.geometry.attributes.position.array;
            positions.push(...Array.from(position));
          }
        });
        
        combinedGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        metrics = GeometricCalculator.calculateMetricsFromGeometry(combinedGeometry, material);
      }

      setActiveModel(metrics);
    } catch (error) {
      console.error('Error importing file:', error);
      alert('Gagal mengimpor file. Silakan coba lagi.');
    }
  };

  const handleExportReport = () => {
    if (!activeModel) return;

    const optimizationResult = GeometricCalculator.optimizeModel(
      activeModel,
      constraints,
      material
    );

    const pdfDoc = ReportGenerator.generatePDFReport(
      activeModel,
      optimizationResult,
      optimizationResult.steps
    );
    pdfDoc.save('laporan-analisis-arsitektur.pdf');

    const workbook = ReportGenerator.generateExcelReport(
      activeModel,
      optimizationResult,
      optimizationResult.steps
    );
    XLSX.writeFile(workbook, 'laporan-analisis-arsitektur.xlsx');
  };

  const formatIDR = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm fixed top-0 left-0 right-0 z-50">
        <div className="w-full px-4">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <h1 className="text-xl md:text-2xl font-semibold text-gray-900">
                SODA-BIP
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileImport}
                accept=".dxf,.obj,.stl,.gltf,.glb,.blend"
                className="hidden"
              />
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="btn-primary"
              >
                <Upload className="h-5 w-5 mr-2" />
                Impor Model
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-16 pb-8">
        <div className="w-full px-4">
          {/* 3D Viewer */}
          <div className="card mb-6">
            <h2 className="text-xl font-semibold mb-4">Tampilan Model</h2>
            <div className="aspect-[21/9] bg-gray-100 rounded-lg mb-4 min-h-[70vh]">
              <Suspense fallback={
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
                </div>
              }>
                <Viewer3D model={modelGeometry || undefined} />
              </Suspense>
            </div>
          </div>

          {/* Control Panels */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Material Properties */}
            <div className="card">
              <h2 className="text-xl font-semibold mb-4">Properti Material</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Material
                  </label>
                  <input
                    type="text"
                    value={material.name}
                    onChange={(e) => setMaterial({ ...material, name: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Biaya per Unit
                  </label>
                  <input
                    type="number"
                    value={material.cost}
                    onChange={(e) => setMaterial({ ...material, cost: parseFloat(e.target.value) })}
                    className="input-field"
                    min="0"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Densitas (kg/m³)
                  </label>
                  <input
                    type="number"
                    value={material.density}
                    onChange={(e) => setMaterial({ ...material, density: parseFloat(e.target.value) })}
                    className="input-field"
                    min="0"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Satuan
                  </label>
                  <select
                    value={material.unit}
                    onChange={(e) => setMaterial({ ...material, unit: e.target.value as 'kg' | 'lb' })}
                    className="input-field"
                  >
                    <option value="kg">kg</option>
                    <option value="lb">lb</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Optimization Constraints */}
            <div className="card">
              <h2 className="text-xl font-semibold mb-4">Batasan Optimalisasi</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Biaya Maksimum
                  </label>
                  <input
                    type="number"
                    value={constraints.maxCost}
                    onChange={(e) => setConstraints({ ...constraints, maxCost: parseFloat(e.target.value) })}
                    className="input-field"
                    min="0"
                    step="1000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Volume Minimum (m³)
                  </label>
                  <input
                    type="number"
                    value={constraints.minVolume}
                    onChange={(e) => setConstraints({ ...constraints, minVolume: parseFloat(e.target.value) })}
                    className="input-field"
                    min="0"
                    step="0.1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Berat Maksimum (kg)
                  </label>
                  <input
                    type="number"
                    value={constraints.maxWeight}
                    onChange={(e) => setConstraints({ ...constraints, maxWeight: parseFloat(e.target.value) })}
                    className="input-field"
                    min="0"
                    step="0.1"
                  />
                </div>
              </div>
            </div>

            {/* Analysis Results */}
            <div className="card">
              <h2 className="text-xl font-semibold mb-4">Hasil Analisis</h2>
              {activeModel ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Volume</p>
                      <p className="text-lg font-medium">{activeModel.volume.toFixed(2)} m³</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Luas Permukaan</p>
                      <p className="text-lg font-medium">{activeModel.surfaceArea.toFixed(2)} m²</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Berat</p>
                      <p className="text-lg font-medium">{activeModel.weight.toFixed(2)} kg</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Biaya</p>
                      <p className="text-lg font-medium">{formatIDR(activeModel.cost)}</p>
                    </div>
                  </div>
                  <button 
                    onClick={handleExportReport}
                    className="btn-success w-full"
                  >
                    <FileDown className="h-5 w-5 mr-2" />
                    Ekspor Laporan
                  </button>
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">
                  Impor model untuk melihat hasil analisis
                </p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;