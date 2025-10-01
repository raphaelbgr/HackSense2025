import { getImages, deleteImage, deleteStorageImage } from '../../../supabase-direct.js';

export default async function handler(req, res) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;

  try {
    const images = await getImages();
    const imageToDelete = images.find(img => img.id === id);

    if (!imageToDelete) {
      return res.status(404).json({ error: 'Imagem não encontrada' });
    }

    // Delete from storage
    await deleteStorageImage(imageToDelete.file);

    // Delete from database
    await deleteImage(id);

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting image:', error);
    res.status(500).json({ error: 'Erro ao deletar imagem: ' + error.message });
  }
}
