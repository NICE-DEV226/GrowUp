const cloudinary = require('cloudinary').v2;
const sharp = require('sharp');

// Configuration Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'demo',
  api_key: process.env.CLOUDINARY_API_KEY || '',
  api_secret: process.env.CLOUDINARY_API_SECRET || ''
});

/**
 * Upload une photo de profil sur Cloudinary
 * @param {Buffer} fileBuffer - Buffer de l'image
 * @param {string} userId - ID de l'utilisateur
 * @returns {Promise<string>} URL de l'image uploadée
 */
async function uploadProfilePhoto(fileBuffer, userId) {
  try {
    // 1. Redimensionner et optimiser l'image avec Sharp
    const processedImage = await sharp(fileBuffer)
      .resize(500, 500, {
        fit: 'cover',
        position: 'center'
      })
      .jpeg({
        quality: 85,
        progressive: true
      })
      .toBuffer();

    // 2. Convertir en base64 pour Cloudinary
    const base64Image = `data:image/jpeg;base64,${processedImage.toString('base64')}`;

    // 3. Upload sur Cloudinary
    const result = await cloudinary.uploader.upload(base64Image, {
      folder: `growup/profiles/${userId}`,
      public_id: `profile_${Date.now()}`,
      overwrite: true,
      transformation: [
        { width: 500, height: 500, crop: 'fill' },
        { quality: 'auto:good' },
        { fetch_format: 'auto' }
      ]
    });

    console.log('✅ Photo uploadée sur Cloudinary:', result.secure_url);
    return result.secure_url;

  } catch (error) {
    console.error('❌ Erreur upload Cloudinary:', error);
    throw new Error('Impossible d\'uploader la photo');
  }
}

/**
 * Supprimer une photo de profil de Cloudinary
 * @param {string} photoUrl - URL de la photo à supprimer
 * @returns {Promise<boolean>} Succès de la suppression
 */
async function deleteProfilePhoto(photoUrl) {
  try {
    if (!photoUrl || !photoUrl.includes('cloudinary.com')) {
      return false;
    }

    // Extraire le public_id de l'URL
    // Format: https://res.cloudinary.com/cloud_name/image/upload/v123456/growup/profiles/userId/profile_123.jpg
    const urlParts = photoUrl.split('/');
    const filename = urlParts[urlParts.length - 1].split('.')[0];
    const folder = urlParts.slice(urlParts.indexOf('growup'), -1).join('/');
    const publicId = `${folder}/${filename}`;

    const result = await cloudinary.uploader.destroy(publicId);
    
    console.log('✅ Photo supprimée de Cloudinary:', publicId);
    return result.result === 'ok';

  } catch (error) {
    console.error('❌ Erreur suppression Cloudinary:', error);
    return false;
  }
}

/**
 * Vérifier si Cloudinary est configuré
 * @returns {boolean} True si configuré
 */
function isCloudinaryConfigured() {
  return !!(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  );
}

module.exports = {
  uploadProfilePhoto,
  deleteProfilePhoto,
  isCloudinaryConfigured
};
