import { useContext } from 'react';
import { UserContext } from '../Context/UserContext'; // Import UserContext
import { Navigate } from 'react-router-dom'; // For redirection

const ProtectedRoute = ({ allowedRoles, children }) => {
  const { userRole } = useContext(UserContext);
  console.log("ProtectedRoute: userRole =", userRole); // Debugging

  // Check if the role is not loaded yet (null)
  if (userRole === null) {
    console.log("User role is still loading...");
    return <div>Loading...</div>;  // You can replace this with a spinner if you like
  }

  // Check if the role is in the allowedRoles
  if (!allowedRoles.includes(userRole)) {
    console.log("User role is not allowed. Redirecting...");  // More Debugging
    return <Navigate to="/" />;
  }

  return children;
};

export default ProtectedRoute;
