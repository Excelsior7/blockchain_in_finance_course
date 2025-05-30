# Guide de déploiement

Ce guide vous explique comment déployer le contrat intelligent sur le réseau de test Sepolia et comment configurer Pinata pour le stockage IPFS.

## 1. Déploiement du contrat sur Sepolia

### Prérequis

- MetaMask installé sur votre navigateur
- ETH de test Sepolia (à obtenir depuis un faucet)
- Node.js et npm installés

### Obtenir des ETH de test Sepolia

1. Installez MetaMask et créez un portefeuille.
2. Configurez MetaMask pour utiliser le réseau Sepolia.
3. Obtenez des ETH de test via un faucet:
   - [Sepolia Faucet](https://sepoliafaucet.com/)
   - [Alchemy Sepolia Faucet](https://sepoliafaucet.com/)

### Déployer le contrat avec Remix IDE

1. Ouvrez [Remix IDE](https://remix.ethereum.org/).
2. Créez un nouveau fichier nommé `CertificateNFT.sol` et copiez le code du contrat.
3. Compilez le contrat avec le compilateur Solidity 0.8.0 ou supérieur.
4. Allez dans l'onglet "Deploy & Run Transactions".
5. Sélectionnez "Injected Provider - MetaMask" comme environnement.
6. Assurez-vous que MetaMask est connecté au réseau Sepolia.
7. Cliquez sur "Deploy" et confirmez la transaction dans MetaMask.
8. Une fois le contrat déployé, notez l'adresse du contrat.

### Alternative: Déployer avec Hardhat

1. Installez Hardhat:
   ```bash
   npm install --save-dev hardhat
   ```

2. Initialisez un projet Hardhat:
   ```bash
   npx hardhat init
   ```

3. Configurez Hardhat pour utiliser Sepolia:
   ```javascript
   // hardhat.config.js
   module.exports = {
     solidity: "0.8.17",
     networks: {
       sepolia: {
         url: `https://sepolia.infura.io/v3/${INFURA_API_KEY}`,
         accounts: [PRIVATE_KEY]
       }
     }
   };
   ```

4. Créez un script de déploiement:
   ```javascript
   // scripts/deploy.js
   async function main() {
     const CertificateNFT = await ethers.getContractFactory("CertificateNFT");
     const certificate = await CertificateNFT.deploy();
     await certificate.deployed();
     console.log("CertificateNFT deployed to:", certificate.address);
   }
   
   main()
     .then(() => process.exit(0))
     .catch((error) => {
       console.error(error);
       process.exit(1);
     });
   ```

5. Exécutez le script de déploiement:
   ```bash
   npx hardhat run scripts/deploy.js --network sepolia
   ```

## 2. Configuration de Pinata pour IPFS

### Créer un compte Pinata

1. Rendez-vous sur [Pinata](https://app.pinata.cloud/) et créez un compte.
2. Connectez-vous à votre compte.

### Obtenir les clés API

1. Dans le menu, cliquez sur votre nom d'utilisateur puis sur "API Keys".
2. Cliquez sur "New Key" pour créer une nouvelle clé API.
3. Définissez un nom pour votre clé et accordez-lui les permissions nécessaires (au minimum "pinFileToIPFS" et "pinJSONToIPFS").
4. Notez votre clé API et votre clé secrète.

### Générer un JWT (JSON Web Token)

1. Dans le même panneau d'API, cliquez sur "JWT".
2. Créez un nouveau JWT avec les mêmes permissions que votre clé API.
3. Notez votre JWT.

## 3. Configuration de l'application

1. Créez un fichier `.env` à la racine du projet.
2. Ajoutez les variables d'environnement suivantes:
   ```
   REACT_APP_CONTRACT_ADDRESS=0x... # Adresse de votre contrat déployé
   REACT_APP_NETWORK=sepolia
   REACT_APP_PINATA_API_KEY=... # Votre clé API Pinata
   REACT_APP_PINATA_SECRET_KEY=... # Votre clé secrète Pinata
   REACT_APP_PINATA_JWT=... # Votre JWT Pinata
   ```

3. Redémarrez l'application:
   ```bash
   npm start
   ```

## 4. Test du système

1. Connectez-vous à l'application avec un compte étudiant.
2. Complétez un cours pour déclencher l'émission d'un certificat.
3. Vérifiez que le certificat est émis sur Sepolia en vérifiant la transaction sur [Sepolia Etherscan](https://sepolia.etherscan.io/).
4. Vérifiez que les métadonnées sont bien stockées sur IPFS en accédant à l'URI IPFS via un navigateur compatible IPFS ou via une passerelle comme `https://gateway.pinata.cloud/ipfs/[CID]`.

