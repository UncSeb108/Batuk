"use client";

import Image from "next/image";

const products = [
  { src: "/batuk/0014.jpg", title: "Portraits", price: "from KES 1,200" },
  { src: "/batuk/0023.jpg", title: "African Abstract Art", price: "from KES 950" },
  { src: "/batuk/0002.png", title: "Contemporary Art", price: "from KES 1,400" },
];

export default function ShopSection() {
  return (
    <div className="h-full w-full px-10 py-20">
      <h2 className="text-center text-5xl font-playfair-display font-bold mb-16 text-black">
        Shop Art Prints
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 max-w-6xl mx-auto">
        {products.map((item, i) => (
          <div key={i} className="group text-center cursor-pointer">
            <div className="overflow-hidden rounded-lg">
              <Image
                src={item.src}
                width={400}
                height={450}
                alt={item.title}
                className="object-cover w-full h-[350px] transition duration-500 group-hover:scale-105"
              />
            </div>
            <h3 className="mt-4 text-lg font-semibold font-playfair-display text-black">
              {item.title}
            </h3>
            <p className="text-gray-600 font-nunito-sans">{item.price}</p>
            <button className="mt-3 w-full py-2 border border-black text-sm text-black uppercase font-nunito-sans transition-all duration-300 group-hover:bg-black group-hover:text-white">
              Shop
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
