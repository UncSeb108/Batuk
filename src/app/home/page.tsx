"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <>
      <section className="h-screen flex items-center justify-center flex-col">
        <div className="text-center">
          <h1 className="text-[#000000] text-7xl font-playfair-display font-bold">
            Batuk Arts
          </h1>

          <p className="text-[#000000] mt-4 text-xl font-nunito-sans">
            Welcome to my Art - rooted in Africa, shaped by Imagination.
          </p>

          <Link
            href="/gallery"
            className="group inline-flex items-center gap-2 mt-5 uppercase px-6 py-3 border border-black text-black text-sm font-nunito-sans tracking-wide transition-all duration-300 hover:bg-black hover:text-white"
          >
            View Gallery
            <ArrowRight
              size={14}
              className="transition-transform duration-300 group-hover:translate-x-1"
            />
          </Link>
        </div>
      </section>
    </>
  );
}
