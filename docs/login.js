// 2.2 Sélection du formulaire de connexion
const formulaireConnexion = document.getElementById("formulaire-connexion");

// Écoute de l'événement "submit"
formulaireConnexion.addEventListener("submit", async function (event) {
  event.preventDefault();

  // Récupération des valeurs
  const email = document.getElementById("champ-email").value;
  const motDePasse = document.getElementById("champ-motdepasse").value;

  // Données envoyées au serveur
  const donnees = {
    email: email,
    password: motDePasse,
  };

  try {
    // Requête POST vers l'API
    const reponse = await fetch("http://localhost:5678/api/users/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(donnees),
    });

    const resultat = await reponse.json();

    if (reponse.ok) {
      // Stockage du token
      localStorage.setItem("token", resultat.token);

      // Redirection vers l'accueil
      window.location.href = "index.html";
    } else {
      afficherErreur("Email ou mot de passe incorrect.");
    }
  } catch (erreur) {
    afficherErreur("Impossible de contacter le serveur.");
  }
});

// Affichage des erreurs
function afficherErreur(message) {
  const zoneErreur = document.getElementById("erreur-connexion");
  zoneErreur.textContent = message;
}
