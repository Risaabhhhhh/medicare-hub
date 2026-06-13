const ApiError = require("../utils/ApiError");
const { ROLE_PERMISSIONS } = require("../config/roles");

// ================= ROLE CHECK =================
const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ApiError("Not authenticated", 401));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new ApiError(
          `Access denied: role '${req.user.role}' not allowed`,
          403
        )
      );
    }

    next();
  };
};

// ================= PERMISSION CHECK =================
const authorizePermissions = (...requiredPermissions) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ApiError("Not authenticated", 401));
    }

    const userPermissions = ROLE_PERMISSIONS[req.user.role] || [];

    const hasPermission = requiredPermissions.every((perm) =>
      userPermissions.includes(perm)
    );

    if (!hasPermission) {
      return next(
        new ApiError(
          `Access denied: insufficient permissions for role '${req.user.role}'`,
          403
        )
      );
    }

    next();
  };
};

module.exports = {
  authorizeRoles,
  authorizePermissions,
};