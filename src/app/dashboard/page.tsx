"use client";
import { useEffect, useState, useRef, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { motion } from "framer-motion";
import {
  FaUserCircle,
  FaQrcode,
  FaMedal,
  FaLeaf,
  FaMapMarkerAlt,
  FaRobot,
  FaTimes,
  FaDirections,
  FaTrophy,
  FaClock,
  FaExpand,
  FaCompress
} from 'react-icons/fa';
import { FaClockRotateLeft as FaHistory } from "react-icons/fa6";
import dynamic from "next/dynamic";
import QRScanner from "@/components/QRScanner";
import DashboardChatbot from "@/components/DashboardChatbot";
import ClientOnly from "@/components/ClientOnly";

const MapSection = dynamic(() => import("@/components/MapSection"), { ssr: false, loading: () => <div>Loading map...</div> });

// Add these type definitions at the top of the file after the imports
interface Challenge {
  id: string;
  title: string;
  description: string;
  type: 'recycle_item' | 'recycle_count' | 'earn_coins' | 'visit_hubs' | 'all_rounder';
  target_item?: string;
  target_amount: number;
  reward_coins: number;
  reward_points: number;
  timeframe: 'daily' | 'weekly' | 'monthly' | 'all';
  active: boolean;
  progress: number;
  completed: boolean;
  percentage: number;
  claimed: boolean;
}

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profilePic, setProfilePic] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showRedeemModal, setShowRedeemModal] = useState(false);
  const [redeemMessage, setRedeemMessage] = useState<string | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  // For demo, use local state for R coins
  const rCoins = profile?.r_coins ?? 120;
  const [userRCoins, setUserRCoins] = useState(rCoins);
  const [showScanner, setShowScanner] = useState(false);
  const [message, setMessage] = useState("");
  const [historyTab, setHistoryTab] = useState<'recycling' | 'rewards' | 'hubs'>('recycling');
  const [rewardHistory, setRewardHistory] = useState<any[]>([]);
  const [loadingRewards, setLoadingRewards] = useState(true);
  const ITEM_OPTIONS = [
    { label: "Plastic Bottle", value: "plastic_bottle", coins: 10 },
    { label: "Glass", value: "glass", coins: 15 },
    { label: "Paper", value: "paper", coins: 5 },
    { label: "Metal Can", value: "metal_can", coins: 20 },
    { label: "Aluminum Foil", value: "aluminum_foil", coins: 8 },
    { label: "E-Waste", value: "e_waste", coins: 25 },
    { label: "Batteries", value: "batteries", coins: 18 },
    { label: "Cardboard", value: "cardboard", coins: 7 },
  ];
  const [showItemModal, setShowItemModal] = useState(false);
  const [pendingHubId, setPendingHubId] = useState<string | null>(null);
  const [pendingHub, setPendingHub] = useState<any>(null);
  const [selectedItems, setSelectedItems] = useState<{ [key: string]: number }>({});
  const [itemSubmitting, setItemSubmitting] = useState(false);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(true);
  const [showRecyclingHistory, setShowRecyclingHistory] = useState(false);
  const [showRewardHistory, setShowRewardHistory] = useState(true);
  const [challengeTimeframe, setChallengeTimeframe] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loadingChallenges, setLoadingChallenges] = useState(true);
  const [isClient, setIsClient] = useState(false);
  const [mapFullView, setMapFullView] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [hubs, setHubs] = useState<any[]>([]);
  const [isMapFullscreen, setIsMapFullscreen] = useState(false);

  // Initialize sample challenges for all items and timeframes
  const sampleChallenges: Challenge[] = [
    // Daily challenges
    {
      id: 'daily-plastic-bottle',
      title: 'Recycle 3 Plastic Bottles',
      description: 'Recycle 3 plastic bottles today!',
      type: 'recycle_item',
      target_item: 'plastic bottle',
      target_amount: 3,
      reward_coins: 10,
      reward_points: 3,
      timeframe: 'daily',
      active: true,
      progress: 0,
      completed: false,
      percentage: 0,
      claimed: false
    },
    {
      id: 'daily-glass',
      title: 'Recycle 2 Glass Items',
      description: 'Recycle 2 glass items today!',
      type: 'recycle_item',
      target_item: 'glass',
      target_amount: 2,
      reward_coins: 15,
      reward_points: 2,
      timeframe: 'daily',
      active: true,
      progress: 0,
      completed: false,
      percentage: 0,
      claimed: false
    },
    {
      id: 'daily-paper',
      title: 'Recycle 5 Paper Items',
      description: 'Recycle 5 paper items today!',
      type: 'recycle_item',
      target_item: 'paper',
      target_amount: 5,
      reward_coins: 5,
      reward_points: 5,
      timeframe: 'daily',
      active: true,
      progress: 0,
      completed: false,
      percentage: 0,
      claimed: false
    },
    {
      id: 'daily-metal-can',
      title: 'Recycle 2 Metal Cans',
      description: 'Recycle 2 metal cans today!',
      type: 'recycle_item',
      target_item: 'metal can',
      target_amount: 2,
      reward_coins: 20,
      reward_points: 2,
      timeframe: 'daily',
      active: true,
      progress: 0,
      completed: false,
      percentage: 0,
      claimed: false
    },
    {
      id: 'daily-aluminum-foil',
      title: 'Recycle 3 Aluminum Foil',
      description: 'Recycle 3 aluminum foil today!',
      type: 'recycle_item',
      target_item: 'aluminum foil',
      target_amount: 3,
      reward_coins: 8,
      reward_points: 3,
      timeframe: 'daily',
      active: true,
      progress: 0,
      completed: false,
      percentage: 0,
      claimed: false
    },
    {
      id: 'daily-e-waste',
      title: 'Recycle 1 E-Waste Item',
      description: 'Recycle 1 e-waste item today!',
      type: 'recycle_item',
      target_item: 'e-waste',
      target_amount: 1,
      reward_coins: 25,
      reward_points: 1,
      timeframe: 'daily',
      active: true,
      progress: 0,
      completed: false,
      percentage: 0,
      claimed: false
    },
    {
      id: 'daily-batteries',
      title: 'Recycle 2 Batteries',
      description: 'Recycle 2 batteries today!',
      type: 'recycle_item',
      target_item: 'batteries',
      target_amount: 2,
      reward_coins: 18,
      reward_points: 2,
      timeframe: 'daily',
      active: true,
      progress: 0,
      completed: false,
      percentage: 0,
      claimed: false
    },
    {
      id: 'daily-cardboard',
      title: 'Recycle 4 Cardboard Items',
      description: 'Recycle 4 cardboard items today!',
      type: 'recycle_item',
      target_item: 'cardboard',
      target_amount: 4,
      reward_coins: 7,
      reward_points: 4,
      timeframe: 'daily',
      active: true,
      progress: 0,
      completed: false,
      percentage: 0,
      claimed: false
    },
    // Weekly challenges
    {
      id: 'weekly-plastic-bottle',
      title: 'Recycle 15 Plastic Bottles',
      description: 'Recycle 15 plastic bottles this week!',
      type: 'recycle_item',
      target_item: 'plastic bottle',
      target_amount: 15,
      reward_coins: 50,
      reward_points: 10,
      timeframe: 'weekly',
      active: true,
      progress: 0,
      completed: false,
      percentage: 0,
      claimed: false
    },
    {
      id: 'weekly-glass',
      title: 'Recycle 10 Glass Items',
      description: 'Recycle 10 glass items this week!',
      type: 'recycle_item',
      target_item: 'glass',
      target_amount: 10,
      reward_coins: 60,
      reward_points: 10,
      timeframe: 'weekly',
      active: true,
      progress: 0,
      completed: false,
      percentage: 0,
      claimed: false
    },
    {
      id: 'weekly-paper',
      title: 'Recycle 20 Paper Items',
      description: 'Recycle 20 paper items this week!',
      type: 'recycle_item',
      target_item: 'paper',
      target_amount: 20,
      reward_coins: 30,
      reward_points: 10,
      timeframe: 'weekly',
      active: true,
      progress: 0,
      completed: false,
      percentage: 0,
      claimed: false
    },
    {
      id: 'weekly-metal-can',
      title: 'Recycle 10 Metal Cans',
      description: 'Recycle 10 metal cans this week!',
      type: 'recycle_item',
      target_item: 'metal can',
      target_amount: 10,
      reward_coins: 80,
      reward_points: 10,
      timeframe: 'weekly',
      active: true,
      progress: 0,
      completed: false,
      percentage: 0,
      claimed: false
    },
    {
      id: 'weekly-aluminum-foil',
      title: 'Recycle 12 Aluminum Foil',
      description: 'Recycle 12 aluminum foil this week!',
      type: 'recycle_item',
      target_item: 'aluminum foil',
      target_amount: 12,
      reward_coins: 40,
      reward_points: 10,
      timeframe: 'weekly',
      active: true,
      progress: 0,
      completed: false,
      percentage: 0,
      claimed: false
    },
    {
      id: 'weekly-e-waste',
      title: 'Recycle 5 E-Waste Items',
      description: 'Recycle 5 e-waste items this week!',
      type: 'recycle_item',
      target_item: 'e-waste',
      target_amount: 5,
      reward_coins: 100,
      reward_points: 10,
      timeframe: 'weekly',
      active: true,
      progress: 0,
      completed: false,
      percentage: 0,
      claimed: false
    },
    {
      id: 'weekly-batteries',
      title: 'Recycle 8 Batteries',
      description: 'Recycle 8 batteries this week!',
      type: 'recycle_item',
      target_item: 'batteries',
      target_amount: 8,
      reward_coins: 60,
      reward_points: 10,
      timeframe: 'weekly',
      active: true,
      progress: 0,
      completed: false,
      percentage: 0,
      claimed: false
    },
    {
      id: 'weekly-cardboard',
      title: 'Recycle 15 Cardboard Items',
      description: 'Recycle 15 cardboard items this week!',
      type: 'recycle_item',
      target_item: 'cardboard',
      target_amount: 15,
      reward_coins: 40,
      reward_points: 10,
      timeframe: 'weekly',
      active: true,
      progress: 0,
      completed: false,
      percentage: 0,
      claimed: false
    },
    // Monthly challenges
    {
      id: 'monthly-plastic-bottle',
      title: 'Recycle 50 Plastic Bottles',
      description: 'Recycle 50 plastic bottles this month!',
      type: 'recycle_item',
      target_item: 'plastic bottle',
      target_amount: 50,
      reward_coins: 200,
      reward_points: 30,
      timeframe: 'monthly',
      active: true,
      progress: 0,
      completed: false,
      percentage: 0,
      claimed: false
    },
    {
      id: 'monthly-glass',
      title: 'Recycle 30 Glass Items',
      description: 'Recycle 30 glass items this month!',
      type: 'recycle_item',
      target_item: 'glass',
      target_amount: 30,
      reward_coins: 220,
      reward_points: 30,
      timeframe: 'monthly',
      active: true,
      progress: 0,
      completed: false,
      percentage: 0,
      claimed: false
    },
    {
      id: 'monthly-paper',
      title: 'Recycle 60 Paper Items',
      description: 'Recycle 60 paper items this month!',
      type: 'recycle_item',
      target_item: 'paper',
      target_amount: 60,
      reward_coins: 100,
      reward_points: 30,
      timeframe: 'monthly',
      active: true,
      progress: 0,
      completed: false,
      percentage: 0,
      claimed: false
    },
    {
      id: 'monthly-metal-can',
      title: 'Recycle 30 Metal Cans',
      description: 'Recycle 30 metal cans this month!',
      type: 'recycle_item',
      target_item: 'metal can',
      target_amount: 30,
      reward_coins: 250,
      reward_points: 30,
      timeframe: 'monthly',
      active: true,
      progress: 0,
      completed: false,
      percentage: 0,
      claimed: false
    },
    {
      id: 'monthly-aluminum-foil',
      title: 'Recycle 40 Aluminum Foil',
      description: 'Recycle 40 aluminum foil this month!',
      type: 'recycle_item',
      target_item: 'aluminum foil',
      target_amount: 40,
      reward_coins: 120,
      reward_points: 30,
      timeframe: 'monthly',
      active: true,
      progress: 0,
      completed: false,
      percentage: 0,
      claimed: false
    },
    {
      id: 'monthly-e-waste',
      title: 'Recycle 20 E-Waste Items',
      description: 'Recycle 20 e-waste items this month!',
      type: 'recycle_item',
      target_item: 'e-waste',
      target_amount: 20,
      reward_coins: 400,
      reward_points: 30,
      timeframe: 'monthly',
      active: true,
      progress: 0,
      completed: false,
      percentage: 0,
      claimed: false
    },
    {
      id: 'monthly-batteries',
      title: 'Recycle 25 Batteries',
      description: 'Recycle 25 batteries this month!',
      type: 'recycle_item',
      target_item: 'batteries',
      target_amount: 25,
      reward_coins: 180,
      reward_points: 30,
      timeframe: 'monthly',
      active: true,
      progress: 0,
      completed: false,
      percentage: 0,
      claimed: false
    },
    {
      id: 'monthly-cardboard',
      title: 'Recycle 50 Cardboard Items',
      description: 'Recycle 50 cardboard items this month!',
      type: 'recycle_item',
      target_item: 'cardboard',
      target_amount: 50,
      reward_coins: 120,
      reward_points: 30,
      timeframe: 'monthly',
      active: true,
      progress: 0,
      completed: false,
      percentage: 0,
      claimed: false
    },
    // Additional Weekly Challenges
    {
      id: 'weekly-mixed-recycler',
      title: 'Recycle 3 Different Types of Items',
      description: 'Recycle at least 3 different types of items this week!',
      type: 'recycle_count',
      target_amount: 3,
      reward_coins: 50,
      reward_points: 15,
      timeframe: 'weekly',
      active: true,
      progress: 0,
      completed: false,
      percentage: 0,
      claimed: false
    },
    {
      id: 'weekly-bulk-recycler',
      title: 'Recycle 40 Items',
      description: 'Recycle a total of 40 items of any type this week!',
      type: 'recycle_count',
      target_amount: 40,
      reward_coins: 100,
      reward_points: 20,
      timeframe: 'weekly',
      active: true,
      progress: 0,
      completed: false,
      percentage: 0,
      claimed: false
    },
    {
      id: 'weekly-coin-collector',
      title: 'Earn 300 R Coins',
      description: 'Earn 300 R coins from recycling this week!',
      type: 'earn_coins',
      target_amount: 300,
      reward_coins: 60,
      reward_points: 20,
      timeframe: 'weekly',
      active: true,
      progress: 0,
      completed: false,
      percentage: 0,
      claimed: false
    },
    // Additional Monthly Challenges
    {
      id: 'monthly-super-recycler',
      title: 'Recycle 150 Items',
      description: 'Recycle 150 items of any type this month!',
      type: 'recycle_count',
      target_amount: 150,
      reward_coins: 300,
      reward_points: 50,
      timeframe: 'monthly',
      active: true,
      progress: 0,
      completed: false,
      percentage: 0,
      claimed: false
    },
    {
      id: 'monthly-all-rounder',
      title: 'Recycle 10 of Each Item Type',
      description: 'Recycle at least 10 of each item type this month!',
      type: 'all_rounder',
      target_amount: 10,
      reward_coins: 400,
      reward_points: 60,
      timeframe: 'monthly',
      active: true,
      progress: 0,
      completed: false,
      percentage: 0,
      claimed: false
    },
    {
      id: 'monthly-big-earner',
      title: 'Earn 1000 R Coins',
      description: 'Earn 1000 R coins from recycling this month!',
      type: 'earn_coins',
      target_amount: 1000,
      reward_coins: 200,
      reward_points: 40,
      timeframe: 'monthly',
      active: true,
      progress: 0,
      completed: false,
      percentage: 0,
      claimed: false
    }
  ];

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) throw error;

        setUser(user);
        if (user) {
          const { data: profileData, error: profileError } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .single();

          // If profile doesn't exist, create it
          if (profileError && profileError.code === 'PGRST116') {
            console.log("Profile doesn't exist, creating one...");
            const { data: newProfile, error: createError } = await supabase
              .from("profiles")
              .insert([
                {
                  id: user.id,
                  email: user.email,
                  name: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
                  r_coins: 0,
                  points: 0,
                  streak: 0,
                  level: 'Beginner'
                }
              ])
              .select()
              .single();

            if (createError) {
              console.error("Error creating profile:", createError);
            } else {
              setProfile(newProfile);
              setProfilePic(newProfile?.avatar_url || null);
            }
          } else if (profileError) {
            console.error("Error fetching profile:", profileError);
          } else {
            setProfile(profileData);
            setProfilePic(profileData?.avatar_url || null);
          }
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    getUser();
  }, []);

  useEffect(() => {
    setUserRCoins(rCoins);
  }, [rCoins]);

  // Fetch recycling history
  useEffect(() => {
    if (!user) return;
    const fetchHistory = async () => {
      setLoadingHistory(true);
      const { data, error } = await supabase
        .from("recycling_history")
        .select("*, recycling_hubs(name)")
        .eq("user_id", user.id)
        .order("date", { ascending: false });
      if (!error) setHistory(data || []);
      setLoadingHistory(false);
    };
    fetchHistory();
  }, [user, userRCoins]);

  // Fetch reward history
  const fetchRewards = async () => {
    if (!user) return;
    setLoadingRewards(true);
    const { data, error } = await supabase
      .from("reward_history")
      .select("*")
      .eq("user_id", user.id)
      .order("date_redeemed", { ascending: false });
    if (!error) setRewardHistory(data || []);
    setLoadingRewards(false);
  };

  useEffect(() => {
    fetchRewards();
  }, [user]);

  useEffect(() => {
    if (!user) return;

    // Subscribe to changes in reward_history for this user
    const channel = supabase
      .channel('reward-history-changes')
      .on(
        'postgres_changes',
        {
          event: '*', // or 'INSERT' if you only care about new rewards
          schema: 'public',
          table: 'reward_history',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          // Refetch or update your rewardHistory state here
          fetchRewards(); // You can call your fetchRewards function
        }
      )
      .subscribe();

    // Cleanup on unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  // Dummy rewards
  const rewards = [
    { id: 1, name: "Amazon ₹100 Gift Card", cost: 100, code: "AMZ100-XYZ" },
    { id: 2, name: "Zomato ₹50 Off", cost: 50, code: "ZMT50-ABC" },
    { id: 3, name: "Flipkart ₹75 Gift Card", cost: 75, code: "FLPK75-DEF" },
  ];

  const handleRedeem = useCallback(async (reward: any) => {
    if (!user) {
      alert("Please log in to redeem rewards");
      return;
    }

    if (userRCoins < reward.cost) {
      setRedeemMessage("Not enough R coins to redeem this reward.");
      return;
    }

    try {
      setUserRCoins(userRCoins - reward.cost);
      setRedeemMessage(`Congratulations! Here's your code for ${reward.name}: ${reward.code}`);

      const { error } = await supabase
        .from("reward_history")
        .insert([{
          user_id: user.id,
          reward_name: reward.name,
          code: reward.code,
          date_redeemed: new Date().toISOString(),
        }]);

      if (error) throw error;
    } catch (error) {
      console.error("Error redeeming reward:", error);
      setRedeemMessage("Failed to redeem reward. Please try again.");
    }
  }, [userRCoins, user]);

  // Modal actions
  const handleLogout = async () => {
    await supabase.auth.signOut();
    setShowProfileModal(false);
    window.location.href = "/auth";
  };
  const handleChangePassword = async () => {
    if (!user?.email) return;
    await supabase.auth.resetPasswordForEmail(user.email);
    alert("Password reset email sent. Please check your inbox.");
  };
  const handleProfilePicChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setUploading(true);
    setModalError(null);
    // Upload to Supabase Storage (bucket: 'avatars')
    const filePath = `${user.id}/${file.name}`;
    const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file, { upsert: true });
    if (uploadError) {
      setModalError(uploadError.message);
      setUploading(false);
      return;
    }
    // Get public URL
    const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
    if (data?.publicUrl) {
      setProfilePic(data.publicUrl);
      // Update profile
      await supabase.from('profiles').update({ avatar_url: data.publicUrl }).eq('id', user.id);
    }
    setUploading(false);
  };

  // Modal JSX
  const ProfileModal = () => (
    <div className="fixed inset-0 z-[1001] flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setShowProfileModal(false)}>
      <div
        className="bg-white/90 rounded-2xl shadow-lg p-8 w-full max-w-md flex flex-col items-center gap-6 border border-green-200 relative"
        onClick={e => e.stopPropagation()}
      >
        <button onClick={() => setShowProfileModal(false)} className="absolute top-4 right-4 text-green-700 hover:text-red-500 text-xl"><FaTimes /></button>
        <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
          {profilePic ? (
            <img src={profilePic} alt="Profile" className="w-24 h-24 rounded-full object-cover border-4 border-green-300" />
          ) : (
            <FaUserCircle className="text-green-600 w-24 h-24" />
          )}
          <div className="absolute inset-0 bg-black/30 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition cursor-pointer">
            <span className="text-white font-semibold">Change</span>
          </div>
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            className="hidden"
            onChange={handleProfilePicChange}
            disabled={uploading}
          />
        </div>
        <h2 className="text-2xl font-bold text-green-700">{profile?.name || user?.email}</h2>
        <p className="text-gray-700">Email: <span className="font-semibold">{user?.email}</span></p>
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
            Logout
          </button>
          <button onClick={handleChangePassword} className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded shadow transition">
            Change Password
          </button>
        </div>
        {modalError && <div className="text-red-600 mt-2">{modalError}</div>}
        {uploading && <div className="text-green-600 mt-2">Uploading...</div>}
      </div>
    </div>
  );

  const RedeemModal = () => (
    <div className="fixed inset-0 z-[1002] flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => { setShowRedeemModal(false); setRedeemMessage(null); }}>
      <div
        className="bg-white/90 rounded-2xl shadow-lg p-8 w-full max-w-md flex flex-col items-center gap-6 border border-green-200 relative"
        onClick={e => e.stopPropagation()}
      >
        <button onClick={() => { setShowRedeemModal(false); setRedeemMessage(null); }} className="absolute top-4 right-4 text-green-700 hover:text-red-500 text-xl"><FaTimes /></button>
        <h2 className="text-xl font-bold text-green-700 mb-2">Redeem Your R Coins</h2>
        <div className="w-full flex flex-col gap-4">
          {rewards.map(reward => (
            <div key={reward.id} className="flex justify-between items-center bg-green-50 rounded p-3 border border-green-100">
              <div>
                <div className="font-semibold text-green-700">{reward.name}</div>
                <div className="text-sm text-gray-600">Cost: {reward.cost} R coins</div>
              </div>
              <button
                className="bg-green-600 text-white px-4 py-2 rounded shadow hover:bg-green-700 disabled:opacity-50"
                disabled={userRCoins < reward.cost}
                onClick={() => handleRedeem(reward)}
              >
                Redeem
              </button>
            </div>
          ))}
        </div>
        {redeemMessage && <div className="mt-4 text-green-700 font-semibold text-center">{redeemMessage}</div>}
        <div className="mt-2 text-gray-500 text-xs">* For demo purposes only</div>
      </div>
    </div>
  );

  const handleScan = async (result: any) => {
    console.log("Scanned Data:", result);
    try {
      let qrText: string | undefined = undefined;

      if (typeof result === "string") {
        qrText = result;
      } else if (result && typeof result.getText === "function") {
        qrText = result.getText();
      }

      if (!qrText) {
        alert("Could not read QR code data.");
        return;
      }

      console.log("QR Text:", qrText);

      if (qrText.includes(":")) {
        const parts = qrText.split(":");
        const hubId = parts[parts.length - 1].trim();

        if (!hubId) {
          alert("Could not extract hub ID from QR code.");
          return;
        }

        console.log("Extracted Hub ID:", hubId);

        // Fetch hub from Supabase
        try {
          const { data: hub, error } = await supabase
            .from("recycling_hubs")
            .select("*")
            .eq("id", hubId)
            .single();

          if (error) {
            console.error("Error fetching hub:", error);
            alert("Error fetching hub: " + error.message);
            return;
          }

          if (!hub) {
            alert("Hub not found! Please try scanning again.");
            return;
          }

          console.log("Found hub:", hub);

          setPendingHubId(hubId);
          setPendingHub(hub);
          setShowScanner(false);
          setShowItemModal(true);
          setSelectedItems({});
        } catch (error) {
          console.error("Exception fetching hub:", error);
          alert("An error occurred while fetching hub data.");
        }
      } else {
        alert("Scanned data is not a valid QR code string: " + qrText);
      }
    } catch (error) {
      console.error("Exception in handleScan:", error);
      alert("An error occurred while processing the QR code.");
    }
  };

  const handleItemCheckbox = (value: string, checked: boolean) => {
    setSelectedItems(prev => {
      const updated = { ...prev };
      if (checked) {
        updated[value] = 1;
      } else {
        delete updated[value];
      }
      return updated;
    });
  };

  const handleItemQuantity = (value: string, qty: number) => {
    setSelectedItems(prev => ({ ...prev, [value]: qty }));
  };

  const handleItemSubmit = async () => {
    if (!user) {
      alert("Please log in to submit recycling items");
      return;
    }
    if (!pendingHubId || !pendingHub) return;
    setItemSubmitting(true);
    const userId = user?.id;
    let totalCoins = 0;
    const records = Object.entries(selectedItems)
      .filter(([_, qty]) => qty > 0)
      .map(([value, qty]) => {
        const itemObj = ITEM_OPTIONS.find(i => i.value === value);
        const coins = itemObj ? itemObj.coins : 10;
        totalCoins += coins * qty;
        return {
          user_id: userId,
          hub_id: pendingHubId,
          item: itemObj ? itemObj.label : value,
          r_coins: coins * qty,
          quantity: qty,
          date: new Date().toISOString(),
        };
      });

    if (records.length === 0) {
      alert("Please select at least one item and quantity.");
      setItemSubmitting(false);
      return;
    }

    // Calculate total items recycled in this submission
    const totalItems = Object.values(selectedItems).reduce((sum, qty) => sum + qty, 0);
    const newRCoins = (profile?.r_coins ?? 0) + totalCoins;
    const newPoints = (profile?.points ?? 0) + totalItems;

    try {
      // Insert all records into recycling_history
      const validRecords = records.map(record => ({
        user_id: record.user_id,
        hub_id: record.hub_id,
        item: record.item,
        r_coins: Number(record.r_coins),
        quantity: Number(record.quantity),
        date: record.date
      }));

      const { error: rewardError } = await supabase
        .from("recycling_history")
        .insert(validRecords);

      if (rewardError) {
        console.error("Error inserting records:", rewardError);
        alert("Failed to add reward: " + rewardError.message);
        setItemSubmitting(false);
        return;
      }

      // Update R coins and points in profile
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ r_coins: newRCoins, points: newPoints })
        .eq("id", userId);

      if (updateError) {
        alert("Failed to update R coins and points.");
        setItemSubmitting(false);
        return;
      }

      // Update challenges based on submitted items
      const updatedChallenges = challenges.map(challenge => {
        // Skip if challenge is already completed
        if (challenge.completed) return challenge;

        let progress = challenge.progress;
        let completed = false;

        // Check if this submission contributes to the challenge
        if (challenge.type === 'recycle_item') {
          // Check if the submitted item matches the challenge target
          const matchingItems = records.filter(record =>
            record.item.toLowerCase().includes((challenge.target_item ?? '').toLowerCase())
          );
          if (matchingItems.length > 0) {
            progress += matchingItems.reduce((sum, item) => sum + item.quantity, 0);
          }
        } else if (challenge.type === 'recycle_count') {
          // Add all items to the total count
          progress += totalItems;
        } else if (challenge.type === 'earn_coins') {
          // Add earned coins to progress
          progress += totalCoins;
        } else if (challenge.type === 'all_rounder') {
          // Check if user has recycled at least target_amount of each item type this month
          // We'll need to fetch the user's recycling history for the month
          // This logic is handled in fetchChallenges for accuracy
        }

        completed = progress >= challenge.target_amount;

        return {
          ...challenge,
          progress,
          completed,
          percentage: Math.min(100, Math.round((progress / challenge.target_amount) * 100)),
          claimed: false
        };
      });

      // Update challenges state
      setChallenges(updatedChallenges);

      // Refresh profile
      const { data: updatedProfile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();
      setProfile(updatedProfile);
      setUserRCoins(newRCoins);

      setShowItemModal(false);
      setPendingHubId(null);
      setPendingHub(null);
      setSelectedItems({});
      setItemSubmitting(false);

      // Show completion messages for any newly completed challenges
      const newlyCompleted = updatedChallenges.filter(
        (c, i) => c.completed && !challenges[i].completed
      );
      if (newlyCompleted.length > 0) {
        const message = newlyCompleted
          .map(c => `"${c.title}" challenge completed!`)
          .join('\n');
        alert(`Reward added successfully! You received ${totalCoins} R coins and ${totalItems} points for recycling.\n\n${message}`);
      } else {
        alert(`Reward added successfully! You received ${totalCoins} R coins and ${totalItems} points for recycling.`);
      }

      // After updating the profile and coins:
      await fetchChallenges(); // <-- This will recalculate all challenge progress

      // Only insert if there are newly completed challenges
      if (newlyCompleted.length > 0) {
        const claims = newlyCompleted.map(c => ({
          user_id: user.id,
          challenge_id: c.id,
          reward_coins: c.reward_coins,
          reward_points: c.reward_points,
          claimed_at: new Date().toISOString()
        }));
        await supabase.from('challenge_claims').insert(claims);
      }

    } catch (error) {
      console.error("Exception during insert:", error);
      alert("An error occurred while adding rewards.");
      setItemSubmitting(false);
      return;
    }
  };

  const ItemModal = () => (
    <div className="fixed inset-0 z-[1003] flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setShowItemModal(false)}>
      <div className="bg-white/90 rounded-2xl shadow-lg p-8 w-full max-w-md flex flex-col items-center gap-6 border border-green-200 relative" onClick={e => e.stopPropagation()}>
        <button onClick={() => setShowItemModal(false)} className="absolute top-4 right-4 text-green-700 hover:text-red-500 text-xl"><FaTimes /></button>
        <h2 className="text-xl font-bold text-green-700 mb-2">Select Items Recycled</h2>
        <div className="w-full flex flex-col gap-4">
          {ITEM_OPTIONS.map(item => (
            <div key={item.value} className={`flex items-center gap-3 p-3 rounded border ${selectedItems[item.value] ? 'border-green-600 bg-green-50' : 'border-green-200 bg-white'} transition`}>
              <input
                type="checkbox"
                name="item"
                value={item.value}
                checked={!!selectedItems[item.value]}
                onChange={e => handleItemCheckbox(item.value, e.target.checked)}
                className="accent-green-600"
              />
              <span className="font-semibold text-green-700">{item.label}</span>
              <span className="ml-auto text-xs text-yellow-700 font-bold">+{item.coins} R coins each</span>
              <input
                type="number"
                min={selectedItems[item.value] ? 1 : 0}
                value={selectedItems[item.value] || 0}
                disabled={!selectedItems[item.value]}
                onChange={e => handleItemQuantity(item.value, Math.max(1, Number(e.target.value)))}
                className="w-16 ml-2 px-2 py-1 border rounded text-green-700 focus:outline-none focus:ring-2 focus:ring-green-400"
              />
            </div>
          ))}
        </div>
        <button
          className="mt-4 bg-green-600 text-white px-6 py-2 rounded shadow hover:bg-green-700 transition disabled:opacity-50"
          disabled={Object.keys(selectedItems).length === 0 || itemSubmitting}
          onClick={handleItemSubmit}
        >
          {itemSubmitting ? "Submitting..." : "Submit"}
        </button>
      </div>
    </div>
  );

  useEffect(() => {
    const checkSupabase = async () => {
      const { data, error } = await supabase.from('recycling_history').select('count');
      console.log("Supabase test query:", { data, error });
    };
    checkSupabase();
  }, []);

  const fetchLeaderboard = async () => {
    setLoadingLeaderboard(true);
    const { data, error } = await supabase
      .from("profiles")
      .select("name, points")
      .order("points", { ascending: false })
      .limit(10);
    if (!error) setLeaderboard(data || []);
    setLoadingLeaderboard(false);
  };

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  useEffect(() => {
    const channel = supabase
      .channel('profiles-leaderboard')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles',
        },
        (payload) => {
          fetchLeaderboard();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log('User location:', position.coords.latitude, position.coords.longitude);
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error('Error getting user location:', error.message);
          setUserLocation({ lat: 12.9716, lng: 77.5946 }); // fallback
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    }
  }, []);

  // Update the claimChallengeReward function
  const claimChallengeReward = async (challengeId: string) => {
    if (!user) return;

    try {
      // Find the challenge
      const challenge = challenges.find(c => c.id === challengeId);
      if (!challenge || !challenge.completed) return;

      // Update user's profile with rewards
      const newRCoins = (profile?.r_coins || 0) + challenge.reward_coins;
      const newPoints = (profile?.points || 0) + (challenge.reward_points || 0);

      // Update profile
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ r_coins: newRCoins, points: newPoints })
        .eq("id", user.id);

      if (updateError) throw updateError;

      // Update local state
      setUserRCoins(newRCoins);
      setProfile((prev: any) => ({ ...prev, r_coins: newRCoins, points: newPoints }));

      // Update challenges list
      setChallenges((prev: Challenge[]) => prev.map(c =>
        c.id === challengeId ? { ...c, claimed: true } : c
      ));

      // Show success message
      alert(`Congratulations! You've claimed ${challenge.reward_coins} R coins${challenge.reward_points ? ` and ${challenge.reward_points} points` : ''
        } for completing the "${challenge.title}" challenge!`);

      // Update challenge_claims table
      await supabase.from('challenge_claims').insert([{
        user_id: user.id,
        challenge_id: challenge.id,
        reward_coins: challenge.reward_coins,
        reward_points: challenge.reward_points,
        claimed_at: new Date().toISOString()
      }]);

    } catch (error) {
      console.error("Error claiming challenge reward:", error);
      alert("Failed to claim reward. Please try again.");
    }
  };

  // Update the fetchChallenges function
  const fetchChallenges = async () => {
    if (!user) return;
    setLoadingChallenges(true);

    try {
      // Get user's recycling history
      const { data: recyclingData, error: recyclingError } = await supabase
        .from("recycling_history")
        .select("*")
        .eq("user_id", user.id);

      if (recyclingError) {
        console.error("Error fetching recycling history:", recyclingError);
      }

      // After fetching recyclingData...
      const { data: claimsData } = await supabase
        .from('challenge_claims')
        .select('challenge_id')
        .eq('user_id', user.id);

      const claimedIds = claimsData ? claimsData.map(c => c.challenge_id) : [];

      // Always use sampleChallenges as the base
      const challengesWithProgress = sampleChallenges.map((challenge: Challenge) => {
        let progress = 0;
        let completed = false;

        if (recyclingData && recyclingData.length > 0) {
          // Filter data based on challenge timeframe
          const relevantHistory = recyclingData.filter(item => {
            const itemDate = new Date(item.date);
            const now = new Date();

            if (challenge.timeframe === 'daily') {
              return itemDate.toDateString() === now.toDateString();
            } else if (challenge.timeframe === 'weekly') {
              const weekStart = new Date(now);
              weekStart.setDate(now.getDate() - now.getDay());
              return itemDate >= weekStart;
            } else if (challenge.timeframe === 'monthly') {
              return itemDate.getMonth() === now.getMonth() &&
                itemDate.getFullYear() === now.getFullYear();
            }
            return true;
          });

          // Calculate progress based on challenge type
          if (challenge.type === 'recycle_item') {
            progress = relevantHistory
              .filter(item => item.item && item.item.toLowerCase().includes(challenge.target_item?.toLowerCase() || ''))
              .reduce((sum, item) => sum + (item.quantity || 1), 0);
          } else if (challenge.type === 'recycle_count') {
            progress = relevantHistory.reduce((sum, item) => sum + (item.quantity || 1), 0);
          } else if (challenge.type === 'earn_coins') {
            progress = relevantHistory.reduce((sum, item) => sum + (item.r_coins || 0), 0);
          } else if (challenge.type === 'all_rounder') {
            // For each item type, check if user has recycled at least target_amount this month
            const itemTypes = ['plastic bottle', 'glass', 'paper', 'metal can', 'aluminum foil', 'e-waste', 'batteries', 'cardboard'];
            let allMet = true;
            for (const type of itemTypes) {
              const count = relevantHistory
                .filter(item => item.item && item.item.toLowerCase().includes(type))
                .reduce((sum, item) => sum + (item.quantity || 1), 0);
              if (count < challenge.target_amount) {
                allMet = false;
                break;
              }
            }
            progress = allMet ? challenge.target_amount : 0;
          }
        }

        completed = progress >= challenge.target_amount;

        return {
          ...challenge,
          progress,
          completed,
          percentage: Math.min(100, Math.round((progress / challenge.target_amount) * 100)),
          claimed: claimedIds.includes(challenge.id)
        };
      });

      setChallenges(challengesWithProgress);
    } catch (error) {
      console.error("Error setting up challenges:", error);
    } finally {
      setLoadingChallenges(false);
    }
  };

  // Add useEffect to initialize challenges
  useEffect(() => {
    if (user) {
      setChallenges(sampleChallenges);
      fetchChallenges();
    }
  }, [user]);

  const top3 = leaderboard.slice(0, 3);
  const next2 = leaderboard.slice(3, 5);

  useEffect(() => {
    function handleFullscreenChange() {
      // Check if any element is in fullscreen
      setIsMapFullscreen(!!document.fullscreenElement);
    }
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex justify-center items-start px-2 md:px-0">
      <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
        {/* Left Column */}
        <div className="flex flex-col gap-8 h-full">
          {/* Welcome/Profile Section */}
          <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="bg-white/70 rounded-2xl shadow-lg p-6 flex items-center gap-6">
            <div className="bg-gradient-to-br from-green-400 to-blue-400 rounded-full p-3 shadow-lg cursor-pointer" onClick={() => setShowProfileModal(true)} title="View Profile">
              {profilePic ? (
                <img src={profilePic} alt="Profile" className="w-14 h-14 rounded-full object-cover border-2 border-green-300" />
              ) : (
                <FaUserCircle className="text-white text-4xl" />
              )}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-green-700">Welcome, {profile?.name || user?.email || "Eco Cycler"}!</h2>
              <p className="text-gray-700 text-sm mt-1">Points: <span className="font-semibold text-green-600">{profile?.points ?? 1230}</span> | Level: <span className="font-semibold text-green-600">{profile?.level ?? "Green Hero"}</span></p>
            </div>
            <button
              onClick={() => setShowScanner(true)}
              className="ml-auto bg-green-600 text-white rounded-full p-4 shadow-lg hover:bg-green-700 transition"
              title="Scan QR Code"
            >
              <FaQrcode className="text-2xl" />
            </button>
          </motion.section>

          {/* Rewards Section */}
          {!user ? (
            <div className="text-center py-4">
              <p>Please log in to view your rewards</p>
            </div>
          ) : (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="rounded-xl shadow-2xl border border-green-300 bg-gradient-to-br from-green-200 via-yellow-100 to-blue-100 p-6 flex items-center gap-4 relative overflow-hidden"
              style={{
                boxShadow: '0 8px 32px 0 rgba(34,197,94,0.25), 0 1.5px 8px 0 rgba(0,0,0,0.10)'
              }}
            >
              <div className="absolute inset-0 pointer-events-none" style={{
                background: 'radial-gradient(circle at 80% 20%, rgba(255,255,255,0.25) 0%, transparent 70%)'
              }} />
              <FaMedal className="text-yellow-400 text-5xl drop-shadow-lg" />
              <div className="flex-1 z-10">
                <h3 className="text-2xl font-extrabold text-green-800 drop-shadow">Your Rewards</h3>
                <div className="flex gap-2 mt-2 flex-wrap">
                  <span className="bg-green-500/90 text-white px-4 py-1 rounded-full text-sm shadow-inner">Badge: Recycler</span>
                  <span className="bg-yellow-400/90 text-white px-4 py-1 rounded-full text-sm shadow-inner">Streak: 7 days</span>
                  <span className="bg-blue-400/90 text-white px-4 py-1 rounded-full text-sm shadow-inner">Level Up!</span>
                  <span className="bg-green-700/90 text-white px-4 py-1 rounded-full text-sm shadow-inner">R Coins: {userRCoins}</span>
                  <motion.button
                    whileHover={{ scale: 1.08, boxShadow: '0 4px 24px 0 rgba(34,197,94,0.25)' }}
                    className="bg-gradient-to-r from-green-500 to-green-700 text-white px-4 py-1 rounded-full text-sm shadow-lg font-bold"
                    onClick={() => setShowRedeemModal(true)}
                  >
                    Redeem
                  </motion.button>
                </div>
              </div>
            </motion.section>
          )}

          {/* Leaderboard Section */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="bg-gradient-to-br from-yellow-50 via-green-100 to-green-200 rounded-xl shadow-lg p-6 border border-yellow-200"
          >
            <div className="flex items-center gap-2 mb-4">
              <FaTrophy className="text-yellow-500 text-2xl animate-bounce" />
              <h3 className="text-lg font-bold text-green-700">Leaderboard</h3>
            </div>
            {loadingLeaderboard ? (
              <div className="text-gray-500">Loading leaderboard...</div>
            ) : (
              <div className="flex flex-col items-center">
                {/* Podium for Top 3 */}
                <div className="flex items-end justify-center gap-4 mb-4" style={{ minHeight: 120 }}>
                  {/* 2nd Place */}
                  {top3[1] && (
                    <motion.div
                      className="flex flex-col items-center"
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      whileHover={{ scale: 1.05 }}
                    >
                      <motion.div className="bg-gray-300 rounded-full w-12 h-12 flex items-center justify-center text-2xl mb-1 border-4 border-gray-400 shadow-lg" whileHover={{ scale: 1.1 }}>
                        <FaUserCircle />
                      </motion.div>
                      <motion.div className="bg-gray-400 text-white w-10 h-16 flex items-center justify-center rounded-t-lg text-xl font-bold mb-1 shadow" whileHover={{ scale: 1.05 }}>2</motion.div>
                      <div className="font-semibold text-gray-700">{top3[1].name || 'Anonymous'}</div>
                      <div className="text-sm text-gray-600">{top3[1].points} pts</div>
                    </motion.div>
                  )}
                  {/* 1st Place */}
                  {top3[0] && (
                    <motion.div
                      className="flex flex-col items-center"
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1.1, opacity: 1 }}
                      transition={{ delay: 0.1 }}
                      whileHover={{ scale: 1.15 }}
                    >
                      <motion.div className="bg-yellow-300 rounded-full w-16 h-16 flex items-center justify-center text-3xl mb-1 border-4 border-yellow-400 shadow-xl animate-pulse" whileHover={{ scale: 1.15 }}>
                        <FaUserCircle />
                      </motion.div>
                      <motion.div className="bg-yellow-400 text-white w-12 h-24 flex items-center justify-center rounded-t-lg text-2xl font-bold mb-1 shadow-lg" whileHover={{ scale: 1.1 }}>1</motion.div>
                      <div className="font-bold text-yellow-700">{top3[0].name || 'Anonymous'}</div>
                      <div className="text-base text-yellow-700">{top3[0].points} pts</div>
                    </motion.div>
                  )}
                  {/* 3rd Place */}
                  {top3[2] && (
                    <motion.div
                      className="flex flex-col items-center"
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.3 }}
                      whileHover={{ scale: 1.05 }}
                    >
                      <motion.div className="bg-yellow-600 rounded-full w-12 h-12 flex items-center justify-center text-2xl mb-1 border-4 border-yellow-700 shadow-lg" whileHover={{ scale: 1.1 }}>
                        <FaUserCircle />
                      </motion.div>
                      <motion.div className="bg-yellow-700 text-white w-10 h-12 flex items-center justify-center rounded-t-lg text-xl font-bold mb-1 shadow" whileHover={{ scale: 1.05 }}>3</motion.div>
                      <div className="font-semibold text-yellow-700">{top3[2].name || 'Anonymous'}</div>
                      <div className="text-sm text-yellow-700">{top3[2].points} pts</div>
                    </motion.div>
                  )}
                </div>
                {/* 4th and 5th as simple list */}
                <div className="flex flex-col gap-1 mt-2 w-full max-w-xs mx-auto">
                  {next2.map((user, idx) => (
                    <motion.div
                      key={user.name + idx}
                      className="flex items-center gap-2 bg-white/80 rounded-lg px-3 py-2 shadow hover:bg-yellow-50 transition"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + idx * 0.1 }}
                      whileHover={{ scale: 1.04 }}
                    >
                      <span className="text-xl">🏅</span>
                      <span className="font-semibold text-green-700">{user.name || "Anonymous"}</span>
                      <span className="ml-auto font-bold text-green-800">{user.points} pts</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </motion.section>

          {/* Challenges Section with toggle options */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative rounded-3xl p-6 overflow-hidden border border-green-200 shadow-2xl"
            style={{
              background: 'linear-gradient(135deg, #e0c3fc 0%, #a8edea 100%)',
              boxShadow: '0 8px 32px 0 rgba(147,51,234,0.18), 0 1.5px 8px 0 rgba(0,0,0,0.10)'
            }}
          >
            {/* Glassmorphism overlay */}
            <div className="absolute inset-0 pointer-events-none" style={{
              background: 'rgba(255,255,255,0.18)',
              backdropFilter: 'blur(6px)',
              WebkitBackdropFilter: 'blur(6px)'
            }} />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4">
                <FaMedal className="text-green-500 text-2xl drop-shadow-lg" />
                <h3 className="text-lg font-bold text-green-700">Challenges</h3>
              </div>
              <div className="flex bg-white/70 rounded-full p-1 mb-4 shadow-sm">
                <button
                  onClick={() => setChallengeTimeframe('daily')}
                  className={`flex-1 py-1.5 px-3 rounded-full text-sm font-medium transition ${challengeTimeframe === 'daily' ? 'bg-green-600 text-white' : 'text-green-700 hover:bg-green-50'}`}
                >
                  Daily
                </button>
                <button
                  onClick={() => setChallengeTimeframe('weekly')}
                  className={`flex-1 py-1.5 px-3 rounded-full text-sm font-medium transition ${challengeTimeframe === 'weekly' ? 'bg-green-600 text-white' : 'text-green-700 hover:bg-green-50'}`}
                >
                  Weekly
                </button>
                <button
                  onClick={() => setChallengeTimeframe('monthly')}
                  className={`flex-1 py-1.5 px-3 rounded-full text-sm font-medium transition ${challengeTimeframe === 'monthly' ? 'bg-green-600 text-white' : 'text-green-700 hover:bg-green-50'}`}
                >
                  Monthly
                </button>
              </div>
              {loadingChallenges ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-700 mx-auto"></div>
                  <p className="mt-2 text-green-700">Loading challenges...</p>
                </div>
              ) : challenges.length === 0 ? (
                <div className="text-center py-8 text-green-700">
                  <p>No active challenges for this timeframe.</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                  {challenges
                    .filter(challenge => challenge.timeframe === challengeTimeframe || challenge.timeframe === 'all')
                    .map((challenge) => (
                      <div key={challenge.id} className="bg-white/80 rounded-lg p-3 shadow-sm border border-green-100">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-semibold text-green-700">{challenge.title}</span>
                          <span className={`text-xs px-2 py-1 rounded-full ${challenge.completed
                            ? 'bg-green-100 text-green-700'
                            : 'bg-yellow-100 text-yellow-700'
                            }`}>
                            {challenge.completed ? 'Completed!' : `${challenge.progress}/${challenge.target_amount}`}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div
                            className={`${challenge.completed ? 'bg-green-600' : 'bg-yellow-500'} h-2.5 rounded-full transition-all duration-500`}
                            style={{ width: `${challenge.percentage}%` }}
                          ></div>
                        </div>
                        <div className="mt-2 text-xs text-green-700">
                          <span>{challenge.description}</span>
                          <span className="block mt-1 font-medium">Reward: +{challenge.reward_coins} R coins {challenge.reward_points > 0 ? `and +${challenge.reward_points} points` : ''}</span>
                        </div>
                        {challenge.completed && !challenge.claimed && (
                          <button
                            onClick={() => claimChallengeReward(challenge.id)}
                            className="mt-2 w-full bg-green-600 text-white text-xs py-1 rounded hover:bg-green-700 transition"
                          >
                            Claim Reward
                          </button>
                        )}
                      </div>
                    ))}
                </div>
              )}
            </div>
          </motion.section>
        </div>

        {/* Right Column */}
        <div className="flex flex-col gap-8">
          {/* Map section */}
          <motion.section
            initial={{ opacity: 0, y: 30, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.9, delay: 0.3, type: 'spring', bounce: 0.18 }}
            className={`relative rounded-3xl p-6 overflow-hidden border border-green-200 shadow-2xl ${mapFullView ? 'fixed inset-0 z-50 m-0 rounded-none' : ''
              }`}
            style={{
              background: 'linear-gradient(135deg, #b9fbc0 0%, #a3c9f9 100%)',
              boxShadow: '0 8px 32px 0 rgba(34,197,94,0.25), 0 1.5px 8px 0 rgba(0,0,0,0.10)'
            }}
          >
            {/* Glassmorphism overlay */}
            <div className="absolute inset-0 pointer-events-none" style={{
              background: 'rgba(255,255,255,0.18)',
              backdropFilter: 'blur(6px)',
              WebkitBackdropFilter: 'blur(6px)'
            }} />
            <div className="flex items-center gap-2 mb-4 relative z-10">
              <FaMapMarkerAlt className="text-green-500 text-2xl drop-shadow-lg animate-bounce" />
              <h3 className="text-lg font-bold text-green-700">Find Nearest Recycling Hub</h3>

            </div>
            <div className="overflow-y-auto max-h-[500px] relative z-10">
              <ClientOnly>
                <MapSection onFullscreenChange={setIsMapFullscreen} />
              </ClientOnly>
            </div>
          </motion.section>

          {/* Only show these sections if mapFullView is false AND map is not in fullscreen */}
          {!mapFullView && !isMapFullscreen && (
            <>
              {/* AI Tips Section - Chatbot */}
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="relative rounded-3xl p-6 overflow-hidden border border-purple-200 shadow-2xl"
                style={{
                  background: 'linear-gradient(135deg, #e0c3fc 0%, #a8edea 100%)',
                  boxShadow: '0 8px 32px 0 rgba(147,51,234,0.18), 0 1.5px 8px 0 rgba(0,0,0,0.10)'
                }}
              >
                {/* Glassmorphism overlay */}
                <div className="absolute inset-0 pointer-events-none" style={{
                  background: 'rgba(255,255,255,0.18)',
                  backdropFilter: 'blur(6px)',
                  WebkitBackdropFilter: 'blur(6px)'
                }} />
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-4">
                    <FaRobot className="text-purple-500 text-2xl drop-shadow-lg" />
                    <h3 className="text-lg font-bold text-purple-700">Recycling Assistant</h3>
                  </div>
                  <div className="h-[300px]">
                    <DashboardChatbot mapFullView={mapFullView} setMapFullView={setMapFullView} />
                  </div>
                </div>
              </motion.section>

              {/* History section */}
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.5 }}
                className="relative rounded-3xl p-6 overflow-hidden border border-green-200 shadow-2xl"
                style={{
                  background: 'linear-gradient(135deg, #b2f7ef 0%, #f7d6e0 100%)',
                  boxShadow: '0 8px 32px 0 rgba(34,197,94,0.18), 0 1.5px 8px 0 rgba(0,0,0,0.10)'
                }}
              >
                {/* Glassmorphism overlay */}
                <div className="absolute inset-0 pointer-events-none" style={{
                  background: 'rgba(255,255,255,0.18)',
                  backdropFilter: 'blur(6px)',
                  WebkitBackdropFilter: 'blur(6px)'
                }} />
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-4">
                    <FaHistory className="text-green-500 text-2xl drop-shadow-lg" />
                    <h3 className="text-lg font-bold text-green-700">Activity History</h3>
                  </div>
                  <div className="flex gap-2 mb-4">
                    <button
                      className={`px-4 py-2 rounded-full font-semibold transition ${historyTab === 'recycling'
                        ? 'bg-green-600 text-white shadow'
                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                        }`}
                      onClick={() => setHistoryTab('recycling')}
                    >
                      ♻️ Recycling
                    </button>
                    <button
                      className={`px-4 py-2 rounded-full font-semibold transition ${historyTab === 'rewards'
                        ? 'bg-yellow-500 text-white shadow'
                        : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                        }`}
                      onClick={() => setHistoryTab('rewards')}
                    >
                      🏅 Rewards
                    </button>
                    <button
                      className={`px-4 py-2 rounded-full font-semibold transition ${historyTab === 'hubs'
                        ? 'bg-blue-600 text-white shadow'
                        : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                        }`}
                      onClick={() => setHistoryTab('hubs')}
                    >
                      🏢 Hubs
                    </button>
                  </div>
                  <div>
                    {historyTab === 'recycling' && (
                      <div>
                        {loadingHistory ? (
                          <div>Loading...</div>
                        ) : history.length === 0 ? (
                          <div>No recycling activity yet.</div>
                        ) : (
                          <ul className="text-black">
                            {history.map((item, idx) => (
                              <li key={idx}>
                                {item.date}: {item.item} x{item.quantity} (+{item.r_coins} R coins)
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    )}

                    {historyTab === 'rewards' && (
                      <div>
                        {loadingRewards ? (
                          <div>Loading...</div>
                        ) : rewardHistory.length === 0 ? (
                          <div>No rewards redeemed yet.</div>
                        ) : (
                          <ul className="text-black">
                            {rewardHistory.map((reward, idx) => (
                              <li key={idx}>
                                {reward.date_redeemed}: {reward.reward_name} (Code: {reward.code})
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    )}

                    {historyTab === 'hubs' && (
                      <div>
                        {loadingHistory ? (
                          <div>Loading...</div>
                        ) : history.length === 0 ? (
                          <div>No hub visits yet.</div>
                        ) : (
                          <ul className="text-black">
                            {[...new Set(history.map(h => h.hub_id))].map((hubId, idx) => {
                              const hub = history.find(h => h.hub_id === hubId);
                              return (
                                <li key={idx}>
                                  {hub?.recycling_hubs?.name || hubId} (Last visit: {hub?.date})
                                </li>
                              );
                            })}
                          </ul>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </motion.section>
            </>
          )}
        </div>
      </div>

      {/* Your modals */}
      {showProfileModal && <ProfileModal />}
      {showRedeemModal && <RedeemModal />}
      {showItemModal && <ItemModal />}
      {showScanner && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
          <QRScanner
            onResult={handleScan}
            onClose={() => setShowScanner(false)}
          />
        </div>
      )}
      {message && <div className="mt-4 text-lg">{message}</div>}
    </main>
  );
}




















