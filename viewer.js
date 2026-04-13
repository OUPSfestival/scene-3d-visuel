import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// Fonction d'initialisation - attendre que le DOM soit prêt
async function initViewer() {
    // Éléments DOM
    const canvas = document.getElementById('scene3d');
    const dropZone = document.getElementById('drop-zone');
    const loadingEl = document.getElementById('loading');
    const controlsInfo = document.getElementById('controls-info');
    const fileInput = document.getElementById('file-input');
    const dropBox = document.getElementById('drop-box');

    // Vérifier que tous les éléments existent
    if (!canvas || !dropZone || !loadingEl || !fileInput || !dropBox) {
        console.error('Erreur : éléments DOM manquants');
        console.log({ canvas, dropZone, loadingEl, fileInput, dropBox });
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

    // Stockage du modèle actuel pour le remplacer
    let currentModel = null;

    // Fonction pour charger et afficher un modèle
    function loadModel(file) {
        const reader = new FileReader();
        
        reader.onload = (e) => {
            // Afficher le loader
            loadingEl.classList.add('active');
            dropZone.classList.add('hidden');
            
            try {
                const arrayBuffer = e.target.result;
                
                loader.parse(
                    arrayBuffer,
                    file.name.substring(0, file.name.lastIndexOf('/') + 1),
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
                    (error) => {
                        console.error('Erreur de parsing du modèle :', error);
                        loadingEl.querySelector('p').textContent =
                            '❌ Impossible de charger le modèle. Format non reconnu.';
                        loadingEl.querySelector('.spinner').style.display = 'none';
                    }
                );
            } catch (error) {
                console.error('Erreur :', error);
                loadingEl.querySelector('p').textContent = '❌ Erreur lors du chargement.';
                loadingEl.querySelector('.spinner').style.display = 'none';
            }
        };

        reader.onerror = () => {
            loadingEl.classList.remove('active');
            alert('Erreur lors de la lecture du fichier');
        };

        reader.readAsArrayBuffer(file);
    }

    // Gestion du drag-and-drop
    document.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropZone.classList.add('drag-over');
    });

    document.addEventListener('dragleave', (e) => {
        if (e.target === document) {
            dropZone.classList.remove('drag-over');
        }
    });

    document.addEventListener('drop', (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropZone.classList.remove('drag-over');

        const files = e.dataTransfer.files;
        if (files.length > 0) {
            const file = files[0];
            const ext = file.name.split('.').pop().toLowerCase();
            if (['glb', 'gltf'].includes(ext)) {
                console.log('📁 Fichier détecté :', file.name);
                loadModel(file);
            } else {
                alert('Seuls les fichiers .glb et .gltf sont acceptés.');
            }
        }
    });

    // Gestion du clic sur la zone de drop
    dropBox.addEventListener('click', () => {
        console.log('🖱️ Clic sur la zone de drop');
        fileInput.click();
    });

    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            console.log('📁 Fichier sélectionné :', e.target.files[0].name);
            loadModel(e.target.files[0]);
        }
    });

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
