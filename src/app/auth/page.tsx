"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import Scene3D from "@/components/Scene3D";
import { FaUserAlt, FaLock, FaLeaf } from "react-icons/fa";
import { useRouter } from "next/navigation";

export default function AuthPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [dob, setDob] = useState("");
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      setLoading(false);
    });
  }, []);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    if (isSignUp) {
      if (!name || !age || !dob) {
        setError("Please fill in all required fields (name, age, date of birth).");
        setLoading(false);
        return;
      }
    }

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;

        // Insert into profiles table
        const user = data.user;
        if (user) {
          const { error: profileError } = await supabase
            .from("profiles")
            .insert([
              {
                id: user.id,
                name,
                age: parseInt(age),
                dob,
                email,
              },
            ]);
          if (profileError) throw profileError;
        }

        // Auto-login after signup (no email confirmation needed)
        setMessage("Account created successfully! Redirecting...");
        router.push("/dashboard");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        setMessage("Logged in successfully! Redirecting...");
        router.push("/dashboard");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <main className="relative flex min-h-screen items-center justify-center bg-gradient-to-br from-green-100 to-blue-100 overflow-hidden">
      <Scene3D />
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, type: "spring" }}
        className="relative z-10 bg-white/30 backdrop-blur-lg rounded-2xl shadow-2xl p-10 w-full max-w-md border border-white/40"
        style={{ boxShadow: "0 8px 32px 0 rgba(34,197,94,0.25)" }}
      >
        <div className="flex flex-col items-center mb-6">
          <div className="bg-gradient-to-br from-green-400 to-blue-400 rounded-full p-3 mb-2 shadow-lg">
            <FaLeaf className="text-white text-3xl" />
          </div>
          <h2 className="text-3xl font-extrabold text-green-700 text-center drop-shadow-lg">
            {isSignUp ? "Create Account" : "Welcome Back"}
          </h2>
          <p className="text-gray-600 text-center text-sm mt-1 mb-2">
            {isSignUp ? "Sign up to join Eco Cycle" : "Log in to your Eco Cycle account"}
          </p>
        </div>
        <div className="border-b border-green-200 mb-6" />
        <AnimatePresence mode="wait">
          <motion.form
            key={isSignUp ? "signup" : "login"}
            onSubmit={handleAuth}
            className="flex flex-col gap-4"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.4, type: "spring" }}
          >
            {isSignUp && (
              <>
                <div className="relative flex flex-col gap-1">
                  <label htmlFor="name" className="text-sm font-medium text-green-700 pl-1">Full Name</label>
                  <input
                    id="name"
                    type="text"
                    placeholder="Full Name"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    required={isSignUp}
                    className="border-none rounded px-4 py-3 bg-white/60 focus:bg-white focus:outline-2 focus:outline-green-600 shadow w-full text-gray-800"
                  />
                </div>
                <div className="relative flex flex-col gap-1">
                  <label htmlFor="age" className="text-sm font-medium text-green-700 pl-1">Age</label>
                  <input
                    id="age"
                    type="number"
                    placeholder="Age"
                    value={age}
                    onChange={e => setAge(e.target.value)}
                    required={isSignUp}
                    min="1"
                    className="border-none rounded px-4 py-3 bg-white/60 focus:bg-white focus:outline-2 focus:outline-green-600 shadow w-full text-gray-800"
                  />
                </div>
                <div className="relative flex flex-col gap-1">
                  <label htmlFor="dob" className="text-sm font-medium text-green-700 pl-1">Date of Birth</label>
                  <input
                    id="dob"
                    type="date"
                    placeholder="Date of Birth"
                    value={dob}
                    onChange={e => setDob(e.target.value)}
                    required={isSignUp}
                    className="border-none rounded px-4 py-3 bg-white/60 focus:bg-white focus:outline-2 focus:outline-green-600 shadow w-full text-gray-800"
                  />
                </div>
              </>
            )}
            <div className="relative flex flex-col gap-1">
              <label htmlFor="email" className="text-sm font-medium text-green-700 pl-1">Email</label>
              <FaUserAlt className="absolute left-3 top-9 text-green-400 text-lg" />
              <input
                id="email"
                type="email"
                placeholder="Email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="pl-10 border-none rounded px-4 py-3 bg-white/60 focus:bg-white focus:outline-2 focus:outline-green-600 shadow w-full text-gray-800"
              />
            </div>
            <div className="relative flex flex-col gap-1">
              <label htmlFor="password" className="text-sm font-medium text-green-700 pl-1">Password</label>
              <FaLock className="absolute left-3 top-9 text-green-400 text-lg" />
              <input
                id="password"
                type="password"
                placeholder="Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="pl-10 border-none rounded px-4 py-3 bg-white/60 focus:bg-white focus:outline-2 focus:outline-green-600 shadow w-full text-gray-800"
              />
            </div>
            <button
              type="submit"
              className="bg-gradient-to-r from-green-500 to-blue-400 text-white py-3 rounded-lg font-semibold hover:from-green-600 hover:to-blue-500 transition shadow-lg text-lg border border-green-200"
              disabled={loading}
            >
              {loading ? (isSignUp ? "Signing Up..." : "Logging In...") : (isSignUp ? "Sign Up" : "Log In")}
            </button>
          </motion.form>
        </AnimatePresence>
        <div className="text-center mt-6">
          <button
            className="text-green-700 hover:underline font-medium"
            onClick={() => setIsSignUp(!isSignUp)}
          >
            {isSignUp ? "Already have an account? Log In" : "Don't have an account? Sign Up"}
          </button>
        </div>
        {error && <p className="text-red-600 text-center mt-2">{error}</p>}
        {message && <p className="text-green-700 text-center mt-2">{message}</p>}
      </motion.div>
    </main>
  );
} 