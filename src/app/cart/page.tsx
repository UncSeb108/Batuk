"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "../context/CartContext";
import Image from "next/image";

interface User {
  id: string;
  name: string;
  email: string;
}

export default function CartPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { cart, removeFromCart } = useCart();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("/api/auth/user");
        const data = await res.json();
        
        if (data.loggedIn) {
          setUser(data.user);
        } else {
          router.push("/login");
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  const handleLogout = async () => {
    await fetch("/api/auth/user/logout", { method: "POST" });
    setUser(null);
    router.push("/login");
  };

  const total = cart.reduce(
    (sum, item) => sum + Number(item.price.replace(/[^0-9.]/g, "")),
    0
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-100 to-gray-200">
        <div className="text-xl font-nunito-sans">Loading your cart...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="px-6 py-24 min-h-screen bg-gradient-to-b from-gray-100 to-gray-200 font-nunito-sans">
      <div className="max-w-6xl mx-auto">
        {/* Header with user info */}
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-4xl font-extrabold text-black tracking-tight font-playfair-display">
            Shopping Cart
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-700 font-nunito-sans">
              Welcome, {user.name}
            </span>
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition font-medium text-sm"
            >
              Logout
            </button>
          </div>
        </div>

        {cart.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-lg text-gray-600 mb-6">Your cart is empty.</p>
            <button
              onClick={() => router.push("/gallery")}
              className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition font-medium"
            >
              Browse Gallery
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
            <div className="md:col-span-3 space-y-6">
              {cart.map((item) => (
                <div
                  key={item.uid}
                  className="flex items-center bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-lg transition-all"
                >
                  <div className="w-24 h-24 overflow-hidden rounded-lg">
                    <Image
                      src={item.src}
                      alt={item.title}
                      width={100}
                      height={100}
                      className="rounded-md object-cover hover:scale-110 transition-transform"
                    />
                  </div>

                  <div className="flex-1 pl-4">
                    <p className="text-xs font-nunito-sans text-gray-500">
                      {item.uid}
                    </p>
                    <h3 className="font-semibold text-lg text-gray-900 font-playfair-display">
                      {item.title}
                    </h3>
                    <p className="text-gray-600 mt-1">{item.price}</p>
                  </div>

                  <button
                    onClick={() => removeFromCart(item.uid)}
                    className="text-red-500 text-sm hover:text-red-600 transition font-medium"
                  >
                    ✕ Remove
                  </button>
                </div>
              ))}
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 h-fit sticky top-28">
              <h2 className="text-xl font-bold mb-5 text-gray-900 tracking-tight">
                Order Summary
              </h2>

              <div className="flex justify-between mb-3 text-gray-700 text-sm font-medium">
                <span>Subtotal</span>
                <span>KES {total.toFixed(2)}</span>
              </div>

              <div className="flex justify-between mb-3 text-gray-700 text-sm font-medium">
                <span>Delivery</span>
                <span className="text-green-600">Free</span>
              </div>
              <hr className="my-5" />
              <div className="flex justify-between text-xl font-extrabold text-gray-900 mb-6">
                <span>Total</span>
                <span>KES {total.toFixed(2)}</span>
              </div>
              <button className="w-full py-3 bg-gray-900 text-white rounded-lg hover:bg-black transition font-medium cursor-pointer">
                Proceed to Checkout →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}