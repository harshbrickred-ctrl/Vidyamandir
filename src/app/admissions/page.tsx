"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, FileText } from "lucide-react";
import { toast } from "sonner";
import Navbar from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import api from "@/lib/api";
import { CLASS_OPTIONS, DOCUMENTS } from "@/lib/content";

export default function AdmissionsPage() {
  const [form, setForm] = useState({
    student_name: "",
    parent_name: "",
    email: "",
    phone: "",
    date_of_birth: "",
    gender: "",
    address: "",
    previous_school: "",
    class_applying: "",
    additional_info: "",
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange =
    (field: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      setForm((p) => ({ ...p, [field]: e.target.value }));
    };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/admissions", form);
      setSubmitted(true);
      toast.success("Application submitted successfully!");
    } catch {
      toast.error("Failed to submit application. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#faf7f2]">
        <Navbar />
        <div className="mx-auto max-w-2xl px-4 pt-32 text-center">
          <CheckCircle2 className="mx-auto mb-6 text-emerald-800" size={64} strokeWidth={1.5} />
          <h1 className="font-display text-4xl font-bold text-emerald-950">
            Application Submitted!
          </h1>
          <p className="mt-4 leading-relaxed text-stone-600">
            Thank you for your interest in S.R.T. Vidyamandir. Your application has been
            received and is being reviewed. We will contact you soon regarding the next steps.
          </p>
          <Link href="/">
            <Button className="mt-8">Back to Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf7f2]">
      <Navbar />
      <div className="mx-auto max-w-5xl px-4 pb-16 pt-28 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-2 text-sm text-stone-500 hover:text-emerald-800"
        >
          <ArrowLeft size={16} /> Back to Home
        </Link>

        <div className="mb-10">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-600">
            Admissions 2025-26
          </p>
          <h1 className="font-display mt-3 text-4xl font-bold text-emerald-950 sm:text-5xl">
            Apply for Admission
          </h1>
          <p className="mt-3 max-w-xl text-stone-600">
            Fill in the application form below. Ensure all information is accurate and complete.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="border-b border-stone-100">
                <CardTitle className="font-display">Application Form</CardTitle>
              </CardHeader>
              <CardContent className="p-6 sm:p-8">
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Student Name *">
                      <Input value={form.student_name} onChange={handleChange("student_name")} required placeholder="Full name" />
                    </Field>
                    <Field label="Parent/Guardian Name *">
                      <Input value={form.parent_name} onChange={handleChange("parent_name")} required placeholder="Parent name" />
                    </Field>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Email *">
                      <Input type="email" value={form.email} onChange={handleChange("email")} required />
                    </Field>
                    <Field label="Phone *">
                      <Input type="tel" value={form.phone} onChange={handleChange("phone")} required />
                    </Field>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Date of Birth *">
                      <Input type="date" value={form.date_of_birth} onChange={handleChange("date_of_birth")} required />
                    </Field>
                    <Field label="Gender *">
                      <select
                        value={form.gender}
                        onChange={handleChange("gender")}
                        required
                        className="flex h-11 w-full rounded-xl border border-stone-200 bg-white px-4 text-sm"
                      >
                        <option value="">Select Gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </Field>
                  </div>
                  <Field label="Class Applying For *">
                    <select
                      value={form.class_applying}
                      onChange={handleChange("class_applying")}
                      required
                      className="flex h-11 w-full rounded-xl border border-stone-200 bg-white px-4 text-sm"
                    >
                      <option value="">Select Class</option>
                      {CLASS_OPTIONS.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Address *">
                    <Textarea value={form.address} onChange={handleChange("address")} required rows={3} />
                  </Field>
                  <Field label="Previous School">
                    <Input value={form.previous_school} onChange={handleChange("previous_school")} />
                  </Field>
                  <Field label="Additional Information">
                    <Textarea value={form.additional_info} onChange={handleChange("additional_info")} rows={3} />
                  </Field>
                  <Button type="submit" disabled={loading} variant="accent" className="w-full" size="lg">
                    {loading ? "Submitting..." : "Submit Application"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="sticky top-24">
              <CardHeader className="border-b border-stone-100">
                <CardTitle className="flex items-center gap-2 font-display text-lg">
                  <FileText size={20} className="text-emerald-800" />
                  Documents Required
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <ul className="space-y-3">
                  {DOCUMENTS.map((doc, i) => (
                    <li key={doc.title} className="rounded-xl bg-stone-50 p-3">
                      <p className="text-sm font-semibold text-emerald-950">
                        {i + 1}. {doc.title}
                      </p>
                      <p className="mt-0.5 text-xs text-stone-500">{doc.desc}</p>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-stone-700">{label}</label>
      {children}
    </div>
  );
}
