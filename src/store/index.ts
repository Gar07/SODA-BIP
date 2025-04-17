import { create } from 'zustand';
import { ModelMetrics, Material, OptimizationConstraints, CalculationStep } from '../types';
import * as THREE from 'three';

interface AppState {
  activeModel: ModelMetrics | null;
  modelGeometry: THREE.BufferGeometry | THREE.Group | null;
  material: Material;
  constraints: OptimizationConstraints;
  calculationSteps: CalculationStep[];
  history: {
    past: AppState[];
    future: AppState[];
  };
  setActiveModel: (model: ModelMetrics | null) => void;
  setModelGeometry: (geometry: THREE.BufferGeometry | THREE.Group | null) => void;
  setMaterial: (material: Material) => void;
  setConstraints: (constraints: OptimizationConstraints) => void;
  setCalculationSteps: (steps: CalculationStep[]) => void;
  undo: () => void;
  redo: () => void;
}

const useStore = create<AppState>((set) => ({
  activeModel: null,
  modelGeometry: null,
  material: {
    name: 'Baja',
    cost: 5.0,
    density: 7.85,
    unit: 'kg'
  },
  constraints: {
    maxCost: 1000,
    minVolume: 100,
    maxWeight: 500,
    materialConstraints: []
  },
  calculationSteps: [],
  history: {
    past: [],
    future: []
  },
  setActiveModel: (model) => {
    set((state) => ({
      activeModel: model,
      history: {
        past: [...state.history.past, { ...state }],
        future: []
      }
    }));
  },
  setModelGeometry: (geometry) => {
    set((state) => ({
      modelGeometry: geometry,
      history: {
        past: [...state.history.past, { ...state }],
        future: []
      }
    }));
  },
  setMaterial: (material) => {
    set((state) => ({
      material,
      history: {
        past: [...state.history.past, { ...state }],
        future: []
      }
    }));
  },
  setConstraints: (constraints) => {
    set((state) => ({
      constraints,
      history: {
        past: [...state.history.past, { ...state }],
        future: []
      }
    }));
  },
  setCalculationSteps: (steps) => {
    set((state) => ({
      calculationSteps: steps,
      history: {
        past: [...state.history.past, { ...state }],
        future: []
      }
    }));
  },
  undo: () => {
    set((state) => {
      const previous = state.history.past[state.history.past.length - 1];
      if (!previous) return state;

      const newPast = state.history.past.slice(0, -1);
      return {
        ...previous,
        history: {
          past: newPast,
          future: [state, ...state.history.future]
        }
      };
    });
  },
  redo: () => {
    set((state) => {
      const next = state.history.future[0];
      if (!next) return state;

      const newFuture = state.history.future.slice(1);
      return {
        ...next,
        history: {
          past: [...state.history.past, state],
          future: newFuture
        }
      };
    });
  }
}));

export default useStore;