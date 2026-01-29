const { getAuth } = require("../config/firebaseAdmin");

/**
 * Middleware to verify Firebase ID token (Bearer token from client)
 */
const authenticateUser = async (req, res, next) => {
  try {
    const firebaseAuth = getAuth();
    if (!firebaseAuth) {
      return res.status(401).json({ error: "Authentication not configured" });
    }

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    const decodedToken = await firebaseAuth.verifyIdToken(token);

    // Attach user to request (Firebase uses uid; backend expects userId)
    req.user = {
      id: decodedToken.uid,
      uid: decodedToken.uid,
      email: decodedToken.email || null,
    };
    req.userId = decodedToken.uid;
    next();
  } catch (error) {
    console.error("Authentication error:", error.message);
    res.status(401).json({ error: "Invalid or expired token" });
  }
};

/**
 * Optional authentication - doesn't fail if no token
 */
const optionalAuth = async (req, res, next) => {
  try {
    const firebaseAuth = getAuth();
    if (!firebaseAuth) {
      return next();
    }

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return next();
    }

    const token = authHeader.split(" ")[1];
    try {
      const decodedToken = await firebaseAuth.verifyIdToken(token);
      req.user = {
        id: decodedToken.uid,
        uid: decodedToken.uid,
        email: decodedToken.email || null,
      };
      req.userId = decodedToken.uid;
    } catch (tokenError) {
      console.warn("Token verification failed:", tokenError.message);
    }
    next();
  } catch (error) {
    next();
  }
};

module.exports = {
  authenticateUser,
  optionalAuth,
};
