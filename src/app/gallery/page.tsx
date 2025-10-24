"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

// Temporary images — replace with your art later
const artworks = [
  { src: "/batuk/0001.jpg", title: "Roots of Rhythm" },
  { src: "/batuk/0002.png", title: "A Burst of Light" },
  {
    src: "/batuk/0003.png",
    title:
      "A Juxtaposition of Youth and Power, Fragility and Aggression, Home and Danger",
  },
  { src: "/batuk/0004.jpg", title: "Spirit of the Motherland" },
  { src: "/batuk/0005.jpg", title: "Khaligraph Jones" },
  { src: "/batuk/0006.jpg", title: "Ethereal Dreams" },
  { src: "/batuk/0007.jpg", title: "Savannah Serenade" },
  { src: "/batuk/0008.jpg", title: "The Hidden Legacy" },
  { src: "/batuk/0009.jpg", title: "The Hidden Legacy" },
  { src: "/batuk/0010.jpg", title: "The Hidden Legacy" },
  { src: "/batuk/0011.jpg", title: "The Hidden Legacy" },
  { src: "/batuk/0012.jpg", title: "The Hidden Legacy" },
  { src: "/batuk/0013.jpg", title: "The Hidden Legacy" },
  { src: "/batuk/0014.jpg", title: "The Hidden Legacy" },
  { src: "/batuk/0015.jpg", title: "The Hidden Legacy" },
  { src: "/batuk/0016.jpg", title: "The Hidden Legacy" },
  { src: "/batuk/0017.jpg", title: "The Hidden Legacy" },
  { src: "/batuk/0018.jpg", title: "The Hidden Legacy" },
  { src: "/batuk/0019.jpg", title: "The Hidden Legacy" },
  { src: "/batuk/0020.jpg", title: "The Hidden Legacy" },
  { src: "/batuk/0021.jpg", title: "The Hidden Legacy" },
  { src: "/batuk/0022.jpg", title: "The Hidden Legacy" },
  { src: "/batuk/0023.jpg", title: "The Hidden Legacy" },
  { src: "/batuk/0024.jpg", title: "The Hidden Legacy" },
  { src: "/batuk/0025.jpg", title: "The Hidden Legacy" },
  { src: "/batuk/0026.jpg", title: "The Hidden Legacy" },
  { src: "/batuk/0027.jpg", title: "The Hidden Legacy" },
  { src: "/batuk/0028.jpg", title: "The Hidden Legacy" },
  { src: "/batuk/0029.jpg", title: "The Hidden Legacy" },
  { src: "/batuk/0030.jpg", title: "The Hidden Legacy" },
  { src: "/batuk/0031.png", title: "The Hidden Legacy" },
  { src: "/batuk/0032.jpg", title: "The Hidden Legacy" },
  { src: "/batuk/0033.jpg", title: "The Hidden Legacy" },
  { src: "/batuk/0034.jpg", title: "The Hidden Legacy" },
  { src: "/batuk/0035.jpg", title: "The Hidden Legacy" },
];

export default function GallerySection() {
  const [selected, setSelected] = useState<number | null>(null);

  return (
    <div className="h-full w-full px-6 py-20 overflow-y-auto">
      {/* Header */}
      <h2 className="text-center text-5xl font-playfair-display font-bold mb-16 mt-16 text-black">
        Gallery
      </h2>

      {/* Masonry Grid */}
      <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
        {artworks.map((item, index) => (
          <motion.div
            key={index}
            className="overflow-hidden cursor-pointer"
            onClick={() => setSelected(index)}
          >
            <Image
              src={item.src}
              alt={item.title}
              width={500}
              height={500}
              className="w-full object-cover transition-transform duration-500 hover:scale-110"
            />
          </motion.div>
        ))}
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {selected !== null && (
          <motion.div
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-[999] backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelected(null)}
          >
            <motion.div
              className="relative max-w-5xl w-[90%]"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={artworks[selected].src}
                alt={artworks[selected].title}
                width={1500}
                height={1500}
                className=" max-h-[85vh] w-auto mx-auto object-contain"
              />
            </motion.div>

            {/* Close Button */}
            <button
              onClick={() => setSelected(null)}
              className="absolute top-6 right-6 text-white bg-black/60 p-3 rounded-full hover:bg-black transition cursor-pointer"
            >
              <X size={26} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
