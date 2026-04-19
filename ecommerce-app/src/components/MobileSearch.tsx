"use client";

import { useRouter } from "next/navigation";

export function MobileSearch() {
  const router = useRouter();

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      router.push(`/products?search=${e.currentTarget.value}`);
    }
  };

  return (
    <div className="mt-6 flex w-full flex-col gap-4 lg:hidden">
      <div className="flex w-full items-center rounded-[1.25rem] border border-slate-200 bg-white px-5 py-4 shadow-xl shadow-slate-200/40">
        <svg className="mr-3 h-5 w-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input 
          type="text" 
          placeholder="Search for groceries..." 
          onKeyDown={handleSearch}
          className="w-full bg-transparent text-sm font-semibold outline-none placeholder:text-slate-400" 
        />
      </div>
    </div>
  );
}
