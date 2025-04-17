import React, { useState, useRef, Suspense, useEffect } from 'react';
import { FileDown, Upload, ChevronDown, ChevronUp, Calculator, HelpCircle, Undo, Redo } from 'lucide-react';
import { ModelMetrics, Material, OptimizationConstraints, CalculationStep } from '../types';
import { GeometricCalculator } from '../utils/calculations';
import { ReportGenerator } from '../utils/reportGenerator';
import { FileHandler } from '../utils/fileHandlers';
import Tutorial from './Tutorial';
import MaterialLibrary from './MaterialLibrary';
import ChartVisualization from './ChartVisualization';
import * as THREE from 'three';
import * as XLSX from 'xlsx';

const Viewer3D = React.lazy(() => import('./Viewer3D'));

interface CalculationSectionProps {
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

const CalculationSection: React.FC<CalculationSectionProps> = ({
  title,
  isOpen,
  onToggle,
  children
}) => (
  <div className="border rounded-lg overflow-hidden bg-white shadow-sm">
    <button
      onClick={onToggle}
      className="w-full px-4 py-3 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors"
    >
      <span className="font-medium text-gray-900">{title}</span>
      {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
    </button>
    {isOpen && <div className="p-4">{children}</div>}
  </div>
);

const Dashboard: React.FC = () => {
  const [showTutorial, setShowTutorial] = useState(true);
  const [activeModel, setActiveModel] = useState<ModelMetrics | null>(null);
  const [modelGeometry, setModelGeometry] = useState<THREE.BufferGeometry | THREE.Group | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [calculationSteps, setCalculationSteps] = useState<CalculationStep[]>([]);
  const [openSections, setOpenSections] = useState({
    volume: true,
    surface: true,
    optimization: true
  });

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

  const [history, setHistory] = useState<{
    past: any[];
    future: any[];
  }>({
    past: [],
    future: []
  });

  useEffect(() => {
    const hasVisited = localStorage.getItem('hasVisitedBefore');
    if (!hasVisited) {
      setShowTutorial(true);
      localStorage.setItem('hasVisitedBefore', 'true');
    } else {
      setShowTutorial(false);
    }
  }, []);

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleUndo = () => {
    if (history.past.length === 0) return;
    
    const previous = history.past[history.past.length - 1];
    const newPast = history.past.slice(0, -1);
    
    setHistory({
      past: newPast,
      future: [{ activeModel, modelGeometry, material, constraints }, ...history.future]
    });
    
    setActiveModel(previous.activeModel);
    setModelGeometry(previous.modelGeometry);
    setMaterial(previous.material);
    setConstraints(previous.constraints);
  };

  const handleRedo = () => {
    if (history.future.length === 0) return;
    
    const next = history.future[0];
    const newFuture = history.future.slice(1);
    
    setHistory({
      past: [...history.past, { activeModel, modelGeometry, material, constraints }],
      future: newFuture
    });
    
    setActiveModel(next.activeModel);
    setModelGeometry(next.modelGeometry);
    setMaterial(next.material);
    setConstraints(next.constraints);
  };

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

      const steps = GeometricCalculator.generateCalculationSteps(metrics);
      setCalculationSteps(steps);
      setActiveModel(metrics);

      // Add to history
      setHistory(prev => ({
        past: [...prev.past, { activeModel, modelGeometry, material, constraints }],
        future: []
      }));
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
      calculationSteps
    );
    pdfDoc.save('laporan-analisis-arsitektur.pdf');

    const workbook = ReportGenerator.generateExcelReport(
      activeModel,
      optimizationResult,
      calculationSteps
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
      <Tutorial isOpen={showTutorial} onClose={() => setShowTutorial(false)} />
      
      {/* Header */}
      <header className="bg-white shadow-sm fixed top-0 left-0 right-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2 sm:gap-4">
              <Calculator className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
              <h1 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-900 truncate">
                SODA-BIP
              </h1>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <button
                onClick={handleUndo}
                disabled={history.past.length === 0}
                className={`p-2 rounded-lg hover:bg-gray-100 transition-colors ${history.past.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                title="Undo"
              >
                <Undo className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
              <button
                onClick={handleRedo}
                disabled={history.future.length === 0}
                className={`p-2 rounded-lg hover:bg-gray-100 transition-colors ${history.future.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                title="Redo"
              >
                <Redo className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
              <button
                onClick={() => setShowTutorial(true)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                title="Bantuan"
              >
                <HelpCircle className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileImport}
                accept=".dxf,.obj,.stl,.gltf,.glb,.blend"
                className="hidden"
              />
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="btn-primary text-sm py-1.5 px-3 sm:py-2 sm:px-4"
              >
                <Upload className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" />
                <span className="hidden xs:inline">Impor Model</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-20 pb-8 px-4">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* 3D Viewer */}
          <div className="card">
            <h2 className="text-lg sm:text-xl font-semibold mb-4">Tampilan Model</h2>
            <div className="aspect-[4/3] sm:aspect-[16/9] md:aspect-[21/9] bg-gray-100 rounded-lg mb-4">
              <Suspense fallback={
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-blue-600" />
                </div>
              }>
                <Viewer3D model={modelGeometry || undefined} />
              </Suspense>
            </div>
          </div>

          {/* Chart Visualization */}
          {activeModel && <ChartVisualization />}

          {/* Control Panels */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Material Library */}
            <div className="md:col-span-2 lg:col-span-1">
              <MaterialLibrary />
            </div>

            {/* Material Properties */}
            <div className="card">
              <h2 className="text-lg sm:text-xl font-semibold mb-4">Properti Material</h2>
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
              <h2 className="text-lg sm:text-xl font-semibold mb-4">Batasan Optimalisasi</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
          </div>

          {/* Analysis Results */}
          <div className="card">
            <h2 className="text-lg sm:text-xl font-semibold mb-4">Hasil Analisis</h2>
            {activeModel ? (
              <div className="space-y-6">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500">Volume</p>
                    <p className="text-lg font-medium">{activeModel.volume.toFixed(2)} m³</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500">Luas Permukaan</p>
                    <p className="text-lg font-medium">{activeModel.surfaceArea.toFixed(2)} m²</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500">Berat</p>
                    <p className="text-lg font-medium">{activeModel.weight.toFixed(2)} kg</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500">Biaya</p>
                    <p className="text-lg font-medium">{formatIDR(activeModel.cost)}</p>
                  </div>
                </div>

                {/* Calculation Steps */}
                <div className="space-y-4">
                  <CalculationSection
                    title="1. Perhitungan Volume"
                    isOpen={openSections.volume}
                    onToggle={() => toggleSection('volume')}
                  >
                    <div className="space-y-3">
                      <p className="text-sm text-gray-600">
                        Perhitungan volume menggunakan integral lipat tiga:
                      </p>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="font-mono text-sm">V = ∫∫∫ dV = ∫∫∫ dx dy dz</p>
                      </div>
                      <p className="text-sm text-gray-600">
                        Menggunakan metode integral parsial dengan substitusi:
                      </p>
                      <div className="bg-gray-50 p-3 rounded-lg space-y-2">
                        <p className="font-mono text-sm">u = x</p>
                        <p className="font-mono text-sm">dv = dy dz</p>
                        <p className="font-mono text-sm">∫u dv = uv - ∫v du</p>
                      </div>
                      <p className="text-sm text-gray-600">
                        Hasil perhitungan volume:
                      </p>
                      <p className="font-medium">
                        V = {activeModel.volume.toFixed(4)} m³
                      </p>
                    </div>
                  </CalculationSection>

                  <CalculationSection
                    title="2. Perhitungan Luas Permukaan"
                    isOpen={openSections.surface}
                    onToggle={() => toggleSection('surface')}
                  >
                    <div className="space-y-3">
                      <p className="text-sm text-gray-600">
                        Perhitungan luas permukaan menggunakan integral lipat dua:
                      </p>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="font-mono text-sm">A = ∫∫ dA = ∫∫ |∂r/∂u × ∂r/∂v| du dv</p>
                      </div>
                      <p className="text-sm text-gray-600">
                        Untuk setiap elemen permukaan:
                      </p>
                      <div className="bg-gray-50 p-3 rounded-lg space-y-2">
                        <p className="font-mono text-sm">dA = |n| dS</p>
                        <p className="font-mono text-sm">n = ∂r/∂u × ∂r/∂v</p>
                      </div>
                      <p className="text-sm text-gray-600">
                        Hasil perhitungan luas permukaan:
                      </p>
                      <p className="font-medium">
                        A = {activeModel.surfaceArea.toFixed(4)} m²
                      </p>
                    </div>
                  </CalculationSection>

                  <CalculationSection
                    title="3. Optimalisasi"
                    isOpen={openSections.optimization}
                    onToggle={() => toggleSection('optimization')}
                  >
                    <div className="space-y-3">
                      <p className="text-sm text-gray-600">
                        Optimalisasi menggunakan metode Lagrange:
                      </p>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="font-mono text-sm">L(x, λ) = f(x) + λg(x)</p>
                      </div>
                      <p className="text-sm text-gray-600">
                        Dengan batasan:
                      </p>
                      <div className="bg-gray-50 p-3 rounded-lg space-y-2">
                        <p className="font-mono text-sm">g₁(x): V ≥ {constraints.minVolume} m³</p>
                        <p className="font-mono text-sm">g₂(x): C ≤ {formatIDR(constraints.maxCost)}</p>
                        <p className="font-mono text-sm">g₃(x): W ≤ {constraints.maxWeight} kg</p>
                      </div>
                    </div>
                  </CalculationSection>
                </div>

                <button 
                  onClick={handleExportReport}
                  className="btn-success w-full sm:w-auto"
                >
                  <FileDown className="h-5 w-5 mr-2" />
                  Ekspor Laporan
                </button>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">
                  Impor model untuk melihat hasil analisis
                </p>
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="btn-primary"
                >
                  <Upload className="h-5 w-5 mr-2" />
                  Impor Model
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;