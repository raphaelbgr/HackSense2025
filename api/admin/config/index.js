// Game configuration API
import { updateConfig as updateGameDataConfig } from '../../game-data.js';

const CONFIG_KEY = 'game_config';

// Default configuration
const defaultConfig = {
  maxRounds: 10
};

// In-memory storage (you can switch to database later)
let config = { ...defaultConfig };

export default async function handler(req, res) {
  if (req.method === 'GET') {
    res.json(config);
  } else if (req.method === 'POST') {
    const { maxRounds } = req.body;

    if (typeof maxRounds !== 'number' || maxRounds < 1 || maxRounds > 50) {
      return res.status(400).json({ error: 'Rounds deve ser entre 1 e 50' });
    }

    config.maxRounds = maxRounds;

    // Update game-data module config
    updateGameDataConfig(config);

    res.json({ success: true, config });
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}

export function getConfig() {
  return config;
}
