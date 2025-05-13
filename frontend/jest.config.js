module.exports = {
  transform: {
    "^.+\\.js$": "babel-jest", // Cela applique babel-jest sur tous les fichiers .js
  },
  transformIgnorePatterns: [
    "/node_modules/(?!axios|@cloudinary)" // Axios et Cloudinary doivent aussi être transformés
  ],
};
