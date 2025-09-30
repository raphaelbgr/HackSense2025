import multiparty from 'multiparty';
import sharp from 'sharp';
import { addImage, uploadImageToStorage } from '../../../supabase-direct.js';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const form = new multiparty.Form();

  form.parse(req, async (err, fields, files) => {
    if (err) {
      return res.status(500).json({ error: 'Error parsing form' });
    }

    try {
      if (!files.aiImage || !files.humanImage) {
        return res.status(400).json({ error: 'Ambas as imagens são necessárias' });
      }

      const pairId = Date.now();

      // Read and compress AI image
      const aiBuffer = await sharp(files.aiImage[0].path)
        .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 80, progressive: true })
        .toBuffer();

      // Read and compress Human image
      const humanBuffer = await sharp(files.humanImage[0].path)
        .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 80, progressive: true })
        .toBuffer();

      // Upload to Supabase Storage
      const aiFileName = `ai/${Date.now()}-${Math.round(Math.random() * 1E9)}.jpg`;
      const humanFileName = `human/${Date.now()}-${Math.round(Math.random() * 1E9)}.jpg`;

      const aiUpload = await uploadImageToStorage(aiBuffer, aiFileName);
      const humanUpload = await uploadImageToStorage(humanBuffer, humanFileName);

      // Save metadata to database
      const aiImage = await addImage({
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        file: aiUpload.fileName,
        url: aiUpload.url,
        type: 'ai',
        pair_id: pairId
      });

      const humanImage = await addImage({
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9) + 'h',
        file: humanUpload.fileName,
        url: humanUpload.url,
        type: 'human',
        pair_id: pairId
      });

      res.json({ success: true, aiImage, humanImage });
    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({ error: 'Erro ao fazer upload do par: ' + error.message });
    }
  });
}
