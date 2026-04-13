# Guide : Mettre sur GitHub Pages

## 📋 Étapes

### 1️⃣ Créer un repo GitHub

1. Allez sur [github.com](https://github.com)
2. Cliquez sur **"New"** pour créer un nouveau repository
3. Nommez-le `scene-3d-visuel` (ou autre)
4. ✅ **Public** (obligatoire pour GitHub Pages)
5. Cliquez **"Create repository"**

### 2️⃣ Initialiser Git localement

Ouvrez le terminal PowerShell dans `c:\Users\antoi\scene 3d visuel` :

```powershell
# Initialiser le repo git
git init

# Ajouter tous les fichiers
git add .

# Faire le premier commit
git commit -m "Initial commit: 3D viewer with Three.js"

# Ajouter l'URL distante (remplacer YOUR_USERNAME par votre pseudo GitHub)
git remote add origin https://github.com/YOUR_USERNAME/scene-3d-visuel.git

# Envoyer sur GitHub
git branch -M main
git push -u origin main
```

### 3️⃣ Activer GitHub Pages

1. Allez sur votre repo : `https://github.com/YOUR_USERNAME/scene-3d-visuel`
2. Cliquez sur **Settings** (⚙️)
3. Dans la barre gauche, allez à **Pages**
4. Sous "Source", sélectionnez **main** et **/root**
5. Cliquez **Save**

La page sera disponible à : `https://YOUR_USERNAME.github.io/scene-3d-visuel/`

### 4️⃣ Ajouter un domain personnalisé (Optionnel)

#### Option A : Utiliser un sous-domaine gratuit
Si vous avez un domain (ex: `exemple.com`), vous pouvez y pointer GitHub Pages :

**Dans votre registrar (GoDaddy, OVH, etc.) :**
1. Allez à vos DNS
2. Créez un **CNAME record** :
   - **Name** : `3d` (ou ce que vous voulez)
   - **Target** : `YOUR_USERNAME.github.io`

**Dans GitHub :**
1. Settings → Pages
2. Sous "Custom domain", entrez : `3d.exemple.com`
3. Cochez **Enforce HTTPS**

> Attendez ~10-15 min que le DNS se propage

#### Option B : Domain gratuit via Freenom
1. Allez sur [freenom.com](https://www.freenom.com)
2. Cherchez un domaine (gratuit pendant 12 mois)
3. Enregistrez-le
4. Allez à Management → MyDomains
5. Cliquez **Manage Domain**
6. Dans "Management Tools" → "Nameservers", entrez les nameservers de GitHub (voir docs GitHub Pages)

---

## ✅ C'est fait !

Après quelques minutes, votre visualiseur 3D sera en ligne ! 🚀

```
https://votre-domain.com/
ou
https://YOUR_USERNAME.github.io/scene-3d-visuel/
```

Glissez-déposez des fichiers `.glb` et profitez ! 🎉
