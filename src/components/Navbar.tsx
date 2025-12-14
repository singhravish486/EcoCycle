"use client";
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function Navbar() {
  return (
    <motion.nav 
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, type: 'spring' }}
      className="fixed top-0 w-full bg-gradient-to-r from-green-200 via-green-300 to-green-100 shadow-lg z-50 backdrop-blur-md"
    >
      <div className="w-full px-0">
        <div className="flex items-center h-16 w-full">
          <motion.div 
            whileHover={{ scale: 1.08, rotate: 2 }}
            transition={{ type: 'spring', stiffness: 300 }}
            className="flex-shrink-0 ml-8"
          >
            <Link href="/" className="text-2xl font-extrabold text-green-700 drop-shadow-lg tracking-wide">
              Eco Cycle
            </Link>
          </motion.div>
        </div>
      </div>
    </motion.nav>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <motion.div whileHover={{ scale: 1.05 }}>
      <Link 
        href={href}
        className="text-gray-600 hover:text-green-600 px-3 py-2 rounded-md text-sm font-medium transition"
      >
        {children}
      </Link>
    </motion.div>
  );
} 