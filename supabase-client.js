import { createClient } from '@supabase/supabase-js';

// Hardcode for now to ensure it works
const supabaseUrl = 'https://afmsegsxgvsqwdctasyl.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFmbXNlZ3N4Z3ZzcXdkY3Rhc3lsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyNzE0NDcsImV4cCI6MjA3NDg0NzQ0N30.kBSJi74iiKWZIhDOa1nMTYyKqNJOzykMu9dE8GXNVY0';

console.log('Initializing Supabase client with URL:', supabaseUrl);

export const supabase = createClient(supabaseUrl, supabaseKey);

// Helper functions for data storage
export async function getImages() {
  try {
    console.log('Querying images table...');
    const { data, error } = await supabase
      .from('images')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }

    console.log('Got data:', data ? data.length : 0, 'rows');
    return data || [];
  } catch (err) {
    console.error('getImages error:', err);
    return [];
  }
}

export async function addImage(imageData) {
  const { data, error } = await supabase
    .from('images')
    .insert([imageData])
    .select();

  if (error) throw error;
  return data[0];
}

export async function deleteImage(id) {
  const { error } = await supabase
    .from('images')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export async function getRankings() {
  const { data, error } = await supabase
    .from('rankings')
    .select('*')
    .order('score', { ascending: false })
    .limit(50);

  return data || [];
}

export async function addRanking(rankingData) {
  const { data, error } = await supabase
    .from('rankings')
    .insert([rankingData])
    .select();

  if (error) throw error;
  return data[0];
}

// Upload image to Supabase Storage
export async function uploadImage(file, type) {
  const fileExt = 'jpg';
  const fileName = `${Date.now()}-${Math.round(Math.random() * 1E9)}.${fileExt}`;
  const filePath = `${type}/${fileName}`;

  const { data, error } = await supabase.storage
    .from('HackSense2025')
    .upload(filePath, file, {
      contentType: 'image/jpeg',
      upsert: false
    });

  if (error) throw error;

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('HackSense2025')
    .getPublicUrl(filePath);

  return { fileName: filePath, url: publicUrl };
}

// Delete image from Supabase Storage
export async function deleteStorageImage(filePath) {
  const { error } = await supabase.storage
    .from('HackSense2025')
    .remove([filePath]);

  if (error) throw error;
}
