# Carte Interactive — Romanche & Oisans, Août 1944

Carte interactive historique recensant les victimes de la répression nazie dans la vallée de la Romanche et l'Oisans (Isère) en août 1944.

## 📋 Description

Cette application web permet de visualiser sur une carte interactive les lieux de mémoire, exécutions, combats et événements tragiques survenus pendant l'occupation allemande de la région en août 1944.

### Fonctionnalités

- **Carte interactive** avec marqueurs géolocalisés
- **Filtres avancés** par type d'événement, commune et période
- **Popups détaillées** avec informations sur chaque lieu et liste des victimes
- **Statistiques** : répartition par commune, chronologie
- **Interface responsive** : fonctionne sur ordinateur, tablette et mobile
- **Données actualisables** : basé sur un fichier CSV facilement modifiable

## 🚀 Installation

### Prérequis

- Un serveur web local (Apache, Nginx, ou serveur Python)
- Navigateur moderne (Chrome, Firefox, Safari, Edge)

### Installation locale

1. **Télécharger le projet**
   ```bash
   # Cloner ou télécharger les fichiers
   ```

2. **Lancer un serveur local**
   
   Option A - Python 3 :
   ```bash
   cd carte_romanche_v8
   python3 -m http.server 8000
   ```
   
   Option B - PHP :
   ```bash
   cd carte_romanche_v8
   php -S localhost:8000
   ```
   
   Option C - Node.js (avec `http-server`) :
   ```bash
   npm install -g http-server
   cd carte_romanche_v8
   http-server -p 8000
   ```

3. **Ouvrir dans le navigateur**
   ```
   http://localhost:8000
   ```

### Déploiement sur GitHub Pages

1. Uploadez les fichiers dans un dépôt GitHub
2. Allez dans Settings → Pages
3. Sélectionnez la branche `main` et le dossier `/` (ou `/docs`)
4. Votre site sera disponible à : `https://votre-nom.github.io/nom-du-repo/`

## 📁 Structure du projet

```
carte_romanche_v8/
├── index.html          # Page principale
├── css/
│   └── styles.css      # Styles personnalisés
├── js/
│   └── carte.js        # Logique de la carte
├── data/
│   └── victimes.csv    # Données des victimes (SOURCE UNIQUE)
├── assets/
│   └── logo_amis_histoire.png  # Logo (optionnel)
└── README.md
```

## 📊 Format des données

Le fichier `data/victimes.csv` contient les informations suivantes :

| Colonne | Description | Exemple |
|---------|-------------|---------|
| `commune` | Commune principale | `Livet-et-Gavet` |
| `lieu_dit` | Lieu précis | `Poursollet` |
| `date` | Date au format ISO | `1944-08-13` |
| `nom` | Nom de la victime | `Georges ARMAND` |
| `statut` | Circonstances | `Tué au combat` |
| `source` | Référence documentaire | `Maitron — ...` |

### Ajouter des données

1. Ouvrez `data/victimes.csv` dans un éditeur de texte ou Excel
2. Ajoutez une nouvelle ligne avec les informations
3. Sauvegardez le fichier
4. Rechargez la page web

**Important** : Pour que les nouveaux lieux apparaissent sur la carte, vous devez ajouter leurs coordonnées GPS dans la fonction `getLocationCoordinates()` du fichier `js/carte.js`.

## 🎨 Personnalisation

### Couleurs

Modifiez les variables CSS dans `css/styles.css` :

```css
:root {
    --color-primary: #2c3e50;      /* Couleur principale */
    --color-accent: #8b4513;       /* Couleur d'accentuation */
    --color-execution: #8b0000;    /* Marqueurs exécutions */
    --color-combat: #1e3a8a;       /* Marqueurs combats */
    --color-civil: #6b7280;        /* Marqueurs civils */
}
```

### Vues prédéfinies

Ajoutez ou modifiez les vues dans `js/carte.js` :

```javascript
const CONFIG = {
    views: {
        'Votre Vue': [[lat_min, lon_min], [lat_max, lon_max]],
        'Basse Romanche': [[45.050, 5.770], [45.095, 5.860]]
    }
};
```

### Logo

Placez votre logo dans `assets/` et mettez à jour le chemin dans `index.html` si nécessaire.

## 🔧 Technologies utilisées

- **Leaflet.js 1.9.4** — Bibliothèque de cartes interactives
- **Leaflet.markercluster** — Regroupement intelligent des marqueurs
- **PapaParse 5.4.1** — Parsing du fichier CSV
- **OpenStreetMap** — Fond de carte
- **CSS Grid & Flexbox** — Mise en page responsive
- **Vanilla JavaScript** — Pas de framework lourd

## 📱 Compatibilité

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ✅ Mobile (iOS Safari, Chrome Android)

## 🤝 Contribution

Pour contribuer au projet :

1. Signalez des erreurs dans les données
2. Proposez des améliorations de l'interface
3. Ajoutez de nouvelles fonctionnalités

## 📜 Licence

Données historiques : Sources citées (Maitron, Archives départementales)
Code source : Libre d'utilisation pour projets éducatifs et mémoriels

## 🙏 Crédits

- **Données historiques** : Maitron, Archives départementales Rhône & Métropole
- **Cartographie** : OpenStreetMap contributors
- **Développement** : [Votre nom / Les Amis de l'Histoire]

## 📞 Contact

Pour toute question : [votre-email@exemple.fr]

---

**Mémoire et transmission** — Ce projet est dédié à la mémoire des victimes de la barbarie nazie dans la vallée de la Romanche et l'Oisans en août 1944.
