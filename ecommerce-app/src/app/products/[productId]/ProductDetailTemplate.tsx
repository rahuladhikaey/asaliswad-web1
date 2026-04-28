"use client";

import { useState } from "react";
import { Product } from "@/lib/types";
import { AddToCartButton } from "@/components/AddToCartButton";
import { BuyNowButton } from "@/components/BuyNowButton";
import { WishlistButton } from "@/components/WishlistButton";
import { ShieldCheck, Truck, RefreshCcw, Tag, ChevronRight, Star } from "lucide-react";
import Link from "next/link";

export default function ProductDetailTemplate({ 
  product, 
  relatedProducts = [] 
}: { 
  product: Product, 
  relatedProducts?: Product[] 
}) {
  const images = product.images || [product.image_url];

  const hasDiscount = product.mrp && product.mrp > product.price;
  const discountPercent = hasDiscount ? Math.round(((product.mrp! - product.price) / product.mrp!) * 100) : 0;


  return (
    <div className="bg-white">
      <div className="mx-auto max-w-[1440px] px-4 py-8 md:px-8 lg:py-12">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:items-start">

          {/* LEFT COLUMN: Premium Side-by-Side Gallery */}
          <div className="lg:col-span-7 lg:sticky lg:top-24">
            <div className="flex flex-col gap-6">
              {/* Product Gallery Grid */}
              <div className={`grid gap-4 ${images.length > 1 ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1"}`}>
                {images.map((img, idx) => (
                  <div 
                    key={idx} 
                    className={`relative overflow-hidden rounded-[3rem] border border-slate-100 bg-white p-8 group transition-all duration-700 hover:shadow-2xl hover:shadow-slate-200/50 ${
                      images.length === 1 ? "aspect-square" : "aspect-[4/5]"
                    }`}
                  >
                    <img
                      src={img}
                      alt={`${product.name} - View 0${idx + 1}`}
                      className="h-full w-full object-contain transition-transform duration-700 group-hover:scale-110"
                    />
                    
                    {/* Wishlist on first image */}
                    {idx === 0 && (
                      <div className="absolute right-8 top-8 z-10">
                        <WishlistButton product={product} />
                      </div>
                    )}
                    
                    {/* View Badge */}
                    <div className="absolute bottom-8 left-8 flex h-9 items-center rounded-2xl bg-white/40 border border-white/50 px-4 backdrop-blur-xl shadow-sm">
                       <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-900/60">Angle View 0{idx + 1}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Action Buttons - Desktop (Flipkart Colors) */}
              <div className="hidden lg:grid grid-cols-2 gap-4 mt-2">
                <AddToCartButton 
                  product={product} 
                  className="flex h-16 items-center justify-center gap-3 rounded-2xl bg-[#ff9f00] text-sm font-black uppercase tracking-widest text-white shadow-xl shadow-orange-500/20 transition-all hover:bg-orange-600 active:scale-95"
                />
                <div className="w-full">
                   <BuyNowButton 
                     product={product} 
                     className="flex h-16 w-full items-center justify-center gap-3 rounded-2xl bg-[#fb641b] text-sm font-black uppercase tracking-widest text-white shadow-xl shadow-orange-600/20 transition-all hover:bg-orange-700 active:scale-95"
                   />
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Product Info */}
          <div className="lg:col-span-5 space-y-10">
            {/* Breadcrumbs */}
            <nav className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
              <span>Home</span> <ChevronRight size={12} />
              <span>{product.category_name || "Products"}</span> <ChevronRight size={12} />
              <span className="text-slate-900 truncate text-[10px] sm:text-xs">{product.name}</span>
            </nav>

            <div className="space-y-4">
              <h1 className="text-2xl font-bold text-slate-900 md:text-3xl leading-tight">
                {product.name}
              </h1>
            </div>


            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <span className="text-4xl font-black text-slate-900">₹{product.price}</span>
                {hasDiscount && (
                  <>
                    <span className="text-lg font-bold text-slate-400 line-through">₹{product.mrp}</span>
                    <span className="text-lg font-black text-[#388e3c]">{discountPercent}% off</span>
                  </>
                )}
              </div>
              <p className="text-xs font-bold text-[#388e3c]">Special Price including all taxes</p>
            </div>


            {/* Available Offers */}
            {product.offers && product.offers.length > 0 && (
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <h3 className="text-base font-black text-slate-900">Available Offers</h3>
                <div className="space-y-3">
                  {product.offers.map((offer, i) => (
                    <div key={i} className="flex gap-3 text-sm font-medium text-slate-600">
                      <Tag className="shrink-0 text-[#388e3c] mt-0.5" size={16} />
                      <span>{offer} <span className="text-[#2874f0] font-black cursor-pointer ml-1 text-xs">T&C</span></span>
                    </div>
                  ))}
                </div>
              </div>
            )}


            {/* Description & Highlights */}
            <div className="grid gap-8 md:grid-cols-2 pt-4 border-t border-slate-100">

              <div className="space-y-4">
                <h3 className="text-base font-black text-slate-900 border-b border-slate-100 pb-2">Product Description</h3>
                <p className="text-sm font-medium leading-relaxed text-slate-600">{product.description}</p>
              </div>
              <div className="space-y-4">
                <h3 className="text-base font-black text-slate-900 border-b border-slate-100 pb-2">Highlights</h3>
                <ul className="space-y-2 list-disc list-inside text-sm font-medium text-slate-600">
                  <li>Original & Pure Quality</li>
                  <li>Directly from Sources</li>
                  <li>Premium Packaging</li>
                  <li>Best for Daily Use</li>
                </ul>
              </div>
            </div>

            {/* Seller Info */}
            <div className="p-6 rounded-2xl bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-white flex items-center justify-center border border-slate-200">
                  <ShieldCheck className="text-[#2874f0]" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-900">Asali Swad Store</h4>
                  <p className="text-xs font-bold text-slate-400">24Hr. Return Policy</p>
                </div>
              </div>
              <button className="text-[#2874f0] text-sm font-black hover:underline">View Retailer</button>
            </div>




            {/* Features (Bottom Icons) */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-12">
              <div className="flex flex-col items-center text-center p-4">
                <Truck className="mb-4 text-[#2874f0]" size={32} />
                <span className="text-xs font-black text-slate-900 uppercase">Fast Delivery</span>
              </div>
              <div className="flex flex-col items-center text-center p-4">
                <ShieldCheck className="mb-4 text-[#2874f0]" size={32} />
                <span className="text-xs font-black text-slate-900 uppercase">Secure Pay</span>
              </div>
              <div className="flex flex-col items-center text-center p-4">
                <RefreshCcw className="mb-4 text-[#2874f0]" size={32} />
                <span className="text-xs font-black text-slate-900 uppercase">Easy Returns</span>
              </div>
              <div className="flex flex-col items-center text-center p-4">
                <Tag className="mb-4 text-[#2874f0]" size={32} />
                <span className="text-xs font-black text-slate-900 uppercase">Original Item</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1440px] px-4 md:px-8">
        {/* RELATED PRODUCTS SECTION */}
        {relatedProducts.length > 0 && (
          <div className="mt-20 border-t border-slate-100 pt-16">
            <div className="flex items-center justify-between mb-8">
              <div>
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#388e3c]">Suggestions</span>
                <h2 className="text-2xl font-black text-slate-900 mt-1">You Might Also Like</h2>
              </div>
              <Link href="/products" className="text-sm font-black text-[#2874f0] hover:underline">View All Products</Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
              {relatedProducts.map((p) => (
                <Link 
                  key={p.id} 
                  href={`/products/${p.id}`}
                  className="group flex flex-col rounded-3xl bg-white p-3 transition-all hover:shadow-xl border border-transparent hover:border-slate-100"
                >
                  <div className="aspect-square w-full overflow-hidden rounded-2xl bg-slate-50 p-3 mb-4">
                    <img 
                      src={p.images?.[0] || p.image_url} 
                      alt={p.name} 
                      className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>
                  <div className="flex-1 space-y-2">
                    <h3 className="text-sm font-bold text-slate-800 line-clamp-1 group-hover:text-[#2874f0] transition-colors">{p.name}</h3>
                    <div className="flex items-center gap-1.5">
                      <div className="flex h-5 items-center gap-0.5 rounded-md bg-[#388e3c] px-1.5 text-[10px] font-bold text-white">
                        <span>4.4</span>
                        <Star size={8} fill="currentColor" />
                      </div>
                      <span className="text-[10px] font-bold text-slate-400">(234)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-black text-slate-900">₹{p.price}</span>
                      {p.mrp && p.mrp > p.price && (
                        <span className="text-[10px] font-bold text-slate-400 line-through">₹{p.mrp}</span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* STICKY BOTTOM BAR FOR MOBILE */}
      <div className="fixed bottom-0 left-0 right-0 z-[60] flex h-16 w-full items-center bg-white border-t border-slate-100 lg:hidden shadow-[0_-8px_30px_rgb(0,0,0,0.08)]">
        <div className="grid grid-cols-2 h-full w-full">
          <AddToCartButton 
            product={product} 
            className="flex items-center justify-center bg-[#ff9f00] text-white text-[10px] font-black uppercase tracking-widest hover:bg-[#f39700] transition-colors border-r border-white/10"
          />
          <BuyNowButton 
            product={product} 
            className="flex items-center justify-center bg-[#fb641b] text-white text-[10px] font-black uppercase tracking-widest hover:bg-[#e65a16] transition-colors"
          />
        </div>
      </div>
      
      {/* Padding for bottom bar on mobile */}
      <div className="h-20 lg:hidden" />
    </div>

  );
}
