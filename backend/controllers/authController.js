const pool = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'dev_projet';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';

// Inscription client
exports.registerClient = async (req, res) => {
  try {
    const { nom, email, numero_telephone, mot_de_passe } = req.body;

    // Vérifier si l'email existe déjà
    const emailCheck = await pool.query('SELECT * FROM Client WHERE email = $1', [email]);
    if (emailCheck.rows.length > 0) {
      return res.status(400).json({ message: 'Cet email est déjà utilisé' });
    }

    // Hasher le mot de passe
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(mot_de_passe, salt);

    // Insérer le nouvel utilisateur
    const result = await pool.query(
      'INSERT INTO Client (nom, email, numero_telephone, mot_de_passe, role) VALUES ($1, $2, $3, $4, $5) RETURNING id, nom, email, role, photo_url',
      [nom, email, numero_telephone, hashedPassword, 'artiste']
    );

    // Créer et signer le token JWT
    const token = jwt.sign(
      { id: result.rows[0].id, email: result.rows[0].email, role: result.rows[0].role, type: 'client' },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.status(201).json({
      message: 'Client enregistré avec succès',
      token,
      user: {
        id: result.rows[0].id,
        nom: result.rows[0].nom,
        email: result.rows[0].email,
        role: result.rows[0].role,
        photo_url: result.rows[0].photo_url,
        type: 'client'
      }
    });
  } catch (error) {
    console.error('Erreur lors de l\'inscription du client:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Inscription propriétaire
exports.registerProprio = async (req, res) => {
  try {
    const { nom, email, numero_telephone, mot_de_passe } = req.body;

    // Vérifier si l'email existe déjà
    const emailCheck = await pool.query('SELECT * FROM Proprio WHERE email = $1', [email]);
    if (emailCheck.rows.length > 0) {
      return res.status(400).json({ message: 'Cet email est déjà utilisé' });
    }

    // Hasher le mot de passe
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(mot_de_passe, salt);

    // Insérer le nouvel utilisateur
    const result = await pool.query(
      'INSERT INTO Proprio (nom, email, numero_telephone, mot_de_passe, role) VALUES ($1, $2, $3, $4, $5) RETURNING id, nom, email, role, photo_url',
      [nom, email, numero_telephone, hashedPassword, 'propriétaire']
    );

    // Créer et signer le token JWT
    const token = jwt.sign(
      { id: result.rows[0].id, email: result.rows[0].email, role: result.rows[0].role, type: 'proprio' },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.status(201).json({
      message: 'Propriétaire enregistré avec succès',
      token,
      user: {
        id: result.rows[0].id,
        nom: result.rows[0].nom,
        email: result.rows[0].email,
        role: result.rows[0].role,
        photo_url: result.rows[0].photo_url,
        type: 'proprio'
      }
    });
  } catch (error) {
    console.error('Erreur lors de l\'inscription du propriétaire:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Connexion (client et proprio)
exports.login = async (req, res) => {
  try {
    const { email, mot_de_passe, type } = req.body;

    let userQuery;
    let tableName;

    if (type === 'client') {
      tableName = 'Client';
    } else if (type === 'proprio') {
      tableName = 'Proprio';
    } else {
      return res.status(400).json({ message: 'Type d\'utilisateur invalide' });
    }

    // Rechercher l'utilisateur
    userQuery = await pool.query(`SELECT * FROM ${tableName} WHERE email = $1`, [email]);

    if (userQuery.rows.length === 0) {
      return res.status(400).json({ message: 'Email ou mot de passe incorrect' });
    }

    const user = userQuery.rows[0];

    // Vérifier le mot de passe
    const validPassword = await bcrypt.compare(mot_de_passe, user.mot_de_passe);
    if (!validPassword) {
      return res.status(400).json({ message: 'Email ou mot de passe incorrect' });
    }

    // Créer et signer le token JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, type },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.json({
      message: 'Connexion réussie',
      token,
      user: {
        id: user.id,
        nom: user.nom,
        email: user.email,
        role: user.role,
        photo_url: user.photo_url,
        type
      }
    });
  } catch (error) {
    console.error('Erreur lors de la connexion:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Vérifier le token et récupérer les informations utilisateur
exports.getCurrentUser = async (req, res) => {
  try {
    // Si on arrive ici, c'est que le middleware d'authentification a validé le token
    // req.user contient les informations du token décodé
    
    if (!req.user) {
      return res.status(401).json({ message: 'Non authentifié' });
    }
    
    // Récupérer les informations de l'utilisateur
    let userQuery;
    if (req.user.type === 'client') {
      userQuery = await pool.query(
        'SELECT id, nom, email, role, photo_url FROM Client WHERE id = $1', 
        [req.user.id]
      );
    } else if (req.user.type === 'proprio') {
      userQuery = await pool.query(
        'SELECT id, nom, email, role, photo_url FROM Proprio WHERE id = $1', 
        [req.user.id]
      );
    } else {
      return res.status(400).json({ message: 'Type d\'utilisateur invalide' });
    }

    if (userQuery.rows.length === 0) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    const user = userQuery.rows[0];
    
    res.json({
      user: {
        ...user,
        type: req.user.type
      }
    });
  } catch (error) {
    console.error('Erreur lors de la vérification du token:', error);
    res.status(401).json({ message: 'Token invalide' });
  }
};