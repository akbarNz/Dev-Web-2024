# Comment lancer le projet en local sur votre machine :

## Etape 1 :

Pour commencer, vous pouvez soit télécharger le fichier en .zip et le décompresser ensuite passer à l'étape 2. Ou alors, vous ouvrez un terminal dans votre IDE, et vous lancer la commande suivante : 

`git clone https://github.com/akbarNz/Dev-Web-2024.git`

## Etape 2 :

Une fois le fichier télécharger, vous ouvrez votre application de base de données, et vous créer une nouvelle base de donnée, ou ouvrez une existante.
Vous ouvrer une exécuteur de commandes sql et vous y copier et coller les lignes du dossier Fichier_DB et le fichier DB.04_V2.sql

## Etape 3 :

Une fois le projet télécharger et la base de donnée initialisée. Vous ouvrez votre IDE et vous vous rendez dans le dossier /backend. Une fois dedans, vous y télécharger les dépendances : 

`npm install` et `npm install firebase`

## Etape 4 :
vous créer au niveau de votre /backend un fichier .env avec les informations suivantes : 

`DATABASE_URL=postgres://USER:NOM_DB@localhost:PORT/mot_de_passe`

## Etape 5 :

Dans les packages.json de votre front, vérifier si au-dessus des dependencies il y a cette ligne : 

`"proxy":"http://localhost:5001",`

## Etape 6 : 

Ouvrez une terminal partagé dans un vous allez dans le /backend et dans l'autre terminal vous allez dans le /frontend. 

Vous exécutez la commande : `node server.js` dans le /backend et la commande : `npm start` dans le /frontend

## Etape 7 :

Vérifier s'il y a des erreurs.

----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

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

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
