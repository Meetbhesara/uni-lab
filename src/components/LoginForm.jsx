import { useState } from "react";
import { VStack, Input, Button, Alert, AlertIcon } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const baseUrl = (import.meta.env.VITE_API_BASE_URL ? `${import.meta.env.VITE_API_BASE_URL}/api` : 'http://localhost:5001/api');
    try {
      const res = await fetch(`${baseUrl}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (data.success && data.isAdmin) {
        localStorage.setItem("token", data.token);
        navigate("/dashboard");
      } else {
        setError("Invalid credentials or not admin user.");
      }
    } catch {
      setError("Server error");
    }
  };

  return (
    <VStack as="form" spacing={4} onSubmit={handleSubmit}>
      <Input
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <Input
        placeholder="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <Button type="submit" colorScheme="blue" width="full">
        Login
      </Button>
      {error && <Alert status="error"><AlertIcon />{error}</Alert>}
    </VStack>
  );
};

export default LoginForm;
