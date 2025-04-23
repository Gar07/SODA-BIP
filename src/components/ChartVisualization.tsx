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

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          font: {
            size: 12
          }
        }
      },
      title: {
        display: true,
        text: 'Perbandingan Nilai Aktual dan Batasan',
        font: {
          size: 16,
          weight: 'bold'
        },
        padding: 20
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const value = context.raw;
            const label = context.dataset.label;
            const metric = context.chart.data.labels[context.dataIndex];
            
            if (metric === 'Biaya (×1000)') {
              return `${label}: Rp ${(value * 1000).toLocaleString()}`;
            }
            return `${label}: ${value.toLocaleString()} ${metric.includes('Volume') ? 'm³' : metric.includes('Berat') ? 'kg' : ''}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        },
        ticks: {
          font: {
            size: 12
          }
        }
      },
      x: {
        grid: {
          display: false
        },
        ticks: {
          font: {
            size: 12
          }
        }
      }
    }
  };

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
        borderWidth: 1,
        borderRadius: 4
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
        borderWidth: 1,
        borderRadius: 4
      }
    ]
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-sm">
      <h3 className="text-lg font-semibold mb-4">Visualisasi Data</h3>
      <div className="h-[400px]">
        <Bar data={data} options={options} />
      </div>
    </div>
  );
};

export default ChartVisualization;