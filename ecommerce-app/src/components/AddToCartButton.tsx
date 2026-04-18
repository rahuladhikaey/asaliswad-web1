"use client";

import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { Product } from "@/lib/types";

export function AddToCartButton({ product, className }: { product: Product; className?: string }) {
  const { cart, addToCart, updateQuantity, removeFromCart } = useCart();
  const router = useRouter();
  
  const cartItem = cart.find(item => item.id === product.id);
  const quantity = cartItem?.quantity || 0;

  const handleBuyNow = () => {
    // Check if item is already in cart
    const cartItem = cart.find(item => item.id === product.id);
    if (!cartItem) {
      addToCart(product, 1);
    }
    
    router.push("/checkout");
  };

  if (quantity > 0) {
    return (
      <div 
        className={className ? className.replace("bg-green-600", "bg-emerald-600").replace("text-white", "text-white") + " p-0 overflow-hidden" : "flex h-11 w-24 items-center justify-between rounded-xl border border-emerald-600 bg-emerald-600 text-sm font-bold text-white shadow-lg shadow-emerald-600/20 overflow-hidden transition-all active:scale-95"}
      >
        <button
          onClick={() => quantity === 1 ? removeFromCart(product.id) : updateQuantity(product.id, quantity - 1)}
          className="flex h-full flex-1 items-center justify-center bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white transition-colors"
        >
          <span className="text-lg">-</span>
        </button>
        <span className="flex h-full flex-1 items-center justify-center bg-emerald-600 text-white text-sm font-bold animate-in zoom-in-50 duration-200">
          {quantity}
        </span>
        <button
          onClick={() => updateQuantity(product.id, quantity + 1)}
          className="flex h-full flex-1 items-center justify-center bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white transition-colors"
        >
          <span className="text-lg">+</span>
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => addToCart(product, 1)}
      className={className || "flex h-11 w-24 items-center justify-center rounded-xl border-2 border-emerald-600 bg-emerald-50/50 text-sm font-bold uppercase text-emerald-700 shadow-sm transition-all hover:bg-emerald-600 hover:text-white active:scale-95"}
    >
      ADD
    </button>
  );

}

