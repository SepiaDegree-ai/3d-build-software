import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

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
            src={`${API_URL}${material.textureUrl}`}
            alt={material.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div
            className="w-full h-full"
            style={{ backgroundColor: material.color }}
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
            ${material.price.toFixed(2)}/m²
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
  const stats = materials.reduce((acc, mat) => {
    acc.total++;
    acc.categories[mat.category] = (acc.categories[mat.category] || 0) + 1;
    acc.totalValue += mat.price;
    return acc;
  }, { total: 0, categories: {}, totalValue: 0 });

  return (
    <div className="bg-white rounded-lg shadow p-4 mb-6">
      <h3 className="font-medium mb-3">Material Statistics</h3>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="bg-blue-50 p-3 rounded">
          <p className="text-sm text-gray-600">Total Materials</p>
          <p className="text-xl font-bold text-blue-600">{stats.total}</p>
        </div>
        <div className="bg-green-50 p-3 rounded">
          <p className="text-sm text-gray-600">Avg. Price/m²</p>
          <p className="text-xl font-bold text-green-600">
            ${(stats.totalValue / stats.total || 0).toFixed(2)}
          </p>
        </div>
        {Object.entries(stats.categories).map(([category, count]) => (
          <div key={category} className="bg-gray-50 p-3 rounded">
            <p className="text-sm text-gray-600 capitalize">{category}</p>
            <p className="text-xl font-bold text-gray-600">{count}</p>
          </div>
        ))}
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
      const response = await axios.get(`${API_URL}/materials`);
      setMaterials(response.data.data);
    } catch (err) {
      setError('Failed to load materials');
      console.error('Error fetching materials:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaterials();
  }, []);

  const handleSubmit = async (formData) => {
    if (editingMaterial) {
      await axios.put(`${API_URL}/materials/${editingMaterial._id}`, formData);
    } else {
      await axios.post(`${API_URL}/materials`, formData);
    }
    setEditingMaterial(null);
    fetchMaterials();
  };

  const handleDelete = async (id) => {
    await axios.delete(`${API_URL}/materials/${id}`);
    fetchMaterials();
  };

  if (error) {
    return (
      <div className="text-red-500 text-center py-8">
        {error}
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8">Material Manager</h1>

      {!loading && <MaterialStats materials={materials} />}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <MaterialForm
            onSubmit={handleSubmit}
            initialData={editingMaterial}
            isEditing={!!editingMaterial}
          />
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-bold mb-4">Material List</h2>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            </div>
          ) : (
            <div className="space-y-4">
              {materials.map(material => (
                <MaterialCard
                  key={material._id}
                  material={material}
                  onEdit={setEditingMaterial}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MaterialManager; 