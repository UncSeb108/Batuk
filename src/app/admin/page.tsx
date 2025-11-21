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

const TYPE_CODES: Record<string, string> = {
  "Portrait": "PT",
  "African Portraiture": "AP",
  "Realism": "RL",
  "Abstract": "AB",
  "Screen Print": "SP",
  "Woodcut Print": "WP",
  "Print": "PR",
};

const STATUS_CONFIG = {
  "Available": { color: "bg-green-100 text-green-800 border-green-200", label: "Available" },
  "Sold": { color: "bg-red-100 text-red-800 border-red-200", label: "Sold" },
  "Exhibition": { color: "bg-blue-100 text-blue-800 border-blue-200", label: "In Exhibition" },
};

const STATE_CONFIG = {
  "In Progress": { color: "bg-yellow-100 text-yellow-800 border-yellow-200", label: "In Progress" },
  "Completed": { color: "bg-purple-100 text-purple-800 border-purple-200", label: "Completed" },
};

export default function AdminPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [nextNumber, setNextNumber] = useState("001");
  const [loading, setLoading] = useState(false);
  const [editingArtwork, setEditingArtwork] = useState<Artwork | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

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

  const [editForm, setEditForm] = useState({
    title: "",
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
      window.location.href = "/admin-login";
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

  const handleEditChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setForm((prev) => ({ ...prev, image: file }));
  };

  const handleEditFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      setEditForm((prev) => ({ ...prev, image: file }));
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const generateUID = () => {
    const year = new Date().getFullYear().toString().slice(-2);
    const typeCode = TYPE_CODES[form.type] || "XX";
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

  const handleEdit = (artwork: Artwork) => {
    setEditingArtwork(artwork);
    setEditForm({
      title: artwork.title,
      price: artwork.price,
      status: artwork.status,
      state: artwork.state,
      materials: artwork.materials || "",
      duration: artwork.duration || "",
      type: artwork.type || "",
      inspiration: artwork.inspiration || "",
      image: null,
    });
    setImagePreview(null);
    setIsEditModalOpen(true);
  };

  const handleUpdateAllDetails = async () => {
    if (!editingArtwork?._id) return;

    try {
      const formData = new FormData();
      formData.append("title", editForm.title);
      formData.append("price", editForm.price);
      formData.append("status", editForm.status);
      formData.append("state", editForm.state);
      formData.append("materials", editForm.materials);
      formData.append("duration", editForm.duration);
      formData.append("type", editForm.type);
      formData.append("inspiration", editForm.inspiration);
      
      if (editForm.image) {
        formData.append("image", editForm.image);
      }

      const res = await fetch(`/api/gallery?id=${editingArtwork._id}`, {
        method: "PUT",
        body: formData,
      });

      if (res.ok) {
        const updatedArt = await res.json();
        setArtworks((prev) =>
          prev.map((a) => (a._id === editingArtwork._id ? updatedArt : a))
        );
        
        // Update the quick edit state as well
        setEditArtworks((prev) => ({
          ...prev,
          [editingArtwork._id!]: { 
            status: editForm.status, 
            state: editForm.state 
          },
        }));

        setIsEditModalOpen(false);
        setEditingArtwork(null);
        setImagePreview(null);
        alert("✅ Artwork details updated successfully!");
      } else {
        alert("❌ Failed to update artwork details.");
      }
    } catch (err) {
      console.error(err);
      alert("❌ Error updating artwork details.");
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

  const StatusBadge = ({ status }: { status: string }) => {
    const config = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.Available;
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const StateBadge = ({ state }: { state: string }) => {
    const config = STATE_CONFIG[state as keyof typeof STATE_CONFIG] || STATE_CONFIG["In Progress"];
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.color}`}>
        {config.label}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 font-playfair-display tracking-tight">
              Admin Dashboard
            </h1>
            <p className="text-gray-600 mt-2">Manage artworks and messages</p>
          </div>
          <button
            onClick={handleAdminLogout}
            className="bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-3 rounded-xl shadow-sm hover:from-red-700 hover:to-red-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all duration-200 font-semibold"
          >
            Logout
          </button>
        </div>

        {/* Upload Artwork */}
        <section className="bg-white p-8 rounded-2xl shadow-xl mb-10 border border-gray-200/60">
          <h2 className="text-2xl font-bold mb-6 text-gray-900 font-playfair-display">Upload Artwork</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* ... (existing form fields remain the same) ... */}
            <div className="space-y-2">
              <label htmlFor="title" className="block text-sm font-semibold text-gray-900">Title</label>
              <input
                id="title"
                name="title"
                value={form.title}
                onChange={handleChange}
                required
                className="block w-full px-4 py-3 text-gray-900 border border-gray-300 rounded-xl placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-colors duration-200"
                placeholder="Enter artwork title"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="artist" className="block text-sm font-semibold text-gray-900">Artist</label>
              <select
                id="artist"
                name="artist"
                value={form.artist}
                onChange={handleChange}
                className="block w-full px-4 py-3 text-gray-900 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-colors duration-200"
              >
                <option value="bt">Batuk</option>
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="type" className="block text-sm font-semibold text-gray-900">Type</label>
              <select
                id="type"
                name="type"
                value={form.type}
                onChange={handleChange}
                className="block w-full px-4 py-3 text-gray-900 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-colors duration-200"
              >
                <option value="">Select type</option>
                {TYPE_OPTIONS.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="price" className="block text-sm font-semibold text-gray-900">Price</label>
              <input
                id="price"
                name="price"
                type="number"
                value={form.price}
                onChange={handleChange}
                required
                className="block w-full px-4 py-3 text-gray-900 border border-gray-300 rounded-xl placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-colors duration-200"
                placeholder="Enter price"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="status" className="block text-sm font-semibold text-gray-900">Status</label>
              <select
                id="status"
                name="status"
                value={form.status}
                onChange={handleChange}
                className="block w-full px-4 py-3 text-gray-900 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-colors duration-200"
              >
                <option>Available</option>
                <option>Sold</option>
                <option>Exhibition</option>
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="state" className="block text-sm font-semibold text-gray-900">State</label>
              <select
                id="state"
                name="state"
                value={form.state}
                onChange={handleChange}
                className="block w-full px-4 py-3 text-gray-900 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-colors duration-200"
              >
                <option>In Progress</option>
                <option>Completed</option>
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="materials" className="block text-sm font-semibold text-gray-900">Materials</label>
              <input
                id="materials"
                name="materials"
                value={form.materials}
                onChange={handleChange}
                className="block w-full px-4 py-3 text-gray-900 border border-gray-300 rounded-xl placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-colors duration-200"
                placeholder="Enter materials used"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="duration" className="block text-sm font-semibold text-gray-900">Duration</label>
              <input
                id="duration"
                name="duration"
                value={form.duration}
                onChange={handleChange}
                className="block w-full px-4 py-3 text-gray-900 border border-gray-300 rounded-xl placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-colors duration-200"
                placeholder="Enter creation duration"
              />
            </div>

            <div className="col-span-full space-y-2">
              <label htmlFor="inspiration" className="block text-sm font-semibold text-gray-900">Inspiration</label>
              <textarea
                id="inspiration"
                name="inspiration"
                value={form.inspiration}
                onChange={handleChange}
                className="block w-full px-4 py-3 text-gray-900 border border-gray-300 rounded-xl placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-colors duration-200"
                rows={3}
                placeholder="Share the inspiration behind this artwork"
              />
            </div>

            {/* File input */}
            <div className="col-span-full space-y-2">
              <label className="block text-sm font-semibold text-gray-900">Artwork Image</label>
              <input
                id="image"
                name="image"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <label
                htmlFor="image"
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl shadow-sm hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 cursor-pointer"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Choose File
              </label>
              {form.image && (
                <span className="ml-3 text-sm text-gray-600 font-medium">{form.image.name}</span>
              )}
            </div>

            <div className="col-span-full p-4 bg-blue-50 rounded-xl border border-blue-200">
              <p className="text-sm font-semibold text-gray-900">
                <span className="text-blue-700">Generated UID:</span> {generateUID()}
              </p>
            </div>

            <button
              disabled={loading}
              className="col-span-full w-full flex justify-center items-center py-4 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-gradient-to-r from-gray-900 to-black hover:from-gray-800 hover:to-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Uploading...
                </>
              ) : (
                "Upload Artwork"
              )}
            </button>
          </form>
        </section>

        {/* Manage Artworks */}
        <section className="bg-white p-8 rounded-2xl shadow-xl mb-10 border border-gray-200/60">
          <h2 className="text-2xl font-bold mb-6 text-gray-900 font-playfair-display">Manage Artworks</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {artworks.length > 0 ? (
              artworks.map((art) => (
                <div key={art._id} className="border border-gray-200 rounded-2xl overflow-hidden shadow-md bg-white hover:shadow-lg transition-shadow duration-200">
                  <div className="relative">
                    <img src={art.src} alt={art.title} className="w-full h-48 object-cover" />
                    <div className="absolute top-3 left-3 flex flex-col gap-2">
                      <StatusBadge status={art.status} />
                      <StateBadge state={art.state} />
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-gray-900 text-lg mb-1">{art.title}</h3>
                    <p className="text-gray-700 font-semibold mb-3">${art.price}</p>
                    <p className="text-xs text-gray-500 font-mono mb-3">{art.uid}</p>

                    {/* Quick Status/State Display */}
                    <div className="flex items-center justify-between mb-3 p-3 bg-gray-50 rounded-lg">
                      <div className="text-center">
                        <p className="text-xs text-gray-600 font-semibold">Status</p>
                        <StatusBadge status={editArtworks[art._id!]?.status || art.status} />
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-600 font-semibold">State</p>
                        <StateBadge state={editArtworks[art._id!]?.state || art.state} />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-semibold text-gray-700">Status:</label>
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
                          className="block w-full px-3 py-2 text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-colors duration-200 text-sm"
                        >
                          <option>Available</option>
                          <option>Sold</option>
                          <option>Exhibition</option>
                        </select>
                      </div>

                      <div className="flex items-center justify-between">
                        <label className="text-sm font-semibold text-gray-700">State:</label>
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
                          className="block w-full px-3 py-2 text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-colors duration-200 text-sm"
                        >
                          <option>In Progress</option>
                          <option>Completed</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex gap-2 mt-4">
                      <button
                        onClick={() => handleEdit(art)}
                        className="flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white px-3 py-2 rounded-lg text-sm font-semibold hover:from-green-700 hover:to-green-800 transition-colors duration-200"
                      >
                        Edit All
                      </button>
                      <button
                        onClick={() =>
                          handleUpdateArtwork(
                            art._id!,
                            editArtworks[art._id!].status,
                            editArtworks[art._id!].state
                          )
                        }
                        className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-3 py-2 rounded-lg text-sm font-semibold hover:from-blue-700 hover:to-blue-800 transition-colors duration-200"
                      >
                        Update
                      </button>
                      <button
                        onClick={() => handleDelete(art._id!)}
                        className="flex-1 bg-gradient-to-r from-red-600 to-red-700 text-white px-3 py-2 rounded-lg text-sm font-semibold hover:from-red-700 hover:to-red-800 transition-colors duration-200"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-500 text-lg">No artworks found.</p>
              </div>
            )}
          </div>
        </section>

        {/* Edit Modal */}
        {isEditModalOpen && editingArtwork && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 font-playfair-display">
                    Edit Artwork Details
                  </h2>
                  <button
                    onClick={() => {
                      setIsEditModalOpen(false);
                      setImagePreview(null);
                    }}
                    className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Image Section */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Current Image
                      </label>
                      <img 
                        src={imagePreview || editingArtwork.src} 
                        alt={editingArtwork.title}
                        className="w-full h-64 object-cover rounded-lg border border-gray-200"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-900">
                        Update Image
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleEditFileChange}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      />
                      <p className="text-xs text-gray-500">
                        Leave empty to keep current image
                      </p>
                    </div>

                    {/* Current Status Display */}
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h3 className="text-sm font-semibold text-gray-900 mb-2">Current Status</h3>
                      <div className="flex gap-4">
                        <div>
                          <p className="text-xs text-gray-600 mb-1">Status</p>
                          <StatusBadge status={editingArtwork.status} />
                        </div>
                        <div>
                          <p className="text-xs text-gray-600 mb-1">State</p>
                          <StateBadge state={editingArtwork.state} />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Form Section */}
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-900">Title</label>
                        <input
                          name="title"
                          value={editForm.title}
                          onChange={handleEditChange}
                          className="block w-full px-3 py-2 text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-900">Price</label>
                        <input
                          name="price"
                          type="number"
                          value={editForm.price}
                          onChange={handleEditChange}
                          className="block w-full px-3 py-2 text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-900">Type</label>
                        <select
                          name="type"
                          value={editForm.type}
                          onChange={handleEditChange}
                          className="block w-full px-3 py-2 text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                        >
                          <option value="">Select type</option>
                          {TYPE_OPTIONS.map((type) => (
                            <option key={type} value={type}>{type}</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-900">Status</label>
                        <select
                          name="status"
                          value={editForm.status}
                          onChange={handleEditChange}
                          className="block w-full px-3 py-2 text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                        >
                          <option>Available</option>
                          <option>Sold</option>
                          <option>Exhibition</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-900">State</label>
                        <select
                          name="state"
                          value={editForm.state}
                          onChange={handleEditChange}
                          className="block w-full px-3 py-2 text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                        >
                          <option>In Progress</option>
                          <option>Completed</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-900">Materials</label>
                        <input
                          name="materials"
                          value={editForm.materials}
                          onChange={handleEditChange}
                          className="block w-full px-3 py-2 text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-900">Duration</label>
                        <input
                          name="duration"
                          value={editForm.duration}
                          onChange={handleEditChange}
                          className="block w-full px-3 py-2 text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-900">Inspiration</label>
                      <textarea
                        name="inspiration"
                        value={editForm.inspiration}
                        onChange={handleEditChange}
                        className="block w-full px-3 py-2 text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                        rows={3}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={handleUpdateAllDetails}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-colors duration-200"
                  >
                    Update All Changes
                  </button>
                  <button
                    onClick={() => {
                      setIsEditModalOpen(false);
                      setImagePreview(null);
                    }}
                    className="flex-1 bg-gradient-to-r from-gray-500 to-gray-600 text-white px-4 py-3 rounded-lg font-semibold hover:from-gray-600 hover:to-gray-700 transition-colors duration-200"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Messages */}
        <section className="bg-white p-8 rounded-2xl shadow-xl border border-gray-200/60">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 font-playfair-display">Contact Messages</h2>
            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
              {messages.length} messages
            </span>
          </div>
          <div className="space-y-4">
            {messages.length > 0 ? (
              messages.map((msg) => (
                <div key={msg._id} className="border border-gray-200 rounded-2xl p-6 bg-white shadow-sm hover:shadow-md transition-shadow duration-200">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg">{msg.name}</h3>
                      <p className="text-blue-600 font-medium text-sm">{msg.email}</p>
                    </div>
                    <button
                      onClick={() => handleDeleteMessage(msg._id)}
                      className="text-red-500 hover:text-red-700 transition-colors duration-200 p-1"
                      title="Delete message"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                  <p className="text-gray-700 mb-4 leading-relaxed">{msg.message}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(msg.createdAt).toLocaleString()}
                  </p>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No messages yet.</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}