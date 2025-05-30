import html2canvas from 'html2canvas';
import axios from 'axios';

// Configuration de Pinata
const PINATA_JWT = process.env.REACT_APP_PINATA_JWT || "";

// Type pour le certificat
export interface Certificate {
  studentName: string;
  studentEmail: string;
  courseId: number;
  courseTitle: string;
  issuerName: string;
  issuedTo: string;
  issuedAt: string;
  id: string;
}

/**
 * Génère une image de certificat à partir des données JSON
 * @param certificate Données du certificat
 * @returns Blob contenant l'image PNG du certificat
 */
export const generateCertificateImage = async (certificate: Certificate): Promise<Blob> => {
  // Créer un élément div temporaire pour le template du certificat
  const certificateElement = document.createElement('div');
  certificateElement.style.width = '1000px';
  certificateElement.style.height = '700px';
  certificateElement.style.position = 'absolute';
  certificateElement.style.left = '-9999px';
  certificateElement.style.fontFamily = 'Arial, sans-serif';
  certificateElement.style.background = 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)';
  certificateElement.style.borderRadius = '10px';
  certificateElement.style.boxShadow = '0 10px 20px rgba(0, 0, 0, 0.2)';
  certificateElement.style.padding = '40px';
  certificateElement.style.boxSizing = 'border-box';
  
  // Date formatée
  const issueDate = new Date(certificate.issuedAt);
  const formattedDate = issueDate.toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  // Template HTML du certificat
  certificateElement.innerHTML = `
    <div style="text-align: center; margin-bottom: 30px;">
      <h1 style="color: #2c3e50; font-size: 36px; margin-bottom: 10px;">CERTIFICAT DE RÉUSSITE</h1>
      <div style="height: 2px; background-color: #3498db; width: 100px; margin: 0 auto;"></div>
    </div>
    
    <div style="text-align: center; margin: 40px 0;">
      <p style="font-size: 20px; color: #7f8c8d; margin-bottom: 10px;">Ce certificat est décerné à</p>
      <h2 style="color: #2c3e50; font-size: 42px; margin: 10px 0;">${certificate.studentName}</h2>
      <p style="font-size: 20px; color: #7f8c8d; margin-top: 10px;">Pour avoir complété avec succès</p>
      <h3 style="color: #3498db; font-size: 28px; margin: 15px 0;">${certificate.courseTitle}</h3>
    </div>
    
    <div style="display: flex; justify-content: space-between; margin-top: 80px; align-items: flex-end;">
      <div>
        <p style="margin: 5px 0; font-size: 16px; color: #7f8c8d;">Date d'émission</p>
        <p style="margin: 5px 0; font-size: 18px; color: #2c3e50;">${formattedDate}</p>
      </div>
      <div style="text-align: center;">
        <div style="height: 2px; background-color: #2c3e50; width: 200px;"></div>
        <p style="margin: 5px 0; font-size: 18px; color: #2c3e50;">${certificate.issuerName}</p>
      </div>
    </div>
    
    <div style="margin-top: 40px; text-align: center;">
      <p style="font-size: 14px; color: #7f8c8d;">Certificat ID: ${certificate.id}</p>
      <p style="font-size: 12px; color: #7f8c8d;">Délivré à l'adresse: ${certificate.issuedTo}</p>
    </div>
  `;
  
  // Ajouter l'élément au document pour le rendu
  document.body.appendChild(certificateElement);
  
  try {
    // Convertir le div en canvas avec des options optimisées
    const canvas = await html2canvas(certificateElement, {
      logging: false,
      allowTaint: true,
      useCORS: true,
      scale: 2, // Meilleure qualité
      backgroundColor: null
    });
    
    // Convertir le canvas en blob
    return new Promise<Blob>((resolve, reject) => {
      try {
        canvas.toBlob((blob: Blob | null) => {
          if (blob) {
            resolve(blob);
          } else {
            console.error("Échec de la conversion en blob");
            reject(new Error('Failed to convert canvas to blob'));
          }
        }, 'image/png', 0.95); // Qualité 0.95
      } catch (blobError) {
        console.error("Erreur lors de la conversion en blob:", blobError);
        reject(blobError);
      }
    });
  } catch (canvasError) {
    console.error("Erreur lors de la génération du canvas:", canvasError);
    throw canvasError;
  } finally {
    // Nettoyer le DOM en supprimant l'élément temporaire
    try {
      document.body.removeChild(certificateElement);
    } catch (cleanupError) {
      console.warn("Erreur lors du nettoyage du DOM:", cleanupError);
    }
  }
};

