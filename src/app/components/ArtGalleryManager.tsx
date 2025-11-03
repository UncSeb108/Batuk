"use client";

import { useState } from "react";
import Image from "next/image";

// 🔢 Helper to auto-generate UID like bt-pt-25-001
const generateUID = (type: string, count: number) => {
  const year = new Date().getFullYear().toString().slice(-2); // e.g., 25
  const num = String(count + 1).padStart(3, "0"); // 001, 002...
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
    type: "pt", // default painting
    series: "",
  });

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

  const handleDelete = (uid: string) => {
    setArtworks(artworks.filter((a) => a.uid !== uid));
  };

  // handle file upload (local preview)
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
    <div className="min-h-screen p-10 bg-gray-50">
      <h1 className="text-3xl font-playfair-display font-bold mb-6">
        🎨 Manage Gallery
      </h1>

      {/* Add Artwork Form */}
      <div className="bg-white p-6 rounded-xl shadow mb-10">
        <h2 className="text-xl font-semibold mb-4">Add Artwork</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="border p-2 rounded"
          />

          <input
            type="text"
            placeholder="Price (KES)"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
            className="border p-2 rounded"
          />

          <select
            value={form.state}
            onChange={(e) => setForm({ ...form, state: e.target.value })}
            className="border p-2 rounded"
          >
            <option>Available</option>
            <option>Sold</option>
          </select>

          <select
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
            className="border p-2 rounded"
          >
            <option value="pt">Painting</option>
            <option value="dr">Drawing</option>
            <option value="wp">Wood Piece</option>
            <option value="sp">Screen Print</option>
          </select>

          <input
            type="text"
            placeholder="Series (optional)"
            value={form.series}
            onChange={(e) => setForm({ ...form, series: e.target.value })}
            className="border p-2 rounded"
          />

          {/* File Upload */}
          <input
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="border p-2 rounded"
          />
        </div>

        {form.image && (
          <div className="mt-4">
            <Image
              src={form.image}
              alt="Preview"
              width={300}
              height={200}
              className="rounded-lg object-cover"
            />
          </div>
        )}

        <textarea
          placeholder="Message / Description"
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          className="border p-2 rounded mt-4 w-full"
        ></textarea>

        <button
          onClick={handleAdd}
          className="mt-4 px-6 py-2 bg-black text-white rounded hover:bg-gray-800"
        >
          Add Artwork
        </button>
      </div>

      {/* Artwork List */}
      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
        {artworks.map((art) => (
          <div
            key={art.uid}
            className="bg-white shadow rounded-xl overflow-hidden"
          >
            <Image
              src={art.image}
              alt={art.title}
              width={500}
              height={400}
              className="object-cover w-full h-60"
            />
            <div className="p-4">
              <h3 className="text-lg font-semibold">{art.title}</h3>
              <p className="text-sm text-gray-500">{art.price || "Undisclosed"}</p>
              <p className="text-xs text-gray-400 mt-1">UID: {art.uid}</p>
              {art.series && (
                <p className="text-xs text-blue-500 mt-1">
                  Series: {art.series}
                </p>
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
                className="mt-3 px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
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
"use client";

import { useState } from "react";
import Image from "next/image";

// 🔢 Helper to auto-generate UID like bt-pt-25-001
const generateUID = (type: string, count: number) => {
  const year = new Date().getFullYear().toString().slice(-2); // e.g., 25
  const num = String(count + 1).padStart(3, "0"); // 001, 002...
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
    type: "pt", // default painting
    series: "",
  });

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

  const handleDelete = (uid: string) => {
    setArtworks(artworks.filter((a) => a.uid !== uid));
  };

  // handle file upload (local preview)
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
    <div className="min-h-screen p-10 bg-gray-50">
      <h1 className="text-3xl font-playfair-display font-bold mb-6">
        🎨 Manage Gallery
      </h1>

      {/* Add Artwork Form */}
      <div className="bg-white p-6 rounded-xl shadow mb-10">
        <h2 className="text-xl font-semibold mb-4">Add Artwork</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="border p-2 rounded"
          />

          <input
            type="text"
            placeholder="Price (KES)"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
            className="border p-2 rounded"
          />

          <select
            value={form.state}
            onChange={(e) => setForm({ ...form, state: e.target.value })}
            className="border p-2 rounded"
          >
            <option>Available</option>
            <option>Sold</option>
          </select>

          <select
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
            className="border p-2 rounded"
          >
            <option value="pt">Painting</option>
            <option value="dr">Drawing</option>
            <option value="wp">Wood Piece</option>
            <option value="sp">Screen Print</option>
          </select>

          <input
            type="text"
            placeholder="Series (optional)"
            value={form.series}
            onChange={(e) => setForm({ ...form, series: e.target.value })}
            className="border p-2 rounded"
          />

          {/* File Upload */}
          <input
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="border p-2 rounded"
          />
        </div>

        {form.image && (
          <div className="mt-4">
            <Image
              src={form.image}
              alt="Preview"
              width={300}
              height={200}
              className="rounded-lg object-cover"
            />
          </div>
        )}

        <textarea
          placeholder="Message / Description"
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          className="border p-2 rounded mt-4 w-full"
        ></textarea>

        <button
          onClick={handleAdd}
          className="mt-4 px-6 py-2 bg-black text-white rounded hover:bg-gray-800"
        >
          Add Artwork
        </button>
      </div>

      {/* Artwork List */}
      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
        {artworks.map((art) => (
          <div
            key={art.uid}
            className="bg-white shadow rounded-xl overflow-hidden"
          >
            <Image
              src={art.image}
              alt={art.title}
              width={500}
              height={400}
              className="object-cover w-full h-60"
            />
            <div className="p-4">
              <h3 className="text-lg font-semibold">{art.title}</h3>
              <p className="text-sm text-gray-500">{art.price || "Undisclosed"}</p>
              <p className="text-xs text-gray-400 mt-1">UID: {art.uid}</p>
              {art.series && (
                <p className="text-xs text-blue-500 mt-1">
                  Series: {art.series}
                </p>
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
                className="mt-3 px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
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
