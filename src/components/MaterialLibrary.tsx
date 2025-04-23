import React from 'react';
import { Book } from 'lucide-react';
import useStore from '../store';

const commonMaterials = [
  { name: 'Baja', density: 7.85, cost: 10000, unit: 'kg' },
  { name: 'Aluminium', density: 2.7, cost: 25000, unit: 'kg' },
  { name: 'Beton', density: 2.4, cost: 500, unit: 'kg' },
  { name: 'Kayu', density: 0.7, cost: 8000, unit: 'kg' },
  { name: 'Kaca', density: 2.5, cost: 15000, unit: 'kg' },
  { name: 'Semen', density: 1.5, cost: 2500, unit: 'kg' },
  { name: 'Pasir Sungai', density: 1.5, cost: 200, unit: 'kg' },
  { name: 'Batu Bata Merah', density: 1.7, cost: 200, unit: 'kg' },
  { name: 'Kayu Meranti', density: 0.7, cost: 5500, unit: 'kg' }
];

const MaterialLibrary: React.FC = () => {
  const { setMaterial } = useStore();

  return (
    <div className="p-4 bg-white rounded-lg shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <Book className="h-5 w-5 text-blue-600" />
        <h3 className="text-lg font-semibold">Pustaka Material</h3>
      </div>
      <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-3">
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