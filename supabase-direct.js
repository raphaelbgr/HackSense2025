// Direct Supabase REST API calls (faster than SDK)
// Configure via environment variables (see .env.example)
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://afmsegsxgvsqwdctasyl.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_KEY || '';

const headers = {
  'apikey': SUPABASE_KEY,
  'Authorization': `Bearer ${SUPABASE_KEY}`,
  'Content-Type': 'application/json',
  'Prefer': 'return=representation'
};

export async function getImages() {
  console.log('Fetching from:', `${SUPABASE_URL}/rest/v1/images`);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000); // 5 second timeout

  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/images?select=*&order=created_at.desc`, {
      headers,
      signal: controller.signal
    });

    clearTimeout(timeout);

    if (!response.ok) {
      throw new Error(`Supabase error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    clearTimeout(timeout);
    if (error.name === 'AbortError') {
      throw new Error('Supabase request timeout - network issue');
    }
    throw error;
  }
}

export async function addImage(imageData) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/images`, {
    method: 'POST',
    headers,
    body: JSON.stringify(imageData)
  });

  if (!response.ok) {
    throw new Error(`Supabase error: ${response.status}`);
  }

  const data = await response.json();
  return data[0];
}

export async function deleteImage(id) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/images?id=eq.${id}`, {
    method: 'DELETE',
    headers
  });

  if (!response.ok) {
    throw new Error(`Supabase error: ${response.status}`);
  }
}

export async function getRankings(limit = null) {
  const limitParam = limit ? `&limit=${limit}` : '';
  const response = await fetch(`${SUPABASE_URL}/rest/v1/rankings?select=*&order=score.desc${limitParam}`, {
    headers
  });

  if (!response.ok) {
    throw new Error(`Supabase error: ${response.status}`);
  }

  return await response.json();
}

export async function addRanking(rankingData) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/rankings`, {
    method: 'POST',
    headers,
    body: JSON.stringify(rankingData)
  });

  if (!response.ok) {
    throw new Error(`Supabase error: ${response.status}`);
  }

  const data = await response.json();
  return data[0];
}

export async function uploadImageToStorage(buffer, filePath) {
  const response = await fetch(`${SUPABASE_URL}/storage/v1/object/HackSense2025/${filePath}`, {
    method: 'POST',
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'image/jpeg'
    },
    body: buffer
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Upload error: ${response.status} - ${error}`);
  }

  const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/HackSense2025/${filePath}`;
  return { fileName: filePath, url: publicUrl };
}

export async function deleteStorageImage(filePath) {
  const response = await fetch(`${SUPABASE_URL}/storage/v1/object/HackSense2025/${filePath}`, {
    method: 'DELETE',
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`
    }
  });

  if (!response.ok) {
    throw new Error(`Delete error: ${response.status}`);
  }
}
