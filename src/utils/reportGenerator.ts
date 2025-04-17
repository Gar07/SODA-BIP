import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';
import { ModelMetrics, OptimizationResult, CalculationStep } from '../types';

export class ReportGenerator {
  static formatIDR(value: number): string {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  }

  static generatePDFReport(
    metrics: ModelMetrics,
    optimizationResult: OptimizationResult,
    steps: CalculationStep[]
  ): jsPDF {
    const doc = new jsPDF();
    let yPos = 20;

    // Add title and date
    doc.setFontSize(20);
    doc.text('Laporan Analisis Desain Arsitektur', 20, yPos);
    yPos += 10;
    
    doc.setFontSize(10);
    doc.text(`Tanggal: ${new Date().toLocaleDateString('id-ID')}`, 20, yPos);
    yPos += 20;

    // Add model metrics
    doc.setFontSize(16);
    doc.text('Metrik Model', 20, yPos);
    yPos += 10;

    doc.setFontSize(12);
    doc.text(`Volume: ${metrics.volume.toFixed(2)} m³`, 30, yPos);
    yPos += 10;
    doc.text(`Luas Permukaan: ${metrics.surfaceArea.toFixed(2)} m²`, 30, yPos);
    yPos += 10;
    doc.text(`Berat: ${metrics.weight.toFixed(2)} kg`, 30, yPos);
    yPos += 10;
    doc.text(`Biaya: ${this.formatIDR(metrics.cost)}`, 30, yPos);
    yPos += 20;

    // Add calculation steps
    doc.setFontSize(16);
    doc.text('Langkah Perhitungan', 20, yPos);
    yPos += 15;

    doc.setFontSize(14);
    doc.text('1. Perhitungan Volume', 25, yPos);
    yPos += 10;

    doc.setFontSize(12);
    doc.text('Menggunakan integral lipat tiga:', 30, yPos);
    yPos += 7;
    doc.text('V = ∫∫∫ dx dy dz', 35, yPos);
    yPos += 10;

    doc.text('Metode integral parsial:', 30, yPos);
    yPos += 7;
    doc.text('∫u dv = uv - ∫v du', 35, yPos);
    yPos += 10;

    steps.forEach(step => {
      if (step.intermediateSteps) {
        doc.text(`${step.description}:`, 30, yPos);
        yPos += 7;
        doc.text(`Formula: ${step.formula}`, 35, yPos);
        yPos += 7;
        doc.text(`Hasil: ${step.result.toFixed(4)}`, 35, yPos);
        yPos += 10;

        step.intermediateSteps.forEach(subStep => {
          doc.text(`- ${subStep.description}:`, 40, yPos);
          yPos += 7;
          doc.text(`  ${subStep.formula}`, 45, yPos);
          yPos += 7;
          doc.text(`  Hasil: ${subStep.result.toFixed(4)}`, 45, yPos);
          yPos += 7;
        });
      }
    });

    // Add new page if needed
    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }

    // Add optimization results
    doc.setFontSize(16);
    doc.text('Hasil Optimalisasi', 20, yPos);
    yPos += 10;

    doc.setFontSize(12);
    doc.text(`Penghematan Material: ${optimizationResult.savings.material.toFixed(2)} m³`, 30, yPos);
    yPos += 10;
    doc.text(`Penghematan Biaya: ${this.formatIDR(optimizationResult.savings.cost)}`, 30, yPos);
    yPos += 10;
    doc.text(`Persentase Penghematan: ${optimizationResult.savings.percentage.toFixed(2)}%`, 30, yPos);
    yPos += 15;

    // Add recommendations
    doc.setFontSize(14);
    doc.text('Rekomendasi:', 20, yPos);
    yPos += 10;

    doc.setFontSize(12);
    optimizationResult.recommendations.forEach(recommendation => {
      doc.text(`• ${recommendation}`, 25, yPos);
      yPos += 7;
    });

    return doc;
  }

  static generateExcelReport(
    metrics: ModelMetrics,
    optimizationResult: OptimizationResult,
    steps: CalculationStep[]
  ): XLSX.WorkBook {
    const wb = XLSX.utils.book_new();

    // Create metrics worksheet
    const metricsData = [
      ['Metrik', 'Nilai', 'Satuan'],
      ['Volume', metrics.volume.toFixed(2), 'm³'],
      ['Luas Permukaan', metrics.surfaceArea.toFixed(2), 'm²'],
      ['Berat', metrics.weight.toFixed(2), 'kg'],
      ['Biaya', this.formatIDR(metrics.cost), '']
    ];
    const metricsWS = XLSX.utils.aoa_to_sheet(metricsData);
    XLSX.utils.book_append_sheet(wb, metricsWS, 'Metrik');

    // Create calculation steps worksheet
    const stepsData = steps.flatMap(step => {
      const rows = [
        [step.description, step.formula, step.result.toFixed(4)]
      ];

      if (step.intermediateSteps) {
        step.intermediateSteps.forEach(subStep => {
          rows.push(['', subStep.description, '']);
          rows.push(['', subStep.formula, subStep.result.toFixed(4)]);
        });
      }

      return rows;
    });
    stepsData.unshift(['Langkah', 'Formula', 'Hasil']);
    const stepsWS = XLSX.utils.aoa_to_sheet(stepsData);
    XLSX.utils.book_append_sheet(wb, stepsWS, 'Langkah Perhitungan');

    // Create optimization worksheet
    const optimizationData = [
      ['Metrik', 'Asli', 'Optimalisasi', 'Penghematan', 'Satuan'],
      ['Volume', 
       optimizationResult.originalMetrics.volume.toFixed(2),
       optimizationResult.optimizedMetrics.volume.toFixed(2),
       optimizationResult.savings.material.toFixed(2),
       'm³'
      ],
      ['Biaya',
       this.formatIDR(optimizationResult.originalMetrics.cost),
       this.formatIDR(optimizationResult.optimizedMetrics.cost),
       this.formatIDR(optimizationResult.savings.cost),
       ''
      ]
    ];
    const optimizationWS = XLSX.utils.aoa_to_sheet(optimizationData);
    XLSX.utils.book_append_sheet(wb, optimizationWS, 'Optimalisasi');

    return wb;
  }
}