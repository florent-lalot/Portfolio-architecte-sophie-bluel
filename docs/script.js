// 2.2 Vérifier si l'utilisateur est connecté
const token = localStorage.getItem("token");

if (token) {
  document.body.classList.add("admin-connecte");

  // Activer le mode édition
  document.querySelector(".bouton-modifier").style.display = "block";

  // Masquer les filtres
  const filtres = document.getElementById("filtres");
  if (filtres) filtres.style.display = "none";

  // Bandeau "Mode édition"
  const banniereEdition = document.querySelector(".banniere-edition");
  if (banniereEdition) banniereEdition.style.display = "flex";
}

// 2.2 Activer le mode connecté dans le menu
const itemConnexion = document.getElementById("menu-login");

if (token) {
  itemConnexion.textContent = "logout";

  itemConnexion.addEventListener("click", () => {
    localStorage.removeItem("token");
    window.location.reload();
  });
}

// 1.1 Fonction qui récupère les travaux depuis le back-end
async function recupererTravaux() {
  const reponse = await fetch("http://localhost:5678/api/works");
  return await reponse.json();
}

// 1.2 Fonction qui récupère les catégories depuis l'API
async function recupererCategories() {
  const reponse = await fetch("http://localhost:5678/api/categories");
  return await reponse.json();
}

// 1.1 Fonction qui affiche les travaux dans la galerie principale
function afficherGalerie(travaux) {
  const galerie = document.getElementById("galerie");
  galerie.innerHTML = "";

  travaux.forEach((travail) => {
    const figure = document.createElement("figure");

    const image = document.createElement("img");
    image.src = travail.imageUrl;
    image.alt = travail.title;

    const legende = document.createElement("figcaption");
    legende.textContent = travail.title;

    figure.appendChild(image);
    figure.appendChild(legende);
    galerie.appendChild(figure);
  });
}

// 1.2 Fonction qui génère les filtres
function genererFiltres(categories) {
  const conteneurFiltres = document.getElementById("filtres");
  conteneurFiltres.innerHTML = "";

  // Bouton "Tous"
  const boutonTous = document.createElement("button");
  boutonTous.textContent = "Tous";

  boutonTous.addEventListener("click", async () => {
    const travaux = await recupererTravaux(); // ⭐ récupéré ici
    afficherGalerie(travaux);

    document
      .querySelectorAll("#filtres button")
      .forEach((b) => b.classList.remove("actif"));
    boutonTous.classList.add("actif");
  });

  conteneurFiltres.appendChild(boutonTous);

  // Boutons des catégories
  categories.forEach((categorie) => {
    const bouton = document.createElement("button");
    bouton.textContent = categorie.name;

    bouton.addEventListener("click", async () => {
      const travaux = await recupererTravaux();

      const travauxFiltres = travaux.filter(
        (travail) => travail.category.id === categorie.id,
      );

      afficherGalerie(travauxFiltres);

      document
        .querySelectorAll("#filtres button")
        .forEach((b) => b.classList.remove("actif"));
      bouton.classList.add("actif");
    });

    conteneurFiltres.appendChild(bouton);
  });
}

// 1.1 Initialisation
(async function init() {
  const travaux = await recupererTravaux();
  const categories = await recupererCategories();
  afficherGalerie(travaux);
  genererFiltres(categories);
})();

// 3.1 Sélection des éléments de la modale
const modale = document.getElementById("modale");
const fondModale = document.getElementById("fond-modale");
const boutonModifier = document.querySelector(".bouton-modifier");
const boutonFermerModale = document.getElementById("fermer-modale");

// 3.1 Vues modale
const vueGalerie = document.getElementById("vue-galerie");
const vueAjout = document.getElementById("vue-ajout");

// 3.1 Ouvrir la modale
function ouvrirModale() {
  modale.classList.remove("cache");
  fondModale.classList.remove("cache");
  document.body.style.overflow = "hidden";

  // Toujours revenir sur la vue galerie
  vueAjout.classList.add("cache");
  vueGalerie.classList.remove("cache");

  afficherGalerieModale();
}

// 3.1 Fermer la modale
function fermerModale() {
  modale.classList.add("cache");
  fondModale.classList.add("cache");
  document.body.style.overflow = "";

  // Réinitialiser les champs
  champPhotoInput.value = "";
  champTitre.value = "";
  champCategorie.value = "";

  // Restaurer le contenu initial de la zone d'ajout
  zoneAjoutPhoto.innerHTML = `
    <i class="fa-regular fa-image"></i>
    <p>+ Ajouter photo</p>
    <span>jpg, png : 4mo max</span>
  `;
}

// 3.1 Écouteurs d'événements
boutonModifier.addEventListener("click", ouvrirModale);
boutonFermerModale.addEventListener("click", fermerModale);
fondModale.addEventListener("click", fermerModale);

// Passage à la vue Ajout
document
  .getElementById("bouton-ajouter-photo")
  .addEventListener("click", () => {
    vueGalerie.classList.add("cache");
    vueAjout.classList.remove("cache");
  });

