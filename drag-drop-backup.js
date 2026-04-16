// ============================================================
// BACKUP du système de Drag-Drop (avant suppression)
// Utilise ce code si tu veux réactiver le drag-drop
// ============================================================

// À placer dans la fonction initViewer() après la création du loader

const oldDragDropCode = `
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
`;

// Fonction originale loadModel (à partir d'un File)
const oldLoadModel = `
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
`;

// HTML drop-zone à conserver
const oldDropZoneHTML = `
    <!-- Zone de drop -->
    <div id="drop-zone">
        <div class="drop-box" id="drop-box">
            <div class="icon">📦</div>
            <h2>Glisse ton fichier .glb ici</h2>
            <p>ou clique pour sélectionner</p>
            <input type="file" id="file-input" accept=".glb,.gltf">
        </div>
        <p style="margin-top: 1rem; font-size: 0.8rem; color: #666;">
            Fichier exporté depuis Blender au format glTF Binary (.glb)
        </p>
    </div>
`;

// CSS drop-zone à conserver
const oldDropZoneCSS = `
    #drop-zone {
        position: fixed; inset: 0; z-index: 20;
        display: flex; flex-direction: column; align-items: center; justify-content: center;
        background: #1a1a2e; color: #ccc; gap: 1.2rem; text-align: center; padding: 2rem;
    }
    #drop-zone.hidden { display: none; }
    #drop-zone.drag-over { background: #2a2a4e; }
    .drop-box {
        width: 340px; padding: 50px 40px;
        border: 2px dashed rgba(124, 108, 240, 0.5); border-radius: 16px;
        cursor: pointer; transition: border-color 0.2s, background 0.2s;
    }
    .drop-box:hover, #drop-zone.drag-over .drop-box {
        border-color: #7c6cf0; background: rgba(124, 108, 240, 0.08);
    }
    .drop-box h2 { font-size: 1.3rem; margin-bottom: 0.6rem; color: #e0e0ff; }
    .drop-box p { font-size: 0.9rem; color: #888; }
    .drop-box input { display: none; }
    .drop-box .icon { font-size: 2.5rem; margin-bottom: 0.6rem; }
`;
