import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import useStore from '../store';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const ChartVisualization: React.FC = () => {
  const { activeModel, constraints } = useStore();

  if (!activeModel) return null;

  const data = {
    labels: ['Volume (m³)', 'Berat (kg)', 'Biaya (×1000)'],
    datasets: [
      {
        label: 'Nilai Aktual',
        data: [
          activeModel.volume,
          activeModel.weight,
          activeModel.cost / 1000
        ],
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 1
      },
      {
        label: 'Batas Maksimum',
        data: [
          constraints.minVolume,
          constraints.maxWeight,
          constraints.maxCost / 1000
        ],
        backgroundColor: 'rgba(239, 68, 68, 0.5)',
        borderColor: 'rgb(239, 68, 68)',
        borderWidth: 1
      }
    ]
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const
      },
      title: {
        display: true,
        text: 'Perbandingan Nilai Aktual dan Batasan'
      }
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-sm">
      <h3 className="text-lg font-semibold mb-4">Visualisasi Data</h3>
      <Bar data={data} options={options} />
    </div>
  );
};

export default ChartVisualization;