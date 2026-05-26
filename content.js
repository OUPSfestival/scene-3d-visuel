// ============================================================
// Configuration du contenu pour chaque forme de la scène 3D
//
// ── Trouver les noms des objets ──────────────────────────────
// Ouvre la console du navigateur (F12) au chargement :
//   📦 Objet : "NomExact" (Mesh)
// → Utilise ces noms comme clés ci-dessous.
//
// ── Trouver les coordonnées des points de zoom ───────────────
// Clique sur la forme dans le navigateur, la console affiche :
//   🎯 Point cliqué : { x: 0.123, y: 4.567, z: -0.89 }
// → Copie ces valeurs dans tourPoints pour définir les zones
//   que la caméra explore.
//
// ── Champs disponibles ───────────────────────────────────────
//   title       : titre affiché en bas à gauche
//   description : texte descriptif en bas à gauche
//   figures     : images affichées à droite
//     image     : chemin vers le fichier (ex: "images/fig.jpg")
//     title     : "Figure. 1"
//     caption   : légende sous l'image
//
//   tourPoints  : (optionnel) points de détail à explorer
//                 Si absent → points auto depuis la bounding box
//     [ { x, y, z }, { x, y, z }, ... ]   (2 à 6 points)
//
//   center      : (optionnel) centre de la forme pour le tour
//                 Si absent → centre de la bounding box auto
//     { x, y, z }
// ============================================================

export const CONTENT = {

    // ── Forme 1 ─────────────────────────────────────────────
    "NomObjet1": {
        title: "Titre de la forme 1",
        description: "Description de cette forme.",
        figures: [
            {
                image: "images/figure-1-a.jpg",
                title: "Figure. 1",
                caption: "Légende ou description de cette image."
            }
        ],
        // Points de zoom manuels (console → 🎯 Point cliqué)
        tourPoints: [
            { x: -6.144, y:  9.392, z: 2.984 },
            { x: -4.573, y:  6.990, z: 3.030 },
            { x: -5.709, y: 11.135, z: 2.839 },
        ],
        center: { x: 1.057, y: 15.316, z: 1.171 },
    },

    // ── Forme 2 ─────────────────────────────────────────────
    "jets_et_conotours001": {
        title: "Ancilla",
        description: "Ancilla est une religieuse du couvent des Carmélites, elle a pour mission de s'occuper de son entretien.\nJe suis allé la rencontrer en sonnant à la porte, d'abord une dame m'a répondu,\nj'ai attendu une 10aine de minutes et puis Ancilla est venue m'ouvrir.\nCe schéma représente sa vision catholique de la création du monde, avec une progression, «Dieu» créa tout, en commençant par le jour et la nuit, et une fois que l'espace fut créer dans le temps, la vie avança, la nuit puis la lune. l'obscurité puis la terre. L'eau puis les animaux, la végétation. L'homme puis la femme.",
        figures: [
            {
                image: "assets/2 1.jpg",
                title: "Figure. 1",
                caption: ""
            },
            {
                image: "assets/2 2.png",
                title: "Figure. 2",
                caption: ""
            },
            {
                image: "assets/2 3.png",
                title: "Figure. 3",
                caption: ""
            }
        ],
        center: { x: -9.860, y: 7.626, z: 1.142 },
    },

    // ── Forme 3 ─────────────────────────────────────────────
    "NomObjet3": {
        title: "Titre de la forme 3",
        description: "Description de cette forme.",
        figures: [],
        center: { x: 7.489, y: 6.065, z: 1.172 },
    },

    // ── Forme 4 ─────────────────────────────────────────────
    "NomObjet4": {
        title: "Titre de la forme 4",
        description: "Description de cette forme.",
        figures: [],
        center: { x: -26.071, y: 2.672, z: 3.956 },
    },

    // ── Forme 5 ─────────────────────────────────────────────
    "NomObjet5": {
        title: "Titre de la forme 5",
        description: "Description de cette forme.",
        figures: [],
        center: { x: -7.633, y: -6.501, z: 4.219 },
    },

    // ── Forme 6 ─────────────────────────────────────────────
    "NomObjet6": {
        title: "Titre de la forme 6",
        description: "Description de cette forme.",
        figures: [],
        center: { x: 10.341, y: -3.001, z: 2.062 },
    },

    // ── Forme 7 ─────────────────────────────────────────────
    "NomObjet7": {
        title: "Titre de la forme 7",
        description: "Description de cette forme.",
        figures: [],
        center: { x: 0.362, y: -16.341, z: 4.210 },
    },

    // ── Forme 8 ─────────────────────────────────────────────
    "NomObjet8": {
        title: "Titre de la forme 8",
        description: "Description de cette forme.",
        figures: [],
        center: { x: 27.529, y: 2.863, z: 1.304 },
    },

    // ── Forme 9 ─────────────────────────────────────────────
    "NomObjet9": {
        title: "Titre de la forme 9",
        description: "Description de cette forme.",
        figures: [],
        center: { x: 20.901, y: 15.591, z: 1.336 },
    },

    // ── Contenu par défaut (si le nom n'est pas reconnu) ─────
    "__default__": {
        title: "",
        description: "",
        figures: []
    }

};
