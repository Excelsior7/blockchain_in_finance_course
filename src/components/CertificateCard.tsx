import React from 'react';
import { Course } from '../types';
import { getEtherscanLink } from '../utils/blockchain';

interface CertificateCardProps {
  course: Course;
  txHash?: string; // Transaction hash from completed_courses
}

const CertificateCard: React.FC<CertificateCardProps> = ({ course, txHash }) => {  
  // Use the provided txHash if available, otherwise fall back to course.txHash (for backwards compatibility)
  const transactionHash = txHash || course.txHash;
  const etherscanLink = transactionHash ? getEtherscanLink(transactionHash) : '#';

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
        
        <div className="flex justify-between items-center">
          <div className="badge badge-success">
            <svg className="mr-1" width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Certifié
          </div>
          
          <a 
            href={etherscanLink} 
            target="_blank" 
            rel="noopener noreferrer"
            className="header-link"
            style={{ color: '#2563eb' }}
          >
            <span className="mr-1">Voir sur Etherscan</span>
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style={{ display: 'inline' }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
};

export default CertificateCard; 