import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../lib/api';
import * as THREE from 'three';

export default function MaterialSidebar({ selectedObject, onMaterialApply }) {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [totalPrice, setTotalPrice] = useState(0);

  useEffect(() => {
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/api/materials`);
      setMaterials(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error('Error fetching materials:', err);
      setError('Failed to load materials');
    } finally {
      setLoading(false);
    }
  };

  const handleMaterialSelect = (material) => {
    setSelectedMaterial(material);
    
    if (selectedObject && material) {
      // Calculate surface area of the selected object
      const geometry = selectedObject.geometry;
      if (!geometry) return;

      let area = 0;
      if (geometry.isBufferGeometry) {
        const positions = geometry.attributes.position.array;
        for (let i = 0; i < positions.length; i += 9) {
          const v1 = new THREE.Vector3(positions[i], positions[i + 1], positions[i + 2]);
          const v2 = new THREE.Vector3(positions[i + 3], positions[i + 4], positions[i + 5]);
          const v3 = new THREE.Vector3(positions[i + 6], positions[i + 7], positions[i + 8]);
          area += getTriangleArea(v1, v2, v3);
        }
      }

      // Convert to square meters and calculate price
      const areaInSqMeters = area * Math.pow(selectedObject.scale.x, 2);
      const price = areaInSqMeters * material.price;
      setTotalPrice(price);
    }
  };

  const getTriangleArea = (v1, v2, v3) => {
    const side1 = new THREE.Vector3().subVectors(v2, v1);
    const side2 = new THREE.Vector3().subVectors(v3, v1);
    const direction = new THREE.Vector3().crossVectors(side1, side2);
    return direction.length() / 2;
  };

  const handleApplyMaterial = () => {
    if (!selectedObject || !selectedMaterial) return;

    const texture = selectedMaterial.textureUrl 
      ? new THREE.TextureLoader().load(`${API_BASE_URL}${selectedMaterial.textureUrl}`)
      : null;

    const material = new THREE.MeshStandardMaterial({
      color: new THREE.Color(selectedMaterial.color || '#cccccc'),
      map: texture,
      roughness: 0.7,
      metalness: 0.3,
    });

    if (selectedObject.material) {
      selectedObject.material.dispose();
    }
    selectedObject.material = material;

    if (onMaterialApply) {
      onMaterialApply({
        objectId: selectedObject.id,
        materialId: selectedMaterial._id,
        price: totalPrice,
      });
    }
  };

  if (loading) {
    return (
      <div className="p-4">
        <p className="text-gray-500">Loading materials...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 w-80 max-h-[600px] overflow-y-auto">
      <h2 className="text-lg font-semibold mb-4">Materials</h2>
      
      {!selectedObject ? (
        <p className="text-gray-500">Select an object to apply materials</p>
      ) : (
        <div className="space-y-4">
          <div className="p-3 bg-gray-50 rounded">
            <h3 className="font-medium">Selected Object</h3>
            <p className="text-sm text-gray-600">{selectedObject.name || 'Unnamed Object'}</p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {materials.map((material) => (
              <div
                key={material._id}
                onClick={() => handleMaterialSelect(material)}
                className={`p-2 rounded cursor-pointer transition-colors ${
                  selectedMaterial?._id === material._id
                    ? 'ring-2 ring-blue-500'
                    : 'hover:bg-gray-50'
                }`}
              >
                <div 
                  className="w-full h-20 rounded mb-2"
                  style={{
                    backgroundColor: material.color || '#cccccc',
                    backgroundImage: material.textureUrl 
                      ? `url(${API_BASE_URL}${material.textureUrl})`
                      : 'none',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                />
                <p className="text-sm font-medium">{material.name}</p>
                <p className="text-xs text-gray-500">${material.price}/m²</p>
              </div>
            ))}
          </div>

          {selectedMaterial && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Estimated Price:</span>
                <span className="font-medium">${totalPrice.toFixed(2)}</span>
              </div>
              <button
                onClick={handleApplyMaterial}
                className="w-full py-2 px-4 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Apply Material
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 