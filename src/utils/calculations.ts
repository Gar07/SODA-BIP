import { integral, derivative, evaluate } from 'mathjs';
import { ModelMetrics, Material, OptimizationResult, CalculationStep } from '../types';
import * as THREE from 'three';

export class GeometricCalculator {
  static calculateVolumeFromGeometry(geometry: THREE.BufferGeometry): number {
    const positions = geometry.getAttribute('position').array;
    const indices = geometry.index ? geometry.index.array : null;
    let volume = 0;
    const steps: CalculationStep[] = [];

    try {
      // If we have indexed geometry
      if (indices) {
        for (let i = 0; i < indices.length; i += 3) {
          const v1 = new THREE.Vector3(
            positions[indices[i] * 3],
            positions[indices[i] * 3 + 1],
            positions[indices[i] * 3 + 2]
          );
          const v2 = new THREE.Vector3(
            positions[indices[i + 1] * 3],
            positions[indices[i + 1] * 3 + 1],
            positions[indices[i + 1] * 3 + 2]
          );
          const v3 = new THREE.Vector3(
            positions[indices[i + 2] * 3],
            positions[indices[i + 2] * 3 + 1],
            positions[indices[i + 2] * 3 + 2]
          );

          // Calculate signed volume of tetrahedron
          const signedVolume = v1.dot(v2.cross(v3)) / 6.0;
          volume += Math.abs(signedVolume);

          steps.push({
            formula: `V${i/3} = |v1 · (v2 × v3)| / 6`,
            description: `Volume kontribusi dari segitiga ${i/3}`,
            result: Math.abs(signedVolume),
            intermediateSteps: [
              {
                formula: `v1 = (${v1.x.toFixed(2)}, ${v1.y.toFixed(2)}, ${v1.z.toFixed(2)})`,
                description: 'Koordinat titik 1',
                result: v1.length()
              },
              {
                formula: `v2 = (${v2.x.toFixed(2)}, ${v2.y.toFixed(2)}, ${v2.z.toFixed(2)})`,
                description: 'Koordinat titik 2',
                result: v2.length()
              },
              {
                formula: `v3 = (${v3.x.toFixed(2)}, ${v3.y.toFixed(2)}, ${v3.z.toFixed(2)})`,
                description: 'Koordinat titik 3',
                result: v3.length()
              }
            ]
          });
        }
      } else {
        // For non-indexed geometry
        for (let i = 0; i < positions.length; i += 9) {
          const v1 = new THREE.Vector3(positions[i], positions[i + 1], positions[i + 2]);
          const v2 = new THREE.Vector3(positions[i + 3], positions[i + 4], positions[i + 5]);
          const v3 = new THREE.Vector3(positions[i + 6], positions[i + 7], positions[i + 8]);

          const signedVolume = v1.dot(v2.cross(v3)) / 6.0;
          volume += Math.abs(signedVolume);

          steps.push({
            formula: `V${i/9} = |v1 · (v2 × v3)| / 6`,
            description: `Volume kontribusi dari segitiga ${i/9}`,
            result: Math.abs(signedVolume),
            intermediateSteps: [
              {
                formula: `v1 = (${v1.x.toFixed(2)}, ${v1.y.toFixed(2)}, ${v1.z.toFixed(2)})`,
                description: 'Koordinat titik 1',
                result: v1.length()
              },
              {
                formula: `v2 = (${v2.x.toFixed(2)}, ${v2.y.toFixed(2)}, ${v2.z.toFixed(2)})`,
                description: 'Koordinat titik 2',
                result: v2.length()
              },
              {
                formula: `v3 = (${v3.x.toFixed(2)}, ${v3.y.toFixed(2)}, ${v3.z.toFixed(2)})`,
                description: 'Koordinat titik 3',
                result: v3.length()
              }
            ]
          });
        }
      }
    } catch (error) {
      console.error('Error calculating volume:', error);
      throw new Error('Volume calculation failed');
    }

    return volume;
  }

