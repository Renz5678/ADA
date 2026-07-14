"use client";

import { Package } from "lucide-react";
import Link from "next/link";

export default function Topbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white">
            <Package size={20} />
          </div>
          <span className="font-headline text-xl font-bold text-dark">
            ADA
          </span>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="https://app.ada-erp.com/login"
            className="hidden sm:inline-flex text-sm font-medium text-dark hover:text-primary transition-colors"
          >
            Log In
          </Link>
          <Link
            href="https://app.ada-erp.com/signup"
            className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-dark"
          >
            Sign Up
          </Link>
        </div>
      </div>
    </header>
  );
}
