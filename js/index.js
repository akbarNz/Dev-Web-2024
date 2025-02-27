let affi = ""; // Initialisation de la variable affi

async function getData() {
    try {
        const response = await fetch("http://localhost:5001/messages");
        if (!response.ok) throw new Error("Erreur de récupération des messages");

        const data = await response.json();
        console.log("Données reçues :", data);

        // Boucle à travers les données
        for (let i of data) {
            affi += i.texte; // Ajoute le texte à la variable affi
        }

        document.getElementById('remplace').innerHTML = affi; // Affiche le texte dans l'élément HTML
    } catch (error) {
        console.error(error);
        alert("Erreur lors de la récupération des messages !");
    }
}

async function sendData() {
    const message = prompt("Entrez votre message :");
    if (!message) return;

    try {
        const response = await fetch("http://localhost:5001/messages", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: message })
        });

        if (!response.ok) throw new Error("Erreur lors de l'envoi du message");

        alert("Message ajouté !");
        getData();
    } catch (error) {
        console.error(error);
        alert("Impossible d'envoyer le message.");
    }
}