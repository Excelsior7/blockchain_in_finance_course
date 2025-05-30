import React, { useContext } from 'react';
import { Course } from '../types';
import { AuthContext } from '../context/AuthContext';
import { issueCertificate } from '../utils/blockchain';

interface CourseCardProps {
  course: Course;
  isCompleted: boolean;
}

const CourseCard: React.FC<CourseCardProps> = ({ course, isCompleted }) => {
  const { user, profile, completeCourse } = useContext(AuthContext);
  
  const handleCompleteCourse = async () => {
    if (!user || !profile) return;
    
    try {
      // Émettre le certificat sur la blockchain avec les informations de l'étudiant
      const txHash = await issueCertificate(
        course.id,
        profile.wallet_address,
        profile.username || 'Étudiant', // Utiliser le nom d'utilisateur du profil
        user.email || 'unknown@example.com', // L'email est dans user, pas dans profile
        course.title
      );
      
      // Mettre à jour l'état de l'utilisateur
      completeCourse(course.id, txHash);
      
      alert(`Félicitations ! Vous avez terminé le cours "${course.title}" et reçu un certificat sur la blockchain.`);
    } catch (error) {
      console.error('Erreur lors de la complétion du cours :', error);
      alert('Une erreur est survenue lors de la validation du cours.');
    }
  };

  return (
    <div className="card">
      <div className="card-image">
        <img 
          src={course.imageUrl} 
          alt={course.title}
        />
      </div>
      
      <div className="card-body">
        <h3 className="card-title">{course.title}</h3>
        <p className="card-text">{course.description}</p>
        
        {isCompleted ? (
          <div className="badge badge-success">
            <svg className="mr-1" width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Complété
          </div>
        ) : (
          <button
            onClick={handleCompleteCourse}
            className="btn btn-primary"
          >
            Compléter ce cours
          </button>
        )}
      </div>
    </div>
  );
};

export default CourseCard; 