## 5. Automatisation de l'émission des certificats (Serveur)

Pour automatiser l'émission des certificats sans intervention manuelle (sans MetaMask), suivez ces étapes :

### 5.1 Configuration d'un serveur d'émission automatique

1. Créez un wallet dédié pour le serveur :
   - Générez un nouveau wallet Ethereum (via MetaMask ou ethers.js)
   - Conservez la clé privée de manière sécurisée
   - Transférez quelques ETH de test pour couvrir les frais de transaction

2. Autorisez cette adresse comme émetteur dans le contrat :
   - Connectez-vous avec le compte propriétaire du contrat
   - Appelez la fonction `addAuthorizedEmitter(address)` avec l'adresse du serveur

3. Installez les dépendances nécessaires :
   ```bash
   npm install ethers dotenv
   ```

4. Créez un fichier `.env` pour le serveur :
   ```
   # Blockchain
   SERVER_PRIVATE_KEY=0x... # Clé privée du serveur
   CONTRACT_ADDRESS=0x... # Adresse du contrat
   RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
   
   # Pinata
   PINATA_API_KEY=...
   PINATA_SECRET_KEY=...
   PINATA_JWT=...
   ```

### 5.2 Exemple de code serveur (Node.js)

Créez un fichier `server.js` :

```javascript
require('dotenv').config();
const ethers = require('ethers');
const axios = require('axios');

// ABI simplifié du contrat (fonctions nécessaires uniquement)
const contractABI = [
  "function issueCertificate(address student, string memory metadataURI) public returns (uint256)"
];

// Configuration blockchain
const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL);
const wallet = new ethers.Wallet(process.env.SERVER_PRIVATE_KEY, provider);
const contract = new ethers.Contract(process.env.CONTRACT_ADDRESS, contractABI, wallet);

// Configuration Pinata
const pinataConfig = {
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${process.env.PINATA_JWT}`
  }
};

// Fonction pour stocker sur IPFS via Pinata
async function storeOnIPFS(data) {
  try {
    const pinataBody = {
      pinataContent: data,
      pinataMetadata: { name: `certificate-${Date.now()}` }
    };
    
    const response = await axios.post(
      'https://api.pinata.cloud/pinning/pinJSONToIPFS',
      pinataBody,
      pinataConfig
    );
    
    return `ipfs://${response.data.IpfsHash}`;
  } catch (error) {
    console.error('Erreur lors du stockage sur IPFS:', error);
    throw error;
  }
}

