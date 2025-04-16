import { DxfWriter } from 'dxf-writer';
import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import DxfParser from 'dxf-parser';

export class FileHandler {
  static async loadDXF(buffer: ArrayBuffer): Promise<THREE.Group> {
    return new Promise((resolve, reject) => {
      try {
        const parser = new DxfParser();
        const decoder = new TextDecoder();
        const dxfContent = decoder.decode(buffer);
        const dxf = parser.parseSync(dxfContent);
        const group = new THREE.Group();
        
        // Convert DXF entities to Three.js objects
        if (dxf.entities) {
          dxf.entities.forEach((entity: any) => {
            switch (entity.type) {
              case 'LINE':
                const geometry = new THREE.BufferGeometry();
                const vertices = new Float32Array([
                  entity.vertices[0].x, entity.vertices[0].y, entity.vertices[0].z || 0,
                  entity.vertices[1].x, entity.vertices[1].y, entity.vertices[1].z || 0
                ]);
                geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
                const line = new THREE.Line(geometry, new THREE.LineBasicMaterial());
                group.add(line);
                break;
              
              case 'CIRCLE':
                const circleGeometry = new THREE.CircleGeometry(entity.radius, 32);
                const circle = new THREE.Mesh(
                  circleGeometry,
                  new THREE.MeshBasicMaterial({ side: THREE.DoubleSide })
                );
                circle.position.set(entity.center.x, entity.center.y, entity.center.z || 0);
                group.add(circle);
                break;
              
              case 'ARC':
                const curve = new THREE.EllipseCurve(
                  entity.center.x, entity.center.y,
                  entity.radius, entity.radius,
                  entity.startAngle, entity.endAngle,
                  false, 0
                );
                const arcPoints = curve.getPoints(50);
                const arcGeometry = new THREE.BufferGeometry().setFromPoints(arcPoints);
                const arc = new THREE.Line(arcGeometry, new THREE.LineBasicMaterial());
                group.add(arc);
                break;
            }
          });
        }
        
        resolve(group);
      } catch (error) {
        reject(error);
      }
    });
  }

  static async loadOBJ(buffer: ArrayBuffer): Promise<THREE.Group> {
    return new Promise((resolve, reject) => {
      const loader = new OBJLoader();
      const blob = new Blob([buffer]);
      const url = URL.createObjectURL(blob);
      
      loader.load(url, 
        (object) => {
          URL.revokeObjectURL(url);
          resolve(object);
        },
        undefined,
        (error) => {
          URL.revokeObjectURL(url);
          reject(error);
        }
      );
    });
  }

  static async loadSTL(buffer: ArrayBuffer): Promise<THREE.BufferGeometry> {
    return new Promise((resolve, reject) => {
      const loader = new STLLoader();
      try {
        const geometry = loader.parse(buffer);
        geometry.computeVertexNormals();
        resolve(geometry);
      } catch (error) {
        reject(error);
      }
    });
  }

  static async loadGLTF(buffer: ArrayBuffer): Promise<THREE.Group> {
    return new Promise((resolve, reject) => {
      const loader = new GLTFLoader();
      const blob = new Blob([buffer]);
      const url = URL.createObjectURL(blob);
      
      loader.load(url,
        (gltf) => {
          URL.revokeObjectURL(url);
          resolve(gltf.scene);
        },
        undefined,
        (error) => {
          URL.revokeObjectURL(url);
          reject(error);
        }
      );
    });
  }

  static async exportDXF(geometry: THREE.BufferGeometry): Promise<string> {
    const writer = new DxfWriter();
    const positions = geometry.getAttribute('position').array;
    
    // Convert Three.js geometry to DXF entities
    for (let i = 0; i < positions.length; i += 9) {
      const v1 = new THREE.Vector3(positions[i], positions[i + 1], positions[i + 2]);
      const v2 = new THREE.Vector3(positions[i + 3], positions[i + 4], positions[i + 5]);
      const v3 = new THREE.Vector3(positions[i + 6], positions[i + 7], positions[i + 8]);
      
      // Add triangle faces as 3D faces
      writer.add3DFace(
        v1.x, v1.y, v1.z,
        v2.x, v2.y, v2.z,
        v3.x, v3.y, v3.z,
        v3.x, v3.y, v3.z // Fourth vertex same as third for triangle
      );
    }
    
    return writer.stringify();
  }
}