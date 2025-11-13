"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { ShoppingCart } from "lucide-react";
import { useCart } from "../context/CartContext";
import useSWR from "swr";

interface User {
  id: string;
  name: string;
  email: string;
}

interface Artwork {
  src: string;
  title: string;
  uid: string;
  price: string;
  status: string;
  state: string;
  materials?: string;
  duration?: string;
  type?: string;
  inspiration?: string;
}

const TABS = ["Available", "Sold", "Exhibition"] as const;

// SWR fetcher
const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function ShopSection() {
  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]>("Available");
  const [toast, setToast] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const { cart, addToCart } = useCart();

  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("/api/auth/user");
        const data = await res.json();
        if (data.loggedIn) {
          setUser(data.user);
        }
      } catch (error) {
        console.error("Auth check failed:", error);
      }
    };

    checkAuth();
  }, []);

  // Fetch artworks from the DB and refresh every 5 seconds
  const { data: artworks = [] } = useSWR<Artwork[]>("/api/gallery", fetcher, {
    refreshInterval: 5000,
  });

  // Ensure artworks is always an array
  const safeArtworks = Array.isArray(artworks) ? artworks : [];

  const grouped = {
    Available: safeArtworks.filter((a) => a.status === "Available"),
    Sold: safeArtworks.filter((a) => a.status === "Sold"),
    Exhibition: safeArtworks.filter((a) => a.status === "Exhibition"),
  };

  const handleAddToCart = (item: Artwork) => {
    // Check if user is logged in
    if (!user) {
      setToast("Please login to add items to cart");
      setTimeout(() => setToast(null), 3000);
      return;
    }

    if (item.status !== "Available") {
      setToast("Item not available for purchase");
      return;
    }

    if (cart.find((cartItem) => cartItem.uid === item.uid)) {
      setToast("Item already in cart");
    } else {
      addToCart({
        uid: item.uid,
        title: item.title,
        price: item.price,
        src: item.src,
        status: item.status,
      });
      setToast("Added to cart successfully!");
    }

    setTimeout(() => setToast(null), 3000);
  };

  // RETURN/UI remains exactly the same
  return (
    <div className="min-h-screen w-full px-6 py-24 bg-[#ffffff] font-nunito-sans">
      <h2 className="text-center text-5xl font-playfair-display font-bold mb-12 text-black">
        Shop Art Prints
      </h2>

      {/* Authentication Banner for non-logged in users */}
      {!user && (
        <div className="max-w-4xl mx-auto mb-8 bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
          <h3 className="text-lg font-semibold text-blue-800 mb-2 font-playfair-display">
            Create an account to start shopping!
          </h3>
          <p className="text-blue-600 mb-4 font-nunito-sans">
            Login or register to add items to your cart and make purchases
          </p>
          <div className="space-x-4">
            <a
              href="/login"
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition font-nunito-sans"
            >
              Login
            </a>
            <a
              href="/register"
              className="border border-blue-600 text-blue-600 px-6 py-2 rounded-lg hover:bg-blue-50 transition font-nunito-sans"
            >
              Register
            </a>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed top-20 right-4 bg-black text-white px-6 py-3 rounded-lg shadow-lg z-50 transition-all duration-300 font-nunito-sans">
          {toast}
        </div>
      )}

      {/* Tabs */}
      <div className="flex justify-center mb-16">
        <div className="flex bg-white border border-gray-300 overflow-hidden">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 text-sm sm:text-base font-semibold transition-all duration-300 cursor-pointer font-nunito-sans ${
                activeTab === tab
                  ? "bg-black text-white"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-6xl mx-auto">
        {grouped[activeTab].length === 0 ? (
          <p className="text-center text-gray-500 italic py-10 font-nunito-sans">
            No artworks available under {activeTab}.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
            {grouped[activeTab].map((item, i) => (
              <div
                key={i}
                className={`group text-center ${
                  item.status === "Sold"
                    ? "cursor-not-allowed opacity-70"
                    : "cursor-pointer"
                }`}
              >
                <div className="overflow-hidden rounded-lg relative">
                  <Image
                    src={item.src}
                    width={400}
                    height={450}
                    alt={item.title}
                    className="object-cover w-full h-[350px] transition duration-500 group-hover:scale-105"
                  />
                  {item.status === "Sold" && (
                    <span className="absolute inset-0 flex items-center justify-center bg-black/60 text-white text-xl font-semibold font-playfair-display">
                      SOLD
                    </span>
                  )}
                  {item.status === "Exhibition" && (
                    <span className="absolute top-3 right-3 bg-black text-white text-xs px-3 py-1 uppercase font-semibold font-nunito-sans">
                      Exhibition
                    </span>
                  )}
                </div>

                <h3 className="mt-4 text-lg font-semibold font-playfair-display text-black">
                  {item.title}
                </h3>
                <p className="text-gray-600 font-nunito-sans">{item.price}</p>
                {item.status === "Available" ? (
                  <button
                    onClick={() => handleAddToCart(item)}
                    className={`mt-3 w-full py-2 border border-black text-sm uppercase font-nunito-sans transition-all duration-300 flex items-center justify-center gap-2 ${
                      user 
                        ? "text-black group-hover:bg-black group-hover:text-white" 
                        : "text-gray-400 border-gray-400 cursor-not-allowed"
                    }`}
                  >
                    {user ? "Add to Cart" : "Login to Buy"} <ShoppingCart size={16} />
                  </button>
                ) : item.status === "Exhibition" ? (
                  <button
                    disabled
                    className="mt-3 w-full py-2 border border-black text-black text-sm uppercase font-nunito-sans cursor-not-allowed"
                  >
                    For Exhibition Only
                  </button>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}