const express = require("express");
const { Pool } = require("pg");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(cors());

// Configuration de PostgreSQL
const pool = new Pool({
    user: "postgres",
    host: "localhost",
    database: "Projet",
    password: "Pendragon",
    port: 5432,
});

// Route pour récupérer les données
app.get("/messages", async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM Hello");
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send("Erreur serveur");
    }
});

// Route pour insérer un message
app.post("/messages", async (req, res) => {
    console.log("Requête reçue :", req.body); 
    const text = req.body.text;

    if (!text) {
        return res.status(400).send("Le champ texte est requis.");
    }

    try {
        await pool.query("INSERT INTO Hello (texte) VALUES ($1)", [text]);
        res.status(201).send("Message ajouté !");
    } catch (err) {
        console.error(err);
        res.status(500).send("Erreur serveur");
    }
});

// Démarrer le serveur
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    console.log(`Serveur lancé sur http://localhost:${PORT}`);
});