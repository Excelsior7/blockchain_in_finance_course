import { ethers } from 'ethers';
import axios from 'axios';
import { 
  generateCertificateImage, 
  generateSimpleCertificateImage,
  storeCertificateImageOnIPFS, 
  Certificate 
} from './certificateGenerator';

// Déclarer le type pour window.ethereum
declare global {
  interface Window {
    ethereum?: any;
  }
}

export const getEtherscanLink = (txHash: string, network: string = 'goerli') => {
  return `https://sepolia.etherscan.io/tx/${txHash}`;
};

// ABI du contrat (à créer ou importer depuis un fichier existant)
const CertificateNFTAbi = [
  "function issueCertificate(address student, string memory metadataURI) public returns (uint256)",
  "function owner() view returns (address)",
  "function getStudentCertificates(address student) view returns (uint256[] memory)",
  "function hasStudentCertificate(address student, uint256 tokenId) view returns (bool)",
  "function tokenURI(uint256 tokenId) view returns (string memory)"
  // Ajoutez d'autres fonctions du contrat selon vos besoins
];

// Configuration du contract (à ajuster selon votre déploiement)
// Adresse du contrat sur Sepolia testnet - REMPLACEZ PAR VOTRE ADRESSE RÉELLE
const CONTRACT_ADDRESS = process.env.REACT_APP_CONTRACT_ADDRESS || "0x0000000000000000000000000000000000000000"; // À remplacer par l'adresse réelle
// Configuration de Pinata
const PINATA_JWT = process.env.REACT_APP_PINATA_JWT;


// Création du certificat au format JSON
export const createCertificate = (
  studentName: string,
  studentEmail: string,
  walletAddress: string,
  courseId: number,
  courseTitle: string,
  issuerName: string = "Data Campus"
): Certificate => {
  const now = new Date();
  return {
    studentName,
    studentEmail,
    courseId,
    courseTitle,
    issuerName,
    issuedTo: walletAddress,
    issuedAt: now.toISOString(),
    id: `CERT-${courseId}-${Date.now()}`
  };
};

// Génération du hash SHA-256 du certificat
export const generateCertificateHash = async (certificate: any): Promise<string> => {
  const certificateString = JSON.stringify(certificate);
  // Utiliser l'API Web Crypto pour générer un hash SHA-256
  const encoder = new TextEncoder();
  const data = encoder.encode(certificateString);
  
  // Convertir le buffer en hexadécimal
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hash = '0x' + hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hash;
};

// Stockage du certificat sur IPFS via Pinata
export const storeCertificateOnIPFS = async (certificate: any): Promise<string> => {
  try {
    // Convertir l'objet en JSON
    const data = JSON.stringify(certificate);
    
    // Configuration de la requête Pinata
    const url = 'https://api.pinata.cloud/pinning/pinJSONToIPFS';
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${PINATA_JWT}`
    };
    
    // Préparer les métadonnées
    const pinataOptions = {
      cidVersion: 1
    };
    
    const pinataMetadata = {
      name: `certificate-${certificate.id || Date.now()}`,
      keyvalues: {
        type: 'certificate',
        studentWallet: certificate.issuedTo || ''
      }
    };
    
    // Données à envoyer
    const pinataBody = {
      pinataContent: certificate,
      pinataMetadata,
      pinataOptions
    };
    
    // Envoyer la requête à Pinata
    const response = await axios.post(url, pinataBody, { headers });
    
    // Retourner l'URI IPFS
    if (response.data && response.data.IpfsHash) {
      const ipfsUri = `https://red-occasional-mule-247.mypinata.cloud/ipfs/${response.data.IpfsHash}`;
      return ipfsUri;
    } else {
      throw new Error('Failed to get IPFS hash from Pinata');
    }
  } catch (error) {
    throw error;
  }
};

// Mise à jour de la fonction createNFTMetadata pour utiliser l'image générée
export const createNFTMetadata = async (certificate: Certificate, certificateHash: string, ipfsUri: string, certificateImageUri: string) => {
  return {
    name: `Certificat: ${certificate.courseTitle}`,
    description: `Certificat délivré à ${certificate.studentName} par ${certificate.issuerName}`,
    image: certificateImageUri,
    hash: certificateHash,
    certificate: certificateImageUri,
    attributes: [
      { trait_type: "Course", value: certificate.courseTitle },
      { trait_type: "Student", value: certificate.studentName },
      { trait_type: "Issued At", value: certificate.issuedAt }
    ]
  };
};

