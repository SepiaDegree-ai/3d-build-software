import React, { useState } from 'react';
import { SpeckleViewer } from '@speckle/viewer';
import axios from 'axios';
import { API_BASE_URL } from '../lib/api';

export default function ModelViewer() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [modelUrl, setModelUrl] = useState(null);

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

      setModelUrl(response.data.modelUrl);
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

      {modelUrl && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">3D Model Viewer</h2>
          <div className="w-full h-[600px] rounded overflow-hidden">
            <SpeckleViewer
              url={modelUrl}
              token={process.env.REACT_APP_SPECKLE_TOKEN}
              style={{ width: '100%', height: '100%' }}
            />
          </div>
        </div>
      )}
    </div>
  );
} 