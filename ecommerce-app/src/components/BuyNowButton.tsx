"use client";

import { useCart } from "@/context/CartContext";
import { Product } from "@/lib/types";
import { useRouter } from "next/navigation";

export function BuyNowButton({ product }: { product: Product }) {
  const { cart, addToCart } = useCart();
  const router = useRouter();
  
  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Check if item is already in cart
    const cartItem = cart.find(item => item.id === product.id);
    if (!cartItem) {
      addToCart(product, 1);
    }
    
    router.push("/checkout");
  };

  return (
    <button
      type="button"
      onClick={handleBuyNow}
      className="flex h-11 w-full items-center justify-center rounded-xl bg-slate-900 text-[10px] font-black uppercase tracking-[0.2em] text-white shadow-xl shadow-slate-900/10 transition-all hover:bg-emerald-600 hover:shadow-emerald-600/30 active:scale-95"
    >
      Buy Now 🛒
    </button>
  );
}
