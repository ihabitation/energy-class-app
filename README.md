# Energy Class App

Application d'évaluation énergétique des bâtiments permettant de classifier les différents systèmes techniques selon leur performance énergétique.

## 🎯 Fonctionnalités

- Évaluation des systèmes techniques par catégories :
  - Chauffage
  - Eau Chaude Sanitaire (ECS)
  - Refroidissement
  - Ventilation
  - Éclairage
  - Stores
  - GTB (Gestion Technique du Bâtiment)

- Classification énergétique de A à D
- Interface utilisateur intuitive et moderne
- Suivi de la progression par catégorie
- Visualisation des résultats avec code couleur

## 🚀 Installation

1. Clonez le dépôt :
```bash
git clone https://github.com/ihabitation/energy-class-app.git
cd energy-class-app
```

2. Installez les dépendances :
```bash
npm install
```

3. Lancez l'application en mode développement :
```bash
npm start
```

L'application sera accessible à l'adresse [http://localhost:3000](http://localhost:3000)

## 🛠 Technologies utilisées

- React
- TypeScript
- Material-UI
- React Router
- Context API

## 📱 Utilisation

1. Sélectionnez une catégorie sur la page d'accueil
2. Parcourez les sous-catégories
3. Évaluez chaque élément en sélectionnant la classe énergétique appropriée
4. Visualisez les résultats globaux et par catégorie

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à :
1. Fork le projet
2. Créer une branche pour votre fonctionnalité
3. Commiter vos changements
4. Pousser vers la branche
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est sous licence MIT.

## 📞 Contact

Pour toute question ou suggestion, n'hésitez pas à ouvrir une issue sur GitHub.

## 📈 Roadmap & Développements Futurs

### Priorité 1 - Gestion des Projets
- Création et enregistrement de projets
- Interface de gestion des projets (création, modification, suppression)
- Système de sauvegarde des données par projet
- Accès et modification des évaluations précédentes
- Organisation des projets par client/bâtiment
- Système de recherche et filtrage des projets

### Priorité 2 - Expérience Utilisateur
- Mode sombre/clair pour une meilleure accessibilité
- Tableau de bord personnalisable avec statistiques clés
- Système avancé de filtres et de recherche
- Visualisations graphiques interactives des résultats
- Mode présentation client avec exports personnalisés
- Interface adaptative selon le profil utilisateur
- Notifications et alertes personnalisables
- Workflows personnalisés par type de projet

### Priorité 3 - Conformité et Normes
- Intégration des dernières normes énergétiques
- Mises à jour automatiques des réglementations
- Génération de rapports de conformité
- Suivi des évolutions réglementaires
- Validation automatique des critères normatifs
- Alertes sur les changements réglementaires
- Base de données des normes par région/pays
- Assistant de mise en conformité

### Autres Améliorations Prévues

#### Analyse Financière
- Calcul du taux de retour sur investissement (ROI)
- Estimation des coûts des améliorations
- Analyse comparative des différentes solutions
- Tableaux de simulation financière
- Export des analyses financières
- Intégration des coûts énergétiques locaux

#### Prescription Automatique
- Système de recommandation d'équipements techniques
- Base de données des équipements disponibles
- Matching automatique entre besoins et solutions
- Génération de cahiers des charges
- Comparaison des solutions techniques
- Mise à jour automatique des catalogues produits

#### Fonctionnalités Techniques
- Export des évaluations en PDF/Excel
- Mode hors-ligne avec synchronisation
- Historique des évaluations
- Comparaison entre différents bâtiments
- API REST pour l'intégration avec d'autres systèmes

#### Gestion des Données
- Multi-utilisateurs avec différents rôles
- Sauvegarde automatique dans le cloud
- Import/Export des données
- Base de données de références

## Modification des Classifications Énergétiques

Les classifications énergétiques sont définies dans les fichiers JSON situés dans `energy-class-app/src/ressources/`. Ces fichiers peuvent être modifiés pour refléter les évolutions de la réglementation.

### Structure des Fichiers

Chaque fichier JSON suit cette structure :
```json
{
  "categorie_id": {
    "description": "Description de la catégorie",
    "sous_categories": {
      "sous_categorie_id": {
        "description": "Description de la sous-catégorie",
        "classes": {
          "classe_D": {
            "option_id": {
              "description": "Description de l'option",
              "impact": "Impact sur la performance",
              "images": []
            }
          },
          // autres classes...
        }
      }
    }
  }
}
```

### Modification des Classes

Pour modifier la répartition des classes, plusieurs cas sont possibles :

1. **Modifier les critères d'une classe existante**
   - Modifiez directement la `description` et l'`impact` dans la classe concernée
   ```json
   "classe_A": {
     "option_id": {
       "description": "Nouvelle description",
       "impact": "Nouvel impact"
     }
   }
   ```

2. **Échanger les critères entre classes**
   - Pour déplacer les critères de la classe B vers la classe A, copiez le contenu complet de `classe_B` vers `classe_A`
   ```json
   // Avant
   "classe_B": { "option_1": {...} }
   "classe_A": { "option_2": {...} }
   
   // Après
   "classe_B": { "option_2": {...} }
   "classe_A": { "option_1": {...} }
   ```

3. **Ajouter une nouvelle classe**
   - Ajoutez une nouvelle entrée dans l'objet "classes"
   ```json
   "classes": {
     "classe_E": {
       "nouvelle_option": {
         "description": "Description de la nouvelle classe",
         "impact": "Impact de la nouvelle classe",
         "images": []
       }
     }
   }
   ```

### Points Importants

- Maintenez la cohérence des noms de classes entre tous les fichiers JSON
- Assurez-vous que chaque classe contient les mêmes champs (description, impact)
- Vérifiez la validité du format JSON après modification
- Si vous ajoutez de nouvelles classes, le code TypeScript devra être mis à jour en conséquence

### Emplacement des Fichiers

Les fichiers de classification se trouvent dans :
- `energy-class-app/src/ressources/01 chauffage.json`
- `energy-class-app/src/ressources/02 ECS.json`
- `energy-class-app/src/ressources/03 refroidissement.json`
- `energy-class-app/src/ressources/04 ventil_clim.json`
- `energy-class-app/src/ressources/05 eclairage.json`
- `energy-class-app/src/ressources/06 stores.json`
- `energy-class-app/src/ressources/07 GTB.json` 