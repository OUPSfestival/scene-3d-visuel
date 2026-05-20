import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';
import { CONTENT } from './content.js';

// Fonction d'initialisation - attendre que le DOM soit prêt
async function initViewer() {
    // Éléments DOM
    const canvas    = document.getElementById('scene3d');
    const loadingEl = document.getElementById('loading');
    const detailView  = document.getElementById('detail-view');
    const backBtn     = document.getElementById('back-btn');
    const detailTitle = document.getElementById('detail-title');
    const detailDesc  = document.getElementById('detail-desc');
    const imagesList  = document.getElementById('images-list');

    // Vérifier que tous les éléments existent
    if (!canvas || !loadingEl) {
        console.error('Erreur : éléments DOM manquants');
        return;
    }

    console.log('✅ DOM chargé, initialisation du viewer...');

    // Renderer
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    renderer.outputEncoding = THREE.sRGBEncoding;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a2e);

    // Environment map HDR nature (reflets dans les matériaux métalliques)
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    pmremGenerator.compileEquirectangularShader();
    new RGBELoader().load(
        'https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/forest_slope_1k.hdr',
        (hdrTexture) => {
            const envMap = pmremGenerator.fromEquirectangular(hdrTexture).texture;
            scene.environment = envMap; // reflets sur tous les matériaux PBR
            hdrTexture.dispose();
            pmremGenerator.dispose();
            console.log('✅ HDR nature chargé');
        }
    );

    // Camera
    const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.01, 1000);
    camera.position.set(3, 2, 5);

    // Controls (orbit autour du modèle)
    const controls = new OrbitControls(camera, canvas);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 1.0;

    // Lumières — contraste fort, source principale en haut
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.04); // quasi nul : ombres très sombres
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 4.0); // très forte, quasi verticale
    dirLight.position.set(2, 20, 5);  // presque directement au-dessus
    scene.add(dirLight);

    // Pas de fill light : on veut des ombres marquées

    // Loader pour les modèles glTF / GLB
    const loader = new GLTFLoader();

    // État général
    let currentModel = null;
    let clickableObjects = [];
    let isDetailView = false;
    let cameraAnim = null;
    const overviewPos    = new THREE.Vector3();
    const overviewTarget = new THREE.Vector3();

    // Tour cinématographique
    let tourQueue = [];
    let tourOnAllComplete  = null;
    let tourPauseTimeout   = null;

    // Raycaster
    const raycaster = new THREE.Raycaster();
    raycaster.params.Line = { threshold: 0.3 };
    const mouse = new THREE.Vector2();

    // Détection drag vs clic
    let isDragging = false;
    let mouseDownX = 0, mouseDownY = 0;
    // Distances min/max originales (restaurées au retour)
    let originalMinDist = 0, originalMaxDist = 0;

    // Easing pour l'animation caméra
    function easeInOut(t) {
        return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    }

    function animateCameraTo(toPos, toTarget, frames = 80, onComplete = null) {
        cameraAnim = {
            fromPos:    camera.position.clone(),
            toPos:      toPos.clone(),
            fromTarget: controls.target.clone(),
            toTarget:   toTarget.clone(),
            progress: 0,
            frames,
            onComplete
        };
    }

    // Lance la prochaine étape du tour, ou appelle tourOnAllComplete si terminé
    function runNextTourStep() {
        if (tourQueue.length === 0) {
            if (tourOnAllComplete) {
                const cb = tourOnAllComplete;
                tourOnAllComplete = null;
                cb();
            }
            return;
        }
        const step = tourQueue.shift();
        animateCameraTo(step.toPos, step.toTarget, step.frames, () => {
            if (step.pause > 0) {
                // Pause immobile avant de passer au point suivant
                tourPauseTimeout = setTimeout(runNextTourStep, step.pause);
            } else {
                runNextTourStep();
            }
        });
    }

    // Génère les étapes du tour : N zones, chacune avec dézoom lent → pause 5s → rezoom
    // customPoints : tableau optionnel de {x,y,z} définis dans content.js
    function buildTourSteps(center, size, maxDim, customPoints) {
        let focuses;

        if (customPoints && customPoints.length > 0) {
            // Points définis manuellement dans content.js → tourPoints
            focuses = customPoints.map(p => new THREE.Vector3(p.x, p.y, p.z));
        } else {
            // Points auto depuis la bounding box
            const hx = size.x * 0.35;
            const hy = size.y * 0.35;
            const hz = size.z * 0.2;
            focuses = [
                new THREE.Vector3(center.x + hx * 0.55, center.y + hy * 0.55, center.z + hz * 0.2),
                new THREE.Vector3(center.x - hx * 0.4,  center.y - hy * 0.3,  center.z + hz * 0.4),
                new THREE.Vector3(center.x + hx * 0.05, center.y + hy * 0.05, center.z - hz * 0.3),
                new THREE.Vector3(center.x - hx * 0.5,  center.y + hy * 0.4,  center.z + hz * 0.1),
            ];
        }

        // Angles légèrement différents pour simuler la rotation X/Z entre chaque point
        const angles = [
            { dx: -0.15, dy:  0.08, dz:  0.95 },
            { dx:  0.22, dy: -0.06, dz:  0.88 },
            { dx:  0.08, dy:  0.18, dz:  0.90 },
            { dx: -0.20, dy:  0.05, dz:  0.92 },
        ];

        const steps = [];
        focuses.forEach((focus, i) => {
            const a = angles[i % angles.length];
            // Étape 1 : dézoom — transition lente depuis la zone précédente
            const farDist = maxDim * 1.3;
            steps.push({
                toTarget: focus,
                toPos: new THREE.Vector3(
                    focus.x + a.dx * farDist,
                    focus.y + a.dy * farDist,
                    focus.z + a.dz * farDist
                ),
                frames: 200,
                pause: 0
            });
            // Étape 2 : rezoom — rapprochement serré, puis pause 5s
            const closeDist = maxDim * 0.72;
            steps.push({
                toTarget: focus,
                toPos: new THREE.Vector3(
                    focus.x + a.dx * closeDist,
                    focus.y + a.dy * closeDist,
                    focus.z + a.dz * closeDist
                ),
                frames: 180,
                pause: 5000
            });
        });

        return steps;
    }

    // Fonction pour charger et afficher un modèle depuis une URL
    function loadModelFromURL(modelPath) {
        // Afficher le loader
        loadingEl.classList.add('active');
        
        loader.load(
            modelPath,
            (gltf) => {
                // Retirer l'ancien modèle
                if (currentModel) {
                    scene.remove(currentModel);
                }
                
                const model = gltf.scene;
                currentModel = model;

                // Centrer le modèle automatiquement
                const box = new THREE.Box3().setFromObject(model);
                const center = box.getCenter(new THREE.Vector3());
                const size = box.getSize(new THREE.Vector3());

                model.position.sub(center);

                // Ajuster la caméra selon la taille du modèle
                const maxDim = Math.max(size.x, size.y, size.z);
                const distance = maxDim * 2;
                camera.position.set(distance * 0.7, distance * 0.5, distance);
                camera.near = maxDim * 0.001;
                camera.far = maxDim * 100;
                camera.updateProjectionMatrix();

                controls.target.set(0, 0, 0);
                controls.minDistance = maxDim * 0.1;
                controls.maxDistance = maxDim * 10;
                originalMinDist = controls.minDistance;
                originalMaxDist = controls.maxDistance;
                controls.update();

                // Matériaux : transparence, IOR élevé, reflets
                model.traverse((node) => {
                    if (node.isMesh) {
                        const mats = Array.isArray(node.material) ? node.material : [node.material];
                        mats.forEach((mat) => {
                            // ── Diagnostic ───────────────────────────────────────
                            const matType = mat.isMeshPhysicalMaterial  ? 'MeshPhysicalMaterial'
                                          : mat.isMeshStandardMaterial   ? 'MeshStandardMaterial'
                                          : mat.type;
                            console.log(`Mat "${mat.name}" → ${matType} | metalness=${mat.metalness?.toFixed(2)} roughness=${mat.roughness?.toFixed(2)} ior=${mat.ior ?? 'n/a'} opacity=${mat.opacity.toFixed(2)}`);

                            // ── Transparence ─────────────────────────────────────
                            if (mat.transparent || mat.opacity < 1 || mat.alphaMap || mat.alphaTest > 0) {
                                mat.transparent = true;
                                mat.depthWrite  = false;
                            }

                            // ── IOR 58 : forcer sur MeshPhysicalMaterial ─────────
                            // GLTFLoader crée MeshPhysicalMaterial seulement si KHR_materials_ior
                            // est présent dans le GLB. Si le type est Standard, l'IOR est ignoré.
                            if (mat.isMeshPhysicalMaterial) {
                                mat.ior = 58.3;
                                console.log(`  → IOR forcé à 58.3 sur "${mat.name}"`);
                            }

                            // ── Reflets env map ───────────────────────────────────
                            mat.envMapIntensity = 1.5; // réduit : moins de blanc IBL, plus de contraste
                            mat.needsUpdate = true;
                        });
                    }
                });

                scene.add(model);

                // Collecter les objets cliquables et loguer leurs noms
                clickableObjects = [];
                model.traverse((node) => {
                    if (node.isMesh || node.isLine) {
                        clickableObjects.push(node);
                        console.log(`📦 Objet : "${node.name}" (${node.isMesh ? 'Mesh' : 'Line'})`);
                    }
                });

                // Masquer le loader
                loadingEl.classList.remove('active');
                console.log('✅ Modèle chargé avec succès');
            },
            (progress) => {
                console.log('Chargement...', Math.round(progress.loaded / progress.total * 100) + '%');
            },
            (error) => {
                console.error('Erreur lors du chargement du modèle :', error);
                loadingEl.querySelector('p').textContent =
                    '❌ Impossible de charger Constellation.glb';
                loadingEl.querySelector('.spinner').style.display = 'none';
            }
        );
    }

    // Charger automatiquement Constellation.glb au démarrage
    console.log('🚀 Chargement automatique de Constellation.glb...');
    loadModelFromURL('./Constellation.glb');

    // ── Suivi mousedown + drag detection ─────────────────
    canvas.addEventListener('mousedown', (e) => {
        mouseDownX = e.clientX;
        mouseDownY = e.clientY;
        isDragging = false;
    });

    // ── Hover : curseur pointer sur les objets ───────────────
    canvas.addEventListener('mousemove', (e) => {
        // Suivre le drag dans tous les modes
        const dx = e.clientX - mouseDownX;
        const dy = e.clientY - mouseDownY;
        if (Math.sqrt(dx * dx + dy * dy) > 4) isDragging = true;

        if (isDetailView) return;
        mouse.x =  (e.clientX / window.innerWidth)  * 2 - 1;
        mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
        raycaster.setFromCamera(mouse, camera);
        const hits = raycaster.intersectObjects(clickableObjects, true);
        canvas.style.cursor = hits.length > 0 ? 'pointer' : 'default';
    });

    // ── Clic → zoom sur la forme ─────────────────────────────
    canvas.addEventListener('click', (e) => {
        if (isDetailView) return;
        if (isDragging) return; // c'était un drag (orbite), pas un clic
        mouse.x =  (e.clientX / window.innerWidth)  * 2 - 1;
        mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
        raycaster.setFromCamera(mouse, camera);
        const hits = raycaster.intersectObjects(clickableObjects, true);
        if (hits.length > 0) {
            // Logger les coordonnées du point cliqué → à copier dans content.js > tourPoints
            const pt = hits[0].point;
            console.log(`🎯 Point cliqué : { x: ${pt.x.toFixed(3)}, y: ${pt.y.toFixed(3)}, z: ${pt.z.toFixed(3)} }`);
            // Remonter jusqu'au premier ancêtre nommé
            let target = hits[0].object;
            while (target.parent && target.parent !== currentModel && !target.name) {
                target = target.parent;
            }
            enterDetailView(target);
        }
    });

    // ── Entrer dans la vue détail ─────────────────────────────
    function enterDetailView(obj) {
        isDetailView = true;
        controls.autoRotate = false;
        controls.enabled = false;

        overviewPos.copy(camera.position);
        overviewTarget.copy(controls.target);

        const box      = new THREE.Box3().setFromObject(obj);
        const bbCenter = box.getCenter(new THREE.Vector3());
        const size     = box.getSize(new THREE.Vector3());
        const maxDim   = Math.max(size.x, size.y, size.z);

        // Récupérer le contenu en premier (pour lire tourPoints et center)
        const content = CONTENT[obj.name] || CONTENT['__default__'] || {
            title: obj.name || 'Forme',
            description: '',
            figures: []
        };

        // Centre : depuis content.js ou bounding box automatique
        const center = content.center
            ? new THREE.Vector3(content.center.x, content.center.y, content.center.z)
            : bbCenter;

        // Lancer le tour cinématographique (avec tourPoints personnalisés si définis)
        tourQueue = buildTourSteps(center, size, maxDim, content.tourPoints);
        tourOnAllComplete = () => {
            // Orbite libre autour de la forme après le tour
            controls.minDistance = maxDim * 0.4;
            controls.maxDistance = maxDim * 2.5;
            controls.enabled = true;
        };
        runNextTourStep();

        showDetailPanel(content);
    }

    // ── Sortir de la vue détail ──────────────────────────────
    function exitDetailView() {
        isDetailView = false;
        controls.enabled = false;
        // Annuler le tour en cours (y compris toute pause setTimeout en attente)
        if (tourPauseTimeout) { clearTimeout(tourPauseTimeout); tourPauseTimeout = null; }
        tourQueue = [];
        tourOnAllComplete = null;
        hideDetailPanel();
        canvas.style.cursor = 'default';
        animateCameraTo(overviewPos, overviewTarget, 80, () => {
            controls.minDistance = originalMinDist;
            controls.maxDistance = originalMaxDist;
            controls.autoRotate = true;
            controls.enabled = true;
        });
    }

    // ── Afficher le panneau détail ────────────────────────────
    function showDetailPanel(content) {
        detailTitle.textContent = content.title;
        detailDesc.textContent  = content.description;

        imagesList.innerHTML = '';
        (content.figures || []).forEach((fig) => {
            const item = document.createElement('div');
            item.className = 'figure-item';
            item.innerHTML = `
                <img src="${fig.image}" alt="${fig.title}">
                <div class="figure-caption">
                    <strong>${fig.title}</strong>
                    <p>${fig.caption}</p>
                </div>
            `;
            imagesList.appendChild(item);
        });

        requestAnimationFrame(() => detailView.classList.add('visible'));
    }

    function hideDetailPanel() {
        detailView.classList.remove('visible');
    }

    // Bouton retour
    backBtn.addEventListener('click', () => exitDetailView());

    // ── Redimensionnement ─────────────────────────────────────
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // Désactiver l'auto-rotate au premier clic
    controls.addEventListener('start', () => {
        controls.autoRotate = false;
    });

    // Boucle de rendu
    function animate() {
        requestAnimationFrame(animate);

        // Animation caméra fluide
        if (cameraAnim) {
            cameraAnim.progress += 1 / cameraAnim.frames;
            const t = easeInOut(Math.min(cameraAnim.progress, 1));
            camera.position.lerpVectors(cameraAnim.fromPos,    cameraAnim.toPos,    t);
            controls.target.lerpVectors(cameraAnim.fromTarget, cameraAnim.toTarget, t);
            if (cameraAnim.progress >= 1) {
                const cb = cameraAnim.onComplete;
                cameraAnim = null;
                if (cb) cb();
            }
        }

        controls.update();
        renderer.render(scene, camera);
    }
    animate();

    console.log('✅ Viewer initialisé avec succès !');
}

// Attendre que le DOM soit complètement chargé
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initViewer);
} else {
    // Le DOM est déjà chargé
    initViewer();
}
