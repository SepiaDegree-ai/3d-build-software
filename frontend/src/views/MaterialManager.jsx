import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../lib/api';

const CATEGORIES = ['wood', 'metal', 'glass', 'plastic', 'other'];

const MaterialForm = ({ onSubmit, initialData = null, isEditing = false }) => {
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: 'other',
    color: '#cccccc',
    description: '',
    ...initialData
  });
  const [texture, setTexture] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setTexture(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const formPayload = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        formPayload.append(key, value);
      });
      if (texture) {
        formPayload.append('texture', texture);
      }

      await onSubmit(formPayload);
      setFormData({
        name: '',
        price: '',
        category: 'other',
        color: '#cccccc',
        description: ''
      });
      setTexture(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Error submitting form');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">
        {isEditing ? 'Edit Material' : 'Add New Material'}
      </h2>

      {error && (
        <div className="bg-red-50 text-red-500 p-3 rounded">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium mb-1">Name</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Price (USD/m²)</label>
        <input
          type="number"
          name="price"
          value={formData.price}
          onChange={handleChange}
          min="0"
          step="0.01"
          className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Category</label>
        <select
          name="category"
          value={formData.category}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
        >
          {CATEGORIES.map(cat => (
            <option key={cat} value={cat}>
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Color</label>
        <div className="flex gap-2">
          <input
            type="color"
            name="color"
            value={formData.color}
            onChange={handleChange}
            className="h-10 w-20"
          />
          <input
            type="text"
            name="color"
            value={formData.color}
            onChange={handleChange}
            pattern="^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$"
            className="flex-1 px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Description</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
          rows="3"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Texture</label>
        <input
          type="file"
          onChange={handleFileChange}
          accept=".png,.jpg,.jpeg,.webp"
          className="w-full"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className={`w-full py-2 px-4 rounded font-medium text-white ${
          loading
            ? 'bg-blue-300'
            : 'bg-blue-500 hover:bg-blue-600 active:bg-blue-700'
        }`}
      >
        {loading ? 'Processing...' : isEditing ? 'Update Material' : 'Add Material'}
      </button>
    </form>
  );
};

const MaterialCard = ({ material, onEdit, onDelete }) => {
  if (!material) return null;

  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this material?')) return;
    
    setDeleting(true);
    try {
      await onDelete(material._id);
    } catch (error) {
      console.error('Error deleting material:', error);
      alert('Failed to delete material');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 flex gap-4">
      <div className="w-24 h-24 bg-gray-100 rounded overflow-hidden flex-shrink-0">
        {material.textureUrl ? (
          <img
            src={`${API_BASE_URL}${material.textureUrl}`}
            alt={material.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div
            className="w-full h-full"
            style={{ backgroundColor: material.color || '#cccccc' }}
          />
        )}
      </div>

      <div className="flex-1">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-medium">{material.name}</h3>
            <p className="text-sm text-gray-500 capitalize">{material.category}</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => onEdit(material)}
              className="px-3 py-1 text-sm bg-blue-100 text-blue-600 rounded hover:bg-blue-200"
            >
              Edit
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="px-3 py-1 text-sm bg-red-100 text-red-600 rounded hover:bg-red-200"
            >
              {deleting ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>

        <div className="mt-2 text-sm">
          <p className="font-medium text-gray-900">
            ${(material.price || 0).toFixed(2)}/m²
          </p>
          {material.description && (
            <p className="text-gray-600 mt-1">{material.description}</p>
          )}
        </div>
      </div>
    </div>
  );
};

const MaterialStats = ({ materials }) => {
  const safeArray = Array.isArray(materials) ? materials : [];
  
  const totalMaterials = safeArray.length;
  const totalValue = safeArray.reduce((sum, mat) => {
    const price = mat && typeof mat.price === 'number' ? mat.price : 0;
    return sum + price;
  }, 0);
  
  const avgPrice = totalMaterials > 0 ? (totalValue / totalMaterials).toFixed(2) : '0.00';

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold">Total Materials</h3>
        <p className="text-2xl">{totalMaterials}</p>
      </div>
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold">Average Price</h3>
        <p className="text-2xl">${avgPrice}/m²</p>
      </div>
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold">Total Value</h3>
        <p className="text-2xl">${totalValue.toFixed(2)}</p>
      </div>
    </div>
  );
};

const MaterialManager = () => {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingMaterial, setEditingMaterial] = useState(null);

  const fetchMaterials = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/api/materials`);
      setMaterials(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error('Error fetching materials:', err);
      setError('Failed to load materials');
      setMaterials([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaterials();
  }, []);

  const handleSubmit = async (formData) => {
    try {
      if (editingMaterial) {
        await axios.put(`${API_BASE_URL}/api/materials/${editingMaterial._id}`, formData);
      } else {
        await axios.post(`${API_BASE_URL}/api/materials`, formData);
      }
      setEditingMaterial(null);
      fetchMaterials();
    } catch (err) {
      console.error('Error submitting material:', err);
      throw err;
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_BASE_URL}/api/materials/${id}`);
      fetchMaterials();
    } catch (err) {
      console.error('Error deleting material:', err);
      throw err;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Material Manager</h1>
          <div className="text-center py-8">Loading...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Material Manager</h1>
          <div className="bg-red-50 text-red-500 p-4 rounded mb-8">{error}</div>
          <MaterialForm onSubmit={handleSubmit} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Material Manager</h1>
        
        <MaterialStats materials={materials} />
        
        <div className="grid md:grid-cols-2 gap-8">
          <MaterialForm
            onSubmit={handleSubmit}
            initialData={editingMaterial}
            isEditing={!!editingMaterial}
          />
          
          <div className="space-y-4">
            <h2 className="text-xl font-bold mb-4">Materials List</h2>
            {!Array.isArray(materials) || materials.length === 0 ? (
              <p className="text-gray-500">No materials added yet.</p>
            ) : (
              materials.map(material => (
                <MaterialCard
                  key={material?._id || Math.random()}
                  material={material}
                  onEdit={setEditingMaterial}
                  onDelete={handleDelete}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MaterialManager; 