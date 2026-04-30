import Image from "next/image";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <Link href="/" className="inline-flex items-center gap-3 text-xl font-bold text-white">
              <span className="relative h-12 w-12 overflow-hidden rounded-2xl bg-yellow-400">
                <Image src="/favicon.ico" alt="Asali Swad logo" fill className="object-cover" />
              </span>
              Asali Swad
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-6 text-slate-300">
              A fresh and reliable grocery experience for your neighborhood. Fast delivery, secure payments, and an easy shopping flow tailored for everyday essentials.
            </p>
            <div className="mt-7 flex flex-wrap gap-3 text-xs text-slate-400 sm:text-sm">
              <span className="rounded-full border border-slate-700 bg-slate-900/80 px-3 py-2">Fresh produce</span>
              <span className="rounded-full border border-slate-700 bg-slate-900/80 px-3 py-2">Quick orders</span>
              <span className="rounded-full border border-slate-700 bg-slate-900/80 px-3 py-2">Secure checkout</span>
            </div>
          </div>

          <div className="hidden lg:block lg:col-span-2">
            <h3 className="text-sm font-semibold uppercase tracking-[0.24em] text-yellow-300">Quick Access</h3>
            <ul className="mt-5 space-y-4 text-sm text-slate-300">
              <li><Link href="/" className="transition hover:text-white">Store Home</Link></li>
              <li><Link href="/products" className="transition hover:text-white">All Products</Link></li>
              <li><Link href="/cart" className="transition hover:text-white">Your Cart</Link></li>
              <li><Link href="/checkout" className="transition hover:text-white">Checkout</Link></li>
              <li><Link href="/assistant" className="transition hover:text-white">AI Assistant</Link></li>
            </ul>
          </div>

          <div className="hidden lg:block lg:col-span-2">
            <h3 className="text-sm font-semibold uppercase tracking-[0.24em] text-yellow-300">Customer Care</h3>
            <ul className="mt-5 space-y-4 text-sm text-slate-300">
              <li><Link href="/admin" className="transition hover:text-white">Admin Portal</Link></li>
              <li><Link href="/about" className="transition hover:text-white">About Us</Link></li>
              <li><Link href="/contact" className="transition hover:text-white">Contact & Support</Link></li>
              <li><Link href="/privacy-policy" className="transition hover:text-white">Privacy Policy</Link></li>
            </ul>
          </div>

          <div className="lg:col-span-4">
            <h3 className="text-xs font-black uppercase tracking-[0.4em] text-amber-400">Stay in touch</h3>
            <p className="mt-5 text-sm font-medium leading-7 text-slate-400">
              Get the latest deals, product drops, and store updates delivered straight to your inbox.
            </p>
            <form action="#" className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative flex-1 group">
                <input
                  id="newsletter"
                  type="email"
                  placeholder="Your email"
                  className="w-full rounded-2xl border border-slate-800 bg-slate-900/40 px-6 py-4 text-sm text-white outline-none transition-all duration-300 backdrop-blur-sm placeholder:text-slate-600 focus:border-amber-500/50 focus:ring-4 focus:ring-amber-500/5 focus:bg-slate-900"
                />
              </div>
              <button
                type="submit"
                className="inline-flex shrink-0 items-center justify-center rounded-2xl bg-emerald-600 px-8 py-4 text-[11px] font-black uppercase tracking-widest text-white shadow-lg shadow-emerald-600/20 transition-all duration-300 hover:bg-emerald-500 hover:-translate-y-0.5 active:scale-95"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        <div className="mt-12 border-t border-slate-800 pt-8 text-sm text-slate-500 sm:flex sm:items-center sm:justify-between">
          <p>© 2026 Asali Swad. All rights reserved.</p>
          <div className="mt-4 flex flex-wrap gap-4 sm:mt-0">
            <Link href="mailto:connect.asaliswad2026@gmail.com" className="transition hover:text-white">connect.asaliswad2026@gmail.com</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

