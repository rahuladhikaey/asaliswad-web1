"use client";

import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { Header } from "@/components/Header";
import { useAuth } from "@/context/AuthContext";

export default function CartPage() {
  const { cart, updateQuantity, removeFromCart, totalItems, totalValue } = useCart();
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent" />
      </main>
    );
  }

  if (!session) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-6 text-center">
        <div className="max-w-md w-full rounded-[2.5rem] bg-white p-10 premium-shadow border border-slate-100">
          <div className="mx-auto h-20 w-20 flex items-center justify-center rounded-full bg-slate-100 text-3xl mb-6">🔒</div>
          <h2 className="text-2xl font-black text-slate-900">Sign in required</h2>
          <p className="mt-3 text-slate-500 font-medium">Please login to your account to view your shopping bag.</p>
          <Link href="/login" className="mt-10 inline-flex w-full items-center justify-center rounded-2xl bg-emerald-600 px-8 py-4 text-sm font-black uppercase tracking-widest text-white shadow-xl shadow-emerald-600/20 transition hover:bg-emerald-700 active:scale-95">
            Login / Signup
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 pb-32 md:pb-20 overflow-x-hidden">
      <Header title="Shopping Bag" subtitle="Your Selection" />

      <section className="mx-auto max-w-4xl px-4 py-6 md:py-12 md:px-8">
        <div className="rounded-[2.5rem] bg-white p-6 md:p-10 premium-shadow border border-slate-100">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between border-b border-slate-50 pb-8">
            <div>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-600">Review Bag</span>
              <h1 className="mt-2 text-3xl font-black text-slate-900">Your Items ({totalItems})</h1>
            </div>
            {cart.length > 0 && (
              <Link
                href="/checkout"
                className="hidden sm:inline-flex items-center justify-center rounded-2xl bg-emerald-600 px-8 py-3.5 text-xs font-black uppercase tracking-widest text-white shadow-xl shadow-emerald-600/20 transition hover:bg-emerald-700 active:scale-95"
              >
                Proceed to Pay
              </Link>
            )}
          </div>

          {cart.length === 0 ? (
            <div className="mt-16 py-10 text-center">
              <div className="mx-auto h-24 w-24 flex items-center justify-center rounded-full bg-slate-50 text-4xl mb-6">🛒</div>
              <h2 className="text-2xl font-black text-slate-900">Your bag is empty</h2>
              <p className="mt-3 text-slate-500 font-medium">Add some premium spices and pantry essentials.</p>
              <Link href="/products" className="mt-10 inline-flex rounded-2xl bg-emerald-600 px-10 py-4 text-sm font-black uppercase tracking-widest text-white shadow-xl shadow-emerald-600/20 transition hover:bg-emerald-700">
                Start Shopping
              </Link>
            </div>
          ) : (
            <div className="mt-10 space-y-8">
              {cart.map((item) => (
                <div key={item.id} className="flex flex-col sm:flex-row items-center gap-6 pb-8 border-b border-slate-50 last:border-0 last:pb-0">
                  <div className="h-28 w-28 shrink-0 rounded-[1.5rem] bg-slate-50 p-2 border border-slate-100">
                    <img src={item.image_url} alt={item.name} className="h-full w-full object-contain" />
                  </div>
                  
                  <div className="flex-1 text-center sm:text-left">
                    <h3 className="text-lg font-black text-slate-900">{item.name}</h3>
                    <p className="mt-1 text-sm font-bold text-slate-400">₹{item.price} per unit</p>
                    
                    <div className="mt-4 flex items-center justify-center sm:justify-start gap-4">
                      {/* Premium Quantity Switcher */}
                      <div className="flex items-center rounded-xl bg-slate-100 p-1">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-white transition-all text-lg font-bold"
                        >
                          -
                        </button>
                        <span className="w-10 text-center font-black text-sm">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-white transition-all text-lg font-bold"
                        >
                          +
                        </button>
                      </div>
                      
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-xs font-black uppercase tracking-widest text-red-500 hover:text-red-600 transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  </div>

                  <div className="text-center sm:text-right">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-300">Total</p>
                    <p className="text-xl font-black text-slate-900">₹{item.price * item.quantity}</p>
                  </div>
                </div>
              ))}

              <div className="mt-12 rounded-[2rem] bg-slate-900 p-8 md:p-10 text-white premium-shadow">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400">Grand Total</p>
                    <p className="text-3xl font-black mt-1">₹{totalValue}</p>
                  </div>
                  <div className="text-right hidden sm:block">
                     <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Estimated Delivery</p>
                     <p className="text-sm font-black mt-1">Today in 45-60 mins</p>
                  </div>
                </div>
                
                <div className="grid gap-4 sm:grid-cols-2">
                  <Link
                    href="/checkout?method=online"
                    className="flex h-16 items-center justify-center rounded-2xl bg-emerald-600 text-[11px] font-black uppercase tracking-widest text-white shadow-xl shadow-emerald-500/20 transition-all hover:bg-emerald-500 active:scale-95"
                  >
                    Pay Online 💳
                  </Link>
                  <Link
                    href="/checkout?method=cod"
                    className="flex h-16 items-center justify-center rounded-2xl bg-amber-400 text-[11px] font-black uppercase tracking-widest text-slate-900 shadow-xl shadow-amber-400/20 transition-all hover:bg-amber-300 active:scale-95"
                  >
                    Cash on Delivery 📦
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Floating Checkout Button for Mobile */}
      {cart.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/80 p-4 backdrop-blur-xl border-t border-slate-100 sm:hidden">
            <Link
              href="/checkout"
              className="flex h-14 w-full items-center justify-between rounded-xl bg-emerald-600 px-6 text-sm font-black uppercase tracking-widest text-white transition-all active:scale-95"
            >
              <span>{totalItems} Item • ₹{totalValue}</span>
              <span className="flex items-center gap-2">Proceed <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" /></svg></span>
            </Link>
        </div>
      )}
    </main>
  );
}
