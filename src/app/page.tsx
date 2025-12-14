"use client";
import { motion } from 'framer-motion';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Scene3D from '@/components/Scene3D';

export default function LandingPage() {
  return (
    <>
      <Navbar />
      <Scene3D />
      <main className="relative min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-100 via-green-300 via-green-400 to-green-200">
        <div className="w-full flex flex-col items-center justify-center py-24">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-5xl md:text-6xl font-bold mb-8 text-green-800 text-center"
          >
            Eco Cycle
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mb-8 text-xl text-green-700 max-w-2xl mx-auto text-center"
          >
            Empowering a sustainable future, one action at a time.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mb-8"
          >
            <Link href="/auth">
              <button className="px-8 py-4 bg-green-600 text-white rounded-full shadow-lg text-xl font-semibold hover:bg-green-700 transition transform hover:scale-105">
                Get Started
              </button>
            </Link>
          </motion.div>
        </div>
        <div className="w-full max-w-7xl px-4 grid grid-cols-1 md:grid-cols-3 gap-8 pb-24">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
              className="bg-white/70 p-6 rounded-xl shadow-lg flex flex-col items-center"
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold mb-2 text-green-700 text-center">{feature.title}</h3>
              <p className="text-gray-600 text-center">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}

const features = [
  {
    icon: "🗺️",
    title: "Find Recycling Centers",
    description: "Locate nearby recycling hubs with our interactive map interface."
  },
  {
    icon: "🤖",
    title: "AI-Powered Tips",
    description: "Get personalized recycling guidance powered by advanced AI technology."
  },
  {
    icon: "🎮",
    title: "Gamified Experience",
    description: "Earn points and rewards while making a positive environmental impact."
  }
];
