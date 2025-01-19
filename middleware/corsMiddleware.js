export const corsMiddleware = (req, res, next) => {
    // CORS Headers
    res.setHeader('Access-Control-Allow-Origin', 'https://beauty-shop-frontend-l8yf.vercel.app'); // Your frontend domain
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true'); // If you want to allow cookies or credentials
  
    // Handle preflight request
    if (req.method === 'OPTIONS') {
      return res.status(200).end(); // Send a 200 response for OPTIONS requests
    }
  
    // Call the next middleware or handler
    next();
  };
  