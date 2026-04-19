"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useState } from "react";
import { CartHeaderLink } from "./CartHeaderLink";
import UserMenu from "./UserMenu";
import { MobileDrawer } from "./MobileDrawer";

type HeaderProps = {
  title?: string;
  subtitle?: string;
};

export function Header({ 
  title = "Premium Taste", 
  subtitle = "Direct to your Door 📍" 
}: HeaderProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");
  const isHome = pathname === "/";

  return (
    <>
      <header className="sticky top-0 z-50 flex items-center justify-between border-b border-slate-200/60 bg-white/80 px-4 py-3 backdrop-blur-xl md:px-8">
        {/* Left Side: Back Button, Logo & Labels */}
        <div className="flex items-center gap-3 md:gap-4">
          {!isHome && (
            <button
              onClick={() => router.back()}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-50 text-slate-600 hover:bg-slate-100 transition-all active:scale-90"
              aria-label="Go Back"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}
          
          <Link href="/" className="flex items-center justify-center transition-transform hover:scale-105">
            <img 
              src="/logo.png" 
              alt="Asali Swad Logo" 
              className="h-10 w-10 md:h-12 md:w-12 rounded-xl object-cover shadow-md border border-slate-100" 
            />
          </Link>
          <div className="flex flex-col overflow-hidden max-w-[150px] md:max-w-none">
            {isAdmin ? (
               <>
                <span className="text-[10px] md:text-sm font-black uppercase tracking-widest text-emerald-600">Admin</span>
                <span className="text-[10px] items-center md:flex font-bold text-slate-800">Panel控制台</span>
              </>
            ) : (
              <>
                <span className="text-[10px] md:text-xs font-black uppercase tracking-widest text-emerald-600 truncate">
                  ASALI
                </span>
                <span className="text-[9px] md:text-[10px] font-bold text-slate-400 -mt-0.5">
                  SWAD
                </span>
              </>
            )}
          </div>
        </div>

        {/* Desktop Navigation Links (Large Screens) */}
        <nav className="hidden xl:flex items-center gap-8">
          {[
            { name: "Home", href: "/" },
            { name: "Shop Spices", href: "/products" },
            { name: "AI Assistant", href: "/assistant" },
          ].map((link) => (
            <Link 
              key={link.name} 
              href={link.href}
              className="text-xs font-black uppercase tracking-widest text-slate-500 hover:text-emerald-600 transition-colors"
            >
              {link.name}
            </Link>
          ))}
        </nav>


        {/* Global Search Bar (Desktop) */}
        <div className="hidden lg:flex flex-1 max-w-md mx-8">
           <div className="relative w-full group">
              <input 
                type="text"
                placeholder="Search premium spices..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    router.push(`/products?search=${(e.target as HTMLInputElement).value}`);
                  }
                }}
                className="w-full bg-slate-50 border border-slate-100 rounded-xl py-2.5 pl-10 pr-4 text-sm font-bold placeholder:text-slate-300 outline-none focus:bg-white focus:border-emerald-500/30 focus:ring-4 focus:ring-emerald-500/5 transition-all"
              />
              <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 group-focus-within:text-emerald-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
           </div>
        </div>

        {/* Right Side: Actions & Drawer Trigger */}
        <div className="flex items-center gap-1.5 md:gap-4 shrink-0">
          {/* Hamburger Menu - Tablet & Phone only (Moved to front for better index) */}
          <button
            onClick={() => setIsDrawerOpen(true)}
            className="flex lg:hidden h-10 w-10 items-center justify-center rounded-xl bg-slate-50 text-slate-600 active:bg-slate-100 transition-all"
            aria-label="Toggle Menu"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <UserMenu />
          <CartHeaderLink />
        </div>

      </header>


      {/* Mobile Drawer */}
      <MobileDrawer 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)} 
      />
    </>
  );
}
