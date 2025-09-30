import express from 'express';
import serverless from 'serverless-http';

// Import the main server app
import app from '../server.js';

// Export as Vercel serverless function
export default serverless(app);
