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

interface CheckoutForm {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  transactionCode?: string;
}

export default function CheckoutPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { cart, clearCart } = useCart();

  const [formData, setFormData] = useState<CheckoutForm>({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    country: "Kenya",
  });

  // M-Pesa Lipa Na M-Pesa Till Number
  const MPESA_TILL_NUMBER = "1233455556"; // Your actual Till Number

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("/api/auth/user");
        const data = await res.json();
        
        if (data.loggedIn) {
          setUser(data.user);
          setFormData(prev => ({
            ...prev,
            fullName: data.user.name,
            email: data.user.email
          }));
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Step 1: Show payment instructions if not already shown
    if (!showPayment) {
      // Validate shipping info first
      if (!formData.fullName || !formData.email || !formData.phone || !formData.address || !formData.city) {
        setError("Please fill in all required shipping information");
        return;
      }
      setShowPayment(true);
      return;
    }

    // Step 2: Validate transaction code
    if (!formData.transactionCode) {
      setError("Please enter your M-Pesa transaction code");
      return;
    }

    setProcessing(true);

    try {
      // Prepare order data with transaction code only
      const orderData = {
        user: {
          id: user?.id,
          name: user?.name,
          email: user?.email,
        },
        shippingInfo: {
          ...formData,
          transactionCode: formData.transactionCode,
        },
        items: cart,
        total: total,
        paymentMethod: "mpesa",
      };

      console.log("📦 Submitting order with M-Pesa transaction code:", orderData);

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      });

      // Log the raw response for debugging
      console.log("📨 Raw Response Status:", response.status);
      console.log("📨 Raw Response OK:", response.ok);

      const result = await response.json();

      console.log("📨 API Response:", result);
      console.log("📨 Response success:", result.success);
      console.log("📨 Response message:", result.message);
      console.log("📨 Response error:", result.error);

      if (response.ok && result.success) {
        console.log("✅ Order created successfully:", result.orderId);
        
        // Clear cart after successful order
        clearCart();
        
        // Show success alert
        alert(`✅ Order placed successfully!\n\nOrder ID: ${result.orderId}\nThank you for your purchase! The artwork has been moved to sold category and admin has been notified.`);
        
        // Redirect to home
        router.push("/");
      } else {
        // Better error handling - check all possible error fields
        const errorMessage = 
          result.message || 
          result.error || 
          (typeof result === 'string' ? result : "Failed to place order");
        
        console.error("❌ Order failed with details:", {
          status: response.status,
          statusText: response.statusText,
          result: result,
          errorMessage: errorMessage
        });
        
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error("❌ Checkout failed:", error);
      setError(`Checkout failed: ${error instanceof Error ? error.message : "Please try again."}`);
    } finally {
      setProcessing(false);
    }
  };

  const total = cart.reduce(
    (sum, item) => sum + Number(item.price.replace(/[^0-9.]/g, "")),
    0
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-xl font-nunito-sans text-slate-700">Loading checkout...</div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="max-w-md mx-auto text-center p-8 bg-white rounded-2xl shadow-lg border border-slate-200">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🛒</span>
          </div>
          <h1 className="text-2xl font-bold mb-4 font-playfair-display text-slate-800">Your Cart is Empty</h1>
          <p className="text-slate-600 mb-6 font-nunito-sans">
            Add some beautiful artwork to your cart before checkout.
          </p>
          <button
            onClick={() => router.push("/gallery")}
            className="bg-slate-900 text-white px-8 py-3 rounded-xl hover:bg-slate-800 transition-all duration-300 font-medium shadow-lg hover:shadow-xl"
          >
            Browse Gallery
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 font-nunito-sans">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 font-playfair-display">Battuk Arts</h1>
              <p className="text-slate-600 text-sm mt-1">Complete your purchase</p>
            </div>
            <div className="text-right">
              <p className="text-slate-600 text-sm">Welcome back</p>
              <p className="font-semibold text-slate-900">{user?.name}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
            <div className="flex items-center gap-2 text-red-700">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-medium">{error}</span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Checkout Form */}
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-slate-900 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">{showPayment ? "2" : "1"}</span>
              </div>
              <h2 className="text-2xl font-bold text-slate-900 font-playfair-display">
                {showPayment ? "M-Pesa Payment" : "Shipping Information"}
              </h2>
            </div>
            
            {!showPayment ? (
              // Shipping Information Form
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition-all duration-200 bg-white text-slate-900 placeholder-slate-500"
                      placeholder="John Doe"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700">
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition-all duration-200 bg-white text-slate-900 placeholder-slate-500"
                      placeholder="john@example.com"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition-all duration-200 bg-white text-slate-900 placeholder-slate-500"
                    placeholder="+254 712 345 678"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700">
                    Delivery Address *
                  </label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    required
                    rows={3}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition-all duration-200 bg-white text-slate-900 placeholder-slate-500 resize-none"
                    placeholder="Enter your complete delivery address"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700">
                      City *
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition-all duration-200 bg-white text-slate-900 placeholder-slate-500"
                      placeholder="Nairobi"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700">
                      Country *
                    </label>
                    <select
                      name="country"
                      value={formData.country}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition-all duration-200 bg-white text-slate-900"
                    >
                      <option value="Kenya">Kenya</option>
                      <option value="Uganda">Uganda</option>
                      <option value="Tanzania">Tanzania</option>
                      <option value="Rwanda">Rwanda</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                {/* Payment Method Info - Only M-Pesa */}
                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">₿</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-green-900">Payment Method: M-Pesa</h3>
                      <p className="text-green-700 text-sm">You will pay via M-Pesa Lipa Na M-Pesa in the next step</p>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={processing}
                  className="w-full py-4 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-all duration-300 font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                >
                  {processing ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Processing...
                    </div>
                  ) : (
                    `Continue to M-Pesa Payment →`
                  )}
                </button>
              </form>
            ) : (
              // M-Pesa Payment Form
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold">₿</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 text-lg">Pay with M-Pesa Lipa Na M-Pesa</h3>
                      <p className="text-slate-700 text-sm">Follow these steps to complete your payment</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="text-white text-xs font-bold">1</span>
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">Go to M-Pesa on your phone</p>
                        <p className="text-slate-600 text-sm">Open your M-Pesa menu</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="text-white text-xs font-bold">2</span>
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">Select "Lipa Na M-Pesa"</p>
                        <p className="text-slate-600 text-sm">Choose Lipa Na M-Pesa (Buy Goods)</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="text-white text-xs font-bold">3</span>
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">Enter Till Number</p>
                        <div className="bg-white border border-green-300 rounded-lg p-3 mt-1">
                          <p className="text-lg font-mono font-bold text-green-700 text-center">{MPESA_TILL_NUMBER}</p>
                          <p className="text-xs text-slate-500 text-center mt-1">Till Number</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="text-white text-xs font-bold">4</span>
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">Enter Amount</p>
                        <div className="bg-white border border-green-300 rounded-lg p-3 mt-1">
                          <p className="text-lg font-mono font-bold text-green-700 text-center">KES {total.toLocaleString()}</p>
                          <p className="text-xs text-slate-500 text-center mt-1">Total Amount from your cart</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="text-white text-xs font-bold">5</span>
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">Enter Your PIN</p>
                        <p className="text-slate-600 text-sm">Enter your M-Pesa PIN to complete payment</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="text-white text-xs font-bold">6</span>
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">Wait for Confirmation</p>
                        <p className="text-slate-600 text-sm">You will receive an SMS with transaction code</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Important Notice */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <p className="font-semibold text-blue-900">Important:</p>
                      <p className="text-blue-700 text-sm">
                        Make sure you pay <strong>exactly KES {total.toLocaleString()}</strong> to Till Number <strong>{MPESA_TILL_NUMBER}</strong> using <strong>Lipa Na M-Pesa</strong>
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-slate-700">
                    M-Pesa Transaction Code *
                  </label>
                  <input
                    type="text"
                    name="transactionCode"
                    value={formData.transactionCode || ""}
                    onChange={handleInputChange}
                    required
                    maxLength={10}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition-all duration-200 bg-white text-slate-900 placeholder-slate-500 text-center text-lg font-mono tracking-widest"
                    placeholder="e.g. KM52DRT8Q7"
                  />
                  <p className="text-sm text-slate-500">
                    Enter only the transaction code from your M-Pesa confirmation message
                    <br />
                    <span className="text-xs">Example: Look for "KM52DRT8Q7 Confirmed" in your SMS</span>
                  </p>
                </div>

                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setShowPayment(false)}
                    className="flex-1 py-4 border-2 border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-all duration-300 font-semibold"
                  >
                    ← Back to Shipping
                  </button>
                  <button
                    type="submit"
                    disabled={processing}
                    className="flex-1 py-4 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all duration-300 font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                  >
                    {processing ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Confirming Payment...
                      </div>
                    ) : (
                      `Complete Order`
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8 sticky top-8">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-slate-900 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">{showPayment ? "3" : "2"}</span>
                </div>
                <h2 className="text-2xl font-bold text-slate-900 font-playfair-display">Order Summary</h2>
              </div>
              
              <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                {cart.map((item) => (
                  <div key={item.uid} className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="w-20 h-20 overflow-hidden rounded-lg flex-shrink-0">
                      <Image
                        src={item.src}
                        alt={item.title}
                        width={80}
                        height={80}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-slate-500 mb-1">{item.uid}</p>
                      <h3 className="font-semibold text-slate-900 font-playfair-display text-sm line-clamp-2">
                        {item.title}
                      </h3>
                      <p className="text-slate-700 font-semibold text-sm mt-1">{item.price}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-slate-200 mt-6 pt-6 space-y-3">
                <div className="flex justify-between items-center text-slate-700">
                  <span className="font-medium">Subtotal</span>
                  <span className="font-semibold">KES {total.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-slate-700">
                  <span className="font-medium">Delivery</span>
                  <span className="text-green-600 font-semibold">Free</span>
                </div>
                <div className="border-t border-slate-200 pt-3">
                  <div className="flex justify-between items-center text-xl">
                    <span className="font-bold text-slate-900">Total Amount</span>
                    <span className="font-bold text-slate-900">KES {total.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {showPayment && (
                <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="font-semibold text-green-900">Payment Required</span>
                  </div>
                  <p className="text-sm text-green-700">
                    Pay <strong>KES {total.toLocaleString()}</strong> using <strong>Lipa Na M-Pesa</strong> to Till: <strong>{MPESA_TILL_NUMBER}</strong>
                  </p>
                </div>
              )}
            </div>

            <button
              onClick={() => router.push("/cart")}
              className="w-full py-4 border-2 border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 hover:border-slate-400 transition-all duration-300 font-semibold flex items-center justify-center gap-2 group"
            >
              <span className="group-hover:-translate-x-1 transition-transform duration-200">←</span>
              Back to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
