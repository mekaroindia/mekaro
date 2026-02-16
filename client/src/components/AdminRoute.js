import { Navigate } from "react-router-dom";

export default function AdminRoute({ children }) {
  const user = JSON.parse(sessionStorage.getItem("user"));

  if (!user || !user.is_staff) {
    return <Navigate to="/" />;
  }

  return children;
}