// Direct Supabase REST API calls (faster than SDK)
const SUPABASE_URL = 'https://afmsegsxgvsqwdctasyl.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFmbXNlZ3N4Z3ZzcXdkY3Rhc3lsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyNzE0NDcsImV4cCI6MjA3NDg0NzQ0N30.kBSJi74iiKWZIhDOa1nMTYyKqNJOzykMu9dE8GXNVY0';

const headers = {
  'apikey': SUPABASE_KEY,
  'Authorization': `Bearer ${SUPABASE_KEY}`,
  'Content-Type': 'application/json',
  'Prefer': 'return=representation'
};

export async function getImages() {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/images?select=*&order=created_at.desc`, {
    headers
  });

  if (!response.ok) {
    throw new Error(`Supabase error: ${response.status}`);
  }

  return await response.json();
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

export async function getRankings() {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/rankings?select=*&order=score.desc&limit=50`, {
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
