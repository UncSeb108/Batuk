"use client";
import { useState } from "react";

export default function ContactSection() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) return alert("Please fill all fields.");
    setLoading(true);

    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message }),
      });

      if (res.ok) {
        alert("✅ Message sent successfully!");
        setName("");
        setEmail("");
        setMessage("");
      } else {
        alert("❌ Failed to send message.");
      }
    } catch (err) {
      console.error(err);
      alert("❌ Error sending message.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full w-full px-10 py-20 flex items-center justify-center">
      <div className="text-center max-w-xl">
        <h2 className="text-5xl font-playfair-display font-bold text-black mb-8">
          Contact
        </h2>

        <p className="text-gray-700 font-nunito-sans mb-10">
          Have a commission request, exhibition invitation, or art inquiry? Let's connect.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4 text-gray-800 font-nunito-sans">
          <input
            type="text"
            placeholder="Your Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border border-gray-300 p-3 rounded-md outline-none focus:border-black"
          />
          <input
            type="email"
            placeholder="Your Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-gray-300 p-3 rounded-md outline-none focus:border-black"
          />
          <textarea
            rows={4}
            placeholder="Message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full border border-gray-300 p-3 rounded-md outline-none focus:border-black"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-3 uppercase tracking-wide font-nunito-sans hover:bg-gray-900 transition-all"
          >
            {loading ? "Sending..." : "Send Message"}
          </button>
        </form>

        <div className="mt-8 text-gray-600 text-sm font-nunito-sans">
          Or email: <span className="text-black font-semibold">sirmabatuk@gmail.com</span>
        </div>
      </div>
    </div>
  );
}
