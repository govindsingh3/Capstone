import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginUser } from "../services/auth.js";
import { useAuth } from "../hooks/useAuth.js";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const onChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const { data } = await loginUser(form);
      login(data);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.error || "Login failed");
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-semibold">Welcome back</h1>
      <p className="mt-2 text-sm text-muted">
        Access the DPRES command center with your credentials.
      </p>
      {error && <p className="mt-4 text-sm text-rose-400">{error}</p>}
      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <input
          name="email"
          type="email"
          value={form.email}
          onChange={onChange}
          placeholder="Email"
          className="focus-ring w-full input-field px-4 py-3 w-full"
        />
        <input
          name="password"
          type="password"
          value={form.password}
          onChange={onChange}
          placeholder="Password"
          className="focus-ring w-full input-field px-4 py-3 w-full"
        />
        <button className="interactive focus-ring w-full rounded-full bg-secondary py-3 text-sm font-semibold text-white">
          Sign in
        </button>
      </form>
      <p className="mt-4 text-xs text-muted">
        New here? <Link to="/register" className="text-accent">Create account</Link>
      </p>
    </div>
  );
};

export default Login;
