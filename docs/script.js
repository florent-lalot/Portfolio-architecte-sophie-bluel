/******************************************************
 * 2.2) MODE ADMIN — affiché UNE SEULE FOIS
 ******************************************************/

// On récupère le token pour savoir si l'utilisateur est connecté
const token = localStorage.getItem("token");

/**
 * Fonction exécutée UNE SEULE FOIS.
 * Elle active le mode admin sans jamais être rappelée,
 * ce qui évite tout "flash" du bandeau lors des mises à jour du DOM.
 */
function activerModeAdminUneFois() {
  document.body.classList.add("admin-connecte");

  // Affichage du bouton "modifier"
  const boutonModifier = document.querySelector(".bouton-modifier");
  if (boutonModifier) boutonModifier.style.display = "block";

  // Masquer les filtres en mode admin
  const filtres = document.getElementById("filtres");
  if (filtres) filtres.style.display = "none";

  // Affichage du bandeau "Mode édition"
  const banniereEdition = document.querySelector(".banniere-edition");
  if (banniereEdition) banniereEdition.style.display = "flex";
}

// Activation du mode admin une seule fois
if (token) activerModeAdminUneFois();

/******************************************************
 * 2.2) MENU LOGIN / LOGOUT
 ******************************************************/

const itemConnexion = document.getElementById("menu-login");

if (token) {
  itemConnexion.textContent = "logout";

  itemConnexion.addEventListener("click", () => {
    localStorage.removeItem("token");
    window.location.reload();
  });
}

/******************************************************
 * 1) FONCTIONS API
 ******************************************************/

// 1.1 Récupération des travaux
async function recupererTravaux() {
  const reponse = await fetch("http://localhost:5678/api/works");
  return await reponse.json();
}

// 1.2 Récupération des catégories
async function recupererCategories() {
  const reponse = await fetch("http://localhost:5678/api/categories");
  return await reponse.json();
}

/******************************************************
 * 1.1) AFFICHAGE DE LA GALERIE PRINCIPALE
 ******************************************************/

function afficherGalerie(travaux) {
  const galerie = document.getElementById("galerie");
  galerie.innerHTML = ""; // On vide la galerie

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

/******************************************************
 * 1.2) FILTRES
 ******************************************************/

function genererFiltres(categories) {
  const conteneurFiltres = document.getElementById("filtres");
  conteneurFiltres.innerHTML = "";

  // Bouton "Tous"
  const boutonTous = document.createElement("button");
  boutonTous.textContent = "Tous";

  boutonTous.addEventListener("click", async () => {
    const travaux = await recupererTravaux();
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

/******************************************************
 * 1.1) INITIALISATION
 ******************************************************/

(async function init() {
  const travaux = await recupererTravaux();
  const categories = await recupererCategories();

  afficherGalerie(travaux);
  genererFiltres(categories);
})();

/******************************************************
 * 3.1) MODALE
 ******************************************************/

const modale = document.getElementById("modale");
const fondModale = document.getElementById("fond-modale");
const boutonModifier = document.querySelector(".bouton-modifier");
const boutonFermerModale = document.getElementById("fermer-modale");

const vueGalerie = document.getElementById("vue-galerie");
const vueAjout = document.getElementById("vue-ajout");

// Ouvrir la modale
function ouvrirModale() {
  modale.classList.remove("cache");
  fondModale.classList.remove("cache");
  document.body.style.overflow = "hidden";

  vueAjout.classList.add("cache");
  vueGalerie.classList.remove("cache");

  afficherGalerieModale();

  // Bouton "Ajouter une photo"
  document.getElementById("bouton-ajouter-photo").onclick = () => {
    vueGalerie.classList.add("cache");
    vueAjout.classList.remove("cache");
  };

  // Bouton "retour"
  document.getElementById("retour-galerie").onclick = () => {
    vueAjout.classList.add("cache");
    vueGalerie.classList.remove("cache");
  };
}
// Fermer la modale
function fermerModale() {
  modale.classList.add("cache");
  fondModale.classList.add("cache");
  document.body.style.overflow = "";

  // Réinitialisation des champs
  champPhotoInput.value = "";
  champTitre.value = "";
  champCategorie.value = "";

  zoneAjoutPhoto.innerHTML = `
    <i class="fa-regular fa-image"></i>
    <p>+ Ajouter photo</p>
    <span>jpg, png : 4mo max</span>
  `;
}

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

/******************************************************
 * 3.1) GALERIE MODALE
 ******************************************************/

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

    // 3.2 Suppression : on retire la miniature localement
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
        // On retire la miniature de la modale
        figure.remove();

        // On rafraîchit uniquement la galerie principale
        const nouveauxTravaux = await recupererTravaux();
        afficherGalerie(nouveauxTravaux);
      }
    });

    figure.appendChild(img);
    figure.appendChild(boutonSupprimer);
    galerieModale.appendChild(figure);
  });
}

/******************************************************
 * 3.3) AJOUT DE PHOTO
 ******************************************************/

const formulaireAjout = document.getElementById("formulaire-ajout-photo");
const champTitre = document.getElementById("champ-titre");
const champCategorie = document.getElementById("champ-categorie");
const boutonValider = document.getElementById("bouton-valider-ajout");

const zoneAjoutPhoto = document.querySelector(".zone-ajout-photo");
const champPhotoInput = document.getElementById("champ-photo");

// Aperçu image
zoneAjoutPhoto.addEventListener("click", () => champPhotoInput.click());

champPhotoInput.addEventListener("change", () => {
  const fichier = champPhotoInput.files[0];
  if (!fichier) return;

  const lecteur = new FileReader();
  lecteur.onload = (e) => {
    zoneAjoutPhoto.innerHTML = "";

    const imgPreview = document.createElement("img");
    imgPreview.src = e.target.result;
    imgPreview.style.width = "100%";
    imgPreview.style.height = "100%";
    imgPreview.style.objectFit = "contain";

    zoneAjoutPhoto.appendChild(imgPreview);
  };

  lecteur.readAsDataURL(fichier);
});

// Vérification des champs
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

// Message d'erreur
const messageErreur = document.createElement("p");
messageErreur.style.color = "red";
messageErreur.style.marginTop = "10px";
formulaireAjout.appendChild(messageErreur);

// Remplir les catégories
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

  const formData = new FormData();
  formData.append("image", champPhotoInput.files[0]);
  formData.append("title", champTitre.value);
  formData.append("category", champCategorie.value);

  const reponse = await fetch("http://localhost:5678/api/works", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });

  if (reponse.ok) {
    // 3.4 On rafraîchit uniquement la galerie principale
    const travaux = await recupererTravaux();
    afficherGalerie(travaux);

    // On ferme la modale (pas de reconstruction → pas de flash)
    fermerModale();
  } else {
    messageErreur.textContent = "Erreur lors de l'envoi.";
  }
});
