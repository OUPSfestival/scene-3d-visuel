// ============================================================
// Configuration du contenu pour chaque forme de la scène 3D
//
// Au chargement, la console du navigateur affiche les noms
// de tous les objets détectés : 📦 Objet : "NomExact" (Mesh)
// → Utilisez ces noms comme clés ci-dessous.
//
// Pour chaque forme :
//   title       : titre affiché en bas à gauche
//   description : texte descriptif en bas à gauche
//   figures     : tableau d'images affichées à droite
//     image     : chemin vers le fichier image (ex: "images/fig.jpg")
//     title     : "Figure. 1"
//     caption   : légende sous l'image
// ============================================================

export const CONTENT = {

    // ── Forme 1 ─────────────────────────────────────────────
    "NomObjet1": {
        title: "Titre de la forme 1",
        description: "Description de cette forme. Vous pouvez écrire un texte plus long ici, il s'affichera en bas à gauche de l'écran lors du zoom sur la forme.",
        figures: [
            {
                image: "images/figure-1-a.jpg",
                title: "Figure. 1",
                caption: "Légende ou description de cette image."
            },
            {
                image: "images/figure-1-b.jpg",
                title: "Figure. 2",
                caption: "Légende ou description de cette image."
            },
            {
                image: "images/figure-1-c.jpg",
                title: "Figure. 3",
                caption: "Légende ou description de cette image."
            }
        ]
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
