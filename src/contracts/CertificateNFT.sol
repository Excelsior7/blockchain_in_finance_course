// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title CertificateNFT
 * @dev Contrat pour l'émission de certificats sous forme de NFT
 */
contract CertificateNFT is ERC721URIStorage, Ownable {
    uint256 private _tokenCounter;
    
    // Événement émis lors de l'émission d'un certificat
    event CertificateIssued(address indexed student, uint256 indexed tokenId, string metadataURI);
    event EmitterAdded(address indexed emitter);
    event EmitterRevoked(address indexed emitter);
    event DailyLimitChanged(uint256 newLimit);
    
    // Mapping pour suivre les certificats par étudiant
    mapping(address => uint256[]) private _studentCertificates;
    
    // Mapping pour les émetteurs autorisés (pour automatisation serveur)
    mapping(address => bool) private _authorizedEmitters;
    
    // Limites quotidiennes
    uint256 public dailyLimit = 100;
    uint256 public dailyCount;
    uint256 public lastResetTime;
    
    constructor() ERC721("DataCampusCertificate", "DCC") Ownable(msg.sender) {
        _tokenCounter = 0;
        lastResetTime = block.timestamp;
    }
    
    /**
     * @dev Ajoute un émetteur autorisé pour l'automatisation serveur
     * @param emitter Adresse de l'émetteur à autoriser
     */
    function addAuthorizedEmitter(address emitter) public onlyOwner {
        require(emitter != address(0), "Invalid emitter address");
        _authorizedEmitters[emitter] = true;
        emit EmitterAdded(emitter);
    }
    
    /**
     * @dev Révoque un émetteur autorisé
     * @param emitter Adresse de l'émetteur à révoquer
     */
    function revokeEmitter(address emitter) public onlyOwner {
        _authorizedEmitters[emitter] = false;
        emit EmitterRevoked(emitter);
    }
    
    /**
     * @dev Vérifie si une adresse est un émetteur autorisé
     * @param emitter Adresse à vérifier
     * @return bool Vrai si l'adresse est un émetteur autorisé
     */
    function isAuthorizedEmitter(address emitter) public view returns (bool) {
        return _authorizedEmitters[emitter];
    }
    
    /**
     * @dev Change la limite quotidienne d'émission de certificats
     * @param newLimit Nouvelle limite quotidienne
     */
    function setDailyLimit(uint256 newLimit) public onlyOwner {
        dailyLimit = newLimit;
        emit DailyLimitChanged(newLimit);
    }
    
    /**
     * @dev Émet un certificat pour un étudiant
     * @param student Adresse de l'étudiant qui reçoit le certificat
     * @param metadataURI URI des métadonnées du certificat (sur IPFS)
     * @return tokenId L'ID du token NFT créé
     */
    function issueCertificate(address student, string memory metadataURI) public returns (uint256) {
        // Vérifier que l'appelant est autorisé (propriétaire ou émetteur autorisé)
        require(owner() == msg.sender || _authorizedEmitters[msg.sender], "Not authorized to issue certificates");
        require(student != address(0), "Invalid student address");
        
        // Vérifier/réinitialiser le compteur quotidien
        if (block.timestamp >= lastResetTime + 1 days) {
            dailyCount = 0;
            lastResetTime = block.timestamp;
        }
        
        // Vérifier la limite quotidienne
        require(dailyCount < dailyLimit, "Daily certificate issuance limit reached");
        dailyCount++;
        
        uint256 tokenId = _tokenCounter;
        _tokenCounter++;
        
        _mint(student, tokenId);
        _setTokenURI(tokenId, metadataURI);
        
        // Ajouter le certificat à la liste des certificats de l'étudiant
        _studentCertificates[student].push(tokenId);
        
        emit CertificateIssued(student, tokenId, metadataURI);
        
        return tokenId;
    }
    
    /**
     * @dev Récupère tous les certificats d'un étudiant
     * @param student Adresse de l'étudiant
     * @return Un tableau des IDs de token possédés par l'étudiant
     */
    function getStudentCertificates(address student) public view returns (uint256[] memory) {
        return _studentCertificates[student];
    }
    
    /**
     * @dev Vérifie si un étudiant possède un certificat spécifique
     * @param student Adresse de l'étudiant
     * @param tokenId ID du token à vérifier
     * @return bool Vrai si l'étudiant possède le certificat
     */
    function hasStudentCertificate(address student, uint256 tokenId) public view returns (bool) {
        return ownerOf(tokenId) == student;
    }
} 