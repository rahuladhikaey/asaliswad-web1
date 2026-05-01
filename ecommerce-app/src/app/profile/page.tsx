"use client";

import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { CartHeaderLink } from "@/components/CartHeaderLink";
import UserMenu from "@/components/UserMenu";

export default function ProfilePage() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent" />
          <p className="text-sm font-black uppercase tracking-widest text-emerald-600">Loading Profile...</p>
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-6 text-center">
        <div className="max-w-md w-full rounded-[2.5rem] bg-white p-10 premium-shadow">
          <div className="mx-auto h-20 w-20 flex items-center justify-center rounded-full bg-slate-100 text-3xl mb-6">👤</div>
          <h1 className="text-2xl font-black text-slate-900">Sign in required</h1>
          <p className="mt-3 text-slate-500 font-medium">Please login to view your premium account details.</p>
          <Link href="/login" className="mt-10 inline-flex w-full items-center justify-center rounded-2xl bg-emerald-600 px-10 py-4 text-sm font-black uppercase tracking-widest text-white shadow-xl shadow-emerald-600/20 transition hover:bg-emerald-700">
            Go to Login
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 pb-20 overflow-x-hidden">
      {/* Premium Sticky Header */}
      <header className="sticky top-0 z-50 flex items-center justify-between border-b border-slate-200/60 bg-white/80 px-4 py-3 backdrop-blur-xl md:px-8">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center justify-center transition-transform hover:scale-105">
            <img src="/logo.png" alt="Asali Swad Logo" className="h-10 w-10 md:h-12 md:w-12 rounded-xl object-cover shadow-md border border-slate-100" />
          </Link>
          <div className="hidden flex-col md:flex">
             <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600">User Profile</span>
             <span className="text-sm font-bold text-slate-800">Account Dashboard</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <UserMenu />
          <CartHeaderLink />
        </div>
      </header>

      <section className="mx-auto max-w-4xl px-4 py-6 md:py-12 md:px-8">
        <div className="overflow-hidden rounded-[2.5rem] bg-white premium-shadow border border-slate-100">
          {/* Cover Area */}
          <div className="h-40 bg-gradient-to-br from-emerald-700 via-emerald-600 to-emerald-500 relative">
             <div className="absolute inset-0 bg-white/10 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }} />
          </div>
          
          <div className="px-6 pb-10 md:px-10">
            <div className="relative -mt-20 flex flex-col md:flex-row md:items-end gap-6 md:gap-8">
              <div className="flex h-36 w-36 shrink-0 items-center justify-center rounded-[2.5rem] border-8 border-white bg-emerald-50 text-5xl font-black text-emerald-600 shadow-2xl shadow-emerald-950/10">
                {user.email?.[0].toUpperCase()}
              </div>
              <div className="mb-4">
                <span className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-emerald-700 mb-2">Verified Member 🌟</span>
                <h1 className="text-3xl md:text-4xl font-black text-slate-900 leading-tight break-words line-clamp-2">
                  {user.user_metadata?.full_name || user.email?.split("@")[0]}
                </h1>
                <p className="mt-1 text-base font-bold text-slate-400 truncate max-w-[280px] md:max-w-none">{user.email}</p>
              </div>
            </div>

            <div className="mt-12 grid gap-10 md:grid-cols-[1fr_0.8fr]">
              <div className="space-y-8">
                <div className="grid gap-6 sm:grid-cols-2">
                   <div className="rounded-2xl bg-slate-50 p-6 border border-slate-100">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 block mb-2">Email Identity</label>
                      <p className="text-sm font-black text-slate-900 break-all">{user.email}</p>
                   </div>
                   <div className="rounded-2xl bg-slate-50 p-6 border border-slate-100">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 block mb-2">Account Type</label>
                      <p className="text-sm font-black text-slate-900">Premium Shopper</p>
                   </div>
                </div>
                
                <div className="rounded-[2rem] bg-slate-900 p-8 text-white premium-shadow">
                   <h3 className="text-xs font-black uppercase tracking-widest text-emerald-400 mb-6">Shopping Metrics</h3>
                   <div className="space-y-5">
                      <div className="flex items-center justify-between">
                         <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Store Joined</span>
                         <span className="text-sm font-black">{new Date(user.created_at).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</span>
                      </div>
                      <div className="flex items-center justify-between">
                         <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Order Streak</span>
                         <span className="text-sm font-black">Regular</span>
                      </div>
                      <div className="flex items-center justify-between border-t border-slate-800 pt-5 mt-2">
                         <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Loyalty Status</span>
                         <span className="text-sm font-black text-emerald-400">Bronze Level</span>
                      </div>
                   </div>
                </div>
              </div>
              
              <div className="flex flex-col gap-4">
                 <Link href="/products" className="flex items-center justify-center rounded-2xl bg-emerald-50 px-6 py-5 text-xs font-black uppercase tracking-widest text-emerald-700 transition-all hover:bg-emerald-100 border border-emerald-200/50">
                    Browse All Spices
                 </Link>
                 <Link href="/profile/orders" className="flex items-center justify-center rounded-2xl bg-slate-50 px-6 py-5 text-xs font-black uppercase tracking-widest text-slate-900 transition-all hover:bg-slate-100 border border-slate-200">
                    View My Orders
                 </Link>
                 <div className="mt-4 p-6 rounded-[2rem] bg-emerald-600 text-white shadow-xl shadow-emerald-600/20 text-center">
                    <p className="text-xs font-black uppercase tracking-widest mb-2">Invite Friends</p>
                    <p className="text-[11px] font-bold opacity-80 leading-relaxed">Share Asali Swad and get extra discounts on your next orders.</p>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

