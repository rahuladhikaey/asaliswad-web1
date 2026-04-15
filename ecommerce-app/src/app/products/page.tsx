"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { encodeWhatsAppMessage, buildProductOrderMessage } from "@/lib/whatsapp";
import { Product, Category } from "@/lib/types";
import { LoadingCard } from "@/components/LoadingCard";
import { AddToCartButton } from "@/components/AddToCartButton";
import { BuyNowButton } from "@/components/BuyNowButton";
import { Header } from "@/components/Header";
import UserMenu from "@/components/UserMenu";

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const [{ data: productsData }, { data: categoriesData }] = await Promise.all([
        supabase.from("products").select("*").order("id", { ascending: false }),
        supabase.from("categories").select("*").order("name", { ascending: true }),
      ]);
      setProducts((productsData ?? []) as Product[]);
      setCategories((categoriesData ?? []) as Category[]);
      setLoading(false);
    };
    load();
  }, []);

  const filtered = useMemo(() => {
    return products.filter((product) => {
      const matchesCategory = selectedCategory ? product.category_id === selectedCategory : true;
      const matchesSearch = product.name.toLowerCase().includes(search.toLowerCase()) || product.description.toLowerCase().includes(search.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [products, selectedCategory, search]);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      <Header title="Browse Catalog" subtitle="Quality Selection" />

      <section className="mx-auto max-w-7xl px-4 py-6 md:py-10 md:px-8">
        {/* Search & Filter Top Bar */}
        <div className="mb-8 rounded-[2rem] bg-white p-6 md:p-8 premium-shadow border border-slate-100">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-md">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-600">Marketplace</span>
              <h1 className="mt-1 text-2xl font-black text-slate-900 md:text-3xl">Find Premium Spices.</h1>
            </div>
            
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center w-full lg:max-w-md">
              <div className="relative flex-1">
                <svg className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search spices, products..."
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3.5 pl-11 pr-5 text-sm font-semibold outline-none transition-all focus:border-emerald-500 focus:bg-white focus:shadow-lg focus:shadow-emerald-500/5"
                />
              </div>
            </div>
          </div>

          {/* Horizontally Scrollable Category Pills */}
          <div className="no-scrollbar mt-8 flex w-full gap-2 overflow-x-auto pb-2">
            <button
              type="button"
              onClick={() => setSelectedCategory(null)}
              className={`whitespace-nowrap rounded-full px-5 py-2 text-xs font-black uppercase tracking-wider transition-all shadow-sm ${selectedCategory === null ? "bg-emerald-600 text-white shadow-emerald-600/20" : "bg-slate-100 text-slate-500 hover:bg-slate-200"}`}
            >
              All items
            </button>
            {categories.map((category) => (
              <button
                type="button"
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`whitespace-nowrap rounded-full px-5 py-2 text-xs font-black uppercase tracking-wider transition-all shadow-sm ${selectedCategory === category.id ? "bg-emerald-600 text-white shadow-emerald-600/20" : "bg-slate-100 text-slate-500 hover:bg-slate-200"}`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* Product Grid - 2 Column Mobile */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 lg:gap-6">
          {loading
            ? Array.from({ length: 10 }).map((_, index) => <LoadingCard key={index} />)
            : filtered.map((product) => (
                <article key={product.id} className="group relative flex flex-col overflow-hidden rounded-[2rem] bg-white premium-shadow transition-all hover:-translate-y-1 hover:shadow-2xl hover:shadow-emerald-500/10 border border-slate-100/50">
                  {/* Image Holder */}
                  <Link href={`/products/${product.id}`} className="relative aspect-square w-full overflow-hidden bg-slate-50 p-4">
                    <img
                      src={product.images?.[0] || product.image_url}
                      alt={product.name}
                      className="h-full w-full object-contain transition duration-500 group-hover:scale-110"
                    />
                  </Link>
                  
                  {/* Content */}
                  <div className="flex flex-1 flex-col p-4 pt-5">
                    <div className="mb-auto">
                       <h3 className="line-clamp-2 text-sm font-bold leading-tight text-slate-800 group-hover:text-emerald-600 transition-colors">
                          {product.name}
                       </h3>
                       <p className="mt-1 line-clamp-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          {product.description || "Asali Swad Choice"}
                       </p>
                    </div>
                    
                    <div className="mt-6 flex items-center justify-between gap-2">
                       <div className="flex flex-col">
                          <span className="text-base font-black text-slate-900">₹{product.price}</span>
                          <span className="text-[10px] font-bold text-emerald-600">IN STOCK</span>
                       </div>
                       <AddToCartButton product={product} />
                    </div>

                    <div className="mt-4 border-t border-slate-50 pt-4">
                      <BuyNowButton product={product} />
                    </div>
                  </div>
                </article>
              ))}
        </div>

        {!loading && filtered.length === 0 && (
          <div className="mt-20 text-center">
             <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-slate-100 text-3xl">🔍</div>
             <h3 className="mt-4 text-xl font-black text-slate-900">No products found</h3>
             <p className="mt-2 text-slate-500">Try adjusting your search or category filters.</p>
             <button onClick={() => { setSearch(""); setSelectedCategory(null); }} className="mt-6 font-bold text-emerald-600 underline">Clear all filters</button>
          </div>
        )}
      </section>
    </main>
  );
}

