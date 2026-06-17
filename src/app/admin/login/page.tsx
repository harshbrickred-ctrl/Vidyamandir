"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { formatApiErrorDetail } from "@/lib/api";
import { SCHOOL } from "@/lib/content";

export default function AdminLoginPage() {
  const { user, loading, login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user?.role === "admin") {
      router.replace("/admin");
    }
  }, [user, loading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await login(email, password);
      toast.success("Welcome back!");
      router.push("/admin");
    } catch (err: unknown) {
      const detail =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { detail?: unknown } } }).response?.data?.detail
          : undefined;
      toast.error(formatApiErrorDetail(detail));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-emerald-950 px-4">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(232,168,56,0.12),transparent_50%)]" />
      <Card className="relative w-full max-w-md border-white/10 bg-white/95 backdrop-blur-xl">
        <CardContent className="p-8">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-900 to-emerald-700 font-display text-lg font-bold text-amber-300">
              SRT
            </div>
            <h1 className="font-display text-2xl font-bold text-emerald-950">Admin Portal</h1>
            <p className="mt-1 text-sm text-stone-500">Sign in to manage {SCHOOL.name}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-stone-700">Email</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@srtvidyamandir.com"
                required
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-stone-700">Password</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" disabled={submitting} className="w-full" variant="accent">
              {submitting ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <Link href="/" className="mt-6 block text-center text-sm text-stone-500 hover:text-emerald-800">
            ← Back to website
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
