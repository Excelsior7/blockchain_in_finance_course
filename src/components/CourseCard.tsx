import React, { useContext, useState } from 'react';
import { Course } from '../types';
import { AuthContext } from '../context/AuthContext';
import { issueCertificate, getEtherscanLink } from '../utils/blockchain';

interface CourseCardProps {
  course: Course;
  isCompleted: boolean;
}

const CourseCard: React.FC<CourseCardProps> = ({ course, isCompleted }) => {
  const { user, profile, completeCourse } = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(false);
  const [completionSuccess, setCompletionSuccess] = useState(false);
  const [currentStep, setCurrentStep] = useState('');
  const [txHash, setTxHash] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  const handleCompleteCourse = async () => {
    if (!user || !profile) return;
    
    try {
      setIsLoading(true);
      setCompletionSuccess(false);
      setError(null);
      
      // Étape 1: Préparation du certificat
      setCurrentStep('Préparation du certificat...');
      
      // Étape 2: Stockage sur IPFS
      setCurrentStep('Stockage des données sur IPFS...');
      
      // Étape 3: Émission du certificat sur la blockchain
      setCurrentStep('Émission du certificat sur la blockchain...');
      
      // Émettre le certificat sur la blockchain avec les informations de l'étudiant
      const hash = await issueCertificate(
        course.id,
        profile.wallet_address,
        profile.username || 'Étudiant', // Utiliser le nom d'utilisateur du profil
        user.email || 'unknown@example.com', // L'email est dans user, pas dans profile
        course.title
      );
      
      // Sauvegarder le hash de transaction
      setTxHash(hash);
      
      // Mettre à jour l'état de l'utilisateur
      completeCourse(course.id, hash);
      
      // Afficher le succès
      setCompletionSuccess(true);
    } catch (error) {
      console.error('Erreur lors de la complétion du cours :', error);
      setError(error instanceof Error ? error.message : 'Une erreur est survenue lors de la validation du cours.');
    } finally {
      setIsLoading(false);
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
        ) : error ? (
          <div className="error-message p-2 bg-red-100 border border-red-300 rounded-md">
            <p className="text-red-700 text-sm">{error}</p>
            <button
              onClick={() => setError(null)}
              className="btn btn-sm btn-outline-danger mt-2"
            >
              Réessayer
            </button>
          </div>
        ) : completionSuccess ? (
          <div className="success-message">
            <div className="badge badge-success">
              <svg className="mr-1" width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Certification émise avec succès !
            </div>
            <p className="text-success mt-2">Félicitations ! Vous avez terminé le cours et reçu un certificat sur la blockchain.</p>
            {txHash && (
              <a 
                href={getEtherscanLink(txHash, 'sepolia')} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 text-sm mt-2 inline-block"
              >
                Voir la transaction sur Etherscan
                <svg className="inline-block ml-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            )}
          </div>
        ) : (
          <button
            onClick={handleCompleteCourse}
            className="btn btn-primary"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {currentStep || 'Certification en cours...'}
              </>
            ) : (
              'Compléter ce cours'
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default CourseCard; 