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

const setCorsHeaders = (req, res) => {
  const origin = req.headers.origin;
  // If an origin header exists set the header.
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    console.log(`✅ CORS Allowed for: ${origin}`);
  }
  // If there's no origin header and it's the Razorpay webhook, allow it without warning.
  else if (!origin && req.originalUrl === '/api/payment/verify-payment') {
    // Allow all origins for this endpoint.
    res.setHeader('Access-Control-Allow-Origin', '*');
    console.log('ℹ️ Razorpay webhook: No Origin header, allowing by default.');
  } else {
    console.warn(`⚠️ CORS Blocked: ${origin} is not in the allowed list.`);
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