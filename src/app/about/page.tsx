"use client";

import Image from "next/image";
import Link from "next/link";

export default function AboutSection() {
  return (
    <div className="min-h-screen w-full px-10 md:px-24 py-20 flex items-center justify-center">
      <div className="max-w-5xl grid md:grid-cols-2 gap-12 items-center">
        
        {/* Artist Image */}
        <div className="overflow-hidden rounded-xl">
          <Image
            src="/batuk/0006.jpg"
            alt="Artist"
            width={500}
            height={600}
            className="object-cover w-full h-full"
          />
        </div>

        {/* Bio */}
        <div>
          <h2 className="text-5xl font-playfair-display font-bold text-black mb-6">
            About the Artist
          </h2>

          <p className="text-base text-gray-800 leading-relaxed font-nunito-sans mb-6">
            I am an African contemporary artist celebrating culture, resilience, 
            and identity through bold strokes and imaginative storytelling. 
            Batuk Arts embodies the spirit of our roots — vibrant like the land, 
            timeless like the rhythm.
          </p>

          <Link
            href="#contact"
            className="uppercase px-6 py-3 border border-black text-black text-sm font-nunito-sans hover:bg-black hover:text-white transition-all duration-300"
          >
            Get In Touch
          </Link>
        </div>
      </div>
    </div>
  );
}
