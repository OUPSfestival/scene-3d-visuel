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
        title: "Ancilla et Océane",
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
        title: "Océane — tout le temps, pendant ou avant",
        description: "Océane est une artiste liée au vivant, inconstante et pyromane. La vie s'incarne dans quelque chose de matériel, un corps, celui-ci possède un esprit, mais rien n'est aussi infini que la vie. Elle traverse le temps, l'espace pour s'incarner, la rencontre de deux éléments, pour exister à travers ce que nous nous voyons, l'univers de la forme. Beaucoup de choses englobent la vie qu'on ne prend pas en compte, les âmes choisissent leur support de vie. La vie est la rencontre à mi-chemin des choses, l'amour.",
        figures: [
            {
                image: "assets/3 1.jpg",
                title: "Figure. 1",
                caption: "Autour de ces deux formes tentant d'exister pressement rien n'est et tout est, un vide plein."
            },
            {
                image: "assets/3 2.jpg",
                title: "Figure. 2",
                caption: "On distingue deux formes possédant une essence, ronde un point d'où naît tout."
            }
        ],
        center: { x: 7.489, y: 6.065, z: 1.172 },
    },

    // ── Forme 4 ─────────────────────────────────────────────
    "forme4": {
        title: "Alvar et Ancilla",
        description: "Description de cette forme.",
        figures: [],
        center: { x: -26.071, y: 2.672, z: 3.956 },
    },

    // ── Forme 5 ─────────────────────────────────────────────
    "forme5": {
        title: "Alvar — pendant ou après",
        description: "Alvar est chercheur et ancien botaniste à Madrid, obsédé par les séquences des choses et leur profondeur. La vie émerge spontanément, les molécules apparaissent depuis la foudre qui tombe et celle-ci se modifie en explorant. La vie se forme de ces ramifications, de cette apparition spontanée de forces inattendues s'exerçant constamment. La vie existe donc par stade, par \"méta\" exprimant toutes une nécessité de vivre de s'exprimer à travers ce qu'il lui est offert.\n\nLe schéma prend au final une forme de molécules elle même.\n\nLa vie est donc l'apparition carnée, le corps.",
        figures: [],
        center: { x: -7.633, y: -6.501, z: 4.219 },
    },

    // ── Forme 6 ─────────────────────────────────────────────
    "forme6": {
        title: "Jimmy — tout le temps",
        description: "Jimmy est obsédé par l'apparition des étoiles, alors qu'il en avait peur avant. Les premières formes de vie, sont du mouvement, la décision inattendue, l'action des choses d'aller quelque part à un moment dans le temps.\n\nLes étoiles sont apparues bien avant nous, et elles représentent toutes nos formes du vivant. Elles sont en nombre, elles ont une enveloppe, vivante, évoluante. Elles se partagent similarités. Pourquoi on les considérait à distance de nous alors qu'elles ont subitement commencé à exister au milieu de la masse de gaz, informe de tout, de la même manière que les premières cellules vivantes se sont formées au milieu de la terre invivable.\n\nQuand je les regarde, je ne vois rien de plus vivant que les étoiles.",
        figures: [
            {
                image: "assets/6 1.jpg",
                title: "Figure. 1",
                caption: "La vie émerge du néant, s'auto crée."
            }
        ],
        center: { x: 0.362, y: -16.341, z: 4.210 },
    },

    // ── Forme 7 ─────────────────────────────────────────────
    "forme7": {
        title: "Gaspar — avant ou pendant",
        description: "Gaspar est un type qui crèche dans l'église saint nicolas à Paris, passionné par les mash up de barbie girl et ramstein. Dans un moment T mais de manière cyclique, les forces s'exercent, le feu, la vie et la connaissance prospèrent, s'alimentant les uns les autres. Elles créent des explosions, des événements, la vie est la représentation de ces cycles.",
        figures: [],
        center: { x: 10.341, y: -3.001, z: 2.062 },
    },

    // ── Forme 8 ─────────────────────────────────────────────
    "forme8": {
        title: "Gaspar et Océane",
        description: "Description de cette forme.",
        figures: [],
        center: { x: 27.529, y: 2.863, z: 1.304 },
    },

    // ── Forme 9 ─────────────────────────────────────────────
    "forme9": {
        title: "Khalija",
        description: "Khalija est une personne rencontrée sur mon lieu de travail où elle fait le ménage, elle aime parler de sa fille. On est né pour vivre, échanger, respecter, partager l'espace. Respecter la vie, laisser parler les autres. La terre elle est un cadeau pour la vie. Mais elle ne veut pas dire comment elle aurait été créée, ni y penser.",
        figures: [],
        center: { x: 20.901, y: 15.591, z: 1.336 },
    },

    // ── Forme 10 ────────────────────────────────────────────
    "forme10": {
        title: "Ameed — tout le temps",
        description: "Ameed est un artiste tentant de représenter les formes de vie par le dessin. Bien qu'on ne puisse pas représenter la vie à son premier état, pour la première fois, l'existence s'incarne dans le tissu matériel, mais la vie appartient à un autre plan. Les pensées sont collectées, échangées, existent en tout temps, elles sont donc partagées par tous les humains, de la même manière qu'on respire l'air et l'expire, transmettant les pensées et la conscience par l'énergie.",
        figures: [
            {
                image: "assets/10 1.png",
                title: "Figure. 1",
                caption: "Ces pensées collectives appartiennent à un ensemble d'une sphère qui elle même est infiniment grande et infiniment petite, pouvant zoomer et dézoomer dedans indéfiniment, ce schéma en est la représentation à un moment T."
            },
            {
                image: "assets/10 2.jpg",
                title: "Figure. 2",
                caption: "Émergeant du rien, ces formes de \"hole\", de trous, apparaissent, s'interconnectant de manière infinie."
            },
            {
                image: "assets/10 3.jpg",
                title: "Figure. 3",
                caption: "La matière existe charnellement grâce à l'énergie, elle s'autoproduit, s'autodétermine, par nécessité. L'énergie et la matière définissent donc notre perception, notre besoin de rencontrer les choses."
            }
        ],
        center: { x: 0, y: 0, z: 0 },
    },

    // ── Contenu par défaut (si le nom n'est pas reconnu) ─────
    "__default__": {
        title: "",
        description: "",
        figures: []
    }

};
