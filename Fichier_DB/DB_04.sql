create TYPE role_utilisateurs as ENUM ('admin', 'propriétaire', 'artiste');

CREATE TABLE Utilisateurs (
    id SERIAL PRIMARY KEY,
    nom TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    numero_telephone TEXT UNIQUE NOT NULL,
    photo_profil_url VARCHAR(500),
    role role_utilisateurs NOT NULL DEFAULT 'artiste',
    date_inscription TIMESTAMP DEFAULT NOW(),
    verifie BOOLEAN DEFAULT FALSE,
    deux_facteur_active BOOLEAN DEFAULT FALSE
);

CREATE TABLE Villes (
    code_postal INTEGER PRIMARY KEY,
    ville VARCHAR NOT NULL
);

CREATE TYPE statut_studio AS ENUM ('en attente', 'validé', 'refusé');

CREATE TABLE Studios (
    id SERIAL PRIMARY KEY,
    nom VARCHAR(255) NOT NULL,
    description TEXT,
    adresse VARCHAR(255),
    latitude FLOAT,
    longitude FLOAT,
    prix_par_heure DECIMAL(10,2) CHECK (prix_par_heure >= 0),  
    equipements JSON,
    photo_url VARCHAR(500),
    proprietaire_id SERIAL NOT NULL, 
    statut statut_studio NOT NULL DEFAULT 'validé',  
    date_creation TIMESTAMP DEFAULT NOW(),
code_postal INTEGER,
    CONSTRAINT fk_proprietaire FOREIGN KEY (proprietaire_id) 
     REFERENCES Utilisateurs(id) ON DELETE CASCADE,
CONSTRAINT fk_studios_villes FOREIGN KEY (code_postal) REFERENCES villes(code_postal)
);

CREATE TABLE Messages(
id SERIAL Primary KEY,
expediteur_id INT NOT NULL,
destinataire_id INT NOT NULL,
contenu TEXT,
date_envoi TIMESTAMP DEFAULT NOW(),
lu BOOLEAN DEFAULT FALSE, 
Constraint fk_envoie FOREIGN KEY(expediteur_id) REFERENCES Utilisateurs(id) ON DELETE CASCADE,
Constraint fk_recoit FOREIGN KEY(destinataire_id) REFERENCES Utilisateurs(id) ON DELETE CASCADE
);


CREATE TABLE Avis (
    id SERIAL PRIMARY KEY,
    artiste_id INT REFERENCES Utilisateurs(id) ON DELETE CASCADE,
    studio_id INT REFERENCES Studios(id) ON DELETE CASCADE,
    note INT CHECK (note >= 1 AND note <= 5),
    commentaire TEXT,
    date_creation TIMESTAMP DEFAULT NOW()
);


CREATE TYPE statut_réservation AS ENUM ('confirmée', 'annulée', 'modifiée');

CREATE TABLE Reservations (
    id SERIAL PRIMARY KEY,
    artiste_id INT REFERENCES Utilisateurs(id) ON DELETE CASCADE,
    studio_id INT REFERENCES Studios(id) ON DELETE CASCADE,
    date_reservation DATE, -- Date de réservation (sans heure)
	nbr_personne INT NOT NULL, -- Nombre de personnes (obligatoire)
    heure_debut TIME, -- Heure de début (sans date)
    heure_fin TIME, -- Heure de fin (sans date)
    statut statut_réservation NOT NULL DEFAULT 'confirmée',
    prix_total DECIMAL
);


Create TYPE type_notif as ENUM ('reservation', 'paiement', 'avis', 'administratif');

CREATE TABLE Notifications (
    id SERIAL PRIMARY KEY, 
    utilisateur_id INT NOT NULL, 
    type type_notif NOT NULL DEFAULT 'reservation',
    message TEXT,
    date_envoi TIMESTAMP DEFAULT NOW(),
    vu BOOLEAN DEFAULT FALSE,
    CONSTRAINT fk_utilisateur FOREIGN KEY (utilisateur_id) REFERENCES Utilisateurs(id) ON DELETE CASCADE
);


CREATE TABLE Favoris (
    id SERIAL PRIMARY KEY,
    artiste_id INT REFERENCES Utilisateurs(id) ON DELETE CASCADE,
    studio_id INT REFERENCES Studios(id) ON DELETE CASCADE,
    date_ajout TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO Villes (code_postal, ville) VALUES
  (75001, 'Paris'),
  (69001, 'Lyon'),
  (13001, 'Marseille');

INSERT INTO Utilisateurs (nom, email, numero_telephone, role, verifie, deux_facteur_active)
VALUES 
  ('Admin', 'admin@example.com', '32468314567', 'admin', TRUE, FALSE),
  ('Propriétaire 1', 'prop1@example.com', '32468894567', 'propriétaire', TRUE, FALSE),
  ('Propriétaire 2', 'prop2@example.com', '32468004567', 'propriétaire', TRUE, FALSE),
  ('Artiste 1', 'artiste1@example.com', '32468314500', 'artiste', TRUE, FALSE),
  ('Artiste 2', 'artiste2@example.com', '32460014567', 'artiste', TRUE, FALSE);


INSERT INTO Studios (nom, description, adresse, latitude, longitude, prix_par_heure, equipements, photo_url, proprietaire_id, statut, code_postal)
VALUES 
  ('Studio Paris 1', 'Studio moderne au centre de Paris', '10 Rue de Paris', 48.8566, 2.3522, 50.00, '["micro", "mixer", "enceintes"]', 'studio1.jpg', 2, 'validé', 75001),
  ('Studio Lyon', 'Un studio bien équipé à Lyon', '15 Rue de Lyon', 45.7640, 4.8357, 40.00, '["piano", "batterie", "enceintes"]', 'studio2.jpg', 2, 'validé', 69001),
  ('Studio Marseille', 'Studio avec une vue sur la mer', '20 Rue de Marseille', 43.2965, 5.3698, 45.00, '["synthé", "mixer", "enceintes"]', 'studio3.jpg', 3, 'validé', 13001);

INSERT INTO Avis (artiste_id, studio_id, note, commentaire)
VALUES 
  (4, 1, 5, 'Super studio, très bien équipé !'),
  (5, 1, 4, 'Très bon mais un peu cher.'),
  (4, 2, 3, 'Bien mais manque du matériel.'),
  (5, 3, 5, 'Top qualité et très belle vue !');

INSERT INTO Reservations (artiste_id, studio_id, date_reservation, nbr_personne, heure_debut, heure_fin, statut, prix_total)
VALUES 
  (4, 1, '2024-03-15', 3, '10:00', '12:00', 'confirmée', 100.00),
  (5, 2, '2024-03-16', 2, '14:00', '16:00', 'confirmée', 80.00),
  (4, 3, '2024-03-17', 4, '18:00', '20:00', 'annulée', 90.00);

INSERT INTO Favoris (artiste_id, studio_id)
VALUES 
  (4, 1),
  (5, 3);

INSERT INTO Messages (expediteur_id, destinataire_id, contenu)
VALUES 
  (4, 2, 'Bonjour, est-ce que le studio est disponible demain ?'),
  (2, 4, 'Oui, vous pouvez réserver.');

INSERT INTO Notifications (utilisateur_id, type, message, vu)
VALUES 
  (4, 'reservation', 'Votre réservation a été confirmée.', FALSE),
  (5, 'paiement', 'Votre paiement a été reçu.', TRUE);
