import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Logout from "./pages/Logout";
import Register from "./pages/Register";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Clientes from "./components/Clientes";
import Marcas from "./components/Marcas";
import ClientPage from "./components/ClientPage";
import Configuration from "./pages/Configuration";
import SubSuccess from "./pages/SubSuccess";
import ProtectedRoute from "./components/utils/ProtectedRoute";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import { useLocalStorage } from "react-use";
import EmailVerification from "./pages/EmailVerification";
import NotificationsPage from "./components/NotificationsPage";
import TermsAndConditions from "./pages/TermsAndConditions";

function Rutas() {
  const [user, setUser] = useLocalStorage("user");

  return (
    <>

      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/politicas" element={<TermsAndConditions />} />
          <Route path="/login" element={!user ? <Login /> : <Navigate to="/configuracion" />} />
          <Route path="/forgotPassword" element={user ? <Navigate to={'/'}/> : <ForgotPassword />} />
          <Route path="/verifyEmail/:token" element={user ? <Navigate to={'/'}/> : <EmailVerification/> } />
          <Route path="/resetPassword/:token" element={user ? <Navigate to={'/'}/> : <ResetPassword />} />
          <Route path="/register" element={!user ? <Register /> : <Navigate to={"/"} />} />
          <Route element={<ProtectedRoute canActivate={user} />}>
            <Route path="/Dashboard" element={<Dashboard />} />
            <Route path="/clientes" element={<Clientes />} />
            <Route path="/clientes/:id" element={<ClientPage />} />
            <Route path="/marcas" element={<Marcas />} />
            <Route path="/notificaciones" element={<NotificationsPage />} />
          </Route>
          <Route
            path="/configuracion" element={ user ? <Configuration /> : <Navigate to="/login" />}
          />
          <Route path="/logout" element={user ? <Logout /> : <Navigate to="/login" />} />
          <Route path="/success" element={user ? <SubSuccess /> : <Navigate to="/login" />} />
        </Routes>
      </Router>
    </>
  );
}

export default Rutas;
