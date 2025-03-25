import React, { Suspense, useRef, useCallback, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useGLTF, OrbitControls, Html, Select } from '@react-three/drei';
import PropTypes from 'prop-types';
import * as THREE from 'three';

// Model component with raycasting and selection
const Model = ({ url, onSelectObject, selectedMaterial }) => {
  const { scene } = useGLTF(url);
  const modelRef = useRef();
  const { camera, raycaster, pointer } = useThree();
  const [selectedMesh, setSelectedMesh] = React.useState(null);

  // Store original materials for resetting
  const originalMaterials = useRef(new Map());

  // Initialize materials map
  React.useEffect(() => {
    scene.traverse((object) => {
      if (object.isMesh) {
        originalMaterials.current.set(object.uuid, object.material.clone());
      }
    });
    return () => originalMaterials.current.clear();
  }, [scene]);

  // Handle material changes
  useEffect(() => {
    if (selectedMesh && selectedMaterial) {
      const newMaterial = new THREE.MeshStandardMaterial({
        color: new THREE.Color(selectedMaterial.color),
        metalness: selectedMaterial.id === 'metal' ? 0.8 : 0.1,
        roughness: selectedMaterial.id === 'glass' ? 0.1 : 0.7,
        transparent: selectedMaterial.id === 'glass',
        opacity: selectedMaterial.id === 'glass' ? 0.6 : 1,
      });

      selectedMesh.material = newMaterial;
    }
  }, [selectedMaterial, selectedMesh]);

  // Handle object selection
  const handleClick = useCallback((event) => {
    // Update raycaster and check intersections
    raycaster.setFromCamera(pointer, camera);
    const intersects = raycaster.intersectObject(scene, true);

    // Reset previous selection
    if (selectedMesh && (!intersects.length || intersects[0].object !== selectedMesh)) {
      const original = originalMaterials.current.get(selectedMesh.uuid);
      if (original) selectedMesh.material = original.clone();
    }

    // Handle new selection
    if (intersects.length > 0) {
      const mesh = intersects[0].object;
      setSelectedMesh(mesh);

      // Call parent callback with object info
      onSelectObject({
        name: mesh.name || 'Unnamed',
        id: mesh.id,
        uuid: mesh.uuid,
        type: mesh.type
      });

    } else {
      setSelectedMesh(null);
      onSelectObject(null);
    }
  }, [scene, camera, raycaster, pointer, selectedMesh, onSelectObject]);

  useFrame((state, delta) => {
    if (modelRef.current && !selectedMesh) {
      modelRef.current.rotation.y += delta * 0.5;
    }
  });

  return (
    <group
      ref={modelRef}
      onClick={handleClick}
      onPointerMissed={() => {
        if (selectedMesh) {
          const original = originalMaterials.current.get(selectedMesh.uuid);
          if (original) selectedMesh.material = original.clone();
          setSelectedMesh(null);
          onSelectObject(null);
        }
      }}
    >
      <primitive object={scene} />
    </group>
  );
};

Model.propTypes = {
  url: PropTypes.string.isRequired,
  onSelectObject: PropTypes.func.isRequired,
  selectedMaterial: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    color: PropTypes.string.isRequired
  })
};

// Loading spinner component
const Loader = () => {
  return (
    <Html center>
      <div className="flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-500 rounded-full animate-spin border-t-transparent"></div>
      </div>
    </Html>
  );
};

// Error display component
const ErrorDisplay = ({ message }) => {
  return (
    <Html center>
      <div className="text-red-500 bg-red-100 p-4 rounded-lg shadow-lg">
        <h3 className="font-bold mb-2">Error Loading Model</h3>
        <p>{message}</p>
      </div>
    </Html>
  );
};

ErrorDisplay.propTypes = {
  message: PropTypes.string.isRequired,
};

const GLTFViewer = ({ modelUrl, onSelectObject, selectedMaterial }) => {
  const [error, setError] = React.useState(null);

  const handleError = (e) => {
    console.error('Error loading model:', e);
    setError('Failed to load 3D model. Please check the URL and try again.');
  };

  return (
    <div className="w-full h-[600px] bg-gray-100 rounded-lg shadow-inner">
      <Canvas
        camera={{ position: [5, 5, 5], fov: 45 }}
        onError={handleError}
        raycaster={{ params: { Points: { threshold: 0.1 } } }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight
          position={[10, 10, 5]}
          intensity={1}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />

        <OrbitControls
          enableDamping
          dampingFactor={0.05}
          minDistance={3}
          maxDistance={10}
          autoRotate={false}
        />

        <Suspense fallback={<Loader />}>
          {error ? (
            <ErrorDisplay message={error} />
          ) : (
            <Model 
              url={modelUrl}
              onSelectObject={onSelectObject}
              selectedMaterial={selectedMaterial}
            />
          )}
        </Suspense>

        <gridHelper args={[20, 20, '#666666', '#222222']} />
        <axesHelper args={[5]} />
      </Canvas>
    </div>
  );
};

GLTFViewer.propTypes = {
  modelUrl: PropTypes.string.isRequired,
  onSelectObject: PropTypes.func.isRequired,
  selectedMaterial: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    color: PropTypes.string.isRequired
  })
};

export default GLTFViewer; 