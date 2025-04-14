# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

## Modification des Classifications Énergétiques

Les classifications énergétiques sont définies dans les fichiers JSON situés dans `src/ressources/`. Ces fichiers peuvent être modifiés pour refléter les évolutions de la réglementation.

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
- `src/ressources/01 chauffage.json`
- `src/ressources/02 ECS.json`
- `src/ressources/03 refroidissement.json`
- `src/ressources/04 ventil_clim.json`
- `src/ressources/05 eclairage.json`
- `src/ressources/06 stores.json`
- `src/ressources/07 GTB.json`
