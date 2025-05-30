import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { courses } from '../data/courses';
import CertificateCard from '../components/CertificateCard';
import { Link } from 'react-router-dom';

const MyCoursesPage: React.FC = () => {
  const { user, completedCourses } = useContext(AuthContext);

  if (!user) {
    return <div style={{ textAlign: 'center', padding: '2.5rem 0' }}>Veuillez vous connecter pour voir vos certifications.</div>;
  }

  // Filtrer les cours complétés par l'utilisateur et trouver le cours correspondant dans les données statiques
  const userCompletedCoursesWithData = completedCourses
    .map(completedCourse => {
      const courseData = courses.find(course => course.id === completedCourse.course_id);
      return courseData ? { 
        course: courseData, 
        txHash: completedCourse.tx_hash 
      } : null;
    })
    .filter(item => item !== null);

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '1rem' }}>Mes Certifications</h1>
        <p style={{ color: '#4b5563' }}>
          Toutes vos certifications vérifiables sur la blockchain.
        </p>
      </div>

      {userCompletedCoursesWithData.length > 0 ? (
        <div className="grid grid-cols-3">
          {userCompletedCoursesWithData.map((item) => (
            item && <CertificateCard 
              key={`${item.course.id}-${item.txHash}`} 
              course={item.course} 
              txHash={item.txHash} 
            />
          ))}
        </div>
      ) : (
        <div className="card" style={{ textAlign: 'center', padding: '2.5rem 0' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 500, color: '#1f2937', marginBottom: '0.5rem' }}>Aucune certification pour le moment</h3>
          <p style={{ color: '#4b5563', marginBottom: '1rem' }}>
            Vous n'avez pas encore terminé de cours. Complétez des cours pour obtenir des certifications.
          </p>
          <Link 
            to="/courses" 
            className="btn btn-primary"
          >
            Voir les cours disponibles
          </Link>
        </div>
      )}
    </div>
  );
};

export default MyCoursesPage; 