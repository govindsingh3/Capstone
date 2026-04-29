import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registerUser } from "../services/auth.js";
import { useAuth } from "../hooks/useAuth.js";

const Register = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "Teacher",
  });
  const [error, setError] = useState("");

  const onChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const { data } = await registerUser(form);
      login(data);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.error || "Registration failed");
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-semibold">Create account</h1>
      <p className="mt-2 text-sm text-muted">
        Launch your institution onboarding in minutes.
      </p>
      {error && <p className="mt-4 text-sm text-rose-400">{error}</p>}
      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <input
          name="name"
          value={form.name}
          onChange={onChange}
          placeholder="Full name"
          className="focus-ring w-full rounded-xl border border-white/10 bg-slate-900/30 px-4 py-3"
        />
        <input
          name="email"
          type="email"
          value={form.email}
          onChange={onChange}
          placeholder="Email"
          className="focus-ring w-full rounded-xl border border-white/10 bg-slate-900/30 px-4 py-3"
        />
        <input
          name="password"
          type="password"
          value={form.password}
          onChange={onChange}
          placeholder="Password"
          className="focus-ring w-full rounded-xl border border-white/10 bg-slate-900/30 px-4 py-3"
        />
        <select
          name="role"
          value={form.role}
          onChange={onChange}
          className="focus-ring w-full rounded-xl border border-white/10 bg-slate-900/30 px-4 py-3"
        >
          <option value="Administrator">Administrator</option>
          <option value="Teacher">Teacher / Coordinator</option>
          <option value="Student">Student</option>
          <option value="DisasterOfficer">Disaster Management Officer</option>
        </select>
        <button className="interactive focus-ring w-full rounded-full bg-secondary py-3 text-sm font-semibold text-white">
          Create account
        </button>
      </form>
      <p className="mt-4 text-xs text-muted">
        Have an account? <Link to="/login" className="text-accent">Sign in</Link>
      </p>
    </div>
  );
};

export default Register;
