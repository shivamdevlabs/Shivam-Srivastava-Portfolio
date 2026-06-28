import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PrivateRoute = () => {
  const { token } = useAuth();
  
  return token ? <Outlet /> : <Navigate to="/admin/login" replace />;
};

export default PrivateRoute;