// Retour à la galerie
document.getElementById("retour-galerie").addEventListener("click", () => {
  vueAjout.classList.add("cache");
  vueGalerie.classList.remove("cache");
});
// Déclencher l'ouverture du champ file en cliquant sur la zone
const zoneAjoutPhoto = document.querySelector(".zone-ajout-photo");
const champPhotoInput = document.getElementById("champ-photo");

zoneAjoutPhoto.addEventListener("click", () => {
  champPhotoInput.click();
});

// 3.3 Afficher l'aperçu de l'image choisie
champPhotoInput.addEventListener("change", () => {
  const fichier = champPhotoInput.files[0];
  if (!fichier) return;

  const lecteur = new FileReader();
  lecteur.onload = (e) => {
    zoneAjoutPhoto.innerHTML = "";

    const imgPreview = document.createElement("img");
    imgPreview.src = e.target.result;
    imgPreview.alt = "Aperçu de la photo";
    imgPreview.style.width = "100%";
    imgPreview.style.height = "100%";
    imgPreview.style.objectFit = "contain";
    imgPreview.style.pointerEvents = "none";

    zoneAjoutPhoto.appendChild(imgPreview);
  };

  lecteur.readAsDataURL(fichier);
});

// 3.1 Affichage des travaux dans la modale
async function afficherGalerieModale() {
  const travaux = await recupererTravaux();
  const galerieModale = document.getElementById("galerie-modale");

  galerieModale.innerHTML = "";

  travaux.forEach((travail) => {
    const figure = document.createElement("figure");
    figure.classList.add("miniature-modale");

    const img = document.createElement("img");
    img.src = travail.imageUrl;
    img.alt = travail.title;

    const boutonSupprimer = document.createElement("button");
    boutonSupprimer.classList.add("bouton-supprimer");
    boutonSupprimer.innerHTML = '<i class="fa-solid fa-trash-can"></i>';

    // 3.2 Suppression d'un projet
    boutonSupprimer.addEventListener("click", async () => {
      const token = localStorage.getItem("token");

      const reponse = await fetch(
        `http://localhost:5678/api/works/${travail.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (reponse.ok) {
        const nouveauxTravaux = await recupererTravaux();
        afficherGalerie(nouveauxTravaux);
        afficherGalerieModale();
      } else {
        console.error("Erreur lors de la suppression :", reponse.status);
      }
    });

    figure.appendChild(img);
    figure.appendChild(boutonSupprimer);
    galerieModale.appendChild(figure);
  });
}

// 3.3 Formulaire d'ajout
const formulaireAjout = document.getElementById("formulaire-ajout-photo");
const champTitre = document.getElementById("champ-titre");
const champCategorie = document.getElementById("champ-categorie");
const boutonValider = document.getElementById("bouton-valider-ajout");

// 3.3 Vérification des champs
function verifierChamps() {
  const imageOK = champPhotoInput.files.length > 0;
  const titreOK = champTitre.value.trim() !== "";
  const categorieOK = champCategorie.value !== "";

  if (imageOK && titreOK && categorieOK) {
    boutonValider.disabled = false;
    boutonValider.classList.add("actif");
  } else {
    boutonValider.disabled = true;
    boutonValider.classList.remove("actif");
  }
}

champPhotoInput.addEventListener("change", verifierChamps);
champTitre.addEventListener("input", verifierChamps);
champCategorie.addEventListener("change", verifierChamps);

const messageErreur = document.createElement("p");
messageErreur.style.color = "red";
messageErreur.style.marginTop = "10px";
formulaireAjout.appendChild(messageErreur);

// Remplir les catégories Modale ajout au chargement de la page
async function remplirCategories() {
  const travaux = await recupererTravaux();
  const categories = [];

  travaux.forEach((t) => {
    if (!categories.includes(t.category.id)) {
      categories.push(t.category.id);

      const option = document.createElement("option");
      option.value = t.category.id;
      option.textContent = t.category.name;

      champCategorie.appendChild(option);
    }
  });
}
remplirCategories();

// 3.3 Soumission du formulaire
formulaireAjout.addEventListener("submit", async (e) => {
  e.preventDefault();

  if (!champPhotoInput.files[0] || !champTitre.value || !champCategorie.value) {
    messageErreur.textContent = "Veuillez remplir tous les champs.";
    return;
  }

  messageErreur.textContent = "";

  const token = localStorage.getItem("token");

  // 3.3 Préparer les données à envoyer
  const formData = new FormData();
  formData.append("image", champPhotoInput.files[0]);
  formData.append("title", champTitre.value);
  formData.append("category", champCategorie.value);

  const reponse = await fetch("http://localhost:5678/api/works", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  // 3.4 Vérification de la réponse
  if (reponse.ok) {
    const nouveauTravail = await reponse.json();

    const travaux = await recupererTravaux();
    afficherGalerie(travaux);

    fermerModale();
  } else {
    messageErreur.textContent = "Erreur lors de l'envoi.";
  }
});
