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

Puis aller dans le dossier /fontend. Une fois dedans, vous y télécharger les dépendances :

`npm install`

## Etape 4 :
vous créer au niveau de votre /backend un fichier .env avec les informations suivantes : 

`DATABASE_URL=postgres://USER:mot_de_passe@localhost:PORT/NOM_DB`

## Etape 5 :

Dans les packages.json de votre front, vérifier si au-dessus des dependencies il y a cette ligne : 

`"proxy":"http://localhost:5001",`

## Etape 6 : 

Ouvrez une terminal partagé dans un vous allez dans le /backend et dans l'autre terminal vous allez dans le /frontend. 

Vous exécutez la commande : `node server.js` dans le /backend et la commande : `npm start` dans le /frontend

## Etape 7 :

Vérifier s'il y a des erreurs. Si une erreur ressemble à des dépendances manquantes vérifier la bonne éxécution du point 3, sinon si le nom de la dépendance manquante est visible essayer d'aller trouver sur internet la commande pour installer celle ci.

----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
