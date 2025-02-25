export const corsHeaders = {
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
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

const setCorsHeaders = (req, res) => {
  const origin = req.headers.origin;
  console.log('🔍 Incoming Origin:', origin);

  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    console.log(`✅ CORS Allowed for: ${origin}`);
  } else {
    console.warn(`⚠️ CORS Blocked: ${origin} is not in the allowed list.`);
  }

  res.setHeader('Access-Control-Allow-Methods', corsHeaders['Access-Control-Allow-Methods']);
  res.setHeader('Access-Control-Allow-Headers', corsHeaders['Access-Control-Allow-Headers']);
  res.setHeader('Access-Control-Allow-Credentials', corsHeaders['Access-Control-Allow-Credentials']);
};

export const corsMiddleware = (req, res, next) => {
  setCorsHeaders(req, res);

  // Handle preflight (OPTIONS) requests
  if (req.method === 'OPTIONS') {
    console.log('🔄 Handling Preflight Request');
    res.writeHead(200);
    res.end();
    return;
  }

  next();
};
