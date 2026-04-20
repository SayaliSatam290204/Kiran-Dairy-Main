export const roleMiddleware = (allowedRoles) => {
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: "User not authenticated" });

    // DEBUG: Log user data for debugging authorization issues
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Auth Debug] User role: ${req.user.role}, Allowed roles: ${roles.join(', ')}`);
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: "Access denied",
        debug: {
          userRole: req.user.role,
          allowedRoles: roles,
          hasRole: req.user.role ? true : false
        }
      });
    }

    next();
  };
};