"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { X, ShoppingCart, CheckCircle, Clock } from "lucide-react";
import { useCart } from "../context/CartContext";
import useSWR from "swr";

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

// SWR fetcher
const fetcher = (url: string) => fetch(url).then((res) => res.json());

// Default filter options that will always show
const DEFAULT_TYPES = ["All", "Portrait", "African Portraiture", "Realism", "Abstract", "Screen print", "Woodcut print", "Print"];
const DEFAULT_STATUSES = ["All", "Sold", "Exhibition", "Available"];
const DEFAULT_STATES = ["All", "Completed", "In Progress"];

export default function GallerySection() {
  const [selected, setSelected] = useState<number | null>(null);
  const { cart, addToCart } = useCart();
  const [toast, setToast] = useState<string | null>(null);

  const [typeFilter, setTypeFilter] = useState<string>("All");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [stateFilter, setStateFilter] = useState<string>("All");

  // Fetch artworks with SWR and refresh every 5 seconds
  const { data: artworks = [], isLoading } = useSWR<Artwork[]>("/api/gallery", fetcher, {
    refreshInterval: 5000,
  });

  const safeArtworks = Array.isArray(artworks) ? artworks : [];

  const handleAddToCart = (item: Artwork) => {
    if (item.status !== "Available") {
      setToast("Item not available");
    } else if (cart.find((c) => c.uid === item.uid)) {
      setToast("Already in cart");
    } else {
      addToCart({
        uid: item.uid,
        title: item.title,
        price: item.price,
        src: item.src,
        status: item.status,
      });
      setToast("Added to cart");
    }

    setTimeout(() => setToast(null), 3000);
  };

  // Apply filters
  const filteredArtworks = safeArtworks.filter((art) => {
    const matchType = typeFilter === "All" || art.type === typeFilter;
    const matchStatus = statusFilter === "All" || art.status === statusFilter;
    const matchState = stateFilter === "All" || art.state === stateFilter;
    return matchType && matchStatus && matchState;
  });

  // Use default options, but merge with any dynamic options from API data
  const types = [...new Set([...DEFAULT_TYPES, ...safeArtworks.map((a) => a.type).filter(Boolean)])];
  const statuses = [...new Set([...DEFAULT_STATUSES, ...safeArtworks.map((a) => a.status).filter(Boolean)])];
  const states = [...new Set([...DEFAULT_STATES, ...safeArtworks.map((a) => a.state).filter(Boolean)])];

  return (
    <div className="min-h-screen w-full px-6 py-20 overflow-y-auto bg-[#ffffff]">
      <h2 className="text-center text-5xl font-playfair-display font-bold mb-10 mt-16 text-black">
        Gallery
      </h2>
      
      {/* Filters - Always show default options */}
      <div className="flex flex-col lg:flex-row flex-wrap items-start justify-center gap-12 mb-16 font-nunito-sans">
        <div className="flex flex-col items-center">
          <span className="text-gray-800 font-semibold mb-3 text-base tracking-wide">
            Filter by Type
          </span>
          <div className="flex flex-wrap justify-center gap-2 max-w-[500px]">
            {types.map((type, i) => (
              <label
                key={i}
                className={`flex items-center gap-2 cursor-pointer px-5 py-2.5 border text-sm font-medium transition-all duration-300 ${
                  typeFilter === type
                    ? "bg-gradient-to-r from-black to-gray-800 text-white border-transparent shadow-md scale-105"
                    : "border-gray-300 text-gray-700 bg-white hover:border-black/40 hover:text-black"
                }`}
              >
                <input
                  type="radio"
                  name="type"
                  value={type}
                  checked={typeFilter === type}
                  onChange={() => setTypeFilter(type)}
                  className="hidden"
                />
                {type}
              </label>
            ))}
          </div>
        </div>

        <div className="flex flex-col items-center">
          <span className="text-gray-800 font-semibold mb-3 text-base tracking-wide">
            Filter by Status
          </span>
          <div className="flex flex-wrap justify-center gap-2 max-w-[500px]">
            {statuses.map((status, i) => (
              <label
                key={i}
                className={`flex items-center gap-2 cursor-pointer px-5 py-2.5 border text-sm font-medium transition-all duration-300 ${
                  statusFilter === status
                    ? "bg-gradient-to-r from-black to-gray-800 text-white border-transparent shadow-md scale-105"
                    : "border-gray-300 text-gray-700 bg-white hover:border-black/40 hover:text-black"
                }`}
              >
                <input
                  type="radio"
                  name="status"
                  value={status}
                  checked={statusFilter === status}
                  onChange={() => setStatusFilter(status)}
                  className="hidden"
                />
                {status}
              </label>
            ))}
          </div>
        </div>

        <div className="flex flex-col items-center">
          <span className="text-gray-800 font-semibold mb-3 text-base tracking-wide">
            Filter by State
          </span>
          <div className="flex flex-wrap justify-center gap-2 max-w-[500px]">
            {states.map((state, i) => (
              <label
                key={i}
                className={`flex items-center gap-2 cursor-pointer px-5 py-2.5 border text-sm font-medium transition-all duration-300 ${
                  stateFilter === state
                    ? "bg-gradient-to-r from-black to-gray-800 text-white border-transparent shadow-md scale-105"
                    : "border-gray-300 text-gray-700 bg-white hover:border-black/40 hover:text-black"
                }`}
              >
                <input
                  type="radio"
                  name="state"
                  value={state}
                  checked={stateFilter === state}
                  onChange={() => setStateFilter(state)}
                  className="hidden"
                />
                {state}
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-10">
          <p className="text-gray-600">Loading artworks...</p>
        </div>
      )}

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -40 }}
            className="fixed top-20 right-4 bg-black text-white px-6 py-3 rounded-lg shadow-lg z-[10000] font-nunito-sans"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Artworks Grid */}
      <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 max-w-7xl mx-auto space-y-6">
        {!isLoading && filteredArtworks.length > 0 ? (
          filteredArtworks.map((item: Artwork, index: number) => (
            <motion.div
              key={item.uid}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="relative break-inside-avoid cursor-pointer group"
              onClick={() => setSelected(index)}
            >
              <Image
                src={item.src}
                alt={item.title}
                width={700}
                height={900}
                className="w-full rounded-xl object-cover shadow max-h-[85vh] transition-transform duration-500 group-hover:scale-[1.03]"
              />

              <div className="absolute bottom-0 left-0 w-full bg-black/60 text-white py-3 px-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 backdrop-blur-sm rounded-xl font-nunito-sans">
                <h3 className="text-sm font-semibold leading-tight">
                  {item.title}
                </h3>
                <p className="text-xs text-gray-200">
                  {item.type} · {item.price}
                </p>
              </div>
            </motion.div>
          ))
        ) : !isLoading ? (
          <p className="text-center text-gray-600 italic w-full col-span-full">
            No artworks match your filters.
          </p>
        ) : null}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {selected !== null && filteredArtworks[selected] && (
          <motion.div
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-[1000] backdrop-blur-sm px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelected(null)}
          >
            <motion.div
              className="relative min-h-screen w-full bg-white p-8 shadow-xl grid grid-cols-1 md:grid-cols-2 gap-8 place-items-center"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-center w-full">
                <Image
                  src={filteredArtworks[selected].src}
                  alt={filteredArtworks[selected].title}
                  width={1400}
                  height={1400}
                  className="rounded-2xl object-contain max-h-[75vh] w-full shadow-lg"
                />
              </div>

              <div className="flex flex-col justify-center text-black space-y-4 pr-3 font-nunito-sans">
                <h3 className="text-4xl font-bold font-playfair-display mb-10">
                  {filteredArtworks[selected].title}
                </h3>

                <p className="text-gray-800 text-sm">
                  {filteredArtworks[selected].uid}
                </p>

                <p className="flex items-center gap-2 text-lg font-medium">
                  {filteredArtworks[selected].state === "Completed" ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <Clock className="w-5 h-5 text-yellow-600" />
                  )}
                  <span
                    className={`${
                      filteredArtworks[selected].state === "Completed"
                        ? "text-green-600"
                        : "text-yellow-600"
                    }`}
                  >
                    {filteredArtworks[selected].state}
                  </span>
                </p>

                <p className="text-black text-lg">
                  <strong>Type:</strong> {filteredArtworks[selected].type}
                </p>
                <p className="text-black text-lg">
                  <strong>Created in ~</strong>{" "}
                  {filteredArtworks[selected].duration}
                </p>
                <p className="text-black text-lg">
                  <strong>Materials:</strong>{" "}
                  {filteredArtworks[selected].materials}
                </p>
                <p className="text-gray-700 leading-relaxed text-sm md:text-base">
                  {filteredArtworks[selected].inspiration}
                </p>

                <p className="text-xl font-bold text-black mb-6">
                  {filteredArtworks[selected].price}
                </p>

                <button
                  onClick={() => handleAddToCart(filteredArtworks[selected])}
                  className="w-full flex items-center justify-center cursor-pointer gap-2 py-3 border border-black text-black font-medium hover:bg-black hover:text-white transition-all"
                >
                  <ShoppingCart className="w-5 h-5" />
                  Add to Cart
                </button>
              </div>

              <button
                onClick={() => setSelected(null)}
                className="absolute top-5 right-5 text-white cursor-pointer bg-black/70 p-2 rounded-full hover:bg-black transition"
              >
                <X size={22} />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}