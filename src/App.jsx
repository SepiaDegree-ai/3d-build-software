import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './components/Login';
import Signup from './components/Signup';
import MaterialManager from './views/MaterialManager';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route
            path="/materials"
            element={
              <ProtectedRoute>
                <MaterialManager />
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<Navigate to="/materials" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App; 