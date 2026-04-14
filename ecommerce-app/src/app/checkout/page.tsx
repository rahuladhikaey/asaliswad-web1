"use client";

import { FormEvent, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { buildCheckoutMessage } from "@/lib/whatsapp";
import { useCart } from "@/context/CartContext";
import Link from "next/link";
import { Header } from "@/components/Header";
import UserMenu from "@/components/UserMenu";

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, totalItems, totalValue, clearCart } = useCart();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [village, setVillage] = useState("");
  const [postOffice, setPostOffice] = useState("");
  const [pincode, setPincode] = useState("");
  const [addressDetail, setAddressDetail] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!cart.length) {
      setMessage("Your cart is empty. Add products before checking out.");
      return;
    }

    setSaving(true);
    
    // Combine address details
    const fullAddress = `Vill: ${village}, P.O: ${postOffice}, Pin: ${pincode}${addressDetail ? `, Info: ${addressDetail}` : ""}`;

    const order = {
      customer_name: name,
      phone,
      address: fullAddress,
      items: cart.map((item) => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        subtotal: item.quantity * item.price,
      })),
      total: totalValue,
    };

    const whatsappUrl = buildCheckoutMessage(order);

    const { error } = await supabase.from("orders").insert([
      {
        customer_name: order.customer_name,
        phone: order.phone,
        address: order.address,
        product_details: JSON.stringify(order.items),
        status: "Pending",
      },
    ]);

    setSaving(false);
    if (error) {
      setMessage("Order saved locally, but we could not store it in Supabase. You can still continue with WhatsApp.");
    } else {
      clearCart();
    }

    window.location.href = whatsappUrl;
  };

  useEffect(() => {
    let isMounted = true;
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      if (isMounted) {
        setIsAuthenticated(!!data.session);
        setIsCheckingAuth(false);
      }
    };
    checkAuth();
    return () => { isMounted = false; };
  }, []);

  if (isCheckingAuth) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent" />
          <p className="text-sm font-black uppercase tracking-widest text-emerald-600">Verifying...</p>
        </div>
      </main>
    );
  }

  if (!isAuthenticated) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-6 text-center">
        <div className="max-w-md w-full rounded-[2.5rem] bg-white p-10 premium-shadow">
          <div className="mx-auto h-20 w-20 flex items-center justify-center rounded-full bg-slate-100 text-3xl mb-6">🔒</div>
          <h1 className="text-2xl font-black text-slate-900">Sign in required</h1>
          <p className="mt-3 text-slate-500 font-medium">Please login to your account to place a premium order.</p>
          <Link href="/login?redirect=/checkout" className="mt-10 inline-flex w-full items-center justify-center rounded-2xl bg-emerald-600 px-8 py-4 text-sm font-black uppercase tracking-widest text-white shadow-xl shadow-emerald-600/20 transition hover:bg-emerald-700 active:scale-95">
            Login / Signup
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 pb-20 overflow-x-hidden">
      <Header title="Secure Checkout" subtitle="Fast Delivery" />

      <section className="mx-auto max-w-5xl px-4 py-6 md:py-12 md:px-8">
        <div className="grid gap-8 lg:grid-cols-[1.6fr_1fr]">
          {/* Form Area */}
          <div className="rounded-[2.5rem] bg-white p-6 md:p-10 premium-shadow border border-slate-100">
            <div className="mb-10 text-center md:text-left">
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-600">Final Step</span>
              <h1 className="mt-2 text-3xl font-black text-slate-900 md:text-4xl">Delivery Details</h1>
              <p className="mt-3 text-base font-medium text-slate-500">
                Provide your address. We'll verify the rest via WhatsApp.
              </p>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="group relative">
                  <label className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-400 mb-2 block ml-1 transition-colors group-focus-within:text-emerald-600">Full Name</label>
                  <input
                    required
                    value={name}
                    placeholder="Your name"
                    onChange={(event) => setName(event.target.value)}
                    className="w-full rounded-2xl border-2 border-slate-50 bg-slate-50 px-6 py-4 text-sm font-bold outline-none transition-all placeholder:text-slate-300 focus:border-emerald-500/20 focus:bg-white focus:ring-4 focus:ring-emerald-500/5"
                  />
                </div>

                <div className="group relative">
                  <label className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-400 mb-2 block ml-1 transition-colors group-focus-within:text-emerald-600">Contact Number</label>
                  <input
                    required
                    type="tel"
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                    placeholder="e.g., 988363XXXX"
                    className="w-full rounded-2xl border-2 border-slate-50 bg-slate-50 px-6 py-4 text-sm font-bold outline-none transition-all placeholder:text-slate-300 focus:border-emerald-500/20 focus:bg-white focus:ring-4 focus:ring-emerald-500/5"
                  />
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="group relative">
                  <label className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-400 mb-2 block ml-1 transition-colors group-focus-within:text-emerald-600">Village (Vill)</label>
                  <input
                    required
                    value={village}
                    placeholder="Village name"
                    onChange={(event) => setVillage(event.target.value)}
                    className="w-full rounded-2xl border-2 border-slate-50 bg-slate-50 px-6 py-4 text-sm font-bold outline-none transition-all placeholder:text-slate-300 focus:border-emerald-500/20 focus:bg-white focus:ring-4 focus:ring-emerald-500/5"
                  />
                </div>

                <div className="group relative">
                  <label className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-400 mb-2 block ml-1 transition-colors group-focus-within:text-emerald-600">Post Office</label>
                  <input
                    required
                    value={postOffice}
                    placeholder="Post office"
                    onChange={(event) => setPostOffice(event.target.value)}
                    className="w-full rounded-2xl border-2 border-slate-50 bg-slate-50 px-6 py-4 text-sm font-bold outline-none transition-all placeholder:text-slate-300 focus:border-emerald-500/20 focus:bg-white focus:ring-4 focus:ring-emerald-500/5"
                  />
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-[1fr_2fr]">
                <div className="group relative">
                  <label className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-400 mb-2 block ml-1 transition-colors group-focus-within:text-emerald-600">Pin Number</label>
                  <input
                    required
                    type="text"
                    pattern="[0-9]*"
                    maxLength={6}
                    value={pincode}
                    placeholder="6-digit PIN"
                    onChange={(event) => setPincode(event.target.value)}
                    className="w-full rounded-2xl border-2 border-slate-50 bg-slate-50 px-6 py-4 text-sm font-bold outline-none transition-all placeholder:text-slate-300 focus:border-emerald-500/20 focus:bg-white focus:ring-4 focus:ring-emerald-500/5"
                  />
                </div>

                <div className="group relative">
                  <label className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-400 mb-2 block ml-1 transition-colors group-focus-within:text-emerald-600">Landmark / Extra Info</label>
                  <input
                    value={addressDetail}
                    placeholder="Optional details..."
                    onChange={(event) => setAddressDetail(event.target.value)}
                    className="w-full rounded-2xl border-2 border-slate-50 bg-slate-50 px-6 py-4 text-sm font-bold outline-none transition-all placeholder:text-slate-300 focus:border-emerald-500/20 focus:bg-white focus:ring-4 focus:ring-emerald-500/5"
                  />
                </div>
              </div>

              {message ? (
                 <div className="flex items-center gap-3 rounded-2xl bg-rose-50 p-4 border border-rose-100/50">
                    <span className="text-xl">⚠️</span>
                    <p className="text-xs font-bold text-rose-700 leading-snug">{message}</p>
                 </div>
              ) : null}

              <button
                type="submit"
                disabled={saving}
                className="flex h-16 w-full items-center justify-center rounded-2xl bg-emerald-600 px-6 text-sm font-black uppercase tracking-widest text-white shadow-xl shadow-emerald-600/30 transition-all hover:bg-emerald-700 active:scale-95 disabled:opacity-50 disabled:scale-100"
              >
                {saving ? "Processing..." : "Confirm & Get Payment Link 🚀"}
              </button>
              
              <p className="text-center text-[10px] font-bold text-slate-300 uppercase tracking-widest">Powered by WhatsApp Cash on Delivery</p>
            </form>
          </div>

          {/* Sidebar Area */}
          <aside className="space-y-6">
            <div className="rounded-[2.5rem] bg-slate-900 p-8 text-white premium-shadow">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-emerald-400 mb-6">Order Summary</h3>
              <div className="space-y-4 max-h-60 no-scrollbar overflow-y-auto pr-2">
                {cart.map((item) => (
                  <div key={item.id} className="flex items-center justify-between text-sm">
                    <span className="font-bold text-slate-100 line-clamp-1 flex-1 pr-4">{item.name} <span className="text-slate-500 px-2 italic font-medium">x{item.quantity}</span></span>
                    <span className="font-black">₹{item.price * item.quantity}</span>
                  </div>
                ))}
              </div>
              <div className="mt-8 border-t border-slate-800 pt-6">
                 <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Pay</span>
                    <span className="text-2xl font-black text-emerald-400">₹{totalValue}</span>
                 </div>
                 <div className="mt-4 flex items-center gap-2 rounded-xl bg-slate-800/50 p-3">
                    <span className="text-lg">🚚</span>
                    <p className="text-[11px] font-bold text-slate-300">Free delivery within 10km radius of store location.</p>
                 </div>
              </div>
            </div>

            <div className="rounded-[2rem] bg-emerald-50 p-8 border border-emerald-100/50">
              <h3 className="text-xs font-black uppercase tracking-widest text-emerald-700">How it works?</h3>
              <p className="mt-3 text-sm font-bold text-emerald-900 leading-relaxed">
                1. Click confirm to open WhatsApp.<br/>
                2. Send the pre-filled message.<br/>
                3. We will send you a **Payment Link**.<br/>
                4. Pay & get instant confirmation!
              </p>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}