// Fonction pour émettre un certificat sur la blockchain
export const issueCertificate = async (
  courseId: number, 
  walletAddress: string, 
  studentName: string, 
  studentEmail: string,
  courseTitle: string
): Promise<string> => {
  try {
    // 1. Créer le certificat
    const certificate = createCertificate(
      studentName,
      studentEmail,
      walletAddress,
      courseId,
      courseTitle
    );

    // 2. Générer le hash du certificat
    const certificateHash = await generateCertificateHash(certificate);

    // 3. Stocker le certificat JSON sur IPFS via Pinata
    const ipfsUri = await storeCertificateOnIPFS(certificate);

    try {
      // 4. Générer l'image du certificat
      let certificateBlob;
      
      try {
        // Essayer d'abord avec html2canvas
        certificateBlob = await generateCertificateImage(certificate);
      } catch (html2canvasError) {
        // Fallback vers la méthode alternative
        certificateBlob = await generateSimpleCertificateImage(certificate);
      }
      
      // 5. Stocker l'image du certificat sur IPFS
      const certificateImageUri = await storeCertificateImageOnIPFS(certificateBlob, certificate.id);
      
      // 6. Créer les métadonnées NFT avec l'URI de l'image
      const metadata = await createNFTMetadata(certificate, certificateHash, ipfsUri, certificateImageUri);
      
      // 7. Stocker les métadonnées sur IPFS via Pinata
      const metadataUri = await storeCertificateOnIPFS(metadata);
      
      // 8. Interagir avec le contrat pour mint le NFT
      if (window.ethereum) {
        // Connexion à MetaMask
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0xaa36a7' }], // Sepolia chainId
        });
        await provider.send("eth_requestAccounts", []);
        const signer = provider.getSigner();
        
        // Connexion au contrat
        const contract = new ethers.Contract(
          CONTRACT_ADDRESS,
          CertificateNFTAbi, 
          signer
        );  
        
        // Émission du certificat   
        const tx = await contract.issueCertificate(walletAddress, metadataUri);
        await tx.wait();
        
        return tx.hash;
      } else {
        // Fallback: Utiliser un serveur signer avec clé privée pour les environnements sans MetaMask
        
        // Utiliser les variables d'environnement pour la clé RPC et la clé privée
        const RPC_URL = process.env.REACT_APP_RPC_URL;
        const PRIVATE_KEY = process.env.REACT_APP_PRIVATE_KEY;
        
        if (!PRIVATE_KEY) {
          throw new Error("Clé privée non configurée. Veuillez configurer REACT_APP_PRIVATE_KEY dans vos variables d'environnement.");
        }
        
        console.log("rpc_url",RPC_URL)
        // Créer un provider et un wallet avec la clé privée
        const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
        console.log("provider",provider)

        const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
        console.log("wallet",wallet)

        
        // Connexion au contrat avec le wallet serveur
        const contract = new ethers.Contract(
          CONTRACT_ADDRESS,
          CertificateNFTAbi, 
          wallet
        );
        
        // Émission du certificat avec le wallet serveur
        const tx = await contract.issueCertificate(walletAddress, metadataUri);
        await tx.wait();
        
        return tx.hash;
      }
    } catch (imageError) {
      // Fallback: utiliser une image générique si la génération d'image échoue
      const genericImageUri = "https://red-occasional-mule-247.mypinata.cloud/ipfs/bafkreiaj6rqcsipmhf4ene3e6uviklgava5srmrzllnkjizkmeml6hl23u";
      
      // Créer les métadonnées avec l'image générique
      const metadata = {
        name: `Certificat: ${certificate.courseTitle}`,
        description: `Certificat délivré à ${certificate.studentName} par ${certificate.issuerName}`,
        image: genericImageUri,
        hash: certificateHash,
        certificate: ipfsUri,
        attributes: [
          { trait_type: "Course", value: certificate.courseTitle },
          { trait_type: "Student", value: certificate.studentName },
          { trait_type: "Issued At", value: certificate.issuedAt }
        ]
      };
      
      // Stocker les métadonnées sur IPFS
      const metadataUri = await storeCertificateOnIPFS(metadata);
      
      // Interagir avec le contrat pour mint le NFT
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0xaa36a7' }], // Sepolia chainId
        });
        await provider.send("eth_requestAccounts", []);
        const signer = provider.getSigner();
        
        const contract = new ethers.Contract(
          CONTRACT_ADDRESS,
          CertificateNFTAbi, 
          signer
        );  
        
        const tx = await contract.issueCertificate(walletAddress, metadataUri);
        await tx.wait();
        
        return tx.hash;
      } else {
        // Fallback: Utiliser un serveur signer avec clé privée pour les environnements sans MetaMask
        
        // Utiliser les variables d'environnement pour la clé RPC et la clé privée
        const RPC_URL = process.env.REACT_APP_RPC_URL;
        const PRIVATE_KEY = process.env.REACT_APP_PRIVATE_KEY;
        
        if (!PRIVATE_KEY) {
          throw new Error("Clé privée non configurée. Veuillez configurer REACT_APP_PRIVATE_KEY dans vos variables d'environnement.");
        }
        
        // Créer un provider et un wallet avec la clé privée
        const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
        const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
        
        // Connexion au contrat avec le wallet serveur
        const contract = new ethers.Contract(
          CONTRACT_ADDRESS,
          CertificateNFTAbi, 
          wallet
        );
        
        // Émission du certificat avec le wallet serveur
        const tx = await contract.issueCertificate(walletAddress, metadataUri);
        await tx.wait();
        
        return tx.hash;
      }
    }
  } catch (error) {
    throw error;
  }
}; 