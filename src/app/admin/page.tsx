"use client";

import { useState, useEffect } from "react";


interface Message {
  _id: string;
  name: string;
  email: string;
  message: string;
  createdAt: string;
}

interface Artwork {
  _id?: string;
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
const TYPE_OPTIONS = [
  "Portrait",
  "African Portraiture",
  "Realism",
  "Abstract",
  "Screen Print",
  "Woodcut Print",
  "Print",
];


export default function AdminPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [nextNumber, setNextNumber] = useState("001");
  const [loading, setLoading] = useState(false);

  // Store editable status/state per artwork
  const [editArtworks, setEditArtworks] = useState<
    Record<string, { status: string; state: string }>
  >({});

  const [form, setForm] = useState({
    title: "",
    artist: "bt",
    typeCode: "pt",
    price: "",
    status: "Available",
    state: "In Progress",
    materials: "",
    duration: "",
    type: "",
    inspiration: "",
    image: null as File | null,
  });

  // Fix the logout function
  const handleAdminLogout = async () => {
    try {
      await fetch("/api/auth/admin/logout", { method: "POST" });
      window.location.href = "/admin-login"; // redirect after logout
    } catch (err) {
      console.error("Admin logout failed", err);
    }
  };

  // Fetch messages and artworks
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [msgRes, artRes] = await Promise.all([
          fetch("/api/messages"),
          fetch("/api/gallery"),
        ]);
        const [msgs, arts] = await Promise.all([msgRes.json(), artRes.json()]);
        if (Array.isArray(msgs)) setMessages(msgs);
        if (Array.isArray(arts)) {
          setArtworks(arts);
          const maxNum = getMaxNumber(arts);
          setNextNumber(String(maxNum + 1).padStart(3, "0"));

          // Initialize editable status/state
          const initialEdit = arts.reduce((acc, art) => {
            if (art._id) acc[art._id] = { status: art.status, state: art.state };
            return acc;
          }, {} as Record<string, { status: string; state: string }>);
          setEditArtworks(initialEdit);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);

  const getMaxNumber = (data: Artwork[]) => {
    let max = 0;
    data.forEach((item) => {
      const match = item.uid?.match(/-(\d{3})$/);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num > max) max = num;
      }
    });
    return max;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setForm((prev) => ({ ...prev, image: file }));
  };

  const TYPE_CODES: Record<string, string> = {
  "Portrait": "PT",
  "African Portraiture": "AP",
  "Realism": "RL",
  "Abstract": "AB",
  "Screen Print": "SP",
  "Woodcut Print": "WP",
  "Print": "PR",  // you can assign "PR" or any code you like
};

