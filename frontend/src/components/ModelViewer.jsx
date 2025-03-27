import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import axios from 'axios';
import { API_BASE_URL } from '../lib/api';

export default function ModelViewer() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedObject, setSelectedObject] = useState(null);
  
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const controlsRef = useRef(null);
  const modelRef = useRef(null);
  const raycasterRef = useRef(new THREE.Raycaster());
  const mouseRef = useRef(new THREE.Vector2());

  // Initialize Three.js scene
  useEffect(() => {
    if (!containerRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      75,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 5;
    cameraRef.current = camera;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.shadowMap.enabled = true;
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Controls setup
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controlsRef.current = controls;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 5, 5);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Cleanup
    return () => {
      renderer.dispose();
      containerRef.current?.removeChild(renderer.domElement);
    };
  }, []);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (!containerRef.current || !cameraRef.current || !rendererRef.current) return;

      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;

      cameraRef.current.aspect = width / height;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handle object selection
  const handleClick = (event) => {
    if (!sceneRef.current || !cameraRef.current || !modelRef.current) return;

    const rect = event.target.getBoundingClientRect();
    mouseRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouseRef.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current);
    const intersects = raycasterRef.current.intersectObject(modelRef.current, true);

    if (intersects.length > 0) {
      const selected = intersects[0].object;
      setSelectedObject(selected);
      
      // Highlight selected object
      if (selected.material) {
        selected.material.emissive = new THREE.Color(0x666666);
        selected.material.emissiveIntensity = 0.5;
      }
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a file to upload');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post(`${API_BASE_URL}/api/models/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Load the converted GLB file
      const loader = new GLTFLoader();
      loader.load(response.data.modelUrl, (gltf) => {
        if (sceneRef.current && modelRef.current) {
          // Remove previous model if it exists
          sceneRef.current.remove(modelRef.current);
        }

        const model = gltf.scene;
        model.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });

        // Center and scale the model
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = 5 / maxDim;
        model.scale.multiplyScalar(scale);
        model.position.sub(center.multiplyScalar(scale));

        modelRef.current = model;
        sceneRef.current.add(model);

        // Reset camera position
        if (cameraRef.current) {
          cameraRef.current.position.set(5, 5, 5);
          cameraRef.current.lookAt(0, 0, 0);
        }
      }, undefined, (error) => {
        console.error('Error loading model:', error);
        setError('Failed to load 3D model');
      });
    } catch (err) {
      console.error('Error uploading model:', err);
      setError(err.response?.data?.error || 'Failed to upload model');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Upload Model</h2>
        <form onSubmit={handleUpload} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Revit File
            </label>
            <input
              type="file"
              onChange={handleFileChange}
              accept=".rvt,.rfa"
              className="w-full"
              disabled={loading}
            />
          </div>
          {error && (
            <div className="text-red-500 text-sm">{error}</div>
          )}
          <button
            type="submit"
            disabled={loading || !file}
            className={`w-full py-2 px-4 rounded font-medium text-white ${
              loading || !file
                ? 'bg-blue-300'
                : 'bg-blue-500 hover:bg-blue-600 active:bg-blue-700'
            }`}
          >
            {loading ? 'Uploading...' : 'Upload Model'}
          </button>
        </form>
      </div>

      <div 
        ref={containerRef}
        className="bg-white p-6 rounded-lg shadow w-full h-[600px]"
        onClick={handleClick}
      >
        {selectedObject && (
          <div className="absolute top-4 right-4 bg-white p-4 rounded shadow-lg">
            <h3 className="font-medium">Selected Object</h3>
            <p className="text-sm text-gray-600">{selectedObject.name || 'Unnamed Object'}</p>
          </div>
        )}
      </div>
    </div>
  );
} 