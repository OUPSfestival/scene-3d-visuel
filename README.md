# Scène 3D Visuel

Un visualiseur 3D interactif pour afficher des modèles **glTF (.glb)** et **GLTF (.gltf)** directement dans le navigateur, sans installation requise.

## 🎯 Fonctionnalités

- ✅ **Drag & Drop** : Glissez-déposez vos fichiers .glb/.gltf
- ✅ **Import par clic** : Ou cliquez pour sélectionner un fichier
- ✅ **Orbit Controls** : Tournez, zoomez, déplacez avec la souris
- ✅ **Auto-rotation** : Le modèle tourne automatiquement au démarrage
- ✅ **Responsive** : Fonctionne sur desktop et mobile
- ✅ **Éclairage réaliste** : Lumières ambiance + directionnelles
- ✅ **Grille au sol** : Pour une meilleure compréhension de l'échelle

## 🚀 Utilisation

### En local
```bash
cd "scene 3d visuel"
python -m http.server 8000
# Puis visitez: http://localhost:8000
```

### Sur le web
Glissez-déposez ou cliquez pour charger votre modèle Blender !

## 📝 Comment exporter depuis Blender

1. **File → Export → glTF Binary (.glb)**
2. Cochez les options :
   - ✓ Include Animations
   - ✓ Include All Bone Influences
   - ✓ Include Normals
   - ✓ Include UVs
3. Exportez et glissez le fichier sur le visualiseur 🎉

## 🛠️ Technologies

- **Three.js** : Moteur 3D WebGL
- **OrbitControls** : Navigation 3D
- **GLTFLoader** : Chargement des modèles

## 📱 Responsive

L'interface s'adapte automatiquement aux petits écrans (tablettes, téléphones).

## 📄 Licence

MIT
