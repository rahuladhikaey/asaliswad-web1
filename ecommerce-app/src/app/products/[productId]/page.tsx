import Link from "next/link";
import { supabaseServer } from "@/lib/supabaseServer";
import { buildProductOrderMessage, encodeWhatsAppMessage } from "@/lib/whatsapp";
import { Product } from "@/lib/types";
import { AddToCartButton } from "@/components/AddToCartButton";
import { BuyNowButton } from "@/components/BuyNowButton";
import { Header } from "@/components/Header";
import UserMenu from "@/components/UserMenu";

type PageProps = {
  params: { productId: string };
};

const getProduct = async (productId: string) => {
  const { data, error } = await supabaseServer
    .from("products")
    .select("*")
    .eq("id", Number(productId))
    .single();

  if (error || !data) {
    return null;
  }

  return data as Product;
};

export default async function ProductDetailPage({ params }: PageProps) {
  const product = await getProduct(params.productId);

  if (!product) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full rounded-[2.5rem] bg-white p-10 text-center premium-shadow">
          <div className="mx-auto h-20 w-20 flex items-center justify-center rounded-full bg-slate-100 text-3xl mb-6">🚫</div>
          <h1 className="text-2xl font-black text-slate-900">Product not found</h1>
          <p className="mt-3 text-slate-500 font-medium">This product might have been moved or removed.</p>
          <Link href="/products" className="mt-8 inline-flex w-full items-center justify-center rounded-2xl bg-emerald-600 px-6 py-4 text-sm font-black uppercase tracking-widest text-white shadow-xl shadow-emerald-600/20 transition hover:bg-emerald-700 active:scale-95">
            Back to store
          </Link>
        </div>
      </main>
    );
  }

  const orderLink = encodeWhatsAppMessage(buildProductOrderMessage(product.name, product.price, 1));

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 pb-20 overflow-x-hidden">
      <Header title="Product Details" subtitle="Quality Check" />

      <section className="mx-auto max-w-6xl px-4 py-6 md:py-12 md:px-8">
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Image Gallery Column */}
          <div className="space-y-6">
            <div className="overflow-hidden rounded-[2.5rem] bg-white p-4 premium-shadow border border-slate-100">
              <img
                src={product.images?.[0] || product.image_url}
                alt={product.name}
                className="aspect-square w-full rounded-[1.75rem] object-contain transition-transform hover:scale-105 duration-700"
              />
            </div>
            
            {product.images && product.images.length > 1 && (
              <div className="grid grid-cols-3 gap-4">
                {product.images.slice(1).map((src, idx) => (
                  <div key={idx} className="overflow-hidden rounded-[1.5rem] bg-white p-2 premium-shadow border border-slate-100">
                    <img src={src} alt={`${product.name} ${idx + 2}`} className="aspect-square w-full rounded-[1rem] object-contain" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Product Info Column */}
          <div className="flex flex-col gap-8">
            <div className="rounded-[2.5rem] bg-white p-8 md:p-10 premium-shadow border border-slate-100">
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-600">Premium Choice</span>
              <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900 md:text-5xl">{product.name}</h1>
              <div className="mt-4 flex items-baseline gap-3">
                <span className="text-3xl font-black text-emerald-600">₹{product.price}</span>
                <span className="text-sm font-bold text-slate-300 line-through">₹{Math.round(product.price * 1.2)}</span>
              </div>

              <div className="mt-8 space-y-4">
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-900">About this item</h3>
                <p className="text-base font-medium leading-relaxed text-slate-500">{product.description}</p>
              </div>

              {/* Action Area */}
              <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="w-full sm:w-auto">
                    <AddToCartButton product={product} className="h-14 w-full sm:w-40 rounded-2xl bg-emerald-600 text-white font-black" />
                </div>
                <div className="flex-1">
                  <BuyNowButton product={product} />
                </div>
              </div>
            </div>

            {/* Features/Utility Section */}
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="rounded-[2rem] bg-emerald-50 p-6 border border-emerald-100/50">
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Fast Delivery</span>
                <p className="mt-2 text-sm font-bold text-emerald-900 leading-snug">Get this item delivered within the next 60 minutes across all local zones.</p>
              </div>
              <div className="rounded-[2rem] bg-white p-6 premium-shadow border border-slate-100">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Security</span>
                <p className="mt-2 text-sm font-bold text-slate-800 leading-snug">Cash on Delivery (COD) available for maximum security & trust.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

