"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, ShoppingCart } from "lucide-react";
import { useCart } from "../context/CartContext";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { cart } = useCart();

  const navLinks = [
    { label: "Home", href: "/home" },
    { label: "Gallery", href: "/gallery" },
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
    { label: "Shop", href: "/shop" },
  ];

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "auto";
  }, [isOpen]);

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  if (pathname === "/") return null;

  return (
    <nav className="fixed top-0 left-0 w-full bg-[#ffffff]/70 text-[#000000] z-100 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/home" className="flex items-center space-x-2">
            <span className="font-bold text-3xl tracking-wide font-playfair-display">
              Battuk Arts
            </span>
          </Link>

          <div className="hidden md:flex space-x-12">
            {navLinks.map(({ href, label }) => (
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
          </div>
          <div className="hidden md:flex items-center space-x-4">
            <Link href="/cart" className="relative group">
              <ShoppingCart size={30} />
              {cart.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-black text-white rounded-lg w-5 h-5 text-xs flex items-center justify-center font-semibold font-nunito-sans">
                  {cart.length}
                </span>
              )}
            </Link>
          </div>

          <div className="md:hidden">
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
              {navLinks.map(({ href, label }) => (
                <motion.li
                  key={href}
                  variants={{
                    hidden: { opacity: 0, x: 20 },
                    visible: { opacity: 1, x: 0 },
                  }}
                  transition={{ duration: 0.5, ease: "easeInOut" }}
                >
                  <Link
                    href={href}
                    onClick={closeMenu}
                    className="block hover:text-white text-lg transition"
                  >
                    {label}
                  </Link>
                </motion.li>
              ))}
            </motion.ul>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
