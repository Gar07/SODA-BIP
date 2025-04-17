import React from 'react';
import { Book } from 'lucide-react';
import useStore from '../store';

const commonMaterials = [
  { name: 'Baja', density: 7.85, cost: 5.0, unit: 'kg' },
  { name: 'Aluminium', density: 2.7, cost: 8.0, unit: 'kg' },
  { name: 'Beton', density: 2.4, cost: 2.0, unit: 'kg' },
  { name: 'Kayu', density: 0.7, cost: 3.0, unit: 'kg' },
  { name: 'Kaca', density: 2.5, cost: 6.0, unit: 'kg' }
];

const MaterialLibrary: React.FC = () => {
  const { setMaterial } = useStore();

  return (
    <div className="p-4 bg-white rounded-lg shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <Book className="h-5 w-5 text-blue-600" />
        <h3 className="text-lg font-semibold">Pustaka Material</h3>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {commonMaterials.map((material) => (
          <button
            key={material.name}
            onClick={() => setMaterial(material)}
            className="p-3 border rounded-lg hover:bg-gray-50 transition-colors text-left"
          >
            <div className="font-medium">{material.name}</div>
            <div className="text-sm text-gray-600">
              Densitas: {material.density} g/cm³
            </div>
            <div className="text-sm text-gray-600">
              Biaya: Rp {material.cost.toLocaleString()}/{material.unit}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default MaterialLibrary;