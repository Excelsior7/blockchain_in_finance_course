import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const HomePage: React.FC = () => {
  const { user } = useContext(AuthContext);

  return (
    <div>
      {/* Hero section */}
      <div className="hero">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1 style={{ fontSize: '3.5rem', fontWeight: 800, lineHeight: 1.1 }}>DataCampus</h1>
          <p style={{ marginTop: '1.5rem', fontSize: '1.25rem', color: '#bfdbfe', maxWidth: '48rem' }}>
            La première plateforme de formation en data science avec certification vérifiable sur blockchain.
          </p>
          {!user && (
            <div style={{ marginTop: '2.5rem' }}>
              <Link
                to="/login"
                className="btn"
                style={{ 
                  backgroundColor: 'white', 
                  color: '#2563eb', 
                  padding: '0.75rem 1.25rem',
                  borderRadius: '0.375rem',
                  fontWeight: 500
                }}
              >
                Se connecter
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Features section */}
      <div className="features-section">
        <div className="container">
          <div style={{ textAlign: 'center' }}>
            <h2 style={{ fontSize: '2.25rem', fontWeight: 800, color: '#1f2937' }}>
              Apprenez la data science avec confiance
            </h2>
            <p style={{ marginTop: '1rem', fontSize: '1.25rem', color: '#6b7280', maxWidth: '36rem', margin: '1rem auto 0' }}>
              Tous nos cours sont certifiés sur blockchain pour garantir l'authenticité de vos compétences.
            </p>
          </div>

          <div className="feature-grid">
            <div className="card" style={{ padding: '1.5rem', position: 'relative', paddingTop: '3rem' }}>
              <div style={{ position: 'absolute', top: '0.5rem', left: '1.5rem' }}>
                <span className="feature-icon">
                  <svg style={{ width: '1.5rem', height: '1.5rem' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </span>
              </div>
              <h3 style={{ marginTop: '2rem', fontSize: '1.125rem', fontWeight: 500, color: '#1f2937' }}>Certifications vérifiables</h3>
              <p style={{ marginTop: '1.25rem', color: '#6b7280' }}>
                Vos certificats sont inscrits sur la blockchain, ce qui les rend infalsifiables et vérifiables par n'importe qui.
              </p>
            </div>

            <div className="card" style={{ padding: '1.5rem', position: 'relative', paddingTop: '3rem' }}>
              <div style={{ position: 'absolute', top: '0.5rem', left: '1.5rem' }}>
                <span className="feature-icon">
                  <svg style={{ width: '1.5rem', height: '1.5rem' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </span>
              </div>
              <h3 style={{ marginTop: '2rem', fontSize: '1.125rem', fontWeight: 500, color: '#1f2937' }}>Contenus pédagogiques de qualité</h3>
              <p style={{ marginTop: '1.25rem', color: '#6b7280' }}>
                Des formations complètes et à jour sur les dernières technologies data science et big data.
              </p>
            </div>

            <div className="card" style={{ padding: '1.5rem', position: 'relative', paddingTop: '3rem' }}>
              <div style={{ position: 'absolute', top: '0.5rem', left: '1.5rem' }}>
                <span className="feature-icon">
                  <svg style={{ width: '1.5rem', height: '1.5rem' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                </span>
              </div>
              <h3 style={{ marginTop: '2rem', fontSize: '1.125rem', fontWeight: 500, color: '#1f2937' }}>Apprenez à votre rythme</h3>
              <p style={{ marginTop: '1.25rem', color: '#6b7280' }}>
                Des cours en ligne accessibles 24/7 pour vous permettre d'apprendre à votre propre rythme.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA section */}
      <div className="cta-section">
        <div className="cta-container">
          <h2 style={{ fontSize: '2.25rem', fontWeight: 800 }}>
            <span>Prêt à développer vos compétences en data?</span>
          </h2>
          <p style={{ marginTop: '1rem', fontSize: '1.125rem', color: '#bfdbfe' }}>
            Rejoignez des milliers d'apprenants et obtenez des certifications reconnues par les employeurs.
          </p>
          <Link
            to={user ? "/courses" : "/login"}
            className="btn"
            style={{ 
              marginTop: '2rem',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0.75rem 1.25rem',
              backgroundColor: 'white',
              color: '#2563eb',
              borderRadius: '0.375rem',
              fontWeight: 500
            }}
          >
            {user ? "Voir les cours" : "Commencer maintenant"}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HomePage; 