  static calculateSurfaceAreaFromGeometry(geometry: THREE.BufferGeometry): number {
    const positions = geometry.getAttribute('position').array;
    const indices = geometry.index ? geometry.index.array : null;
    let area = 0;
    const steps: CalculationStep[] = [];

    try {
      if (indices) {
        for (let i = 0; i < indices.length; i += 3) {
          const v1 = new THREE.Vector3(
            positions[indices[i] * 3],
            positions[indices[i] * 3 + 1],
            positions[indices[i] * 3 + 2]
          );
          const v2 = new THREE.Vector3(
            positions[indices[i + 1] * 3],
            positions[indices[i + 1] * 3 + 1],
            positions[indices[i + 1] * 3 + 2]
          );
          const v3 = new THREE.Vector3(
            positions[indices[i + 2] * 3],
            positions[indices[i + 2] * 3 + 1],
            positions[indices[i + 2] * 3 + 2]
          );

          // Calculate area using cross product
          const side1 = new THREE.Vector3().subVectors(v2, v1);
          const side2 = new THREE.Vector3().subVectors(v3, v1);
          const triangleArea = side1.cross(side2).length() / 2;
          
          area += triangleArea;

          steps.push({
            formula: `A${i/3} = |v2-v1 × v3-v1| / 2`,
            description: `Luas segitiga ${i/3}`,
            result: triangleArea,
            intermediateSteps: [
              {
                formula: `side1 = (${side1.x.toFixed(2)}, ${side1.y.toFixed(2)}, ${side1.z.toFixed(2)})`,
                description: 'Vektor sisi 1',
                result: side1.length()
              },
              {
                formula: `side2 = (${side2.x.toFixed(2)}, ${side2.y.toFixed(2)}, ${side2.z.toFixed(2)})`,
                description: 'Vektor sisi 2',
                result: side2.length()
              }
            ]
          });
        }
      } else {
        for (let i = 0; i < positions.length; i += 9) {
          const v1 = new THREE.Vector3(positions[i], positions[i + 1], positions[i + 2]);
          const v2 = new THREE.Vector3(positions[i + 3], positions[i + 4], positions[i + 5]);
          const v3 = new THREE.Vector3(positions[i + 6], positions[i + 7], positions[i + 8]);

          const side1 = new THREE.Vector3().subVectors(v2, v1);
          const side2 = new THREE.Vector3().subVectors(v3, v1);
          const triangleArea = side1.cross(side2).length() / 2;
          
          area += triangleArea;

          steps.push({
            formula: `A${i/9} = |v2-v1 × v3-v1| / 2`,
            description: `Luas segitiga ${i/9}`,
            result: triangleArea,
            intermediateSteps: [
              {
                formula: `side1 = (${side1.x.toFixed(2)}, ${side1.y.toFixed(2)}, ${side1.z.toFixed(2)})`,
                description: 'Vektor sisi 1',
                result: side1.length()
              },
              {
                formula: `side2 = (${side2.x.toFixed(2)}, ${side2.y.toFixed(2)}, ${side2.z.toFixed(2)})`,
                description: 'Vektor sisi 2',
                result: side2.length()
              }
            ]
          });
        }
      }
    } catch (error) {
      console.error('Error calculating surface area:', error);
      throw new Error('Surface area calculation failed');
    }

    return area;
  }

  static generateCalculationSteps(metrics: ModelMetrics): CalculationStep[] {
    return [
      {
        formula: 'V = ∫∫∫ dx dy dz',
        description: 'Volume total menggunakan integral lipat tiga',
        result: metrics.volume,
        intermediateSteps: [
          {
            formula: '∫u dv = uv - ∫v du',
            description: 'Metode integral parsial',
            result: metrics.volume
          }
        ]
      },
      {
        formula: 'A = ∫∫ |∂r/∂u × ∂r/∂v| du dv',
        description: 'Luas permukaan menggunakan integral lipat dua',
        result: metrics.surfaceArea,
        intermediateSteps: [
          {
            formula: 'dA = |n| dS',
            description: 'Elemen luas permukaan',
            result: metrics.surfaceArea
          }
        ]
      }
    ];
  }

  static calculateMetricsFromGeometry(
    geometry: THREE.BufferGeometry,
    material: Material
  ): ModelMetrics {
    const volume = this.calculateVolumeFromGeometry(geometry);
    const surfaceArea = this.calculateSurfaceAreaFromGeometry(geometry);
    const weight = volume * material.density;
    const cost = weight * material.cost;

    // Calculate bounding box for dimensions
    geometry.computeBoundingBox();
    const boundingBox = geometry.boundingBox!;
    const dimensions = new THREE.Vector3();
    boundingBox.getSize(dimensions);

    return {
      volume,
      surfaceArea,
      weight,
      cost,
      dimensions
    };
  }

  static optimizeModel(
    metrics: ModelMetrics,
    constraints: OptimizationConstraints,
    material: Material
  ): OptimizationResult {
    const steps: CalculationStep[] = [];
    let optimizedMetrics = { ...metrics };

    // Calculate potential optimizations
    const volumeReduction = Math.max(0, metrics.volume - constraints.minVolume);
    const costSavings = volumeReduction * material.density * material.cost;
    const weightSavings = volumeReduction * material.density;

    steps.push({
      formula: 'ΔV = V - Vmin',
      description: 'Pengurangan volume yang mungkin',
      result: volumeReduction,
      intermediateSteps: [
        {
          formula: `V = ${metrics.volume.toFixed(2)}`,
          description: 'Volume awal',
          result: metrics.volume
        },
        {
          formula: `Vmin = ${constraints.minVolume}`,
          description: 'Volume minimum yang diizinkan',
          result: constraints.minVolume
        }
      ]
    });

    // Apply optimizations while respecting constraints
    optimizedMetrics.volume -= volumeReduction;
    optimizedMetrics.weight -= weightSavings;
    optimizedMetrics.cost -= costSavings;

    const savingsPercentage = (costSavings / metrics.cost) * 100;

    steps.push({
      formula: 'Savings% = (ΔCost / Cost) × 100',
      description: 'Persentase penghematan biaya',
      result: savingsPercentage,
      intermediateSteps: [
        {
          formula: `ΔCost = ${costSavings.toFixed(2)}`,
          description: 'Penghematan biaya',
          result: costSavings
        },
        {
          formula: `Cost = ${metrics.cost.toFixed(2)}`,
          description: 'Biaya awal',
          result: metrics.cost
        }
      ]
    });

    return {
      originalMetrics: metrics,
      optimizedMetrics,
      savings: {
        cost: costSavings,
        material: volumeReduction,
        percentage: savingsPercentage
      },
      recommendations: [
        `Kurangi volume material sebesar ${volumeReduction.toFixed(2)} m³`,
        `Potensi penghematan biaya: ${costSavings.toFixed(2)} satuan`,
        `Pengurangan berat: ${weightSavings.toFixed(2)} ${material.unit}`
      ],
      steps
    };
  }
}