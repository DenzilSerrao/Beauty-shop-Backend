export const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://beauty-shop-frontend-l8yf.vercel.app,https://www.anabeauty.co.in,https://anabeauty.co.in,http://localhost:5173',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Credentials': 'true'
};

export const corsMiddleware = (req, res) => {
  // Check if the request method is OPTIONS (preflight request)
  if (req.method === 'OPTIONS') {
    res.writeHead(200, corsHeaders);
    res.end();
    return true; // Signal that the request has been fully handled
  }

  // Set CORS headers for the actual request
  res.setHeader('Access-Control-Allow-Origin', corsHeaders['Access-Control-Allow-Origin']);
  res.setHeader('Access-Control-Allow-Methods', corsHeaders['Access-Control-Allow-Methods']);
  res.setHeader('Access-Control-Allow-Headers', corsHeaders['Access-Control-Allow-Headers']);
  res.setHeader('Access-Control-Allow-Credentials', corsHeaders['Access-Control-Allow-Credentials']);

  return false; // Signal that the request needs further processing
};