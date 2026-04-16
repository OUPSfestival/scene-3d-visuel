import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// Fonction d'initialisation - attendre que le DOM soit prêt
async function initViewer() {
    // Éléments DOM
    const canvas = document.getElementById('scene3d');
    const loadingEl = document.getElementById('loading');
    const controlsInfo = document.getElementById('controls-info');

    // Vérifier que tous les éléments existent
    if (!canvas || !loadingEl) {
        console.error('Erreur : éléments DOM manquants');
        console.log({ canvas, loadingEl });
        return;
    }

    console.log('✅ DOM chargé, initialisation du viewer...');

    // Renderer
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a2e);

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

    // Grille au sol (optionnelle)
    const grid = new THREE.GridHelper(20, 40, 0x444466, 0x333355);
    grid.material.opacity = 0.4;
    grid.material.transparent = true;
    scene.add(grid);

    // Loader pour les modèles glTF / GLB
    const loader = new GLTFLoader();

    // Stockage du modèle actuel
    let currentModel = null;

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
                controls.update();

                scene.add(model);

                // Masquer le loader et afficher les contrôles
                loadingEl.classList.remove('active');
                controlsInfo.classList.remove('hidden');
                console.log('✅ Modèle chargé avec succès');
            },
            (progress) => {
                console.log('Chargement...', Math.round(progress.loaded / progress.total * 100) + '%');
            },
            (error) => {
                console.error('Erreur lors du chargement du modèle :', error);
                loadingEl.querySelector('p').textContent =
                    '❌ Impossible de charger model.glb';
                loadingEl.querySelector('.spinner').style.display = 'none';
            }
        );
    }

    // Charger automatiquement model.glb au démarrage
    console.log('🚀 Chargement automatique de model.glb...');
    loadModelFromURL('./model.glb');

    // Redimensionnement
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
