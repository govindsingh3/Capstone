import { Outlet } from "react-router-dom";

const AuthLayout = () => (
  <div className="min-h-screen bg-radial-shell p-4 grid place-items-center">
    <div className="glass-card w-full max-w-lg p-8">
      <Outlet />
    </div>
  </div>
);

export default AuthLayout;
