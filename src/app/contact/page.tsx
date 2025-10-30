"use client";

export default function ContactSection() {
  return (
    <div className="h-full w-full px-10 py-20 flex items-center justify-center">
      <div className="text-center max-w-xl">
        <h2 className="text-5xl font-playfair-display font-bold text-black mb-8">
          Contact
        </h2>

        <p className="text-gray-700 font-nunito-sans mb-10">
          Have a commission request, exhibition invitation, or art inquiry?
          Let&apos;s connect.
        </p>

        <form className="space-y-4 text-gray-800 font-nunito-sans">
          <input
            type="text"
            placeholder="Your Name"
            className="w-full border border-gray-300 p-3 rounded-md outline-none focus:border-black"
          />
          <input
            type="email"
            placeholder="Your Email"
            className="w-full border border-gray-300 p-3 rounded-md outline-none focus:border-black"
          />
          <textarea
            rows={4}
            placeholder="Message"
            className="w-full border border-gray-300 p-3 rounded-md outline-none focus:border-black"
          />
          <button
            type="submit"
            className="w-full bg-black text-white py-3 uppercase tracking-wide font-nunito-sans hover:bg-gray-900 transition-all"
          >
            Send Message
          </button>
        </form>

        <div className="mt-8 text-gray-600 text-sm font-nunito-sans">
          Or email: <span className="text-black font-semibold">sirmabatuk@gmail.com</span>
        </div>
      </div>
    </div>
  );
}
