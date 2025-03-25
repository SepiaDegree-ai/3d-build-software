import React, { useEffect, useState, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { IFCLoader } from 'three/examples/jsm/loaders/IFCLoader';
import { WebGLRenderer } from 'three';
import * as THREE from 'three';

const IFCViewer = () => {
  const [model, setModel] = useState(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef();
  const containerRef = useRef();

  useEffect(() => {
    // Initialize IFC loader
    const ifcLoader = new IFCLoader();
    ifcLoader.ifcManager.setWasmPath('../../');
    
    // Cleanup function
    return () => {
      if (model) {
        model.geometry.dispose();
        model.material.dispose();
      }
    };
  }, []);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setLoading(true);
    try {
      const ifcLoader = new IFCLoader();
      ifcLoader.ifcManager.setWasmPath('../../');
      
      const url = URL.createObjectURL(file);
      const loadedModel = await ifcLoader.loadAsync(url);
      
      // Center and scale the model
      const box = new THREE.Box3().setFromObject(loadedModel);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());
      
      loadedModel.position.x = -center.x;
      loadedModel.position.y = -center.y;
      loadedModel.position.z = -center.z;
      
      const maxDim = Math.max(size.x, size.y, size.z);
      const scale = 5 / maxDim;
      loadedModel.scale.set(scale, scale, scale);
      
      setModel(loadedModel);
    } catch (error) {
      console.error('Error loading IFC file:', error);
      alert('Error loading IFC file. Please try again.');
    } finally {
      setLoading(false);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="w-full h-screen flex flex-col" ref={containerRef}>
      <div className="p-4 bg-gray-100">
        <input
          type="file"
          accept=".ifc"
          onChange={handleFileUpload}
          ref={fileInputRef}
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current.click()}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          Upload IFC File
        </button>
      </div>
      
      <div className="flex-1 relative">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-10">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        )}
        
        <Canvas
          camera={{ position: [10, 10, 10], fov: 45 }}
          style={{ background: '#f0f0f0' }}
        >
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 5]} intensity={1} />
          <OrbitControls enableDamping dampingFactor={0.05} />
          {model && <primitive object={model} />}
        </Canvas>
      </div>
    </div>
  );
};

export default IFCViewer; 