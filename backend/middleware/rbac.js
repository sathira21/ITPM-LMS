// Role-Based Access Control middleware
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Role '${req.user.role}' is not authorized to access this resource`,
      });
    }
    next();
  };
};

// Permission map per role
const PERMISSIONS = {
  admin: ['manage_users', 'manage_guardians', 'manage_reports', 'manage_groups', 'view_activity', 'view_all_dashboards'],
  teacher: ['create_reports', 'view_students', 'manage_groups', 'view_activity'],
  student: ['view_own_reports', 'join_groups', 'view_own_dashboard'],
  guardian: ['view_linked_student', 'view_linked_reports'],
};

const hasPermission = (role, permission) => {
  return PERMISSIONS[role]?.includes(permission) ?? false;
};

const requirePermission = (permission) => {
  return (req, res, next) => {
    if (!hasPermission(req.user.role, permission)) {
      return res.status(403).json({
        success: false,
        message: `Permission '${permission}' denied for role '${req.user.role}'`,
      });
    }
    next();
  };
};

module.exports = { authorize, requirePermission, hasPermission, PERMISSIONS };