const generateUID = () => {
  const year = new Date().getFullYear().toString().slice(-2);
  const typeCode = TYPE_CODES[form.type] || "XX"; // fallback if no type selected
  return `${form.artist}-${typeCode}-${year}-${nextNumber}`;
};

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.image) return alert("Please select an image!");
    setLoading(true);

    const uid = generateUID();
    const data = new FormData();
    data.append("title", form.title);
    data.append("artist", form.artist);
    data.append("typeCode", form.typeCode);
    data.append("price", form.price);
    data.append("status", form.status);
    data.append("state", form.state);
    data.append("materials", form.materials);
    data.append("duration", form.duration);
    data.append("type", form.type);
    data.append("inspiration", form.inspiration);
    data.append("uid", uid);
    data.append("image", form.image);

    try {
      const res = await fetch("/api/gallery", {
        method: "POST",
        body: data,
      });

      if (res.ok) {
        const savedArt = await res.json();
        const updated = [savedArt, ...artworks];
        setArtworks(updated);
        const newNum = String(getMaxNumber(updated) + 1).padStart(3, "0");
        setNextNumber(newNum);

        setEditArtworks((prev) => ({
          ...prev,
          [savedArt._id]: { status: savedArt.status, state: savedArt.state },
        }));

        setForm({
          title: "",
          artist: "bt",
          typeCode: "pt",
          price: "",
          status: "Available",
          state: "In Progress",
          materials: "",
          duration: "",
          type: "",
          inspiration: "",
          image: null,
        });
        alert("✅ Artwork uploaded successfully!");
      } else {
        alert("❌ Failed to upload artwork.");
      }
    } catch (err) {
      console.error(err);
      alert("❌ Error uploading artwork.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this artwork?")) return;
    await fetch(`/api/gallery?id=${id}`, { method: "DELETE" });
    setArtworks((prev) => prev.filter((a) => a._id !== id));
    setEditArtworks((prev) => {
      const newEdit = { ...prev };
      delete newEdit[id];
      return newEdit;
    });
  };

  const handleUpdateArtwork = async (id: string, status: string, state: string) => {
    try {
      const res = await fetch(`/api/gallery?id=${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, state }),
      });
      if (res.ok) {
        setArtworks((prev) =>
          prev.map((a) => (a._id === id ? { ...a, status, state } : a))
        );
        alert("✅ Artwork updated successfully!");
      } else {
        alert("❌ Failed to update artwork.");
      }
    } catch (err) {
      console.error(err);
      alert("❌ Error updating artwork.");
    }
  };
  const handleDeleteMessage = async (id: string) => {
  if (!confirm("Delete this message?")) return;

  try {
    const res = await fetch(`/api/messages?id=${id}`, { method: "DELETE" });
    if (res.ok) {
      setMessages(prev => prev.filter(m => m._id !== id));
      alert("✅ Message deleted successfully!");
    } else {
      alert("❌ Failed to delete message.");
    }
  } catch (err) {
    console.error(err);
    alert("❌ Error deleting message.");
  }
};


  return (
    
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-8 text-center text-gray-900 font-playfair-display">
        Admin Dashboard
      </h1>
      <div className="flex justify-between items-center mb-6 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-gray-900 font-playfair-display">Admin Dashboard</h1>
        <button
          onClick={handleAdminLogout}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Logout
        </button>
      </div>


      {/* Upload Artwork */}
      <section className="bg-white p-6 rounded-2xl shadow-lg mb-10 border border-gray-200 max-w-4xl mx-auto">
        <h2 className="text-xl font-semibold mb-4 text-gray-900">Upload Artwork</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="title" className="block mb-1 font-medium text-gray-900">Title</label>
            <input
              id="title"
              name="title"
              value={form.title}
              onChange={handleChange}
              required
              className="border p-3 rounded bg-white text-gray-900 focus:ring-2 focus:ring-black w-full"
            />
          </div>
          <div>
            <label htmlFor="artist" className="block mb-1 font-medium text-gray-900">Artist</label>
            <select
              id="artist"
              name="artist"
              value={form.artist}
              onChange={handleChange}
              className="border p-3 rounded bg-white text-gray-900 focus:ring-2 focus:ring-black w-full"
            >
              <option value="bt">Batuk</option>
            </select>
          </div>
          <div>
            <label htmlFor="typeCode" className="block mb-1 font-medium text-gray-900">Type</label>
            <select
  id="type"
  name="type"
  value={form.type}
  onChange={handleChange}
  className="border p-3 rounded bg-white text-gray-900 focus:ring-2 focus:ring-black w-full"
>
  <option value="">Select type</option>
  {TYPE_OPTIONS.map((type) => (
    <option key={type} value={type}>{type}</option>
  ))}
</select>

          </div>
          <div>
            <label htmlFor="price" className="block mb-1 font-medium text-gray-900">Price</label>
            <input
              id="price"
              name="price"
              type="number"
              value={form.price}
              onChange={handleChange}
              required
              className="border p-3 rounded bg-white text-gray-900 focus:ring-2 focus:ring-black w-full"
            />
          </div>
          <div>
            <label htmlFor="status" className="block mb-1 font-medium text-gray-900">Status</label>
            <select
              id="status"
              name="status"
              value={form.status}
              onChange={handleChange}
              className="border p-3 rounded bg-white text-gray-900 focus:ring-2 focus:ring-black w-full"
            >
              <option>Available</option>
              <option>Sold</option>
              <option>Exhibition</option>
            </select>
          </div>
          <div>
            <label htmlFor="state" className="block mb-1 font-medium text-gray-900">State</label>
            <select
              id="state"
              name="state"
              value={form.state}
              onChange={handleChange}
              className="border p-3 rounded bg-white text-gray-900 focus:ring-2 focus:ring-black w-full"
            >
              <option>In Progress</option>
              <option>Completed</option>
            </select>
          </div>
          {/* File input with button style */}
          <div className="col-span-full">
            <label htmlFor="image" className="block mb-1 font-medium text-gray-900">
              Select Artwork Image
            </label>
            
            {/* Hidden file input */}
            <input
              id="image"
              name="image"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            
            {/* Button-styled label */}
            <label
              htmlFor="image"
              className="inline-block px-4 py-2 bg-blue-600 text-white font-medium rounded cursor-pointer hover:bg-blue-700 transition-colors"
            >
              Choose File
            </label>
            
            {/* Show selected file name */}
            {form.image && (
              <span className="ml-3 text-sm text-gray-600">{form.image.name}</span>
            )}
          </div>

          <div>
            <label htmlFor="materials" className="block mb-1 font-medium text-gray-900">Materials</label>
            <input
              id="materials"
              name="materials"
              value={form.materials}
              onChange={handleChange}
              className="border p-3 rounded bg-white text-gray-900 focus:ring-2 focus:ring-black w-full"
            />
          </div>
          <div>
            <label htmlFor="duration" className="block mb-1 font-medium text-gray-900">Duration</label>
            <input
              id="duration"
              name="duration"
              value={form.duration}
              onChange={handleChange}
              className="border p-3 rounded bg-white text-gray-900 focus:ring-2 focus:ring-black w-full"
            />
          </div>
          <div className="col-span-full">
            <label htmlFor="inspiration" className="block mb-1 font-medium text-gray-900">Inspiration</label>
            <textarea
              id="inspiration"
              name="inspiration"
              value={form.inspiration}
              onChange={handleChange}
              className="border p-3 rounded bg-white text-gray-900 focus:ring-2 focus:ring-black w-full"
              rows={3}
            />
          </div>

          <div className="col-span-full text-gray-900 text-sm">
            <strong>Generated UID:</strong> {generateUID()}
          </div>

          <button
            disabled={loading}
            className="col-span-full bg-black text-white py-3 rounded-lg hover:bg-gray-800 transition"
          >
            {loading ? "Uploading..." : "Upload Artwork"}
          </button>
        </form>
      </section>

      {/* Manage Artworks */}
      <section className="bg-white p-6 rounded-2xl shadow-lg mb-10 border border-gray-200">
        <h2 className="text-xl font-semibold mb-4 text-gray-900">Manage Artworks</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {artworks.length > 0 ? (
            artworks.map((art) => (
              <div key={art._id} className="border rounded-xl overflow-hidden shadow-md bg-gray-50 p-3">
                <img src={art.src} alt={art.title} className="w-full h-40 object-cover" />
                <div className="p-2">
                  <h3 className="font-semibold text-gray-900">{art.title}</h3>
                  <p className="text-sm text-gray-900">{art.price}</p>

                  <div className="flex items-center gap-2 mt-1">
                    <label className="text-xs text-gray-700">Status:</label>
                    <select
                      value={editArtworks[art._id!]?.status || "Available"}
                      onChange={(e) =>
                        setEditArtworks((prev) => ({
                          ...prev,
                          [art._id!]: {
                            ...prev[art._id!],
                            status: e.target.value,
                          },
                        }))
                      }
                      className="border p-1 text-xs rounded"
                    >
                      <option>Available</option>
                      <option>Sold</option>
                      <option>Exhibition</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-2 mt-1">
                    <label className="text-xs text-gray-700">State:</label>
                    <select
                      value={editArtworks[art._id!]?.state || "In Progress"}
                      onChange={(e) =>
                        setEditArtworks((prev) => ({
                          ...prev,
                          [art._id!]: {
                            ...prev[art._id!],
                            state: e.target.value,
                          },
                        }))
                      }
                      className="border p-1 text-xs rounded"
                    >
                      <option>In Progress</option>
                      <option>Completed</option>
                    </select>
                  </div>

                  <div className="flex justify-between items-center mt-2">
                    <p className="text-xs text-gray-700">{art.uid}</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          handleUpdateArtwork(
                            art._id!,
                            editArtworks[art._id!].status,
                            editArtworks[art._id!].state
                          )
                        }
                        className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700"
                      >
                        Update
                      </button>
                      <button
                        onClick={() => handleDelete(art._id!)}
                        className="text-xs bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-700">No artworks found.</p>
          )}
        </div>
      </section>

      {/* Messages */}
      <section className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200">
        <h2 className="text-xl font-semibold mb-4 text-gray-900">Contact Messages</h2>
        <div className="space-y-4">
          {messages.length > 0 ? (
            messages.map((msg) => (
              <div key={msg._id} className="border rounded-xl p-4 bg-gray-50 shadow-sm">
                <h3 className="font-semibold text-gray-900">
                  {msg.name} — <span className="text-sm text-gray-700">{msg.email}</span>
                </h3>
                <p className="text-gray-900 mt-1">{msg.message}</p>
                <p className="text-xs text-gray-700 mt-2">
                  {new Date(msg.createdAt).toLocaleString()}
                </p>
              </div>
            ))
          ) : (
            <p className="text-gray-700">No messages yet.</p>
          )}
        </div>
      </section>
    </div>
  );
}
