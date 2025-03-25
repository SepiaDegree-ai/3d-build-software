import React from 'react';
import PropTypes from 'prop-types';
import materials from '../lib/materials.json';

const MATERIALS = Object.entries(materials).map(([id, data]) => ({
  id,
  name: id.charAt(0).toUpperCase() + id.slice(1),
  ...data
}));

const formatPrice = (price) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(price);
};

const MaterialCard = ({ material, isSelected, onClick }) => (
  <div
    className={`p-3 border rounded-lg cursor-pointer transition-all ${
      isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'
    }`}
    onClick={() => onClick(material)}
  >
    <div className="flex items-center gap-3">
      <div
        className="w-8 h-8 rounded-full"
        style={{ backgroundColor: material.color }}
      />
      <div className="flex-1">
        <h4 className="font-medium text-sm">{material.name}</h4>
        <p className="text-xs text-gray-500">{formatPrice(material.price)} {material.unit}</p>
      </div>
    </div>
    <p className="text-xs text-gray-500 mt-2">{material.description}</p>
  </div>
);

MaterialCard.propTypes = {
  material: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    color: PropTypes.string.isRequired,
    price: PropTypes.number.isRequired,
    unit: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired
  }).isRequired,
  isSelected: PropTypes.bool.isRequired,
  onClick: PropTypes.func.isRequired
};

const Sidebar = ({ selectedObject, onMaterialChange, selectedMaterial }) => {
  // Calculate surface area (simplified - using bounding box)
  const calculateSurfaceArea = (object) => {
    if (!object || !object.geometry) return 0;
    const box = object.geometry.boundingBox;
    if (!box) return 0;
    
    // Calculate surface area of bounding box (simplified)
    const width = Math.abs(box.max.x - box.min.x);
    const height = Math.abs(box.max.y - box.min.y);
    const depth = Math.abs(box.max.z - box.min.z);
    
    return 2 * (width * height + width * depth + height * depth);
  };

  // Calculate total price
  const calculatePrice = () => {
    if (!selectedObject || !selectedMaterial) return 0;
    const surfaceArea = calculateSurfaceArea(selectedObject);
    return surfaceArea * selectedMaterial.price;
  };

  return (
    <div className="w-96 bg-white p-6 shadow-lg h-full overflow-y-auto">
      <h2 className="text-xl font-bold mb-6 text-gray-800">Object Properties</h2>
      
      {selectedObject ? (
        <div className="space-y-6">
          {/* Object Info */}
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">Selected Object</h3>
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <p className="text-sm">
                <span className="font-medium">Name: </span>
                {selectedObject.name || 'Unnamed'}
              </p>
              <p className="text-sm">
                <span className="font-medium">ID: </span>
                {selectedObject.id}
              </p>
              <p className="text-sm">
                <span className="font-medium">Type: </span>
                {selectedObject.type}
              </p>
            </div>
          </div>

          {/* Material Selection */}
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">Material</h3>
            <div className="space-y-2">
              {MATERIALS.map((material) => (
                <MaterialCard
                  key={material.id}
                  material={material}
                  isSelected={selectedMaterial?.id === material.id}
                  onClick={onMaterialChange}
                />
              ))}
            </div>
          </div>

          {/* Price Calculation */}
          {selectedMaterial && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Price Estimate</h3>
              <div className="space-y-1">
                <p className="text-sm">
                  <span className="font-medium">Material: </span>
                  {selectedMaterial.name}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Rate: </span>
                  {formatPrice(selectedMaterial.price)}/{selectedMaterial.unit}
                </p>
                <div className="h-px bg-blue-200 my-2" />
                <p className="text-lg font-bold text-blue-700">
                  Total: {formatPrice(calculatePrice())}
                </p>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-10 text-gray-500">
          <p>No object selected</p>
          <p className="text-sm mt-2">Click on an object in the viewer to see its properties</p>
        </div>
      )}
    </div>
  );
};

Sidebar.propTypes = {
  selectedObject: PropTypes.shape({
    name: PropTypes.string,
    id: PropTypes.number,
    type: PropTypes.string,
    uuid: PropTypes.string,
    geometry: PropTypes.object
  }),
  selectedMaterial: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    color: PropTypes.string.isRequired,
    price: PropTypes.number.isRequired,
    unit: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired
  }),
  onMaterialChange: PropTypes.func.isRequired
};

export default Sidebar; 