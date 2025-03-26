import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { API_BASE_URL } from '../lib/api';

export default function ProjectLoader({ onProjectLoad }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currentUser } = useAuth();

  useEffect(() => {
    fetchProjects();
  }, [currentUser]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/projects/${currentUser.uid}`);
      setProjects(response.data.data);
    } catch (err) {
      setError('Failed to load projects');
      console.error('Error loading projects:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleProjectLoad = async (projectId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/projects/project/${projectId}`);
      onProjectLoad(response.data.data);
    } catch (err) {
      setError('Failed to load project');
      console.error('Error loading project:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-500 p-4 rounded">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-900">Your Projects</h2>
      {projects.length === 0 ? (
        <p className="text-gray-500">No projects saved yet</p>
      ) : (
        <div className="grid gap-4">
          {projects.map((project) => (
            <div
              key={project._id}
              className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handleProjectLoad(project._id)}
            >
              <h3 className="font-medium text-gray-900">{project.projectName}</h3>
              <div className="mt-2 flex justify-between text-sm text-gray-500">
                <span>Created: {new Date(project.createdAt).toLocaleDateString()}</span>
                <span>Total: ${project.totalPrice.toFixed(2)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 