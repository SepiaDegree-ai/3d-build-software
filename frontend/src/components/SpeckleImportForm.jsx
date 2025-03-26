import React, { useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../lib/api';

const validateSpeckleId = (id, type) => {
  if (!id) {
    return `${type} ID is required`;
  }

  // Stream ID format: streams/streamId
  if (type === 'Stream' && !/^[0-9a-f]{24}$/.test(id)) {
    return 'Invalid Stream ID format. Should be a 24-character hexadecimal string.';
  }

  // Object ID format: objects/objectId
  if (type === 'Object' && !/^[0-9a-f]{24}$/.test(id)) {
    return 'Invalid Object ID format. Should be a 24-character hexadecimal string.';
  }

  return null;
};

export default function SpeckleImportForm({ onModelImported }) {
  const [formData, setFormData] = useState({
    streamId: '',
    objectId: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError(null);
    setValidationErrors(prev => ({
      ...prev,
      [name]: null
    }));
  };

  const validateForm = () => {
    const errors = {
      streamId: validateSpeckleId(formData.streamId, 'Stream'),
      objectId: validateSpeckleId(formData.objectId, 'Object')
    };

    setValidationErrors(errors);
    return !Object.values(errors).some(error => error !== null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(`${API_BASE_URL}/import-from-speckle`, formData);
      
      if (response.data.status === 'success') {
        onModelImported(response.data.data.fileUrl);
        setFormData({
          streamId: '',
          objectId: ''
        });
      }
    } catch (err) {
      setError(
        err.response?.data?.message || 
        'Failed to import model from Speckle'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        Import from Speckle
      </h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label 
            htmlFor="streamId" 
            className="block text-sm font-medium text-gray-700"
          >
            Stream ID
          </label>
          <input
            type="text"
            id="streamId"
            name="streamId"
            value={formData.streamId}
            onChange={handleChange}
            required
            className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm
              ${validationErrors.streamId
                ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
              }`}
            placeholder="Enter Speckle Stream ID"
          />
          {validationErrors.streamId && (
            <p className="mt-1 text-sm text-red-600">
              {validationErrors.streamId}
            </p>
          )}
        </div>

        <div>
          <label 
            htmlFor="objectId" 
            className="block text-sm font-medium text-gray-700"
          >
            Object ID
          </label>
          <input
            type="text"
            id="objectId"
            name="objectId"
            value={formData.objectId}
            onChange={handleChange}
            required
            className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm
              ${validationErrors.objectId
                ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
              }`}
            placeholder="Enter Speckle Object ID"
          />
          {validationErrors.objectId && (
            <p className="mt-1 text-sm text-red-600">
              {validationErrors.objectId}
            </p>
          )}
        </div>

        {error && (
          <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white 
            ${loading 
              ? 'bg-blue-400 cursor-not-allowed' 
              : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
            }`}
        >
          {loading ? (
            <>
              <svg 
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" 
                xmlns="http://www.w3.org/2000/svg" 
                fill="none" 
                viewBox="0 0 24 24"
              >
                <circle 
                  className="opacity-25" 
                  cx="12" 
                  cy="12" 
                  r="10" 
                  stroke="currentColor" 
                  strokeWidth="4"
                />
                <path 
                  className="opacity-75" 
                  fill="currentColor" 
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Importing...
            </>
          ) : (
            'Import Model'
          )}
        </button>
      </form>
    </div>
  );
} 