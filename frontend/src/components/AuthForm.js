import { useState } from "react";
import { useRouter } from "next/router";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { api } from "@/utils/api";

const AuthForm = ({ isRegister = false }) => {
  const [formData, setFormData] = useState({ username: "", email: "", password: "" });
  const [error, setError] = useState("");
  const { login } = useAuth();
  const router = useRouter();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      if (isRegister) {
        await api.post("/users/register", formData);
        router.push("/login");
      } else {
        const res = await api.post("/users/login", new URLSearchParams({ username: formData.username, password: formData.password }));
        login(res.data.access_token);
        router.push("/dashboard");
      }
    } catch (err) {
      setError(err.response?.data?.detail || "An error occurred");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-xl font-semibold">{isRegister ? "Register" : "Login"}</h2>
      {error && <p className="text-red-500">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="text" name="username" placeholder="Username" className="w-full p-2 border" value={formData.username} onChange={handleChange} required />
        {isRegister && <input type="email" name="email" placeholder="Email" className="w-full p-2 border" value={formData.email} onChange={handleChange} required />}
        <input type="password" name="password" placeholder="Password" className="w-full p-2 border" value={formData.password} onChange={handleChange} required />
        <button type="submit" className="w-full p-2 bg-blue-600 text-white">{isRegister ? "Register" : "Login"}</button>
      </form>
    </div>
  );
};

export default AuthForm;
