-- Create images table
CREATE TABLE IF NOT EXISTS images (
  id TEXT PRIMARY KEY,
  file TEXT NOT NULL,
  url TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('ai', 'human')),
  pair_id BIGINT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create rankings table
CREATE TABLE IF NOT EXISTS rankings (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  score INTEGER NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_images_type ON images(type);
CREATE INDEX IF NOT EXISTS idx_images_pair_id ON images(pair_id);
CREATE INDEX IF NOT EXISTS idx_rankings_score ON rankings(score DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE images ENABLE ROW LEVEL SECURITY;
ALTER TABLE rankings ENABLE ROW LEVEL SECURITY;

-- Create policies to allow public read access
CREATE POLICY "Allow public read access on images" ON images
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert access on images" ON images
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public delete access on images" ON images
  FOR DELETE USING (true);

CREATE POLICY "Allow public read access on rankings" ON rankings
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert access on rankings" ON rankings
  FOR INSERT WITH CHECK (true);
