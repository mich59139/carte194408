# 🗺️ Carte Interactive — Guide de Démarrage Rapide

## ✨ Nouveautés de la version 8

Votre carte interactive a été complètement modernisée ! Voici ce qui a changé :

### 🎯 Principales améliorations

1. **Interface moderne et élégante**
   - Design sobre et respectueux du contexte historique
   - Navigation intuitive avec sidebar coulissante
   - Modales pour l'aide et les statistiques

2. **Chargement dynamique des données**
   - Les données sont lues directement depuis le CSV
   - Plus besoin de regénérer le HTML à chaque modification
   - Un seul fichier à mettre à jour : `data/victimes.csv`

3. **Filtres avancés**
   - Filtrer par type d'événement (exécutions, combats, civils)
   - Sélection de communes multiples
   - Plage de dates personnalisable

4. **Statistiques intégrées**
   - Nombre total de victimes
   - Répartition par commune (graphiques)
   - Chronologie des événements

5. **Responsive et accessible**
   - Fonctionne parfaitement sur mobile
   - Interface tactile optimisée
   - Popups adaptatives

6. **Performance**
   - Bibliothèques à jour (Leaflet 1.9.4)
   - Clustering intelligent des marqueurs
   - Chargement rapide

## 🚀 Comment utiliser

### Méthode 1 : Serveur local (recommandé)

```bash
# Dans le dossier carte_romanche_v8
python3 -m http.server 8000
```

Puis ouvrez : http://localhost:8000

### Méthode 2 : Double-clic sur index.html

⚠️ **Attention** : Cela ne fonctionnera pas à cause des restrictions CORS (le navigateur bloque le chargement du CSV).

Vous **devez** utiliser un serveur local.

### Méthode 3 : GitHub Pages

1. Uploadez tout le dossier sur GitHub
2. Activez GitHub Pages dans les settings
3. Votre carte sera accessible en ligne !

## 📝 Mettre à jour les données

### Ajouter une victime

1. Ouvrez `data/victimes.csv`
2. Ajoutez une ligne avec ces colonnes :
   - `commune` : Nom de la commune
   - `lieu_dit` : Lieu précis
   - `date` : Format YYYY-MM-DD
   - `nom` : Nom de la victime
   - `statut` : "Exécuté", "Tué au combat", etc.
   - `source` : Référence documentaire

3. Sauvegardez le fichier

4. **Important** : Si c'est un nouveau lieu, ajoutez ses coordonnées GPS dans `js/carte.js` :

```javascript
function getLocationCoordinates() {
    return {
        'Commune_Lieu': { lat: 45.1234, lon: 5.6789 },
        // ... autres lieux
    };
}
```

### Vérifier les données

Lancez le script de validation :

```bash
python3 generate_map.py
```

Ce script vous dira :
- ✅ Si les données sont valides
- 📊 Les statistiques
- 📍 Les lieux sans coordonnées GPS

## 🎨 Personnaliser

### Changer les couleurs

Éditez `css/styles.css`, section `:root` :

```css
:root {
    --color-primary: #2c3e50;      /* Bleu foncé */
    --color-accent: #8b4513;       /* Marron terre */
    --color-execution: #8b0000;    /* Rouge foncé */
    --color-combat: #1e3a8a;       /* Bleu marine */
    --color-civil: #6b7280;        /* Gris */
}
```

### Ajouter des vues prédéfinies

Dans `js/carte.js` :

```javascript
const CONFIG = {
    views: {
        'Ma nouvelle vue': [[lat_min, lon_min], [lat_max, lon_max]],
        // ... autres vues
    }
};
```

### Modifier le logo

Remplacez `assets/logo_amis_histoire.png` par votre logo.

## 📱 Navigation

- **Zoom** : Molette de souris ou boutons +/-
- **Déplacer** : Cliquer-glisser sur la carte
- **Marqueur** : Cliquez pour voir les détails
- **Filtres** : Bouton ☰ en haut à gauche
- **Aide** : Bouton ? en haut à droite
- **Statistiques** : Bouton 📊 en haut à droite
- **Recentrer** : Bouton ⌂ sur la carte

## 🔧 Dépannage

### La carte ne charge pas

1. Vérifiez que vous utilisez un serveur local (pas en double-cliquant sur index.html)
2. Ouvrez la console du navigateur (F12) pour voir les erreurs
3. Vérifiez que `data/victimes.csv` existe

### Les marqueurs n'apparaissent pas

1. Vérifiez que les lieux ont des coordonnées dans `getLocationCoordinates()`
2. Lancez `python3 generate_map.py` pour voir les lieux manquants

### Les filtres ne fonctionnent pas

1. Cliquez sur "Appliquer les filtres" après avoir fait vos choix
2. Vérifiez la console du navigateur pour des erreurs JavaScript

## 📦 Structure des fichiers

```
carte_romanche_v8/
├── index.html              ← Page principale
├── css/
│   └── styles.css          ← Tous les styles
├── js/
│   └── carte.js            ← Toute la logique
├── data/
│   └── victimes.csv        ← VOS DONNÉES (à modifier)
├── assets/
│   └── logo_*.png          ← Images (optionnel)
├── generate_map.py         ← Script de validation
└── README.md               ← Documentation complète
```

## 🆚 Différences avec l'ancienne version

| Aspect | Ancienne version (v7) | Nouvelle version (v8) |
|--------|----------------------|----------------------|
| **Données** | HTML généré par Python | CSV chargé dynamiquement |
| **Mise à jour** | Régénérer tout le HTML | Modifier juste le CSV |
| **Design** | Basique Bootstrap | Interface moderne sur mesure |
| **Filtres** | Aucun | Complets (catégorie, date, commune) |
| **Stats** | Aucune | Intégrées avec graphiques |
| **Mobile** | Fonctionnel | Optimisé |
| **Performance** | Leaflet 1.6 (2020) | Leaflet 1.9.4 (2023) |

## 🎓 Ressources

- **Leaflet.js** : https://leafletjs.com/
- **OpenStreetMap** : https://www.openstreetmap.org/
- **PapaParse** : https://www.papaparse.com/

## 💬 Questions fréquentes

**Q : Puis-je utiliser cette carte sur mon site web ?**  
R : Oui, copiez simplement tous les fichiers sur votre serveur.

**Q : Comment ajouter de nouveaux types d'événements ?**  
R : Modifiez la fonction `determineCategory()` dans `js/carte.js`.

**Q : Puis-je exporter la carte en image ?**  
R : Utilisez la fonction d'impression du navigateur ou un outil de capture d'écran.

**Q : Les données sont-elles sauvegardées quelque part ?**  
R : Non, tout est local. Le CSV est la seule source.

## ✉️ Support

Pour toute question ou problème :
1. Consultez le README.md complet
2. Vérifiez la console du navigateur (F12)
3. Lancez le script de validation Python

---

**Bon courage avec votre projet de mémoire ! 🕊️**
