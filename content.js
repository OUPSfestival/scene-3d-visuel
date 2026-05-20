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
        // Supprime ces lignes pour utiliser les points automatiques
        tourPoints: [
            { x: -6.144, y:  9.392, z: 2.984 },
            { x: -4.573, y:  6.990, z: 3.030 },
            { x: -5.709, y: 11.135, z: 2.839 },
        ],

        // Centre de la forme (optionnel, auto si absent)
        // center: { x: 0, y: 0, z: 0 },
    },

    // ── Forme 2 ─────────────────────────────────────────────
    "NomObjet2": {
        title: "Titre de la forme 2",
        description: "Description de cette forme.",
        figures: [
            {
                image: "images/figure-2-a.jpg",
                title: "Figure. 1",
                caption: "Légende."
            }
        ]
    },

    // ── Forme 3 ─────────────────────────────────────────────
    "NomObjet3": {
        title: "Titre de la forme 3",
        description: "Description de cette forme.",
        figures: []
    },

    // ── Forme 4 ─────────────────────────────────────────────
    "NomObjet4": {
        title: "Titre de la forme 4",
        description: "Description de cette forme.",
        figures: []
    },

    // ── Contenu par défaut (si le nom n'est pas reconnu) ─────
    "__default__": {
        title: "",
        description: "",
        figures: []
    }

};
