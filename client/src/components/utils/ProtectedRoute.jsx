import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = ({ canActivate }) => {
    if (canActivate) {
        if (canActivate.subscription_status === "active") {
            return <Outlet />;
        } else {
            return <Navigate to={"/configuracion"} replace />;
        }
    } else {
        return <Navigate to={"/login"} replace />
    }
}

export default ProtectedRoute;