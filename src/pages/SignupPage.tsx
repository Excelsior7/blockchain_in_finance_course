import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const SignupPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validation simple
    if (!username || !email || !password || !walletAddress) {
      setError('Veuillez remplir tous les champs.');
      setLoading(false);
      return;
    }

    // Validation de l'adresse Ethereum
    if (!/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
      setError('Adresse de portefeuille Ethereum invalide. Elle doit commencer par 0x et être suivie de 40 caractères hexadécimaux.');
      setLoading(false);
      return;
    }

    try {
      const result = await register(username, email, password, walletAddress);
      
      if (result.success) {
        navigate('/login');
      } else {
        setError(result.error?.message || 'Une erreur est survenue l\'inscription.');
      }
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue l\'inscription.');
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
          Inscription à DataCampus
        </h2>
        <p style={{ marginTop: '0.5rem', textAlign: 'center', fontSize: '0.875rem', color: '#4b5563' }}>
          Créez votre compte pour accéder aux formations certifiées sur blockchain
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
              <label htmlFor="username" className="form-label">
                Nom d'utilisateur
              </label>
              <div style={{ marginTop: '0.25rem' }}>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="form-input"
                  disabled={loading}
                />
              </div>
            </div>

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

            <div className="form-group">
              <label htmlFor="walletAddress" className="form-label">
                Adresse du portefeuille Ethereum
              </label>
              <div style={{ marginTop: '0.25rem' }}>
                <input
                  id="walletAddress"
                  name="walletAddress"
                  type="text"
                  required
                  placeholder="0x..."
                  value={walletAddress}
                  onChange={(e) => setWalletAddress(e.target.value)}
                  className="form-input"
                  disabled={loading}
                />
                <p style={{ marginTop: '0.25rem', fontSize: '0.75rem', color: '#6b7280' }}>
                  Cette adresse sera utilisée pour stocker vos certifications sur la blockchain.
                </p>
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', justifyContent: 'center' }}
                disabled={loading}
              >
                {loading ? 'Inscription en cours...' : 'S\'inscrire'}
              </button>
            </div>
          </form>
          
          <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
            <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
              Vous avez déjà un compte?{' '}
              <Link to="/login" style={{ color: '#2563eb', textDecoration: 'none' }}>
                Connectez-vous
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage; 