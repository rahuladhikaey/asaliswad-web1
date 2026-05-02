import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import { Product } from "@/lib/types";
import { Header } from "@/components/Header";
import ProductDetailTemplate from "./ProductDetailTemplate";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type PageProps = {
  params: Promise<{ productId: string }>;
};

export async function generateStaticParams() {
  const { data: products } = await supabase
    .from("products")
    .select("id");

  if (!products) return [];

  return products.map((product) => ({
    productId: product.id.toString(),
  }));
}

const getProduct = async (productId: string) => {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", Number(productId))
    .single();

  if (error || !data) {
    console.error("Error fetching product:", error);
    return null;
  }

  return data as Product;
};

const getRelatedProducts = async (category_id: number, currentProductId: number) => {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("category_id", category_id)
    .neq("id", currentProductId)
    .limit(5);

  if (error) {
    console.error("Error fetching related products:", error);
    return [];
  }

  return data as Product[];
};

export default async function ProductDetailPage({ params }: PageProps) {
  const { productId } = await params;
  const product = await getProduct(productId);
  
  // Fetch related products if category_id exists
  const relatedProducts = product && product.category_id 
    ? await getRelatedProducts(product.category_id, product.id)
    : [];

  if (!product) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-slate-900">
        <div className="max-w-md w-full rounded-[2.5rem] bg-white p-10 text-center premium-shadow">
          <div className="mx-auto h-20 w-20 flex items-center justify-center rounded-full bg-slate-100 text-3xl mb-6">🚫</div>
          <h1 className="text-2xl font-black text-slate-900">Product not found</h1>
          <p className="mt-3 text-slate-500 font-medium">This product might have been moved or removed. (ID: {productId})</p>
          <Link href="/products" className="mt-8 inline-flex w-full items-center justify-center rounded-2xl bg-emerald-600 px-6 py-4 text-sm font-black uppercase tracking-widest text-white shadow-xl shadow-emerald-600/20 transition hover:bg-emerald-700 active:scale-95">
            Back to store
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white text-slate-900 overflow-x-hidden">
      <Header title={product.name} subtitle={product.category_name || "Premium Quality"} />

      <ProductDetailTemplate product={product} relatedProducts={relatedProducts} />
    </main>
  );
}




