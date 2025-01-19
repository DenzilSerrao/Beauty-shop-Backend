import jwt from 'jsonwebtoken';

export async function auth(req, res) {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return { error: 'No authentication token' };
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    return null;
  } catch (error) {
    return { error: 'Invalid authentication token' };
  }
}