// Simple login/register form component
import { useState } from "react";

interface Props {
  onAuthSuccess: () => void;
}
// Endpoint for authentication requests
const VITE_SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:5000";

const Auth = ({ onAuthSuccess }: Props) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isRegister, setIsRegister] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Send login or registration request to the server
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const endpoint = isRegister ? "/auth/register" : "/auth/login";
    try {
      const res = await fetch(`${VITE_SERVER_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username, password }),
      });
      
      const data = await res.json().catch(() => null);

      if (!res.ok) {
        setError(data?.message || "Request failed");
        return;
      }

      if (data?.token) {
        localStorage.setItem("token", data.token as string);
      }
      setUsername("");
      setPassword("");
      onAuthSuccess();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <div className="w-fit flex flex-col justify-center items-center text-center space-y-4 bg-white text-black rounded-xl py-8 px-6 shadow-lg">
      <h1 className="text-3xl font-bold mb-4">{isRegister ? "Register" : "Login"}</h1>
      {error && <div className="text-red-600 text-sm">{error}</div>}
      <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="outline-none text-black p-3 rounded-md w-[300px] bg-gray-100 placeholder-gray-500"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="outline-none text-black p-3 rounded-md w-[300px] bg-gray-100 placeholder-gray-500"
        />
        <button
          type="submit"
          className="p-3 bg-blue-500 hover:bg-blue-700 rounded-md font-medium w-[300px] text-white transition"
        >
          {isRegister ? "Register" : "Login"}
        </button>
      </form>
      <button
        onClick={() => setIsRegister(!isRegister)}
        className="text-sm text-blue-600 hover:underline"
      >
        {isRegister ? "Have an account? Login" : "Need an account? Register"}
      </button>
    </div>
  );
};

export default Auth;