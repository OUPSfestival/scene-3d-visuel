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
    const detailDescEn = document.getElementById('detail-desc-en');
    const imagesList  = document.getElementById('images-list');
    const detailImages = document.getElementById('detail-images');

    // Vérifier que tous les éléments existent
    if (!canvas || !loadingEl) {
        console.error('Erreur : éléments DOM manquants');
        return;
    }

    console.log('✅ DOM chargé, initialisation du viewer...');

    // Renderer
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio * 1.5, 3));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.78;
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a2e); // fond bleu nuit d'origine

    // Environment map HDR — reflets ET fond de scène (comme Blender)
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    pmremGenerator.compileEquirectangularShader();
    new RGBELoader().load(
        './assets/forest_slope_1k.hdr',
        (hdrTexture) => {
            const envMap = pmremGenerator.fromEquirectangular(hdrTexture).texture;
            scene.environment = envMap;          // IBL : reflets sur tous les matériaux PBR
            // fond de scène = couleur d'origine (pas l'HDR)
            hdrTexture.dispose();
            pmremGenerator.dispose();
            console.log('✅ HDR chargé — reflets actifs');
        }
    );

    // Camera
    const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.01, 1000);
    camera.position.set(3, 2, 5);

    // Controls (orbit autour du modèle)
    const controls = new OrbitControls(camera, canvas);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.autoRotate = false;
    controls.autoRotateSpeed = 1.0;
    // Navigation tactile : 1 doigt = rotation, 2 doigts = zoom + déplacement
    controls.touches.ONE = THREE.TOUCH.ROTATE;
    controls.touches.TWO = THREE.TOUCH.DOLLY_PAN;

    // Lumières — minimales : l'IBL (HDR) fait le travail principal comme dans Blender
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.03); // quasi nul, IBL gère l'ambiant
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 3.5); // lumière principale, ombres marquées
    dirLight.position.set(10, 1, 8);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width  = 2048;
    dirLight.shadow.mapSize.height = 2048;
    dirLight.shadow.camera.near = 1;
    dirLight.shadow.camera.far  = 200;
    dirLight.shadow.camera.left   = -60;
    dirLight.shadow.camera.right  =  60;
    dirLight.shadow.camera.top    =  60;
    dirLight.shadow.camera.bottom = -60;
    dirLight.shadow.bias = -0.001;
    scene.add(dirLight);

    // Pas de fill light : on veut des ombres marquées

    // Loader pour les modèles glTF / GLB
    const loader = new GLTFLoader();

    // État général
    let currentModel = null;
    let clickableObjects = [];
    let isDetailView = false;
    let cameraAnim = null;
    // Trajectoire caméra (mode idle)
    let pathCurve = null;
    let isPathMode = false;
    let pathT = 0;
    const PATH_SPEED = 0.0001; // tour complet ~167s à 60fps
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

    // Points de trajectoire caméra exportés depuis Blender (axes convertis Blender→Three.js)
    const PATH_POINTS_RAW = [
        {"x":-16.9316,"y":3.6843,"z":-0.3064},{"x":-14.5032,"y":3.4466,"z":-0.1594},
        {"x":-15.0184,"y":3.6434,"z":2.2715},{"x":-14.587,"y":-0.462,"z":1.5661},
        {"x":-14.5026,"y":-2.316,"z":0.4572},{"x":-8.5254,"y":-4.781,"z":2.4291},
        {"x":-8.4017,"y":-8.9689,"z":2.4342},{"x":-8.7898,"y":-11.6133,"z":0.5504},
        {"x":-11.6891,"y":-12.8688,"z":4.4353},{"x":-11.3665,"y":-15.7999,"z":4.5185},
        {"x":-2.154,"y":-17.4191,"z":4.5157},{"x":0.9027,"y":-21.2938,"z":0.8299},
        {"x":3.1791,"y":-25.3639,"z":0.5565},{"x":2.4013,"y":-26.5078,"z":-1.0694},
        {"x":-1.3132,"y":-25.6812,"z":0.1254},{"x":-1.8125,"y":-30.1068,"z":3.298},
        {"x":-10.2998,"y":-28.7443,"z":2.0813},{"x":-17.0063,"y":-28.4908,"z":1.304},
        {"x":-21.9198,"y":-23.2969,"z":3.393},{"x":-22.5327,"y":-21.9714,"z":-0.7727},
        {"x":-22.1101,"y":-18.0326,"z":0.1591},{"x":-28.1166,"y":-17.8748,"z":-2.8143},
        {"x":-37.4539,"y":-10.89,"z":-7.0853},{"x":-27.3342,"y":-3.0015,"z":-1.6526},
        {"x":-18.311,"y":6.7726,"z":3.1628},{"x":-18.889,"y":7.9051,"z":0.0442}
    ];

    // Détection drag vs clic
    let isDragging = false;
    let mouseDownX = 0, mouseDownY = 0;
    // Position d'accueil (vue d'ensemble, toutes les formes cadrées)
    let isModelLoaded = false;
    const homePos    = new THREE.Vector3();
    const homeTarget = new THREE.Vector3();
    // Timer d'inactivité → retour automatique à l'accueil + auto-rotate
    let idleTimer = null;
    const IDLE_TIMEOUT = 45000; // 45s sans interaction
    // Timer d'attraction → texte de présentation après longue inactivité
    let attractTimer = null;
    const ATTRACT_TIMEOUT = 60000; // 1 min sans interaction
    const attractScreen = document.getElementById('attract-screen');

    function showAttractScreen() {
        if (attractScreen) attractScreen.classList.add('visible');
    }
    function hideAttractScreen() {
        if (attractScreen) attractScreen.classList.remove('visible');
    }

    // Retour automatique à la vue d'ensemble après inactivité
    function resetIdleTimer() {
        if (!isModelLoaded) return; // modèle pas encore chargé
        // Stopper la trajectoire si active — repartir du point de vue courant
        if (isPathMode) {
            isPathMode = false;
            controls.enabled = true;
            // Garder le target où la caméra regardait (look-ahead sur la courbe)
            const lookT = (pathT + PATH_SPEED * 30) % 1;
            controls.target.copy(pathCurve.getPoint(lookT));
        }
        clearTimeout(idleTimer);
        clearTimeout(attractTimer);
        hideAttractScreen();
        idleTimer = setTimeout(() => {
            if (isDetailView) return;
            controls.enabled = false;
            if (pathCurve) {
                // Glisser vers le premier point de la trajectoire puis démarrer le vol
                const startPos = pathCurve.getPoint(0);
                animateCameraTo(startPos, new THREE.Vector3(0, 0, 0), 150, () => {
                    isPathMode = true;
                    pathT = 0;
                });
            }
        }, IDLE_TIMEOUT);
        attractTimer = setTimeout(() => {
            if (!isDetailView) showAttractScreen();
        }, ATTRACT_TIMEOUT);
    }

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

        // Angles légèrement différents pour varier les axes de vue
        const angles = [
            { dx: -0.15, dy:  0.08, dz:  0.95 },
            { dx:  0.22, dy: -0.06, dz:  0.88 },
            { dx:  0.08, dy:  0.18, dz:  0.90 },
            { dx: -0.20, dy:  0.05, dz:  0.92 },
        ];

        const steps = [];
        focuses.forEach((focus, i) => {
            const a = angles[i % angles.length];
            // Zoom direct sur le point → pause 5s (pas de dézoom intermédiaire)
            const closeDist = maxDim * 0.72;
            steps.push({
                toTarget: focus,
                toPos: new THREE.Vector3(
                    focus.x + a.dx * closeDist,
                    focus.y + a.dy * closeDist,
                    focus.z + a.dz * closeDist
                ),
                frames: 150,
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

                // Construire la courbe de trajectoire caméra (offset identique au modèle)
                pathCurve = new THREE.CatmullRomCurve3(
                    PATH_POINTS_RAW.map(p => new THREE.Vector3(p.x - center.x, p.y - center.y, p.z - center.z)),
                    true, 'catmullrom', 0.5
                );

                // Ajuster la caméra selon la taille du modèle
                const maxDim = Math.max(size.x, size.y, size.z);
                const distance = maxDim * 0.45;
                camera.position.set(distance * 0.7, distance * 0.5, distance);
                camera.near = maxDim * 0.001;
                camera.far = maxDim * 100;
                camera.updateProjectionMatrix();

                controls.target.set(0, 0, 0);
                controls.minDistance = 0;
                controls.maxDistance = Infinity;
                controls.update();

                // Sauvegarder la position d'accueil (cadrage toutes les formes)
                isModelLoaded = true;
                homePos.set(distance * 0.7, distance * 0.5, distance);
                homeTarget.set(0, 0, 0);
                resetIdleTimer();

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
                            // Intensité modérée : couleurs vives sans surexposition blanche
                            mat.envMapIntensity = 1.1;
                            mat.needsUpdate = true;
                        });
                    }
                });

                // Ombres portées sur tous les meshes
                model.traverse((node) => {
                    if (node.isMesh) {
                        node.castShadow    = true;
                        node.receiveShadow = true;
                    }
                });

                scene.add(model);

                // Collecter les objets cliquables (hors meshes "text" de Blender)
                clickableObjects = [];
                model.traverse((node) => {
                    if (node.isMesh || node.isLine) {
                        if (node.name.toLowerCase() === 'text') {
                            console.log(`🚫 Exclu du raycasting : "${node.name}"`);
                            return;
                        }
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
        resetIdleTimer();
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
            // Remonter jusqu'à un ancêtre dont le nom existe dans CONTENT
            // (le mesh cliqué peut être un enfant du groupe Blender nommé)
            let target = hits[0].object;
            while (target && !CONTENT[target.name] && target.parent && target.parent !== currentModel) {
                target = target.parent;
            }
            console.log(`🎯 Objet résolu : "${target?.name}"`);
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

        const content = CONTENT[obj.name] || CONTENT['__default__'] || {
            title: obj.name || 'Forme',
            description: '',
            figures: []
        };

        // Centre : depuis content.js ou bounding box automatique
        const center = content.center
            ? new THREE.Vector3(content.center.x, content.center.y, content.center.z)
            : bbCenter;

        // ── Phase 1 : cadrage direct sur la forme ─────────────
        const framingDist = maxDim * 1.4;
        const framingPos = new THREE.Vector3(
            center.x + framingDist * 0.35,
            center.y + framingDist * 0.25,
            center.z + framingDist * 0.9
        );
        showDetailPanel(content);
        animateCameraTo(framingPos, center, 70, () => {
            // ── Phase 2 : tour automatique des points d'intérêt ───
            tourQueue = buildTourSteps(center, size, maxDim, content.tourPoints);
            tourOnAllComplete = () => {
                controls.enabled = true;
            };
            tourPauseTimeout = setTimeout(runNextTourStep, 1200);
        });
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
            controls.enabled = true;
        });
    }

    // ── Afficher le panneau détail ────────────────────────────
    function showDetailPanel(content) {
        detailTitle.textContent = content.title;
        const fr = content.description || '';
        const en = content.descriptionEn || '';
        detailDesc.innerHTML = fr.replace(/\n/g, '<br>');
        detailDescEn.innerHTML = en.replace(/\n/g, '<br>');

        const figures = content.figures || [];
        imagesList.innerHTML = '';
        detailImages.style.display = figures.length ? '' : 'none';
        figures.forEach((fig) => {
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

    // Attract screen : un toucher/clic cache le texte et reprend l'interaction
    if (attractScreen) {
        const dismissAttract = () => { hideAttractScreen(); resetIdleTimer(); };
        attractScreen.addEventListener('click', dismissAttract);
        attractScreen.addEventListener('touchend', dismissAttract);
    }

    // ── Redimensionnement ─────────────────────────────────────
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // Désactiver l'auto-rotate à la première interaction et réarmer le timer
    controls.addEventListener('start', () => {
        controls.autoRotate = false;
        resetIdleTimer();
    });

    // ── Navigation tactile ────────────────────────────────────
    // Tap 1 doigt → sélectionner une forme (équivalent clic souris)
    let touchStartX = 0, touchStartY = 0, isTouchDragging = false;

    canvas.addEventListener('touchstart', (e) => {
        resetIdleTimer();
        if (e.touches.length === 1) {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
            isTouchDragging = false;
        } else {
            isTouchDragging = true; // multi-touch = zoom/pan, pas un tap
        }
    }, { passive: true });

    canvas.addEventListener('touchmove', (e) => {
        resetIdleTimer();
        if (e.touches.length === 1) {
            const dx = e.touches[0].clientX - touchStartX;
            const dy = e.touches[0].clientY - touchStartY;
            if (Math.sqrt(dx * dx + dy * dy) > 8) isTouchDragging = true;
        }
    }, { passive: true });

    canvas.addEventListener('touchend', (e) => {
        if (isTouchDragging || e.changedTouches.length !== 1) return;
        if (isDetailView) return;
        const touch = e.changedTouches[0];
        mouse.x =  (touch.clientX / window.innerWidth)  * 2 - 1;
        mouse.y = -(touch.clientY / window.innerHeight) * 2 + 1;
        raycaster.setFromCamera(mouse, camera);
        const hits = raycaster.intersectObjects(clickableObjects, true);
        if (hits.length > 0) {
            const pt = hits[0].point;
            console.log(`🎯 Tap : { x: ${pt.x.toFixed(3)}, y: ${pt.y.toFixed(3)}, z: ${pt.z.toFixed(3)} }`);
            let target = hits[0].object;
            while (target && !CONTENT[target.name] && target.parent && target.parent !== currentModel) {
                target = target.parent;
            }
            enterDetailView(target);
        }
    });

    // Boucle de rendu
    function animate() {
        requestAnimationFrame(animate);

        // Trajectoire caméra idle
        if (isPathMode && !cameraAnim) {
            pathT = (pathT + PATH_SPEED) % 1;
            camera.position.copy(pathCurve.getPoint(pathT));
            // Regarder dans la direction du mouvement (tangente légèrement en avant)
            const lookT = (pathT + PATH_SPEED * 30) % 1;
            const lookTarget = pathCurve.getPoint(lookT);
            camera.lookAt(lookTarget);
            controls.target.copy(lookTarget);
        }

        // Animation caméra fluide (transition)
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

        if (!isPathMode) controls.update();
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
