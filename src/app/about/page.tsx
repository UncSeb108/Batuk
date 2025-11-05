"use client";

import Image from "next/image";
import Link from "next/link";

export default function AboutSection() {
  return (
    <div className="min-h-screen w-full px-10 md:px-24 py-20 flex items-center justify-center">
      <div className="max-w-5xl grid md:grid-cols-2 gap-12 items-center">
        <div className="overflow-hidden rounded-xl">
          <Image
            src="/batuk/0006.jpg"
            alt="Artist"
            width={500}
            height={600}
            className="object-cover w-full h-full"
          />
        </div>

        <div>
          <h2 className="text-5xl font-playfair-display font-bold text-black mb-6">
            About the Artist
          </h2>

          <p className="text-base text-gray-800 leading-relaxed font-nunito-sans mb-6">
          I'm a multidisciplinary artist based in Kenya, whose work explores the intersections of surrealism, justice, and inner conflict. I work in printmaking, painting, and mixed media to probe questions of identity, trauma and spirituality. My practice is rooted in lived experiences and draws from both traditional motifs and contemporary political anxieties. As a young African artist, I explore the tension between external structures and internal realities; the difference between what is visible and what is buried. My work is grounded in the surreal and emotional chaos of living in a society where violence and spirituality are ever present, often entangled. My work is a reflection of my own inner struggles and a reflection of the world around me.</p>
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
