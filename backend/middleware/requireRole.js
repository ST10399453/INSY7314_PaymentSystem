export default function requireRole(expectedRole) {
  return (req, res, next) => {
    if (!req.role || req.role !== expectedRole) {
      return res.status(403).json({ message: "Forbidden: insufficient role" });
    }
    next();
  };
}
