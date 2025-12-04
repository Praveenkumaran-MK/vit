import { useEffect, useState } from "react";

export default function useAuth() {
  const [user, setUser] = useState(null);   // backend user object
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const payload = JSON.parse(atob(token.split(".")[1])); // decode JWT
      setUser(payload); // { id, email, name }
    } catch (err) {
      console.error("Invalid token");
      setUser(null);
    }
    setLoading(false);
  }, []);

  return { user, loading, setUser };
}