/**
 * Méthode alternative pour générer une image de certificat sans utiliser html2canvas
 * (pour contourner les limitations des environnements sans DOM complet)
 */
export const generateSimpleCertificateImage = async (certificate: Certificate): Promise<Blob> => {
  // Cette fonction utilise une approche alternative si html2canvas échoue
  // Ici on va créer un canvas directement sans passer par html2canvas
  
  const canvas = document.createElement('canvas');
  canvas.width = 1000;
  canvas.height = 700;
  
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error("Could not get canvas context");
  }
  
  // Fond dégradé
  const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  gradient.addColorStop(0, '#f5f7fa');
  gradient.addColorStop(1, '#c3cfe2');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Textes
  ctx.fillStyle = '#2c3e50';
  ctx.font = 'bold 36px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('CERTIFICAT DE RÉUSSITE', canvas.width / 2, 80);
  
  // Ligne décorative
  ctx.fillStyle = '#3498db';
  ctx.fillRect((canvas.width / 2) - 50, 100, 100, 2);
  
  // Nom de l'étudiant
  ctx.font = 'bold 42px Arial';
  ctx.fillStyle = '#2c3e50';
  ctx.fillText(certificate.studentName, canvas.width / 2, 250);
  
  // Cours
  ctx.font = 'bold 28px Arial';
  ctx.fillStyle = '#3498db';
  ctx.fillText(certificate.courseTitle, canvas.width / 2, 350);
  
  // Date
  const issueDate = new Date(certificate.issuedAt);
  const formattedDate = issueDate.toLocaleDateString('fr-FR');
  ctx.font = '18px Arial';
  ctx.fillStyle = '#2c3e50';
  ctx.textAlign = 'left';
  ctx.fillText(`Date: ${formattedDate}`, 100, 550);
  
  // Émetteur
  ctx.textAlign = 'right';
  ctx.fillText(certificate.issuerName, canvas.width - 100, 550);
  
  // ID
  ctx.font = '14px Arial';
  ctx.fillStyle = '#7f8c8d';
  ctx.textAlign = 'center';
  ctx.fillText(`Certificat ID: ${certificate.id}`, canvas.width / 2, 620);
  ctx.fillText(`Délivré à l'adresse: ${certificate.issuedTo}`, canvas.width / 2, 650);
  
  // Convertir le canvas en blob
  return new Promise<Blob>((resolve, reject) => {
    try {
      canvas.toBlob((blob: Blob | null) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to convert canvas to blob'));
        }
      }, 'image/png', 0.95);
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Stocke l'image du certificat sur IPFS via Pinata
 * @param certificateBlob Blob de l'image du certificat
 * @param certificateId Identifiant unique du certificat
 * @returns URL IPFS de l'image stockée
 */
export const storeCertificateImageOnIPFS = async (certificateBlob: Blob, certificateId: string): Promise<string> => {
  if (!PINATA_JWT) {
    console.error("PINATA_JWT n'est pas défini. Vérifiez vos variables d'environnement.");
    throw new Error("API key for Pinata not found");
  }

  try {
    // Vérifier que certificateBlob est bien un Blob
    if (!(certificateBlob instanceof Blob)) {
      throw new Error(`Le blob n'est pas valide: ${typeof certificateBlob}`);
    }
    
    // Créer un formData pour l'upload
    const formData = new FormData();
    formData.append('file', certificateBlob, `certificate-${certificateId}.png`);
    
    // Configuration de la requête Pinata
    const url = 'https://api.pinata.cloud/pinning/pinFileToIPFS';
    const headers = {
      'Authorization': `Bearer ${PINATA_JWT}`
    };
    
    // Ajouter les métadonnées
    const metadata = JSON.stringify({
      name: `certificate-image-${certificateId}`,
      keyvalues: {
        type: 'certificate-image'
      }
    });
    formData.append('pinataMetadata', metadata);
    
    // Options pour Pinata
    const options = JSON.stringify({
      cidVersion: 1
    });
    formData.append('pinataOptions', options);
    
    // Envoyer la requête à Pinata
    const response = await axios.post(url, formData, { 
      headers,
      maxBodyLength: Infinity,
      maxContentLength: Infinity
    });
    
    // Retourner l'URI IPFS
    if (response.data && response.data.IpfsHash) {
      return `https://red-occasional-mule-247.mypinata.cloud/ipfs/${response.data.IpfsHash}`;
    } else {
      throw new Error('Failed to get IPFS hash from Pinata');
    }
  } catch (error) {
    console.error('Error uploading certificate image to Pinata:', error);
    if (axios.isAxiosError(error)) {
      console.error('Axios error details:', error.response?.data || error.message);
    }
    throw error;
  }
}; 