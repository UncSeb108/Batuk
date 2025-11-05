"use client";

import { useState } from "react";
import Image from "next/image";

// 🔢 Helper to auto-generate UID like bt-pt-25-001
const generateUID = (type: string, count: number) => {
  const year = new Date().getFullYear().toString().slice(-2);
  const num = String(count + 1).padStart(3, "0");
  return `bt-${type}-${year}-${num}`;
};

export default function ArtGalleryManager() {
  const [artworks, setArtworks] = useState<any[]>([]);
  const [form, setForm] = useState({
    title: "",
    price: "",
    state: "Available",
    message: "",
    image: "",
    type: "pt",
    series: "",
  });

  // ✅ Add artwork
  const handleAdd = () => {
    if (!form.title || !form.image || !form.type)
      return alert("Please add at least title, image, and type");

    const newUID = generateUID(form.type, artworks.length);
    const newArt = { uid: newUID, ...form };

    setArtworks([...artworks, newArt]);
    setForm({
      title: "",
      price: "",
      state: "Available",
      message: "",
      image: "",
      type: "pt",
      series: "",
    });
  };

  // ✅ Delete artwork
  const handleDelete = (uid: string) => {
    setArtworks(artworks.filter((a) => a.uid !== uid));
  };

  // ✅ Handle file upload (for preview)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setForm({ ...form, image: event.target?.result as string });
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="min-h-screen bg-white py-12 px-6 sm:px-12 lg:px-24">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-4xl font-bold font-playfair-display mb-3">
          Manage Gallery
        </h1>
        <p className="text-gray-600 mb-10">
          Add, preview, or remove artworks from your Battuk Arts collection.
        </p>
      </div>

      {/* Add Artwork Form */}
      <div className="max-w-4xl mx-auto bg-gray-50 p-8 rounded-2xl shadow-md mb-12">
        <h2 className="text-2xl font-semibold mb-6 text-center">Add Artwork</h2>

        <div className="grid md:grid-cols-2 gap-5">
          <div className="flex flex-col">
            <label className="font-medium mb-1 text-sm text-gray-700">
              Title
            </label>
            <input
              type="text"
              placeholder="e.g. Sunset Dreams"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="border border-gray-300 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          <div className="flex flex-col">
            <label className="font-medium mb-1 text-sm text-gray-700">
              Price (KES)
            </label>
            <input
              type="text"
              placeholder="e.g. 5000"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              className="border border-gray-300 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          <div className="flex flex-col">
            <label className="font-medium mb-1 text-sm text-gray-700">
              Availability
            </label>
            <select
              value={form.state}
              onChange={(e) => setForm({ ...form, state: e.target.value })}
              className="border border-gray-300 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
            >
              <option>Available</option>
              <option>Sold</option>
            </select>
          </div>

          <div className="flex flex-col">
            <label className="font-medium mb-1 text-sm text-gray-700">
              Type
            </label>
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              className="border border-gray-300 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
            >
              <option value="pt">Painting</option>
              <option value="dr">Drawing</option>
              <option value="wp">Wood Piece</option>
              <option value="sp">Screen Print</option>
            </select>
          </div>

          <div className="flex flex-col md:col-span-1">
            <label className="font-medium mb-1 text-sm text-gray-700">
              Series (optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Nature Collection"
              value={form.series}
              onChange={(e) => setForm({ ...form, series: e.target.value })}
              className="border border-gray-300 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          <div className="flex flex-col md:col-span-1">
            <label className="font-medium mb-1 text-sm text-gray-700">
              Upload Image
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="border border-gray-300 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>
        </div>

        {form.image && (
          <div className="mt-6 flex justify-center">
            <Image
              src={form.image}
              alt="Preview"
              width={350}
              height={250}
              className="rounded-xl shadow-md object-cover"
            />
          </div>
        )}

        <div className="flex flex-col mt-6">
          <label className="font-medium mb-1 text-sm text-gray-700">
            Message / Description
          </label>
          <textarea
            placeholder="Describe your artwork or share its story..."
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
            className="border border-gray-300 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-black w-full"
            rows={3}
          ></textarea>
        </div>

        <div className="text-center mt-6">
          <button
            onClick={handleAdd}
            className="px-8 py-3 bg-black text-white rounded-md font-medium hover:bg-gray-800 transition"
          >
            Add Artwork
          </button>
        </div>
      </div>

      {/* Artwork List */}
      <div className="max-w-5xl mx-auto grid sm:grid-cols-2 md:grid-cols-3 gap-8">
        {artworks.map((art) => (
          <div
            key={art.uid}
            className="bg-white border border-gray-200 shadow-sm rounded-xl overflow-hidden hover:shadow-md transition"
          >
            <Image
              src={art.image}
              alt={art.title}
              width={500}
              height={400}
              className="object-cover w-full h-60"
            />
            <div className="p-4 text-center">
              <h3 className="text-lg font-semibold mb-1">{art.title}</h3>
              <p className="text-sm text-gray-600">
                {art.price || "Undisclosed"}
              </p>
              <p className="text-xs text-gray-400">UID: {art.uid}</p>
              {art.series && (
                <p className="text-xs text-blue-500">Series: {art.series}</p>
              )}
              <p
                className={`text-xs mt-1 ${
                  art.state === "Sold" ? "text-red-500" : "text-green-600"
                }`}
              >
                {art.state}
              </p>
              {art.message && (
                <p className="text-sm text-gray-700 mt-2">{art.message}</p>
              )}
              <button
                onClick={() => handleDelete(art.uid)}
                className="mt-3 px-4 py-2 bg-red-500 text-white text-sm rounded-md hover:bg-red-600 transition"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
