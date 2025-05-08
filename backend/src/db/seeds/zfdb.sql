CREATE TYPE role_utilisateurs AS ENUM ('admin', 'propriétaire', 'artiste');
CREATE TYPE statut_studio AS ENUM ('en attente', 'validé', 'refusé');
CREATE TYPE statut_réservation AS ENUM ('confirmée', 'annulée', 'modifiée');

CREATE TABLE Villes (
    code_postal INTEGER PRIMARY KEY,
    ville VARCHAR NOT NULL
);

CREATE TABLE Client (
    id SERIAL PRIMARY KEY,
    nom TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    numero_telephone TEXT UNIQUE NOT NULL,
    photo_url VARCHAR(500),
    role role_utilisateurs NOT NULL DEFAULT 'artiste',
    date_inscription TIMESTAMP DEFAULT NOW(),
    verifie BOOLEAN DEFAULT FALSE,
    deux_facteur_active BOOLEAN DEFAULT FALSE
);

CREATE TABLE Proprio (
    id SERIAL PRIMARY KEY,
    nom TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    numero_telephone TEXT UNIQUE NOT NULL,
    photo_url VARCHAR(500),
     role role_utilisateurs NOT NULL DEFAULT 'propriétaire',
    date_inscription TIMESTAMP DEFAULT NOW(),
    verifie BOOLEAN DEFAULT FALSE,
    deux_facteur_active BOOLEAN DEFAULT FALSE
);

CREATE TABLE Studio (
    id SERIAL PRIMARY KEY,
    nom VARCHAR(255) NOT NULL,
    description TEXT,
    adresse VARCHAR(255),
    latitude FLOAT,
    longitude FLOAT,
    prix_par_heure DECIMAL(10,2) CHECK (prix_par_heure >= 0),
    equipements JSON,
    photo_url VARCHAR(500),
    proprietaire_id INT NOT NULL,
    statut statut_studio NOT NULL DEFAULT 'validé',
    date_creation TIMESTAMP DEFAULT NOW(),
    code_postal INTEGER,
    CONSTRAINT fk_proprietaire FOREIGN KEY (proprietaire_id) 
        REFERENCES Proprio(id) ON DELETE CASCADE,
    CONSTRAINT fk_studios_villes FOREIGN KEY (code_postal) 
        REFERENCES Villes(code_postal) ON DELETE RESTRICT
);

CREATE TABLE Avis (
    id SERIAL PRIMARY KEY,
    client_id INT NOT NULL,
    studio_id INT NOT NULL,
    note INT CHECK (note >= 1 AND note <= 5),
    date_creation TIMESTAMP DEFAULT NOW(),
    CONSTRAINT fk_client FOREIGN KEY (client_id) 
        REFERENCES Client(id) ON DELETE CASCADE,
    CONSTRAINT fk_studio FOREIGN KEY (studio_id) 
        REFERENCES Studio(id) ON DELETE CASCADE
);

CREATE TABLE Reservation (
    id SERIAL PRIMARY KEY,
    client_id INT NOT NULL,
    studio_id INT NOT NULL,
    date_reservation DATE,
    nbr_personne INT NOT NULL,
    heure_debut TIME,
    heure_fin TIME,
    statut statut_réservation NOT NULL DEFAULT 'confirmée',
    prix_total DECIMAL(10,2),
    CONSTRAINT fk_client FOREIGN KEY (client_id) 
        REFERENCES Client(id) ON DELETE CASCADE,
    CONSTRAINT fk_studio FOREIGN KEY (studio_id) 
        REFERENCES Studio(id) ON DELETE CASCADE
);

CREATE TABLE Favoris (
    client_id INT NOT NULL,
    studio_id INT NOT NULL,
    date_ajout TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (client_id, studio_id),
    CONSTRAINT fk_client FOREIGN KEY (client_id) 
        REFERENCES Client(id) ON DELETE CASCADE,
    CONSTRAINT fk_studio FOREIGN KEY (studio_id) 
        REFERENCES Studio(id) ON DELETE CASCADE
);
