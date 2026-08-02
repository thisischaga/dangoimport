import { Navigate, useLocation } from 'react-router-dom';
import { getVendorToken, isVendor } from '../../utils/vendorAuth';

const VendorRoute = ({ children }) => {
  const location = useLocation();
  const token = getVendorToken();

  if (!token || !isVendor()) {
    return <Navigate to="/vendeur/login" replace state={{ from: location.pathname }} />;
  }

  return children;
};

export default VendorRoute;
