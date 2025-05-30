# Blockchain Certification Project

## 🎯 Project Objective

This project implements a blockchain-based certification system for educational institutions. The system leverages blockchain technology to issue tamper-proof digital certificates as NFTs (Non-Fungible Tokens), ensuring credential authenticity and allowing graduates to own their credentials permanently on the blockchain.

## 💡 Key Features

- **Digital Certificate Creation**: Generate digital certificates with unique identifiers
- **Blockchain Verification**: Store certificate hashes on Ethereum blockchain for tamper-proof verification
- **IPFS Storage**: Store certificate content on IPFS for decentralized, permanent access
- **Student Ownership**: Issue certificates as NFTs directly to students' Ethereum wallets
- **Public Verification**: Allow anyone to verify the authenticity of certificates through the web interface

## 🔧 Technical Architecture

### Technology Stack

- **Frontend**: React.js with Tailwind CSS for responsive UI
- **Blockchain**: Ethereum (Sepolia testnet) for smart contract deployment
- **Smart Contracts**: Solidity (ERC-721 NFT standard)
- **Decentralized Storage**: IPFS via Pinata API
- **Web3 Integration**: ethers.js for blockchain interaction

### System Components

1. **Student Registration Module**: Collects and validates student information
2. **Certificate Generation System**: Creates certificate JSON/PDF and generates cryptographic hash
3. **IPFS Integration**: Uploads and pins certificate data to IPFS
4. **Smart Contract**: Issues NFT certificates to student Ethereum addresses
5. **Verification Interface**: Public-facing tool to verify certificate authenticity

## 🔄 Workflow

1. **Student Registration**:
   - Student provides personal information and Ethereum wallet address
   - System validates identity and eligibility

2. **Certificate Creation**:
   - Upon course completion, system generates a digital certificate with metadata
   - Certificate is hashed using SHA-256 algorithm

3. **Blockchain Storage**:
   - Certificate metadata and hash are uploaded to IPFS
   - IPFS returns a unique CID (Content Identifier)

4. **NFT Issuance**:
   - Smart contract mints a new NFT with the IPFS URI
   - NFT is transferred to the student's Ethereum wallet

5. **Verification**:
   - Anyone can verify a certificate by providing the NFT ID or student wallet address
   - System retrieves certificate from IPFS and validates its hash against blockchain records

## 🚀 Getting Started

### Prerequisites

- Node.js (v14+)
- MetaMask or similar Ethereum wallet
- Ethereum testnet (Sepolia) tokens for gas fees

### Configuration

Create a `.env` file at the root of the project with:

```
# Blockchain Configuration
REACT_APP_CONTRACT_ADDRESS=0x1234567890123456789012345678901234567890
REACT_APP_NETWORK=sepolia

# Pinata Configuration (IPFS)
REACT_APP_PINATA_API_KEY=your_pinata_api_key
REACT_APP_PINATA_SECRET_KEY=your_pinata_secret_key
REACT_APP_PINATA_JWT=your_pinata_jwt
```

#### Blockchain Setup

1. The `CONTRACT_ADDRESS` must point to your deployed ERC-721 smart contract on the Sepolia network.
2. The contract implements the function `issueCertificate(address student, string memory metadataURI)`.

#### Pinata (IPFS) Setup

1. Create an account on [Pinata](https://app.pinata.cloud/).
2. Obtain API keys and JWT from your Pinata account.
3. Add these keys to your `.env` file.

### Installation

```bash
npm install
```

### Running the Application

```bash
npm start
```

## 📝 Smart Contract

The project uses an ERC-721 contract for certificate NFTs. Key functions include:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract CertificateNFT is ERC721URIStorage, Ownable {
    uint256 public tokenCounter;

    constructor() ERC721("EduCertificate", "CERT") {
        tokenCounter = 0;
    }

    function issueCertificate(address student, string memory metadataURI) public onlyOwner {
        uint256 tokenId = tokenCounter;
        _safeMint(student, tokenId);
        _setTokenURI(tokenId, metadataURI);
        tokenCounter++;
    }
}
```

## 🔒 Privacy TODO

For a production-ready application, the following privacy features would need to be implemented:

- **GDPR Compliance**: Currently not implemented, but required for handling EU student data
- **Data Minimization**: Implement storage of only necessary data on-chain
- **Consent Management**: Add mechanisms for students to provide and revoke consent
- **Right to be Forgotten**: Design a solution for certificate revocation or metadata updates
- **Data Security**: Implement encryption for sensitive data stored off-chain

## 📚 Further Development

- Multi-signature certification for additional security
- Integration with decentralized identity solutions
- Mobile application for certificate management
- Integration with job marketplaces and credential verification services

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).
