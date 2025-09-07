export const corsHeaders = {
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Allow-Credentials": "true",
};

const setCorsHeaders = (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  console.log("✅ CORS Allowed for all origins");

  // Set additional CORS headers
  res.setHeader(
    "Access-Control-Allow-Methods",
    corsHeaders["Access-Control-Allow-Methods"]
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    corsHeaders["Access-Control-Allow-Headers"]
  );
  res.setHeader(
    "Access-Control-Allow-Credentials",
    corsHeaders["Access-Control-Allow-Credentials"]
  );
};
export const corsMiddleware = (req, res) => {
  setCorsHeaders(req, res);

  // Handle preflight (OPTIONS) requests
  if (req.method === "OPTIONS") {
    res.writeHead(200, corsHeaders);
    res.end();
    return true; // Signal that the request has been fully handled
  }

  return false; // Signal that the request needs further processing
};
