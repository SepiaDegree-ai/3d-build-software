import React, { useState, useRef } from 'react';
import GLTFViewer from './GLTFViewer';
import Sidebar from './Sidebar';
import ProjectLoader from './ProjectLoader';
import ProjectSummary from './ProjectSummary';
import SpeckleImportForm from './SpeckleImportForm';
import useHistory from '../hooks/useHistory';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

export default function ModelPage() {
  const { state: selections, setState: setSelections, undo, redo, canUndo, canRedo } = useHistory({});
  const [selectedObject, setSelectedObject] = useState(null);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [totalPrice, setTotalPrice] = useState(0);
  const [showProjectLoader, setShowProjectLoader] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showPdfPreview, setShowPdfPreview] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [currentProject, setCurrentProject] = useState(null);
  const [modelUrl, setModelUrl] = useState(null);
  const [showSpeckleImport, setShowSpeckleImport] = useState(false);
  const viewerRef = useRef(null);
  const { currentUser } = useAuth();

  const handleObjectSelect = (object) => {
    setSelectedObject(object);
    setSelectedMaterial(selections[object.uuid] || null);
  };

  const handleMaterialChange = (material) => {
    if (selectedObject) {
      const newSelections = {
        ...selections,
        [selectedObject.uuid]: material
      };
      setSelections(newSelections);
      setSelectedMaterial(material);
    }
  };

  const handleModelImport = (fileUrl) => {
    setModelUrl(fileUrl);
    setSelections({});
    setSelectedObject(null);
    setSelectedMaterial(null);
    setShowSpeckleImport(false);
  };

  const handleSaveProject = async () => {
    if (!projectName.trim()) return;

    try {
      const projectData = {
        projectName: projectName.trim(),
        modelUrl,
        selections: Object.entries(selections).map(([objectId, material]) => ({
          objectId,
          material: material.id
        })),
        totalPrice
      };

      const response = await axios.post(`${process.env.REACT_APP_API_URL}/projects/save`, projectData);
      setCurrentProject(response.data.data);
      setShowSaveDialog(false);
      setProjectName('');
    } catch (error) {
      console.error('Error saving project:', error);
    }
  };

  const handleProjectLoad = (project) => {
    setSelections({});
    setSelectedObject(null);
    setSelectedMaterial(null);
    setTotalPrice(0);

    const newSelections = {};
    project.selections.forEach(selection => {
      newSelections[selection.objectId] = selection.material;
    });

    setSelections(newSelections);
    setTotalPrice(project.totalPrice);
    setCurrentProject(project);
    setModelUrl(project.modelUrl);
    setShowProjectLoader(false);
  };

  const captureModelThumbnail = () => {
    if (viewerRef.current) {
      return viewerRef.current.getCanvas().toDataURL('image/png');
    }
    return null;
  };

  const handleExportPDF = () => {
    setShowPdfPreview(true);
  };

  return (
    <div className="flex h-screen">
      <div className="flex-1 relative">
        <div className="absolute top-4 right-4 z-10 space-x-2 flex">
          <button
            onClick={() => setShowSpeckleImport(prev => !prev)}
            className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
          >
            {showSpeckleImport ? 'Hide Import' : 'Import from Speckle'}
          </button>
          <button
            onClick={() => setShowProjectLoader(true)}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Load Project
          </button>
          <button
            onClick={() => setShowSaveDialog(true)}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Save Project
          </button>
          {currentProject && (
            <button
              onClick={handleExportPDF}
              className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
            >
              Export PDF
            </button>
          )}
        </div>

        {showSpeckleImport && (
          <div className="absolute top-16 right-4 z-10 w-80">
            <SpeckleImportForm onModelImported={handleModelImport} />
          </div>
        )}

        {modelUrl ? (
          <GLTFViewer
            ref={viewerRef}
            modelUrl={modelUrl}
            onObjectSelect={handleObjectSelect}
            selectedObject={selectedObject}
            selections={selections}
          />
        ) : (
          <div className="flex items-center justify-center h-full bg-gray-50">
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No Model Loaded
              </h3>
              <p className="text-gray-500">
                Import a model from Speckle or load an existing project
              </p>
            </div>
          </div>
        )}
      </div>

      <Sidebar
        selectedObject={selectedObject}
        selectedMaterial={selectedMaterial}
        onMaterialChange={handleMaterialChange}
        totalPrice={totalPrice}
        onUndo={canUndo ? undo : null}
        onRedo={canRedo ? redo : null}
      />

      {showProjectLoader && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Load Project</h2>
              <button
                onClick={() => setShowProjectLoader(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <ProjectLoader onProjectLoad={handleProjectLoad} />
          </div>
        </div>
      )}

      {showSaveDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <h2 className="text-xl font-semibold mb-4">Save Project</h2>
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="Enter project name"
              className="w-full p-2 border rounded mb-4"
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowSaveDialog(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveProject}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {showPdfPreview && currentProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Preview PDF</h2>
              <button
                onClick={() => setShowPdfPreview(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <ProjectSummary
              project={currentProject}
              selections={selections}
              materials={Object.values(selections)}
              modelThumbnail={captureModelThumbnail()}
              onConfirm={() => {
                setShowPdfPreview(false);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
} 