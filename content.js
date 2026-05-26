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
    "forme1": {
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
            { x: -3.5,  y: 10.5, z: 3.0 },
            { x:  1.2,  y: 13.8, z: 2.8 },
            { x: -1.0,  y:  7.8, z: 3.2 },
            { x:  3.0,  y: 11.5, z: 2.6 },
        ],
        center: { x: 1.057, y: 15.316, z: 1.171 },
    },

    // ── Forme 2 ─────────────────────────────────────────────
    "forme2": {
        title: "Ancilla",
        description: "Ancilla est une religieuse au monastère des carmélites à Saint-Gilles, elle considère dieu comme son meilleur ami, elle apprend le piano.\nPour elle la vie a été créé par dieu, tout son contexte nécessaire d'abord, puis l'homme, puis la femme. L'homme doit tout dominer\nce qui a été créé auparavant. Que l'homme soit le chef de tout.\n\nDans cette réflexion Dieu aurait besoin de nous comme on aurait besoin de lui, c'est pour ça\nqu'il aurait créé la vie, créée pour aimer de la même manière qu'elle est aimée par dieu.",
        figures: [
            {
                image: "assets/2 1.jpg",
                title: "Figure. 1",
                caption: "La vie est créée à travers un cadre spatial, pleins d'éléments constituants son espace nécessaire à sa vie. La vie, une fois créée deviendrait créatrice à son tour."
            },
            {
                image: "assets/2 2.png",
                title: "Figure. 2",
                caption: "\"Que le ciel soit\" L'action de dieu, ses paroles et ses gestes sont représentés par ces lignes qui indiquent son mouvement, au sein d'une temporalité, chaque chose est créé l'une après l'autre (dit sur 7 jours)."
            },
            {
                image: "assets/2 3.png",
                title: "Figure. 3",
                caption: "Representé par ces sortes d'\"étoiles\", l'espace existe en dehors de la terre comme d'une manière pour l'équilibrer, la contenir, la porter."
            }
        ],
        center: { x: -9.860, y: 7.626, z: 1.142 },
    },

    // ── Forme 3 ─────────────────────────────────────────────
    "forme3": {
        title: "Titre de la forme 3",
        description: "Description de cette forme.",
        figures: [],
        center: { x: 7.489, y: 6.065, z: 1.172 },
    },

    // ── Forme 4 ─────────────────────────────────────────────
    "forme4": {
        title: "Titre de la forme 4",
        description: "Description de cette forme.",
        figures: [],
        center: { x: -26.071, y: 2.672, z: 3.956 },
    },

    // ── Forme 5 ─────────────────────────────────────────────
    "forme5": {
        title: "Titre de la forme 5",
        description: "Description de cette forme.",
        figures: [],
        center: { x: -7.633, y: -6.501, z: 4.219 },
    },

    // ── Forme 6 ─────────────────────────────────────────────
    "forme6": {
        title: "Titre de la forme 6",
        description: "Description de cette forme.",
        figures: [],
        center: { x: 0.362, y: -16.341, z: 4.210 },
    },

    // ── Forme 7 ─────────────────────────────────────────────
    "forme7": {
        title: "Titre de la forme 7",
        description: "Description de cette forme.",
        figures: [],
        center: { x: 10.341, y: -3.001, z: 2.062 },
    },

    // ── Forme 8 ─────────────────────────────────────────────
    "forme8": {
        title: "Titre de la forme 8",
        description: "Description de cette forme.",
        figures: [],
        center: { x: 27.529, y: 2.863, z: 1.304 },
    },

    // ── Forme 9 ─────────────────────────────────────────────
    "forme9": {
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
