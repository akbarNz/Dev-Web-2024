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
        REFERENCES Villes(code_postal)
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


INSERT INTO Villes (code_postal, ville) VALUES
    (1000, 'Bruxelles'),
    (2000, 'Anvers'),
    (3000, 'Louvain'),
    (4000, 'Liège'),
    (5000, 'Namur'),
    (6000, 'Charleroi'),
    (8000, 'Bruges'),
    (9000, 'Gand');

INSERT INTO Proprio (nom, email, numero_telephone, verifie) VALUES
    ('Jean Dupont', 'jean.dupont@gmail.com', '+32478123456', TRUE),
    ('Marie Lambert', 'marie.lambert@outlook.be', '+32498765432', TRUE),
    ('Thomas Peeters', 'thomas.peeters@skynet.be', '+32456789012', TRUE),
    ('Sophie Dubois', 'sophie.dubois@telenet.be', '+32412345678', TRUE);

INSERT INTO Client (nom, email, numero_telephone, role, verifie) VALUES
    ('Admin Système', 'admin@studiobe.be', '+32487654321', 'admin', TRUE),
    ('Luc Janssens', 'luc.janssens@gmail.com', '+32465432109', 'artiste', TRUE),
    ('Emma Vervoort', 'emma.vervoort@hotmail.com', '+32476543210', 'artiste', TRUE),
    ('Maxime Leroy', 'maxime.leroy@gmail.com', '+32432109876', 'artiste', TRUE),
    ('Julie Maes', 'julie.maes@outlook.be', '+32454321098', 'artiste', TRUE),
    ('Nicolas Claes', 'nicolas.claes@gmail.com', '+32423456789', 'artiste', FALSE);

INSERT INTO Studio (nom, description, adresse, latitude, longitude, prix_par_heure, equipements, photo_url, proprietaire_id, statut, code_postal) VALUES
    ('Studio Bruxelles Central', 'Studio professionnel au centre de Bruxelles', '25 Rue de la Loi', 50.8466, 4.3528, 60.00, '["microphones Neumann", "console SSL", "acoustique traitée", "instruments"]', 'slkelm9y9ooushsaowro', 1, 'validé', 1000),
    
    ('Anvers Sound Lab', 'Studio moderne avec vue sur l''Escaut', '10 Meir', 51.2194, 4.4025, 45.00, '["batterie Pearl", "amplis guitare Mesa", "synthétiseurs", "micros Shure"]', 'gddjqtzra3ijqbovrzpn', 2, 'validé', 2000),
    
    ('Louvain Music Factory', 'Espace créatif pour musiciens indépendants', '15 Bondgenotenlaan', 50.8798, 4.7005, 35.00, '["piano Yamaha", "DAW Pro Tools", "isolation phonique", "monitoring Genelec"]', 'ttgsjjy7uazxob9kf2g8', 1, 'validé', 3000),
    
    ('Liège Recording', 'Studio chaleureux avec équipement vintage', '8 Rue Hors-Château', 50.6410, 5.5796, 50.00, '["préamplis à lampes", "mixeur analogique", "instruments vintage", "cabine vocale"]', 'dj0p4ravbn3erntclzu1', 3, 'validé', 4000),
    
    ('Namur Sessions', 'Studio avec ambiance cosy près de la Citadelle', '22 Rue de Fer', 50.4669, 4.8719, 40.00, '["interface UAD", "micros Audio-Technica", "clavier MIDI", "acoustique traitée"]', 'ppnt59terglxhqvflg42', 4, 'validé', 5000),
    
    ('Charleroi Urban Studio', 'Espace moderne pour productions urbaines', '5 Boulevard Tirou', 50.4108, 4.4444, 35.00, '["station de production", "boîtes à rythmes", "platines vinyle", "micros rap"]', 'lvya3ftnsjba8je6v8sq', 2, 'en attente', 6000),
    
    ('Bruges Acoustic Room', 'Studio spécialisé en musique acoustique', '12 Steenstraat', 51.2093, 3.2247, 55.00, '["piano à queue", "guitares acoustiques", "micros ribbon", "traitement acoustique premium"]', 'cgedhgdbi9tgaihlolxw', 3, 'validé', 8000),
    
    ('Gand Electronic Lab', 'Studio équipé pour musique électronique', '7 Korenmarkt', 51.0543, 3.7174, 50.00, '["synthétiseurs modulaires", "boîtes à rythmes", "DAW Ableton", "contrôleurs MIDI"]', 'r7fyxfrrtdndrcuz2i3u', 4, 'validé', 9000);

INSERT INTO Avis (client_id, studio_id, note) VALUES
    (2, 1, 5),
    (3, 1, 4),
    (4, 2, 5),
    (5, 3, 3),
    (2, 4, 5),
    (3, 5, 4),
    (5, 7, 5),
    (4, 8, 4);

INSERT INTO Reservation (client_id, studio_id, date_reservation, nbr_personne, heure_debut, heure_fin, statut, prix_total) VALUES
    (2, 1, '2024-04-20', 2, '14:00', '18:00', 'confirmée', 240.00),
    (3, 2, '2024-04-22', 3, '10:00', '14:00', 'confirmée', 180.00),
    (4, 3, '2024-04-25', 1, '16:00', '19:00', 'confirmée', 105.00),
    (5, 4, '2024-04-27', 4, '18:00', '22:00', 'confirmée', 200.00),
    (2, 5, '2024-04-30', 2, '13:00', '17:00', 'annulée', 160.00),
    (3, 7, '2024-05-05', 3, '09:00', '12:00', 'confirmée', 165.00),
    (4, 8, '2024-05-10', 1, '15:00', '19:00', 'modifiée', 200.00),
    (5, 1, '2024-05-15', 2, '17:00', '21:00', 'confirmée', 240.00);

INSERT INTO Favoris (client_id, studio_id) VALUES
    (2, 1),
    (2, 4),
    (3, 2),
    (3, 7),
    (4, 3),
    (4, 8),
    (5, 4),
    (5, 5);
