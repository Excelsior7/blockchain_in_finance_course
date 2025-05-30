import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import CoursesPage from './pages/CoursesPage';
import MyCoursesPage from './pages/MyCoursesPage';
import './App.css';

// Composant pour les routes protégées
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    // Afficher un indicateur de chargement pendant la vérification
    return <div>Chargement...</div>;
  }
  
  if (!user) {
    // Rediriger vers la page de connexion si l'utilisateur n'est pas connecté
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen" style={{ backgroundColor: '#f9fafb' }}>
          <Header />
          <main>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route 
                path="/courses" 
                element={
                  <ProtectedRoute>
                    <CoursesPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/my-courses" 
                element={
                  <ProtectedRoute>
                    <MyCoursesPage />
                  </ProtectedRoute>
                } 
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
