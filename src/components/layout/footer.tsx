import Link from "next/link";
import { MapPin, Phone, Mail } from "lucide-react";
import { NAV_LINKS, SCHOOL } from "@/lib/content";

export default function Footer() {
  return (
    <footer className="relative overflow-hidden bg-emerald-950 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(232,168,56,0.12),_transparent_50%)]" />
      <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 font-display text-sm font-bold">
                SRT
              </div>
              <div>
                <p className="font-display font-bold">{SCHOOL.name}</p>
                <p className="text-xs text-white/60">{SCHOOL.tagline}</p>
              </div>
            </div>
            <p className="text-sm leading-relaxed text-white/60">
              Established under the aegis of {SCHOOL.trust}.
            </p>
          </div>

          <div>
            <h4 className="mb-4 font-display text-sm font-bold uppercase tracking-wider text-amber-400">
              Quick Links
            </h4>
            <ul className="space-y-2">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-sm text-white/70 transition-colors hover:text-amber-300"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-4 font-display text-sm font-bold uppercase tracking-wider text-amber-400">
              Important
            </h4>
            <ul className="space-y-2 text-sm text-white/70">
              <li>
                <Link href="/admissions" className="hover:text-amber-300">
                  Admissions
                </Link>
              </li>
              <li>Documents Required</li>
              <li>Rules & Regulations</li>
              <li>Principal&apos;s Desk</li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 font-display text-sm font-bold uppercase tracking-wider text-amber-400">
              Contact
            </h4>
            <ul className="space-y-3 text-sm text-white/70">
              <li className="flex gap-2">
                <MapPin size={16} className="mt-0.5 shrink-0 text-amber-400" />
                {SCHOOL.address}
              </li>
              <li className="flex gap-2">
                <Phone size={16} className="shrink-0 text-amber-400" />
                <a href={SCHOOL.phoneHref} className="hover:text-amber-300">
                  {SCHOOL.phone}
                </a>
              </li>
              <li className="flex gap-2">
                <Mail size={16} className="shrink-0 text-amber-400" />
                <a href={`mailto:${SCHOOL.email}`} className="hover:text-amber-300">
                  {SCHOOL.email}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-white/10 pt-8 text-center text-sm text-white/40">
          © {new Date().getFullYear()} {SCHOOL.name}. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
