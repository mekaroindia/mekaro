import { Navigate } from "react-router-dom";

export default function AdminRoute({ children }) {
  const user = JSON.parse(sessionStorage.getItem("user") || localStorage.getItem("user") || "null");
  const isStaff = user && (user.is_staff || user.isAdmin || user.is_superuser);

  if (!isStaff) {
    return <Navigate to="/" replace />;
  }

  return children;
}