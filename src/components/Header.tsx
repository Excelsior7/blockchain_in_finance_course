import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Header: React.FC = () => {
  const { user, profile, logout, loading } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const result = await logout();
      // Naviguer vers la page de connexion, que la déconnexion ait réussi ou non
      navigate('/login');
      if (!result.success) {
        console.warn('Déconnexion avec avertissement:', result.error);
      }
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
      // Naviguer vers la page de connexion même en cas d'erreur
      navigate('/login');
    }
  };

  return (
    <header className="header">
      <div className="container header-container">
        <Link to="/" className="header-logo">DataCampus</Link>
        
        <nav className="header-nav">
          {user ? (
            <>
              <Link to="/courses" className="header-link">Cours</Link>
              <Link to="/my-courses" className="header-link">Mes Certifications</Link>
              <div className="flex items-center">
                <span className="mr-1">Bonjour, {profile?.username || 'Utilisateur'}</span>
                <button 
                  onClick={handleLogout}
                  className="header-button"
                  disabled={loading}
                >
                  {loading ? '...' : 'Déconnexion'}
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center" style={{ gap: '0.75rem' }}>
              <Link 
                to="/login" 
                className="header-button"
              >
                Connexion
              </Link>
              <Link 
                to="/signup"
                className="btn btn-primary" 
              >
                S'inscrire
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header; 