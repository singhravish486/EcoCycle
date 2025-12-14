"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { FaUserCircle, FaSignOutAlt, FaKey } from "react-icons/fa";
import { useZxing } from "react-zxing";

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const getUser = async () => {
      setLoading(true);
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) setError(error.message);
      setUser(user);
      if (user) {
        const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
        setProfile(data);
      }
      setLoading(false);
    };
    getUser();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/auth");
  };

  const handleChangePassword = async () => {
    if (!user?.email) return;
    await supabase.auth.resetPasswordForEmail(user.email);
    alert("Password reset email sent. Please check your inbox.");
  };

  const setUserRCoins = (newRCoins: number) => {
    setProfile(prevProfile => ({ ...prevProfile, r_coins: newRCoins }));
  };

  const handleScan = async (result: any) => {
    console.log("Scanned Data:", result);

    let qrText: string | undefined = undefined;

    // If result is a string, use it directly
    if (typeof result === "string") {
      qrText = result;
    } else if (result && typeof result.getText === "function") {
      qrText = result.getText();
    }

    // Only proceed if qrText is a string and contains ':'
    if (typeof qrText === "string" && qrText.includes(":")) {
      const parts = qrText.split(":");
      console.log("Split parts:", parts);
      const hubId = parts[parts.length - 1];
      if (!hubId) {
        alert("Could not extract hub ID from QR code.");
        return;
      }

      // --- ALL your scan logic must be here! ---
      // Example:
      // setShowScanner(false);
      // const { data: hub, error } = await supabase
      //   .from("hubs")
      //   .select("*")
      //   .eq("id", hubId)
      //   .single();
      // ...rest of your logic...
      // setIsProcessing(false);

    } else {
      alert("Scanned data is not a valid QR code string: " + qrText);
      return;
    }
  };

  const { ref } = useZxing({
    onDecodeResult(result: any) {
      handleScan(result);
    },
  });

  if (loading) return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  if (!user) return <div className="flex justify-center items-center min-h-screen">Not logged in.</div>;

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-100 via-green-300 to-green-200 py-8 px-2">
      <div className="bg-white/80 rounded-2xl shadow-lg p-8 w-full max-w-md flex flex-col items-center gap-6 border border-green-200">
        <FaUserCircle className="text-green-600 text-6xl mb-2" />
        <h2 className="text-2xl font-bold text-green-700">{profile?.name || user.email}</h2>
        <p className="text-gray-700">Email: <span className="font-semibold">{user.email}</span></p>
        <div className="w-full flex flex-col gap-2 mt-4">
          <div className="flex justify-between text-green-700 font-semibold">
            <span>Points:</span>
            <span>{profile?.points ?? 1230}</span>
          </div>
          <div className="flex justify-between text-green-700 font-semibold">
            <span>Streak:</span>
            <span>{profile?.streak ?? 7} days</span>
          </div>
          <div className="flex justify-between text-green-700 font-semibold">
            <span>Level:</span>
            <span>{profile?.level ?? "Green Hero"}</span>
          </div>
        </div>
        <div className="flex gap-4 mt-6">
          <button onClick={handleLogout} className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded shadow transition">
            <FaSignOutAlt /> Logout
          </button>
          <button onClick={handleChangePassword} className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded shadow transition">
            <FaKey /> Change Password
          </button>
        </div>
        {error && <div className="text-red-600 mt-2">{error}</div>}
      </div>
    </main>
  );
} 