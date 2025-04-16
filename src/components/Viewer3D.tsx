import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, Grid, PerspectiveCamera } from '@react-three/drei';
import { Mesh, BufferGeometry, Group } from 'three';
import * as THREE from 'three';
import { Eye, EyeOff, Grid as GridIcon, Move, ZoomIn, ZoomOut } from 'lucide-react';

interface ViewerProps {
  model?: BufferGeometry | Group;
}

const ModelViewer: React.FC<{ geometry?: BufferGeometry | Group }> = ({ geometry }) => {
  const { camera } = useThree();
  
  useEffect(() => {
    if (geometry) {
      if (geometry instanceof BufferGeometry) {
        geometry.computeBoundingBox();
        const box = geometry.boundingBox!;
        const center = box.getCenter(box.min);
        const size = box.getSize(box.max);
        const maxDim = Math.max(size.x, size.y, size.z);
        
        camera.position.set(center.x + maxDim * 2, center.y + maxDim * 2, center.z + maxDim * 2);
        camera.lookAt(center);
      } else if (geometry instanceof Group) {
        const box = new THREE.Box3().setFromObject(geometry);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        
        camera.position.set(center.x + maxDim * 2, center.y + maxDim * 2, center.z + maxDim * 2);
        camera.lookAt(center);
      }
    }
  }, [geometry, camera]);

  if (!geometry) return null;

  if (geometry instanceof BufferGeometry) {
    return (
      <mesh geometry={geometry}>
        <meshStandardMaterial color="#4a90e2" />
      </mesh>
    );
  }

  return <primitive object={geometry} />;
};

const Viewer3D: React.FC<ViewerProps> = ({ model }) => {
  const [wireframe, setWireframe] = useState(false);
  const [showGrid, setShowGrid] = useState(true);
  const meshRef = useRef<Mesh>(null);
  const [zoom, setZoom] = useState(1);

  const handleZoom = (factor: number) => {
    setZoom(prev => Math.max(0.1, Math.min(5, prev * factor)));
  };

  return (
    <div className="relative w-full h-full">
      {/* Left Toolbar */}
      <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white rounded-lg shadow-lg p-2 space-y-2">
        <button
          onClick={() => setWireframe(!wireframe)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          title={wireframe ? 'Tampilan Solid' : 'Tampilan Wireframe'}
        >
          {wireframe ? <Eye size={20} /> : <EyeOff size={20} />}
        </button>
        <button
          onClick={() => setShowGrid(!showGrid)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          title="Toggle Grid"
        >
          <GridIcon size={20} />
        </button>
        <button
          onClick={() => handleZoom(1.2)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          title="Zoom In"
        >
          <ZoomIn size={20} />
        </button>
        <button
          onClick={() => handleZoom(0.8)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          title="Zoom Out"
        >
          <ZoomOut size={20} />
        </button>
        <button
          onClick={() => setZoom(1)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          title="Reset View"
        >
          <Move size={20} />
        </button>
      </div>

      {/* 3D Canvas */}
      <Canvas className="w-full h-full">
        <PerspectiveCamera makeDefault position={[5, 5, 5]} zoom={zoom} />
        <OrbitControls enableDamping dampingFactor={0.05} />
        
        {showGrid && <Grid infiniteGrid />}
        
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        
        {model ? (
          <ModelViewer geometry={model} />
        ) : (
          <mesh ref={meshRef}>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial wireframe={wireframe} />
          </mesh>
        )}
      </Canvas>
    </div>
  );
};

export default Viewer3D;