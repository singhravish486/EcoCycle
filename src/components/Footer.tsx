"use client";
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-white/80 backdrop-blur-md border-t">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-center">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2 text-center">Connect With Us</h3>
            <div className="flex justify-center space-x-2">
              <SocialLink href="https://twitter.com" icon="𝕏" />
              <SocialLink href="https://facebook.com" icon="f" />
              <SocialLink href="https://instagram.com" icon="📸" />
              <SocialLink href="https://linkedin.com" icon="in" />
            </div>
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t text-center text-gray-600 text-xs">
          <p>&copy; {new Date().getFullYear()} Eco Cycle. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <motion.li whileHover={{ x: 5 }}>
      <Link href={href} className="text-gray-600 hover:text-green-600 transition">
        {children}
      </Link>
    </motion.li>
  );
}

function SocialLink({ href, icon }: { href: string; icon: string }) {
  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      whileHover={{ scale: 1.1 }}
      className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 hover:bg-green-100 text-gray-600 hover:text-green-600 transition"
    >
      {icon}
    </motion.a>
  );
} 