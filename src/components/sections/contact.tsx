"use client";

import { useState } from "react";
import { Mail, MapPin, Phone, Send } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import { SCHOOL } from "@/lib/content";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import AnimatedSection from "@/components/three/animated-section";
import { Reveal, SectionLabel, SectionTitle } from "@/components/motion/reveal";

export default function ContactSection() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/contact", form);
      toast.success("Message sent successfully! We'll get back to you soon.");
      setForm({ name: "", email: "", phone: "", subject: "", message: "" });
    } catch {
      toast.error("Failed to send message. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatedSection id="contact" variant="contact" className="py-20 sm:py-28" sceneOpacity={0.3}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="mb-12 text-center">
          <SectionLabel>Contact Us</SectionLabel>
          <SectionTitle className="mt-3">Get in Touch</SectionTitle>
          <p className="mx-auto mt-4 max-w-xl text-stone-600">
            Have a question about admissions or our programs? We&apos;d love to hear from you.
            Messages are delivered directly to{" "}
            <a href={`mailto:${SCHOOL.email}`} className="font-medium text-emerald-800 hover:underline">
              {SCHOOL.email}
            </a>
            .
          </p>
        </Reveal>

        <div className="grid gap-12 lg:grid-cols-5">
          <Reveal className="lg:col-span-2">
            <div className="space-y-6">
              {[
                { icon: MapPin, label: "Address", value: SCHOOL.address },
                { icon: Phone, label: "Phone", value: SCHOOL.phone, href: SCHOOL.phoneHref },
                { icon: Mail, label: "Email", value: SCHOOL.email, href: `mailto:${SCHOOL.email}` },
              ].map(({ icon: Icon, label, value, href }) => (
                <div
                  key={label}
                  className="flex gap-4 rounded-2xl border border-stone-200 bg-white/80 p-5 shadow-sm backdrop-blur-sm transition-shadow hover:shadow-md"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-900/5">
                    <Icon className="text-emerald-800" size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-stone-400">
                      {label}
                    </p>
                    {href ? (
                      <a href={href} className="mt-1 block text-sm text-stone-700 hover:text-emerald-800">
                        {value}
                      </a>
                    ) : (
                      <p className="mt-1 text-sm text-stone-700">{value}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Reveal>

          <Reveal className="lg:col-span-3" delay={0.15}>
            <form
              onSubmit={handleSubmit}
              className="rounded-3xl border border-stone-200 bg-white/90 p-8 shadow-xl backdrop-blur-sm"
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-stone-700">Name *</label>
                  <Input
                    value={form.name}
                    onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                    required
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-stone-700">Email *</label>
                  <Input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                    required
                    placeholder="you@example.com"
                  />
                </div>
              </div>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-stone-700">Phone</label>
                  <Input
                    value={form.phone}
                    onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                    placeholder="+91 XXXXX XXXXX"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-stone-700">Subject *</label>
                  <Input
                    value={form.subject}
                    onChange={(e) => setForm((p) => ({ ...p, subject: e.target.value }))}
                    required
                    placeholder="How can we help?"
                  />
                </div>
              </div>
              <div className="mt-4">
                <label className="mb-1.5 block text-sm font-medium text-stone-700">Message *</label>
                <Textarea
                  value={form.message}
                  onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))}
                  required
                  rows={5}
                  placeholder="Your message..."
                />
              </div>
              <Button type="submit" disabled={loading} className="mt-6 w-full" variant="accent">
                {loading ? "Sending..." : "Send Message"}
                <Send size={16} />
              </Button>
            </form>
          </Reveal>
        </div>
      </div>
    </AnimatedSection>
  );
}