// Fonction pour créer un certificat
async function createCertificate(studentName, studentEmail, walletAddress, courseId, courseTitle) {
  const certificate = {
    studentName,
    studentEmail,
    courseId,
    courseTitle,
    issuerName: "DataCampus",
    issuedTo: walletAddress,
    issuedAt: new Date().toISOString(),
    id: `CERT-${courseId}-${Date.now()}`
  };
  
  // Générer le hash du certificat
  const certificateString = JSON.stringify(certificate);
  const certificateHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(certificateString));
  
  // Stocker le certificat sur IPFS
  const certificateURI = await storeOnIPFS(certificate);
  
  // Créer les métadonnées
  const metadata = {
    name: `Certificat: ${certificate.courseTitle}`,
    description: `Certificat délivré à ${certificate.studentName} par DataCampus`,
    image: "ipfs://QmXXXXXXXX", // À remplacer par une vraie image
    hash: certificateHash,
    certificate: certificateURI,
    attributes: [
      { trait_type: "Course", value: certificate.courseTitle },
      { trait_type: "Student", value: certificate.studentName },
      { trait_type: "Issued At", value: certificate.issuedAt }
    ]
  };
  
  // Stocker les métadonnées sur IPFS
  const metadataURI = await storeOnIPFS(metadata);
  
  return { certificate, certificateURI, metadataURI };
}

// Fonction pour émettre un certificat
async function issueCertificate(studentData) {
  try {
    const { walletAddress, name, email, courseId, courseTitle } = studentData;
    
    // Créer le certificat et obtenir les URI
    const { metadataURI } = await createCertificate(
      name, 
      email, 
      walletAddress, 
      courseId, 
      courseTitle
    );
    
    // Émettre le certificat sur la blockchain
    console.log(`Émission du certificat pour ${name} (${walletAddress})...`);
    const tx = await contract.issueCertificate(walletAddress, metadataURI);
    const receipt = await tx.wait();
    
    console.log(`Certificat émis avec succès! Hash de transaction: ${tx.hash}`);
    return {
      success: true,
      transactionHash: tx.hash
    };
  } catch (error) {
    console.error('Erreur lors de l\'émission du certificat:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Exemple d'utilisation
// Cette fonction serait appelée par votre API lorsqu'un étudiant termine un cours
async function handleCourseCompletion(req, res) {
  const studentData = {
    walletAddress: '0x123...', // Adresse ETH de l'étudiant
    name: 'Alice Dupont',
    email: 'alice@example.com',
    courseId: 42,
    courseTitle: 'Blockchain Avancée'
  };
  
  const result = await issueCertificate(studentData);
  
  if (result.success) {
    // Mettre à jour la base de données, envoyer un email, etc.
    console.log('Certificat émis avec succès');
  } else {
    console.error('Échec de l\'émission du certificat');
  }
}

// Pour tester manuellement
// handleCourseCompletion();
```

### 5.3 Sécurité du serveur d'émission

1. **Protection des clés privées** :
   - Ne stockez JAMAIS la clé privée en clair dans le code source
   - Utilisez des variables d'environnement sécurisées
   - Considérez l'utilisation d'un service comme AWS Secrets Manager, HashiCorp Vault, etc.

2. **Limitation des privilèges** :
   - Le compte serveur ne doit avoir que les droits d'émission, pas les droits d'administrateur
   - Limitez les fonds sur ce compte au minimum nécessaire

3. **Surveillance et alertes** :
   - Mettez en place une surveillance des transactions
   - Configurez des alertes en cas d'activité anormale
   - Journalisez toutes les opérations d'émission

4. **Authentification des demandes** :
   - Sécurisez votre API avec une authentification robuste
   - N'acceptez que les demandes d'émission provenant de sources fiables

5. **Sauvegarde et récupération** :
   - Gardez une sauvegarde sécurisée de la clé privée
   - Prévoyez un processus de récupération en cas de compromission

### 5.4 Configuration d'un serveur web pour l'automatisation

Pour un déploiement complet, vous pouvez utiliser :

1. **Express.js pour l'API REST** :
   ```bash
   npm install express cors helmet
   ```

2. **Base de données pour le suivi** :
   - MongoDB, PostgreSQL, etc.

3. **Gestion des files d'attente** :
   - RabbitMQ ou Redis pour gérer les files d'attente d'émission

4. **Hébergement sécurisé** :
   - AWS, Google Cloud, Azure avec HTTPS obligatoire
   - Mise en place de pare-feu et de restrictions d'accès 