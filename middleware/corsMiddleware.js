export const corsHeaders = {
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Credentials': 'true'
};

const allowedOrigins = [
  'https://beauty-shop-frontend-l8yf.vercel.app',
  'https://www.anabeauty.co.in',
  'https://anabeauty.co.in',
  'http://localhost:5173',
  'https://beauty-shop-frontend-l8yf-iyz8b60tj-denzil-serraos-projects.vercel.app',
];

const setCorsHeaders = (req, res, attempt = 1) => {
  const origin = req.headers.origin;
  console.log('origin', origin);
// && allowedOrigins.includes(origin)
  if (origin) {
    try {
      res.setHeader('Access-Control-Allow-Origin', origin);
    } catch (error) {
      console.error(`Attempt ${attempt}: Failed to set Access-Control-Allow-Origin header`, error);
      if (attempt < 5) {
        setTimeout(() => setCorsHeaders(req, res, attempt + 1), 2000);
        return;
      }
    }
  } else {
    res.setHeader('Access-Control-Allow-Origin', ''); // No origin allowed
  }

  res.setHeader('Access-Control-Allow-Methods', corsHeaders['Access-Control-Allow-Methods']);
  res.setHeader('Access-Control-Allow-Headers', corsHeaders['Access-Control-Allow-Headers']);
  res.setHeader('Access-Control-Allow-Credentials', corsHeaders['Access-Control-Allow-Credentials']);
};

export const corsMiddleware = (req, res) => {
  setCorsHeaders(req, res);

  // Handle preflight (OPTIONS) requests
  if (req.method === 'OPTIONS') {
    res.writeHead(200, corsHeaders);
    res.end();
    return true; // Signal that the request has been fully handled
  }

  return false; // Signal that the request needs further processing
};