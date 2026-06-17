"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NAV_LINKS, SCHOOL } from "@/lib/content";
import { cn } from "@/lib/utils";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTo = (href: string) => {
    setMobileOpen(false);
    if (href.startsWith("#")) {
      document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-500",
        scrolled
          ? "bg-[#faf7f2]/90 backdrop-blur-xl shadow-sm border-b border-stone-200/50 py-3"
          : "bg-transparent py-5"
      )}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="group flex items-center gap-3">
          <div className="relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-900 to-emerald-700 shadow-lg shadow-emerald-900/30 transition-transform group-hover:scale-105">
            <span className="font-display text-sm font-bold text-amber-300">SRT</span>
            <div className="absolute inset-0 bg-gradient-to-tr from-amber-400/20 to-transparent" />
          </div>
          <div className="hidden sm:block">
            <p
              className={cn(
                "font-display text-sm font-bold leading-tight transition-colors",
                scrolled ? "text-emerald-950" : "text-white"
              )}
            >
              {SCHOOL.name}
            </p>
            <p
              className={cn(
                "text-[10px] uppercase tracking-wider transition-colors",
                scrolled ? "text-stone-500" : "text-white/70"
              )}
            >
              {SCHOOL.tagline}
            </p>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map((link) => (
            <button
              key={link.href}
              onClick={() => scrollTo(link.href)}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-medium transition-colors hover:bg-white/10",
                scrolled ? "text-stone-700 hover:bg-emerald-900/5" : "text-white/90"
              )}
            >
              {link.label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link href="/admissions" className="hidden sm:block">
            <Button variant={scrolled ? "default" : "accent"} size="sm">
              Admissions Open
            </Button>
          </Link>
          <button
            className={cn(
              "rounded-xl p-2 lg:hidden",
              scrolled ? "text-emerald-950" : "text-white"
            )}
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden border-t border-stone-200/50 bg-[#faf7f2]/95 backdrop-blur-xl lg:hidden"
          >
            <div className="flex flex-col gap-1 px-4 py-4">
              {NAV_LINKS.map((link) => (
                <button
                  key={link.href}
                  onClick={() => scrollTo(link.href)}
                  className="rounded-xl px-4 py-3 text-left text-sm font-medium text-stone-700 hover:bg-emerald-900/5"
                >
                  {link.label}
                </button>
              ))}
              <Link href="/admissions" onClick={() => setMobileOpen(false)}>
                <Button className="mt-2 w-full" variant="accent">
                  Admissions Open
                </Button>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
