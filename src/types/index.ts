import { Vector3 } from 'three';

export interface Material {
  name: string;
  cost: number;
  density: number;
  unit: 'kg' | 'lb';
}

export interface ModelMetrics {
  volume: number;
  surfaceArea: number;
  weight: number;
  cost: number;
  dimensions: Vector3;
}

export interface OptimizationConstraints {
  maxCost: number;
  minVolume: number;
  maxWeight: number;
  materialConstraints: Material[];
}

export interface CalculationStep {
  formula: string;
  description: string;
  result: number;
  intermediateSteps?: {
    formula: string;
    description: string;
    result: number;
  }[];
}

export interface OptimizationResult {
  originalMetrics: ModelMetrics;
  optimizedMetrics: ModelMetrics;
  savings: {
    cost: number;
    material: number;
    percentage: number;
  };
  recommendations: string[];
  steps: CalculationStep[];
}