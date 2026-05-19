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

    // Lumières
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
    dirLight.position.set(5, 10, 7);
    scene.add(dirLight);

    const fillLight = new THREE.DirectionalLight(0x8888ff, 0.4);
    fillLight.position.set(-5, 2, -5);
    scene.add(fillLight);

    // Loader pour les modèles glTF / GLB
    const loader = new GLTFLoader();

    // État général
    let currentModel = null;
    let clickableObjects = [];
    let isDetailView = false;
    let cameraAnim = null;
    const overviewPos    = new THREE.Vector3();
    const overviewTarget = new THREE.Vector3();

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

                // Forcer la transparence sur tous les matériaux qui en ont besoin
                // (inclut les matériaux déjà marqués transparent par GLTFLoader via alphaMode:BLEND)
                model.traverse((node) => {
                    if (node.isMesh) {
                        const materials = Array.isArray(node.material) ? node.material : [node.material];
                        materials.forEach((mat) => {
                            if (mat.transparent || mat.opacity < 1 || mat.alphaMap || mat.alphaTest > 0) {
                                mat.transparent = true;
                                mat.depthWrite = false;
                                mat.needsUpdate = true;
                            }
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
        controls.enabled = false; // désactivé pendant l'animation

        overviewPos.copy(camera.position);
        overviewTarget.copy(controls.target);

        const box    = new THREE.Box3().setFromObject(obj);
        const center = box.getCenter(new THREE.Vector3());
        const size   = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);

        // Zoom serré : la forme remplit l'écran, panneau droit laissé libre
        const targetPos = new THREE.Vector3(
            center.x - maxDim * 0.15,
            center.y,
            center.z + maxDim * 1.1
        );
        animateCameraTo(targetPos, center, 80, () => {
            // Réactiver l'orbite autour de la forme sélectionnée
            controls.minDistance = maxDim * 0.4;
            controls.maxDistance = maxDim * 2.5;
            controls.enabled = true;
        });

        const content = CONTENT[obj.name] || CONTENT['__default__'] || {
            title: obj.name || 'Forme',
            description: '',
            figures: []
        };
        showDetailPanel(content);
    }

    // ── Sortir de la vue détail ──────────────────────────────
    function exitDetailView() {
        isDetailView = false;
        controls.enabled = false; // désactivé pendant l'animation retour
        hideDetailPanel();
        canvas.style.cursor = 'default';
        animateCameraTo(overviewPos, overviewTarget, 80, () => {
            // Restaurer les distances originales et réactiver
            controls.minDistance = originalMinDist;
            controls.maxDistance = originalMaxDist;
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
