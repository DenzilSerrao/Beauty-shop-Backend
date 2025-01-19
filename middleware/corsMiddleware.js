export const corsMiddleware = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', 'https://beauty-shop-frontend-l8yf.vercel.app'); // Your frontend domain
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true'); // Allow cookies or credentials

  // Handle preflight (OPTIONS) requests
  if (req.method === 'OPTIONS') {
    res.status(200).end(); // End the response for OPTIONS requests
    return true; // Signal that the request has been fully handled
  }

  return false; // Signal that the request needs further processing
};
