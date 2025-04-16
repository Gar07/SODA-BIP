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
            description: `Volume contribution from triangle ${i/3}`,
            result: Math.abs(signedVolume)
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
            description: `Volume contribution from triangle ${i/9}`,
            result: Math.abs(signedVolume)
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
            description: `Area of triangle ${i/3}`,
            result: triangleArea
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
            description: `Area of triangle ${i/9}`,
            result: triangleArea
          });
        }
      }
    } catch (error) {
      console.error('Error calculating surface area:', error);
      throw new Error('Surface area calculation failed');
    }

    return area;
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

    // Apply optimizations while respecting constraints
    optimizedMetrics.volume -= volumeReduction;
    optimizedMetrics.weight -= weightSavings;
    optimizedMetrics.cost -= costSavings;

    const savingsPercentage = (costSavings / metrics.cost) * 100;

    return {
      originalMetrics: metrics,
      optimizedMetrics,
      savings: {
        cost: costSavings,
        material: volumeReduction,
        percentage: savingsPercentage
      },
      recommendations: [
        `Reduce material volume by ${volumeReduction.toFixed(2)} cubic units`,
        `Potential cost savings: ${costSavings.toFixed(2)} units`,
        `Weight reduction: ${weightSavings.toFixed(2)} ${material.unit}`
      ],
      steps
    };
  }
}