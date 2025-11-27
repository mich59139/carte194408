#!/usr/bin/env python3
"""
Script de génération de carte depuis le CSV
Permet de créer automatiquement les coordonnées et de valider les données
"""

import csv
import json
from collections import defaultdict
from datetime import datetime

def load_csv(filepath):
    """Charge le fichier CSV"""
    with open(filepath, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        return list(reader)

def group_by_location(victims):
    """Groupe les victimes par lieu"""
    groups = defaultdict(lambda: {
        'victims': [],
        'dates': set(),
        'commune': '',
        'lieu_dit': ''
    })
    
    for victim in victims:
        key = f"{victim['commune']}_{victim['lieu_dit']}"
        groups[key]['victims'].append(victim)
        groups[key]['dates'].add(victim['date'])
        groups[key]['commune'] = victim['commune']
        groups[key]['lieu_dit'] = victim['lieu_dit']
    
    return groups

def generate_statistics(victims):
    """Génère des statistiques sur les données"""
    stats = {
        'total_victims': len(victims),
        'by_commune': defaultdict(int),
        'by_date': defaultdict(int),
        'by_status': defaultdict(int)
    }
    
    for victim in victims:
        stats['by_commune'][victim['commune']] += 1
        stats['by_date'][victim['date']] += 1
        stats['by_status'][victim['statut']] += 1
    
    return stats

def print_statistics(stats):
    """Affiche les statistiques"""
    print("\n" + "="*60)
    print(" STATISTIQUES DES DONNÉES")
    print("="*60)
    
    print(f"\n📊 Total de victimes : {stats['total_victims']}")
    
    print(f"\n🏘️  Répartition par commune :")
    for commune, count in sorted(stats['by_commune'].items(), key=lambda x: -x[1]):
        print(f"  • {commune:40} : {count:3} victimes")
    
    print(f"\n📅 Répartition par date :")
    for date, count in sorted(stats['by_date'].items()):
        date_obj = datetime.strptime(date, '%Y-%m-%d')
        date_str = date_obj.strftime('%d %B %Y')
        print(f"  • {date_str:40} : {count:3} victimes")
    
    print("\n" + "="*60 + "\n")

def validate_data(victims):
    """Valide les données et signale les erreurs"""
    errors = []
    
    for i, victim in enumerate(victims, 1):
        # Vérifier les champs obligatoires
        required_fields = ['commune', 'lieu_dit', 'date', 'nom', 'statut']
        for field in required_fields:
            if not victim.get(field):
                errors.append(f"Ligne {i}: Champ '{field}' manquant")
        
        # Vérifier le format de la date
        try:
            datetime.strptime(victim['date'], '%Y-%m-%d')
        except ValueError:
            errors.append(f"Ligne {i}: Format de date invalide ({victim['date']})")
    
    if errors:
        print("\n⚠️  ERREURS DÉTECTÉES :")
        for error in errors:
            print(f"  • {error}")
        print()
    else:
        print("\n✅ Toutes les données sont valides\n")
    
    return len(errors) == 0

def list_missing_coordinates(groups, existing_coords):
    """Liste les lieux sans coordonnées"""
    missing = []
    
    for key, group in groups.items():
        if key not in existing_coords:
            missing.append({
                'key': key,
                'commune': group['commune'],
                'lieu_dit': group['lieu_dit'],
                'count': len(group['victims'])
            })
    
    if missing:
        print("\n📍 Lieux sans coordonnées GPS :")
        print("  (À ajouter dans la fonction getLocationCoordinates() de carte.js)\n")
        for item in sorted(missing, key=lambda x: -x['count']):
            print(f"  • {item['commune']} - {item['lieu_dit']}")
            print(f"    → {item['count']} victime(s)")
            print(f"    → Clé: '{item['key']}'")
            print(f"    → À ajouter: '{item['key']}': {{ lat: 00.0000, lon: 0.0000 }},")
            print()
    else:
        print("\n✅ Toutes les localisations ont des coordonnées\n")
    
    return missing

def generate_geojson(groups, coordinates):
    """Génère un fichier GeoJSON depuis les données"""
    features = []
    
    for key, group in groups.items():
        if key in coordinates:
            coord = coordinates[key]
            feature = {
                'type': 'Feature',
                'geometry': {
                    'type': 'Point',
                    'coordinates': [coord['lon'], coord['lat']]
                },
                'properties': {
                    'commune': group['commune'],
                    'lieu_dit': group['lieu_dit'],
                    'victims_count': len(group['victims']),
                    'dates': sorted(list(group['dates'])),
                    'victims': [v['nom'] for v in group['victims']]
                }
            }
            features.append(feature)
    
    geojson = {
        'type': 'FeatureCollection',
        'features': features
    }
    
    return geojson

def main():
    print("\n" + "="*60)
    print(" GÉNÉRATEUR DE CARTE — Romanche & Oisans 1944")
    print("="*60)
    
    # Charger les données
    csv_file = 'data/victimes.csv'
    print(f"\n📄 Chargement de {csv_file}...")
    
    try:
        victims = load_csv(csv_file)
        print(f"✅ {len(victims)} victimes chargées")
    except FileNotFoundError:
        print(f"❌ Erreur: Le fichier {csv_file} n'existe pas")
        return
    except Exception as e:
        print(f"❌ Erreur lors du chargement: {e}")
        return
    
    # Valider les données
    print("\n🔍 Validation des données...")
    is_valid = validate_data(victims)
    
    if not is_valid:
        response = input("❓ Continuer malgré les erreurs? (o/n): ")
        if response.lower() != 'o':
            return
    
    # Grouper par lieu
    groups = group_by_location(victims)
    print(f"\n📍 {len(groups)} lieux distincts identifiés")
    
    # Statistiques
    stats = generate_statistics(victims)
    print_statistics(stats)
    
    # Coordonnées existantes (à garder à jour avec carte.js)
    existing_coords = {
        'Allemont (Allemond)_Fonderie d\'Allemont': {'lat': 45.1318, 'lon': 6.0395},
        'Allemont (Allemond)_Les Granges (chalet)': {'lat': 45.137, 'lon': 6.046},
        'Claix_Les Peyrouses': {'lat': 45.138, 'lon': 5.6675},
        'La Morte_Les Combaz': {'lat': 45.0275, 'lon': 5.862},
        'La Morte_La Blache': {'lat': 45.0315, 'lon': 5.8675},
        'Le Bourg-d\'Oisans_La Paute': {'lat': 45.0747, 'lon': 6.012},
        'Le Bourg-d\'Oisans_Salle des fêtes (arrière)': {'lat': 45.0558, 'lon': 6.0303},
        'Le Bourg-d\'Oisans_Les Ilats': {'lat': 45.0635, 'lon': 6.035},
        'Livet-et-Gavet_Poursollet': {'lat': 45.0511, 'lon': 5.8986},
        'Livet-et-Gavet_Livet - La Chambre d\'eau': {'lat': 45.095, 'lon': 5.915},
        'Livet-et-Gavet_Gavet - L\'Adret': {'lat': 45.06, 'lon': 5.86},
        'Livet-et-Gavet_Grand Gris': {'lat': 45.085, 'lon': 5.885},
        'Livet-et-Gavet_Gavet - Fonfroide': {'lat': 45.055, 'lon': 5.87},
        'Livet-et-Gavet_Rioupéroux - Les Clots / Les Ponants': {'lat': 45.091165, 'lon': 5.909787},
        'Livet-et-Gavet_Gavet': {'lat': 45.055, 'lon': 5.87},
        'Livet-et-Gavet_Rioupéroux': {'lat': 45.0919, 'lon': 5.9031},
        'Séchilienne_Village / Les Clots (stèle)': {'lat': 45.0575, 'lon': 5.8375},
        'Séchilienne_Combats de repli': {'lat': 45.0542, 'lon': 5.8348},
        'Séchilienne_Les Rivoirands (lieu-dit)': {'lat': 45.05575, 'lon': 5.79536},
        'Vizille_La Glacière (bord de route, après arrestation)': {'lat': 45.0798, 'lon': 5.7798},
        'Vizille_La Glacière (domicile Bontoux)': {'lat': 45.0798, 'lon': 5.7798},
        'Vizille_Domicile Georges Daillencourt (jardin)': {'lat': 45.0753, 'lon': 5.7729},
        'Vizille_Place du château (mitraillage)': {'lat': 45.0753, 'lon': 5.7729},
        'Vizille_Les Rivoirands (lieu-dit, soirée)': {'lat': 45.05575, 'lon': 5.79536}
    }
    
    # Vérifier les coordonnées manquantes
    missing = list_missing_coordinates(groups, existing_coords)
    
    # Générer GeoJSON optionnel
    if not missing:
        geojson = generate_geojson(groups, existing_coords)
        output_file = 'data/lieux.geojson'
        
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(geojson, f, ensure_ascii=False, indent=2)
        
        print(f"✅ Fichier GeoJSON généré : {output_file}\n")
    
    print("="*60)
    print(" Génération terminée")
    print("="*60 + "\n")

if __name__ == '__main__':
    main()
