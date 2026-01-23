const { supabaseClient } = require('../config/supabase');

/**
 * Middleware to verify JWT token from Supabase
 */
const authenticateUser = async (req, res, next) => {
  try {
    // Check if Supabase is configured
    if (!supabaseClient || !process.env.SUPABASE_URL) {
      console.warn('Supabase not configured, skipping authentication');
      return res.status(401).json({ error: 'Authentication not configured' });
    }

    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];

    // Verify the token with Supabase
    const { data: { user }, error } = await supabaseClient.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    // Attach user to request
    req.user = user;
    req.userId = user.id;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({ error: 'Authentication failed' });
  }
};

/**
 * Optional authentication - doesn't fail if no token
 */
const optionalAuth = async (req, res, next) => {
  try {
    // Check if Supabase is configured
    if (!supabaseClient || !process.env.SUPABASE_URL) {
      // Continue without authentication if Supabase is not configured
      return next();
    }

    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      try {
        const { data: { user }, error } = await supabaseClient.auth.getUser(token);

        if (!error && user) {
          req.user = user;
          req.userId = user.id;
        }
      } catch (tokenError) {
        // If token verification fails, continue without authentication
        console.warn('Token verification failed:', tokenError.message);
      }
    }
    next();
  } catch (error) {
    // Continue without authentication on any error
    console.warn('Optional auth error:', error.message);
    next();
  }
};

module.exports = {
  authenticateUser,
  optionalAuth,
};
