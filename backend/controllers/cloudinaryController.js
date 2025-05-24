const cloudinary = require('cloudinary').v2;

// Configuration de Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dpszia6xf',
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

exports.deleteImage = async (req, res) => {
  try {
    const { public_id } = req.body;

    if (!public_id) {
      return res.status(400).json({ message: 'L\'identifiant public (public_id) est requis' });
    }

    const result = await cloudinary.uploader.destroy(public_id);

    if (result.result === 'ok') {
      return res.status(200).json({ message: 'Image supprimée avec succès', result });
    } else {
      return res.status(400).json({ message: 'Erreur lors de la suppression de l\'image', result });
    }
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'image sur Cloudinary:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la suppression de l\'image', error: error.message });
  }
};
