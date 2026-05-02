"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import { Header } from "@/components/Header";

interface Order {
  id: string;
  created_at: string;
  total_amount: number;
  payment_method: string;
  payment_status: string;
  order_status: string;
  product_details: string; // JSON string
}

export default function MyOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    async function fetchOrders() {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        setLoading(false);
        return;
      }

      setUser(sessionData.session.user);

      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("user_id", sessionData.session.user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching orders:", error);
      } else {
        setOrders(data || []);
      }
      setLoading(false);
    }

    fetchOrders();
  }, []);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent" />
      </main>
    );
  }

  if (!user) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-6 text-center">
        <div className="max-w-md w-full rounded-[2.5rem] bg-white p-10 premium-shadow">
          <div className="mx-auto h-20 w-20 flex items-center justify-center rounded-full bg-slate-100 text-3xl mb-6">🔒</div>
          <h1 className="text-2xl font-black text-slate-900">Please Sign In</h1>
          <p className="mt-3 text-slate-500 font-medium">You need to be logged in to view your order history.</p>
          <Link href="/login" className="mt-10 inline-flex w-full items-center justify-center rounded-2xl bg-emerald-600 px-8 py-4 text-sm font-black uppercase tracking-widest text-white shadow-xl shadow-emerald-600/20 transition hover:bg-emerald-700">
            Login Now
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <Header title="My Orders" subtitle="Track your premium spices" />


      <section className="mx-auto max-w-4xl px-4 py-12 md:px-8">
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-600">Purchase History</span>
            <h1 className="mt-2 text-4xl font-black text-slate-900">Your Orders</h1>
          </div>
          <Link href="/products" className="text-xs font-black uppercase tracking-widest text-emerald-600 hover:text-emerald-700 transition-colors">
            + Order More Spices
          </Link>
        </div>

        {orders.length === 0 ? (
          <div className="rounded-[2.5rem] bg-white p-16 text-center premium-shadow border border-slate-100">
            <div className="mx-auto h-24 w-24 flex items-center justify-center rounded-full bg-slate-50 text-4xl mb-6">📦</div>
            <h2 className="text-xl font-black text-slate-900">No orders yet</h2>
            <p className="mt-2 text-slate-500 font-medium max-w-xs mx-auto">Your premium spice journey starts here. Place your first order today!</p>
            <Link href="/products" className="mt-10 inline-flex items-center justify-center rounded-2xl bg-emerald-600 px-10 py-4 text-xs font-black uppercase tracking-widest text-white shadow-xl shadow-emerald-600/20 transition hover:bg-emerald-700 active:scale-95">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="grid gap-6">
            {orders.map((order) => {
              let items = [];
              try {
                items = typeof order.product_details === "string" 
                  ? JSON.parse(order.product_details) 
                  : (order.product_details || []);
              } catch (e) {
                console.error("Failed to parse items:", e);
              }
              return (
                <div key={order.id} className="group relative overflow-hidden rounded-[2.5rem] bg-white p-6 md:p-8 premium-shadow border border-slate-100 transition-all hover:border-emerald-200">
                  <div className="flex flex-col md:flex-row justify-between gap-6">
                    <div className="space-y-4 flex-1">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="rounded-full bg-slate-100 px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-slate-600">
                          Order #{String(order.id).slice(0, 8).toUpperCase()}
                        </span>
                        <span className={`rounded-full px-4 py-1.5 text-[10px] font-black uppercase tracking-widest ${
                          order.order_status === "PENDING" ? "bg-amber-50 text-amber-600" :
                          order.order_status === "SHIPPED" ? "bg-blue-50 text-blue-600" :
                          "bg-emerald-50 text-emerald-600"
                        }`}>
                          {order.order_status}
                        </span>
                      </div>
                      
                      <div className="space-y-2">
                        {items.map((item: any, idx: number) => (
                          <div key={idx} className="flex items-center gap-3 text-sm">
                            <div className="h-2 w-2 rounded-full bg-emerald-500" />
                            <p className="font-bold text-slate-800">
                              {item.name} <span className="text-slate-400 font-medium">x{item.quantity}</span>
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-col justify-between items-end border-l border-slate-50 pl-8 text-right min-w-[150px]">
                      <div className="space-y-1">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Paid</p>
                        <p className="text-2xl font-black text-slate-900">₹{order.total_amount}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Placed On</p>
                        <p className="text-sm font-bold text-slate-600">{new Date(order.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 flex items-center justify-between border-t border-slate-50 pt-6">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Status:</span>
                      <span className="text-xs font-black text-slate-900">{order.payment_status} ({order.payment_method})</span>
                    </div>
                    <button className="text-[10px] font-black uppercase tracking-widest text-emerald-600 hover:underline">
                      View Details →
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
