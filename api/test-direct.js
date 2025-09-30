// Simple test endpoint without Express
export default async function handler(req, res) {
  console.log('Test endpoint called');

  try {
    const SUPABASE_URL = 'https://afmsegsxgvsqwdctasyl.supabase.co';
    const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFmbXNlZ3N4Z3ZzcXdkY3Rhc3lsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyNzE0NDcsImV4cCI6MjA3NDg0NzQ0N30.kBSJi74iiKWZIhDOa1nMTYyKqNJOzykMu9dE8GXNVY0';

    console.log('Fetching from Supabase...');
    const startTime = Date.now();

    const response = await fetch(`${SUPABASE_URL}/rest/v1/images?select=*`, {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`
      }
    });

    const duration = Date.now() - startTime;
    console.log(`Fetch completed in ${duration}ms`);

    if (!response.ok) {
      return res.status(500).json({
        success: false,
        error: `Supabase returned ${response.status}`,
        duration
      });
    }

    const data = await response.json();

    res.status(200).json({
      success: true,
      message: 'Supabase connected!',
      count: data.length,
      duration,
      data: data.slice(0, 2) // First 2 items
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      stack: error.stack
    });
  }
}
