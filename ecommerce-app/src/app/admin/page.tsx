"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase, supabaseStorage } from "@/lib/supabaseClient";
import { Product, Category } from "@/lib/types";

const ADMIN_ACCESS_KEY_1 = "admin@988";
const ADMIN_ACCESS_KEY_2 = "r!a@h#u$l%2005";
const ADMIN_AUTH_STORAGE_KEY = "admin-authorized";
const ADMIN_AUTH_USER_KEY = "admin-user";
const PRODUCT_IMAGES_BUCKET = "product-images";
const PRODUCT_IMAGES_FOLDER = "product-images";

type Order = {
  id: number;
  customer_name: string;
  phone: string;
  address: string;
  product_details: string;
  status: string;
  payment_status: string;
  payment_method: string;
  razorpay_order_id?: string;
  razorpay_payment_id?: string;
  total_amount: number;
  created_at: string;
};

export default function AdminPage() {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [tab, setTab] = useState("dashboard");
  const [productForm, setProductForm] = useState({
    name: "",
    price: "",
    description: "",
    category_id: "",
    imageFiles: null as FileList | null,
  });
  const [editingProductId, setEditingProductId] = useState<number | null>(null);
  const [editingCategoryId, setEditingCategoryId] = useState<number | null>(null);

  const [categoryName, setCategoryName] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [accessKey1, setAccessKey1] = useState("");
  const [accessKey2, setAccessKey2] = useState("");
  const [authError, setAuthError] = useState("");
  const [adminUser, setAdminUser] = useState("");

  const fetchData = async () => {
    setLoading(true);
    const [{ data: productData }, { data: categoryData }, { data: orderData }] = await Promise.all([
      supabase.from("products").select("*").order("id", { ascending: false }),
      supabase.from("categories").select("*").order("name", { ascending: true }),
      supabase.from("orders").select("*").order("created_at", { ascending: false }),
    ]);
    setProducts((productData ?? []) as Product[]);
    setCategories((categoryData ?? []) as Category[]);
    setOrders((orderData ?? []) as Order[]);
    setLoading(false);
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    const storedAuth = window.localStorage.getItem(ADMIN_AUTH_STORAGE_KEY);
    const storedUser = window.localStorage.getItem(ADMIN_AUTH_USER_KEY);
    setIsAuthorized(storedAuth === "true");
    setAdminUser(storedUser ?? "");
    setLoading(false);
  }, []);

  useEffect(() => {
    if (isAuthorized) fetchData();
  }, [isAuthorized]);

  const handleLogout = () => {
    window.localStorage.removeItem(ADMIN_AUTH_STORAGE_KEY);
    window.localStorage.removeItem(ADMIN_AUTH_USER_KEY);
    setIsAuthorized(false);
    setAdminUser("");
    router.push("/admin");
  };

  const handleAccessSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (accessKey1.trim() === ADMIN_ACCESS_KEY_1 && accessKey2 === ADMIN_ACCESS_KEY_2) {
      window.localStorage.setItem(ADMIN_AUTH_STORAGE_KEY, "true");
      window.localStorage.setItem(ADMIN_AUTH_USER_KEY, accessKey1.trim());
      setIsAuthorized(true);
      setAdminUser(accessKey1.trim());
      setAuthError("");
      setAccessKey1("");
      setAccessKey2("");
      return;
    }

    setAuthError("Incorrect admin keys. Please try again.");
  };

  const handleCategorySubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!categoryName.trim()) return;
    
    if (editingCategoryId) {
      const { error } = await supabase.from("categories").update({ name: categoryName.trim() }).eq("id", editingCategoryId);
      if (error) {
        setStatusMessage(error.message);
        return;
      }
      setStatusMessage("Category updated successfully.");
      setEditingCategoryId(null);
    } else {
      const { error } = await supabase.from("categories").insert([{ name: categoryName.trim() }]);
      if (error) {
        setStatusMessage(error.message);
        return;
      }
      setStatusMessage("Category added successfully.");
    }
    setCategoryName("");
    fetchData();
  };

  const handleProductSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const name = productForm.name.trim();
    const price = Number(productForm.price);
    const description = productForm.description.trim();
    const categoryId = productForm.category_id ? Number(productForm.category_id) : null;

    if (!name || Number.isNaN(price) || price <= 0 || !description || (!categoryId && categories.length > 0)) {
      setStatusMessage("Please complete all product fields.");
      return;
    }

    const imageFiles = productForm.imageFiles;
    let image_url = "";
    let images: string[] = [];
    let storageFallback = false;

    if (imageFiles && imageFiles.length > 0) {
      const uploads = Array.from(imageFiles).map(async (file) => {
        const path = `${PRODUCT_IMAGES_FOLDER}/${Date.now()}-${file.name}`;
        const { error } = await supabaseStorage.storage.from(PRODUCT_IMAGES_BUCKET).upload(path, file, { cacheControl: "3600", upsert: false });
        if (error) {
          if (error.message?.includes("Bucket not found")) {
            throw new Error("Bucket not found");
          }
          throw error;
        }
        const { data } = supabaseStorage.storage.from(PRODUCT_IMAGES_BUCKET).getPublicUrl(path);
        return data.publicUrl;
      });

      try {
        images = await Promise.all(uploads);
        image_url = images[0] ?? "";
      } catch (error: any) {
        if (error.message?.includes("Bucket not found")) {
          storageFallback = true;
          image_url = "";
          images = [];
        } else {
          setStatusMessage(error.message ?? "Image upload failed.");
          return;
        }
      }
    }

    let error;
    const productPayload: any = {
      name,
      price,
      description,
      image_url,
      images,
    };

    if (categoryId) {
      productPayload.category_id = categoryId;
    }

    if (editingProductId) {
      const updatePayload: any = { ...productPayload };
      if (image_url) {
        updatePayload.image_url = image_url;
        updatePayload.images = images;
      }
      const response = await supabase.from("products").update(updatePayload).eq("id", editingProductId);
      error = response.error;
    } else {
      const response = await supabase.from("products").insert([productPayload]);
      error = response.error;
    }

    if (error) {
      setStatusMessage(error.message);
      return;
    }

    setProductForm({ name: "", price: "", description: "", category_id: "", imageFiles: null });
    setEditingProductId(null);
    setStatusMessage(storageFallback
      ? "Product saved successfully, but image upload is unavailable because the storage bucket was not found."
      : editingProductId
        ? "Product updated successfully."
        : "Product added successfully.");
    fetchData();
  };

  const handleDeleteProduct = async (productId: number) => {
    await supabase.from("products").delete().eq("id", productId);
    fetchData();
  };

  const handleDeleteCategory = async (categoryId: number) => {
    await supabase.from("categories").delete().eq("id", categoryId);
    fetchData();
  };

  const handleOrderStatusUpdate = async (orderId: number, status: string) => {
    await supabase.from("orders").update({ status }).eq("id", orderId);
    fetchData();
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-50">
        <p className="text-slate-600">Verifying admin access...</p>
      </main>
    );
  }

  if (!isAuthorized) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center p-4 text-slate-900 border-t-8 border-emerald-600">
        <section className="w-full max-w-lg">
          <div className="rounded-[3rem] bg-white p-10 md:p-14 premium-shadow border border-slate-100/50 flex flex-col items-center">
            <div className="mb-10 transition-transform hover:scale-110 duration-500">
              <Link href="/">
                <img src="/logo.png" alt="Asali Swad Admin" className="h-24 w-24 rounded-[2rem] object-cover shadow-2xl border-4 border-white" />
              </Link>
            </div>
            
            <div className="text-center mb-10">
               <span className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-600">Secure Entry</span>
               <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900">Admin Portal</h1>
               <p className="mt-3 text-sm font-bold text-slate-400">Exclusive access for spice masters.</p>
            </div>

            <form className="w-full space-y-6" onSubmit={handleAccessSubmit}>
              <div className="space-y-4">
                <div className="group relative">
                  <span className="absolute left-6 top-1/2 -translate-y-1/2 text-[10px] font-black uppercase text-slate-300 group-focus-within:text-emerald-500 transition-colors">Key 1</span>
                  <input
                    type="text"
                    required
                    value={accessKey1}
                    onChange={(event) => setAccessKey1(event.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-2xl border-2 border-slate-50 bg-slate-50 pl-20 pr-6 py-4 text-sm font-bold outline-none transition-all placeholder:text-slate-100 focus:border-emerald-500/20 focus:bg-white focus:ring-4 focus:ring-emerald-500/5"
                  />
                </div>
                <div className="group relative">
                  <span className="absolute left-6 top-1/2 -translate-y-1/2 text-[10px] font-black uppercase text-slate-300 group-focus-within:text-emerald-500 transition-colors">Key 2</span>
                  <input
                    type="password"
                    required
                    value={accessKey2}
                    onChange={(event) => setAccessKey2(event.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-2xl border-2 border-slate-50 bg-slate-50 pl-20 pr-6 py-4 text-sm font-bold outline-none transition-all placeholder:text-slate-100 focus:border-emerald-500/20 focus:bg-white focus:ring-4 focus:ring-emerald-500/5"
                  />
                </div>
              </div>

              {authError ? (
                 <div className="flex items-center gap-3 rounded-2xl bg-rose-50 p-4 border border-rose-100/50">
                    <p className="text-xs font-bold text-rose-700 leading-snug">{authError}</p>
                 </div>
              ) : null}

              <button
                type="submit"
                className="flex h-14 w-full items-center justify-center rounded-2xl bg-emerald-600 text-sm font-black uppercase tracking-widest text-white shadow-xl shadow-emerald-600/30 transition-all hover:bg-emerald-700 active:scale-95"
              >
                Authenticate Access ✨
              </button>

              <div className="pt-4 text-center">
                <Link href="/" className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors">
                   ← Return to Public Store
                </Link>
              </div>
            </form>
          </div>
        </section>
      </main>
    );
  }

  const completedOrders = orders.filter((order) => order.status === "Delivered").length;

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-xl border-b border-slate-100 premium-shadow">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-20 items-center justify-between">
            <div className="flex items-center gap-4">
               {/* Back Button */}
               <button
                 onClick={() => router.back()}
                 className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 text-slate-600 hover:bg-slate-100 transition-all active:scale-90"
                 aria-label="Go Back"
               >
                 <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                 </svg>
               </button>

               <div className="h-10 w-10 rounded-xl bg-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-600/20">
                  <span className="text-white font-black text-xs">AS</span>
               </div>
               <div>
                  <h1 className="text-lg font-black tracking-tight text-slate-900 uppercase">Admin 控制台</h1>
                  <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">{adminUser || 'Internal'}</p>
               </div>
            </div>
            
            <button
              onClick={handleLogout}
              className="group flex items-center gap-2 rounded-xl bg-rose-50 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-rose-600 transition-all hover:bg-rose-600 hover:text-white"
            >
              Sign Out
              <svg className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M17 16l4-4m0 0l-4-4m4 4H7" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Tab Navigation */}
        <div className="mb-10 flex flex-nowrap items-center gap-2 overflow-x-auto pb-4 no-scrollbar">
          {[
            { id: 'dashboard', label: 'Overview', icon: 'M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z' },
            { id: 'products', label: 'Inventory', icon: 'M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4' },
            { id: 'categories', label: 'Shelves', icon: 'M7 7h.01M7 11h.01M7 15h.01M13 7h.01M13 11h.01M13 15h.01M17 7h.01M17 11h.01M17 15h.01' },
            { id: 'orders', label: 'Dispatches', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' }
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-3 whitespace-nowrap rounded-2xl px-6 py-3.5 text-xs font-black uppercase tracking-widest transition-all ${
                tab === t.id
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                  : 'bg-white text-slate-500 hover:bg-slate-100 border border-slate-100'
              }`}
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d={t.icon} />
              </svg>
              {t.label}
            </button>
          ))}
        </div>

        {statusMessage ? (
          <div className="mb-8 flex items-center gap-4 rounded-[2rem] bg-amber-50 p-6 border border-amber-100 shadow-sm animate-in fade-in slide-in-from-top-4">
             <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                <svg className="h-5 w-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
             </div>
             <p className="text-sm font-bold text-amber-900 leading-tight">{statusMessage}</p>
          </div>
        ) : null}

        {tab === "dashboard" ? (
          <div className="space-y-10">
            <div className="bg-white rounded-[3rem] p-8 md:p-12 premium-shadow border border-slate-100 flex flex-col md:flex-row items-center gap-8 justify-between relative overflow-hidden">
                <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-emerald-50 rounded-full blur-3xl opacity-50"></div>
                <div className="relative z-10 text-center md:text-left">
                   <span className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-600">Operations Overview</span>
                   <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-900">Welcome back, Chief.</h2>
                   <p className="mt-2 text-sm font-bold text-slate-400">Everything looks great today! 🌿</p>
                </div>
                <div className="flex gap-4 relative z-10">
                   <div className="h-14 w-14 rounded-2xl bg-slate-50 flex items-center justify-center border border-slate-100">
                      <svg className="h-6 w-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                   </div>
                   <div className="h-14 w-14 rounded-2xl bg-emerald-50 flex items-center justify-center border border-emerald-100">
                      <svg className="h-6 w-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                   </div>
                </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-3">
              {[
                { label: 'Total Products', value: products.length, color: 'emerald', icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
                { label: 'Total Orders', value: orders.length, color: 'indigo', icon: 'M16 11V7a4 4 0 118 0m-3 9v3a2 2 0 01-2 2H5a2 2 0 01-2-2v-3a2 2 0 012-2h10a2 2 0 012 2z' },
                { label: 'Orders Delivered', value: completedOrders, color: 'rose', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' }
              ].map((s) => (
                <div key={s.label} className="group rounded-[2.5rem] bg-white p-8 transition-all hover:scale-[1.02] border border-slate-100 premium-shadow">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-${s.color}-50 transition-colors group-hover:bg-${s.color}-100`}>
                    <svg className={`h-6 w-6 text-${s.color}-600`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d={s.icon} />
                    </svg>
                  </div>
                  <h3 className="mt-6 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">{s.label}</h3>
                  <p className="mt-2 text-4xl font-black tracking-tighter text-slate-900">{s.value}</p>
                </div>
              ))}
            </div>
          </div>
        ) : null}


        {tab === "products" ? (
          <div className="space-y-12">
            <div className="bg-white rounded-[3rem] p-8 md:p-12 border border-slate-100 premium-shadow">
               <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-600">Inventory Management</span>
                    <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-900">{editingProductId ? "Modify Essential Spice" : "Add New Essential Spice"}</h2>
                  </div>
                  {editingProductId && (
                    <button 
                      type="button" 
                      onClick={() => { setEditingProductId(null); setProductForm({ name: "", price: "", description: "", category_id: "", imageFiles: null }); }} 
                      className="px-6 py-3 rounded-xl bg-rose-50 text-rose-600 text-[10px] font-black uppercase tracking-widest hover:bg-rose-100 transition-colors"
                    >
                      Discard Changes
                    </button>
                  )}
               </div>

              <form className="grid gap-6 md:grid-cols-2" onSubmit={handleProductSubmit}>
                <div className="space-y-4">
                  <div className="group relative">
                    <span className="absolute left-6 top-1/2 -translate-y-1/2 text-[10px] font-black uppercase text-slate-300 group-focus-within:text-emerald-500 transition-colors">Name</span>
                    <input
                      value={productForm.name}
                      onChange={(event) => setProductForm((prev) => ({ ...prev, name: event.target.value }))}
                      placeholder="..."
                      className="w-full rounded-2xl border-2 border-slate-50 bg-slate-50 pl-20 pr-6 py-4 text-sm font-bold outline-none transition-all focus:border-emerald-500/20 focus:bg-white focus:ring-4 focus:ring-emerald-500/5"
                    />
                  </div>
                  <div className="group relative">
                    <span className="absolute left-6 top-1/2 -translate-y-1/2 text-[10px] font-black uppercase text-slate-300 group-focus-within:text-emerald-500 transition-colors">Price</span>
                    <input
                      value={productForm.price}
                      onChange={(event) => setProductForm((prev) => ({ ...prev, price: event.target.value }))}
                      placeholder="0.00"
                      type="number"
                      className="w-full rounded-2xl border-2 border-slate-50 bg-slate-50 pl-20 pr-6 py-4 text-sm font-bold outline-none transition-all focus:border-emerald-500/20 focus:bg-white focus:ring-4 focus:ring-emerald-500/5"
                    />
                  </div>
                  <div className="group relative">
                    <span className="absolute left-6 top-1/2 -translate-y-1/2 text-[10px] font-black uppercase text-slate-300 group-focus-within:text-emerald-500 transition-colors">Shelf</span>
                    <select
                      value={productForm.category_id}
                      onChange={(event) => setProductForm((prev) => ({ ...prev, category_id: event.target.value }))}
                      className="w-full rounded-2xl border-2 border-slate-50 bg-slate-50 pl-20 pr-6 py-4 text-sm font-bold outline-none transition-all focus:border-emerald-500/20 focus:bg-white focus:ring-4 focus:ring-emerald-500/5 appearance-none"
                    >
                      <option value="">Select Shelf</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>{category.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-4 text-slate-950">
                  <textarea
                    value={productForm.description}
                    onChange={(event) => setProductForm((prev) => ({ ...prev, description: event.target.value }))}
                    placeholder="Tell the story of this spice..."
                    className="w-full h-[10.5rem] rounded-2xl border-2 border-slate-50 bg-slate-50 px-6 py-5 text-sm font-bold outline-none transition-all focus:border-emerald-500/20 focus:bg-white focus:ring-4 focus:ring-emerald-500/5 resize-none"
                  />
                  <div className="grid grid-cols-1 gap-4">
                     <div className="relative group">
                        <input
                          type="file"
                          id="product-images"
                          multiple
                          onChange={(event) => setProductForm((prev) => ({ ...prev, imageFiles: event.target.files }))}
                          className="hidden"
                        />
                        <label 
                          htmlFor="product-images"
                          className="flex items-center gap-4 w-full rounded-2xl border-2 border-dashed border-slate-200 bg-white px-6 py-4 cursor-pointer transition-all group-hover:border-emerald-500 group-hover:bg-emerald-50/30"
                        >
                           <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100 group-hover:bg-white transition-colors text-slate-950">
                              <svg className="h-5 w-5 text-slate-400 group-hover:text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                              </svg>
                           </div>
                           <div>
                              <p className="text-[10px] font-black uppercase tracking-widest text-slate-900 leading-tight">
                                 {productForm.imageFiles ? `${productForm.imageFiles.length} files selected` : "Upload Product Images"}
                              </p>
                              <p className="text-[9px] font-bold text-slate-400 mt-0.5">JPG, PNG up to 5MB</p>
                           </div>
                        </label>
                     </div>
                  </div>
                </div>

                <div className="md:col-span-2 pt-4">
                  <button className="flex h-16 w-full items-center justify-center rounded-2xl bg-slate-900 text-xs font-black uppercase tracking-[0.2em] text-white shadow-xl shadow-slate-900/20 transition-all hover:bg-emerald-600 hover:shadow-emerald-600/30 active:scale-95">
                    {editingProductId ? "Seal Updates ✨" : "Launch Product 🚀"}
                  </button>
                </div>
              </form>
            </div>

            <div className="bg-white rounded-[3rem] p-8 md:p-12 border border-slate-100 premium-shadow">
               <div className="flex items-center justify-between mb-10">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-600">Vault Inventory</span>
                    <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-900">Total Selection ({products.length})</h2>
                  </div>
               </div>
               
               <div className="grid gap-6">
                {products.map((product) => (
                  <div key={product.id} className="group relative flex flex-col md:flex-row items-center gap-6 p-6 rounded-[2.5rem] border border-slate-100 bg-white transition-all hover:bg-slate-50/50 hover:shadow-xl hover:shadow-slate-900/5">
                    <div className="h-24 w-24 rounded-2xl bg-slate-100 overflow-hidden border border-slate-100 flex-shrink-0">
                       {product.image_url ? (
                          <img src={product.image_url} alt={product.name} className="h-full w-full object-cover transition-transform group-hover:scale-110 duration-700" title={product.name}/>
                       ) : (
                          <div className="h-full w-full flex items-center justify-center text-slate-300">
                             <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                             </svg>
                          </div>
                       )}
                    </div>
                    
                    <div className="flex-1 text-center md:text-left">
                       <div className="flex flex-col md:flex-row md:items-center gap-2 mb-2">
                          <h3 className="text-lg font-black tracking-tight text-slate-900">
                             {product.name}
                          </h3>
                          <span className="inline-flex px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[9px] font-black uppercase tracking-widest w-fit mx-auto md:mx-0">
                             {categories.find(c => c.id === product.category_id)?.name || 'Uncategorized'}
                          </span>
                       </div>
                       <p className="text-2xl font-black tracking-tighter text-emerald-600">₹{product.price}</p>
                    </div>
                    
                    <div className="flex gap-3">
                       <button
                        type="button"
                        onClick={() => {
                          setEditingProductId(product.id);
                          setProductForm({
                            name: product.name,
                            price: String(product.price),
                            description: product.description,
                            category_id: String(product.category_id),
                            imageFiles: null
                          });
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className="h-14 px-8 rounded-2xl bg-slate-50 border border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-600 transition-all hover:bg-emerald-600 hover:text-white hover:border-emerald-600"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteProduct(product.id)}
                        className="h-14 w-14 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center transition-all hover:bg-rose-600 group/del"
                      >
                         <svg className="h-5 w-5 text-rose-600 group-hover/del:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                         </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : null}


        {tab === "categories" ? (
          <div className="space-y-12">
            <div className="bg-white rounded-[3rem] p-8 md:p-12 border border-slate-100 premium-shadow">
               <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-600">Shelving & Organization</span>
                    <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-900">{editingCategoryId ? "Rename Spice Category" : "Establish New Category"}</h2>
                  </div>
                  {editingCategoryId && (
                    <button 
                      type="button" 
                      onClick={() => { setEditingCategoryId(null); setCategoryName(""); }} 
                      className="px-6 py-3 rounded-xl bg-rose-50 text-rose-600 text-[10px] font-black uppercase tracking-widest hover:bg-rose-100 transition-colors"
                    >
                      Discard Changes
                    </button>
                  )}
               </div>

              <form className="grid gap-6 md:grid-cols-[1fr_auto]" onSubmit={handleCategorySubmit}>
                <div className="group relative">
                  <span className="absolute left-6 top-1/2 -translate-y-1/2 text-[10px] font-black uppercase text-slate-300 group-focus-within:text-emerald-500 transition-colors">Namespace</span>
                  <input
                    value={categoryName}
                    onChange={(event) => setCategoryName(event.target.value)}
                    placeholder="e.g. Rare Blends"
                    required
                    className="w-full rounded-2xl border-2 border-slate-50 bg-slate-50 pl-24 pr-6 py-4 text-sm font-bold outline-none transition-all focus:border-emerald-500/20 focus:bg-white focus:ring-4 focus:ring-emerald-500/5"
                  />
                </div>
                <button className="flex h-14 md:h-auto items-center justify-center rounded-2xl bg-slate-900 px-10 text-[10px] font-black uppercase tracking-[0.3em] text-white shadow-xl shadow-slate-900/10 transition-all hover:bg-emerald-600 active:scale-95">
                  {editingCategoryId ? "Update Shelf ✨" : "Create Shelf 🛠️"}
                </button>
              </form>
            </div>

            <div className="bg-white rounded-[3rem] p-8 md:p-12 border border-slate-100 premium-shadow">
               <div className="flex items-center justify-between mb-10">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-600">Spice Taxonomy</span>
                    <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-900">Current Shelves ({categories.length})</h2>
                  </div>
               </div>
               
               <div className="grid gap-4">
                {categories.map((category) => (
                  <div key={category.id} className="group relative flex items-center justify-between p-6 rounded-[2rem] border border-slate-100 bg-white transition-all hover:bg-slate-50/50 hover:shadow-xl hover:shadow-slate-900/5">
                    <div className="flex items-center gap-6">
                       <div className="h-12 w-12 rounded-xl bg-emerald-50 flex items-center justify-center border border-emerald-100">
                          <svg className="h-5 w-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                          </svg>
                       </div>
                       <div>
                          <p className="text-lg font-black tracking-tight text-slate-900">{category.name}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{products.filter(p => p.category_id === category.id).length} Products Assigned</p>
                       </div>
                    </div>
                    
                    <div className="flex gap-2">
                       <button
                        type="button"
                        onClick={() => {
                          setEditingCategoryId(category.id);
                          setCategoryName(category.name);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className="h-12 px-6 rounded-xl bg-slate-50 border border-slate-100 text-[9px] font-black uppercase tracking-widest text-slate-600 transition-all hover:bg-emerald-600 hover:text-white hover:border-emerald-600"
                      >
                        Rename
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteCategory(category.id)}
                        className="h-12 w-12 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center transition-all hover:bg-rose-600 group/del"
                      >
                         <svg className="h-4 w-4 text-rose-600 group-hover/del:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                         </svg>
                      </button>
                    </div>
                  </div>
                ))}
                {categories.length === 0 && (
                  <div className="text-center py-20 bg-slate-50 rounded-[2.5rem] border border-dashed border-slate-200">
                     <p className="text-sm font-bold text-slate-400">Vault is empty. Create your first shelf.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : null}


        {tab === "orders" ? (
          <div className="space-y-12">
            <div className="bg-white rounded-[3rem] p-8 md:p-12 border border-slate-100 premium-shadow">
               <div className="flex items-center justify-between mb-10">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-600">Dispatch Center</span>
                    <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-900">Recent Customer Orders ({orders.length})</h2>
                  </div>
               </div>
               
               <div className="grid gap-8">
                {orders.map((order) => (
                  <div key={order.id} className="group relative flex flex-col p-8 rounded-[3rem] border border-slate-100 bg-white transition-all hover:bg-slate-50/50 hover:shadow-2xl hover:shadow-slate-900/5">
                    <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-8 pb-8 border-b border-slate-100">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                           <div className="h-10 w-10 rounded-full bg-slate-900 flex items-center justify-center text-white text-[10px] font-black">
                              {order.customer_name.charAt(0).toUpperCase()}
                           </div>
                           <h3 className="text-xl font-black tracking-tight text-slate-900">{order.customer_name}</h3>
                        </div>
                        <div className="flex flex-wrap gap-4 text-xs font-bold text-slate-400">
                           <span className="flex items-center gap-1.5">
                              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.948V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                              {order.phone}
                           </span>
                           <span className="flex items-center gap-1.5">
                              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                              {new Date(order.created_at).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
                           </span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-3">
                         <div className="flex flex-wrap justify-end gap-2">
                            <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-sm ${
                              order.payment_method === 'COD' 
                                ? 'bg-amber-100 text-amber-700 border border-amber-200' 
                                : 'bg-blue-100 text-blue-700 border border-blue-200'
                            }`}>
                              Method: {order.payment_method || 'N/A'}
                            </span>
                            <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-sm ${
                              order.payment_status === 'COMPLETE' 
                                ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' 
                                : 'bg-rose-50 text-rose-600 border border-rose-100'
                            }`}>
                              Payment: {order.payment_status || 'PENDING'}
                            </span>
                            <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-sm ${
                              order.status === 'Delivered' 
                                ? 'bg-slate-900 text-white' 
                                : 'bg-amber-50 text-amber-600 border border-amber-100'
                            }`}>
                              Order: {order.status || 'PENDING'}
                            </span>
                         </div>
                         <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Order ID: #{order.id} | Razorpay: {order.razorpay_order_id?.slice(-8) || 'N/A'}</p>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-[1fr_auto] gap-8">
                       <div className="space-y-6">
                          <div>
                             <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Delivery Address</p>
                             <p className="text-sm font-bold text-slate-600 leading-relaxed bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                                {order.address}
                             </p>
                          </div>
                          <div>
                             <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Manifest Details</p>
                             <div className="bg-slate-900 rounded-[2rem] p-6 text-slate-300 shadow-xl shadow-slate-900/10 whitespace-pre-wrap text-sm leading-relaxed font-mono">
                                {order.product_details}
                             </div>
                          </div>
                       </div>

                       <div className="flex md:flex-col gap-3 justify-center">
                          <button
                            type="button"
                            onClick={() => {
                              alert("Initiating Shiprocket Shipment for Order #" + order.id);
                              // Logic for Shiprocket API call would go here
                              handleOrderStatusUpdate(order.id, "Shipped");
                            }}
                            disabled={order.status === 'Shipped' || order.status === 'Delivered'}
                            className={`h-14 px-8 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 disabled:opacity-30 disabled:grayscale`}
                          >
                            Create Shipment (Shiprocket) 🚚
                          </button>
                          
                          {order.payment_method === 'COD' && order.payment_status === 'PENDING' && (
                            <button
                              type="button"
                              onClick={async () => {
                                await supabase.from("orders").update({ payment_status: "COMPLETE" }).eq("id", order.id);
                                fetchData();
                                setStatusMessage("Payment marked as RECEIVED for Order #" + order.id);
                              }}
                              className="h-14 px-8 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all bg-amber-500 text-white shadow-lg shadow-amber-600/20 hover:bg-amber-600"
                            >
                              Confirm Cash Received 💸
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => handleOrderStatusUpdate(order.id, "Delivered")}
                            disabled={order.status === 'Delivered'}
                            className={`h-14 px-8 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                               order.status === 'Delivered' 
                                 ? 'bg-emerald-600 text-white' 
                                 : 'bg-emerald-50 text-emerald-600 border border-emerald-200 hover:bg-emerald-600 hover:text-white'
                            }`}
                          >
                            {order.status === 'Delivered' ? 'Delivered ✅' : 'Mark Delivered ✅'}
                          </button>
                       </div>
                    </div>
                  </div>
                ))}
                {orders.length === 0 && (
                  <div className="text-center py-40 bg-slate-50 rounded-[3rem] border border-dashed border-slate-200">
                     <p className="text-sm font-bold text-slate-400">No active dispatches. Operations are idle.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : null}


      </section>
    </main>
  );
}

