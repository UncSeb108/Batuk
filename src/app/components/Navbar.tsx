"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, ShoppingCart, User, LogOut } from "lucide-react";
import { useCart } from "../context/CartContext";

interface User {
  id: string;
  name: string;
  email: string;
}

interface NavLink {
  label: string;
  href: string;
  icon?: string;
  action?: () => void;
}

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const pathname = usePathname();
  const { cart } = useCart();

  // Check authentication status - ONLY USER AUTH
  useEffect(() => {
    const checkAuth = async () => {
      setAuthLoading(true);
      try {
        console.log('🔍 Checking auth status...');
        
        // Check user auth only - NO ADMIN CHECK
        const userRes = await fetch('/api/auth/user', {
          credentials: 'include'
        });
        if (userRes.ok) {
          const userData = await userRes.json();
          console.log('👤 User auth response:', userData);
          if (userData.loggedIn) {
            setUser(userData.user);
          } else {
            setUser(null);
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        setUser(null);
      } finally {
        setAuthLoading(false);
      }
    };

    checkAuth();

    // Set up periodic auth check
    const interval = setInterval(checkAuth, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    try {
      console.log('🚪 Logging out...');
      
      // Logout from user session only - NO ADMIN LOGOUT
      await fetch('/api/auth/user/logout', { 
        method: 'POST',
        credentials: 'include'
      });
      
      setUser(null);
      console.log('✅ Logout successful');
      
      // Refresh to update UI state completely
      window.location.href = '/home';
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // Base nav links for all users
  const baseNavLinks: NavLink[] = [
    { label: "Home", href: "/home" },
    { label: "Gallery", href: "/gallery" },
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
    { label: "Shop", href: "/shop" },
    { label: "Cart", href: "/cart" },
  ];

  // Auth links - ONLY USER AUTH, NO ADMIN
  let authLinks: NavLink[] = [];
  
  if (user) {
    // User is logged in
    authLinks = [
      { label: `Hi, ${user.name.split(' ')[0]}`, href: "/profile", icon: "user" },
      { label: "Logout", href: "#", icon: "logout", action: handleLogout }
    ];
  } else {
    // User is not logged in
    authLinks = [
      { label: "Login", href: "/login", icon: "login" },
      { label: "Register", href: "/register", icon: "register" }
    ];
  }

  // Combine all links
  const navLinks: NavLink[] = [...baseNavLinks, ...authLinks];

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "auto";
  }, [isOpen]);

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  if (pathname === "/") return null;

  // Show loading state briefly
  if (authLoading) {
    return (
      <nav className="fixed top-0 left-0 w-full bg-[#ffffff]/70 text-[#000000] z-100 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/home" className="flex items-center space-x-2">
              <span className="font-bold text-3xl tracking-wide font-playfair-display">
                Battuk Arts
              </span>
            </Link>
            <div className="text-sm text-gray-500 font-nunito-sans">Loading...</div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="fixed top-0 left-0 w-full bg-[#ffffff]/70 text-[#000000] z-100 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/home" className="flex items-center space-x-2">
            <span className="font-bold text-3xl tracking-wide font-playfair-display">
              Battuk Arts
            </span>
          </Link>

          <div className="hidden md:flex space-x-8 items-center">
            {baseNavLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={`relative group transition ease-in-out duration-300 font-nunito-sans uppercase text-sm ${
                  pathname === href ? "font-semibold" : ""
                }`}
              >
                {label}
                <span
                  className={`
                    absolute left-0 -bottom-1 h-[2px] bg-black transition-all duration-300 
                    ${pathname === href ? "w-full" : "w-0 group-hover:w-full"}
                  `}
                ></span>
              </Link>
            ))}
            
            {/* Auth Links - NO ADMIN */}
            <div className="flex items-center space-x-6 border-l border-gray-300 pl-6 ml-2">
              {authLinks.map(({ href, label, icon, action }) => (
                <div key={label}>
                  {action ? (
                    <button
                      onClick={action}
                      className="flex items-center space-x-1 text-sm uppercase font-nunito-sans hover:text-gray-600 transition"
                    >
                      {icon === "logout" && <LogOut size={16} />}
                      <span>{label}</span>
                    </button>
                  ) : (
                    <Link
                      href={href}
                      className={`flex items-center space-x-1 text-sm uppercase font-nunito-sans hover:text-gray-600 transition ${
                        pathname === href ? "font-semibold" : ""
                      }`}
                    >
                      {icon === "user" && <User size={16} />}
                      {icon === "login" && <User size={16} />}
                      <span>{label}</span>
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <Link href="/cart" className="relative group">
              <ShoppingCart size={24} />
              {cart.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-black text-white rounded-lg w-5 h-5 text-xs flex items-center justify-center font-semibold font-nunito-sans">
                  {cart.length}
                </span>
              )}
            </Link>
          </div>

          <div className="md:hidden flex items-center space-x-4">
            <Link href="/cart" className="relative">
              <ShoppingCart size={24} />
              {cart.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-black text-white rounded-lg w-5 h-5 text-xs flex items-center justify-center font-semibold">
                  {cart.length}
                </span>
              )}
            </Link>
            <button onClick={toggleMenu} className="focus:outline-none">
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: "0%" }}
            exit={{ x: "100%" }}
            transition={{ duration: 1, ease: "easeInOut" }}
            className="fixed top-15 right-0 w-full h-screen bg-white text-[#000000] px-6 pt-16 pb-4 md:hidden font-nunito-sans uppercase"
          >
            <motion.ul
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={{
                visible: {
                  transition: {
                    when: "beforeChildren",
                    staggerChildren: 0.2,
                  },
                },
                hidden: {
                  transition: {
                    when: "beforeChildren",
                    staggerChildren: 0.2,
                    staggerDirection: -1,
                  },
                },
              }}
              className="space-y-10 text-center"
            >
              {navLinks.map(({ href, label, action }) => (
                <motion.li
                  key={label}
                  variants={{
                    hidden: { opacity: 0, x: 20 },
                    visible: { opacity: 1, x: 0 },
                  }}
                  transition={{ duration: 0.5, ease: "easeInOut" }}
                >
                  {action ? (
                    <button
                      onClick={() => {
                        action();
                        closeMenu();
                      }}
                      className="block hover:text-gray-600 text-lg transition w-full font-nunito-sans"
                    >
                      {label}
                    </button>
                  ) : (
                    <Link
                      href={href}
                      onClick={closeMenu}
                      className="block hover:text-gray-600 text-lg transition font-nunito-sans"
                    >
                      {label}
                    </Link>
                  )}
                </motion.li>
              ))}
            </motion.ul>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}