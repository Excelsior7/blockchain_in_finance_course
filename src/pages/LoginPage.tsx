import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login, user } = useAuth();
  const navigate = useNavigate();

  // Rediriger si l'utilisateur est déjà connecté
  useEffect(() => {
    if (user) {
      navigate('/courses');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!email || !password) {
      setError('Veuillez remplir tous les champs.');
      setLoading(false);
      return;
    }

    try {
      const result = await login(email, password);
      
      if (result.success) {
        navigate('/courses');
      } else {
        setError(result.error?.message || 'Identifiants incorrects.');
      }
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue lors de la connexion.');
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '3rem 1.5rem' }}>
      <div style={{ maxWidth: '28rem', margin: '0 auto', width: '100%' }}>
        <h2 style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '1.875rem', fontWeight: 800, color: '#1f2937' }}>
          Connexion à DataCampus
        </h2>
        <p style={{ marginTop: '0.5rem', textAlign: 'center', fontSize: '0.875rem', color: '#4b5563' }}>
          La plateforme d'apprentissage de la data certifiée sur blockchain
        </p>
      </div>

      <div style={{ marginTop: '2rem', maxWidth: '28rem', margin: '2rem auto 0', width: '100%' }}>
        <div className="card" style={{ padding: '2rem 1rem' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {error && (
              <div className="form-error">
                {error}
              </div>
            )}
            
            <div className="form-group">
              <label htmlFor="email" className="form-label">
                Email
              </label>
              <div style={{ marginTop: '0.25rem' }}>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="form-input"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">
                Mot de passe
              </label>
              <div style={{ marginTop: '0.25rem', position: 'relative' }}>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="form-input"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#6b7280'
                  }}
                >
                  {showPassword ? (
                    <span role="img" aria-label="Masquer">👁️‍🗨️</span>
                  ) : (
                    <span role="img" aria-label="Afficher">👁️</span>
                  )}
                </button>
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', justifyContent: 'center' }}
                disabled={loading}
              >
                {loading ? 'Connexion en cours...' : 'Se connecter'}
              </button>
            </div>
          </form>
          
          <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
            <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
              Vous n'avez pas de compte?{' '}
              <Link to="/signup" style={{ color: '#2563eb', textDecoration: 'none' }}>
                Inscrivez-vous
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage; 