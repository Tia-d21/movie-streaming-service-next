import Link from 'next/link';
import { Facebook, Twitter, Instagram, Youtube } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-black text-gray-400 py-12 px-4">
      <div className="max-w-6xl mx-auto flex flex-col items-center">
        
        {/* Social Links */}
        <div className="flex space-x-6 mb-8">
          <Link href="#" className="hover:text-white transition-colors">
            <Facebook size={20} />
          </Link>
          <Link href="#" className="hover:text-white transition-colors">
            <Twitter size={20} />
          </Link>
          <Link href="#" className="hover:text-white transition-colors">
            <Instagram size={20} />
          </Link>
          <Link href="#" className="hover:text-white transition-colors">
            <Youtube size={20} />
          </Link>
        </div>
        
        <div className="flex items-center space-x-4 mb-8">
          {/* --- CHANGE MADE HERE --- */}
          <Link href="/terms-of-use" className="block text-sm hover:underline">
            Terms of Use
          </Link>
          
          <span className="text-gray-500">|</span>
          
          {/* --- AND CHANGE MADE HERE --- */}
          <Link href="/privacy-policy" className="block text-sm hover:underline">
            Privacy Policy
          </Link>
        </div>
        
        {/* Copyright */}
        <p className="text-sm">
          &copy; {new Date().getFullYear()} NetStream. All rights reserved.
        </p>
      </div>
    </footer>
  );
}