"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Calendar,
  ExternalLink,
  ImagePlus,
  LogOut,
  Megaphone,
  Plus,
  Search,
  Trash2,
  Upload,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/auth-context";
import api, { BACKEND_URL, formatApiErrorDetail, galleryImageUrl } from "@/lib/api";
import { EVENT_CATEGORIES, GALLERY_CATEGORIES } from "@/lib/content";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type Stats = {
  total_admissions: number;
  pending_admissions: number;
  approved_admissions: number;
  total_announcements: number;
  total_events: number;
  total_contacts: number;
  total_gallery: number;
};

export default function AdminPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || user.role !== "admin")) {
      router.replace("/admin/login");
    }
  }, [user, loading, router]);

  const handleLogout = async () => {
    await logout();
    router.push("/admin/login");
  };

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-stone-100">
        <p className="text-stone-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-100">
      <header className="sticky top-0 z-40 border-b border-stone-200 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
          <div>
            <h1 className="font-display text-xl font-bold text-emerald-950">Admin Dashboard</h1>
            <p className="text-sm text-stone-500">Welcome back, {user.name || user.email}</p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/" target="_blank">
              <Button variant="ghost" size="sm">
                <ExternalLink size={16} /> View Site
              </Button>
            </Link>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut size={16} /> Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <AdminDashboard />
      </main>
    </div>
  );
}

function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    api.get<Stats>("/stats").then((r) => setStats(r.data)).catch(() => {});
  }, []);

  const statCards = stats
    ? [
        { label: "Applications", value: stats.total_admissions, icon: Users },
        { label: "Pending", value: stats.pending_admissions, icon: Calendar },
        { label: "Events", value: stats.total_events, icon: Calendar },
        { label: "Gallery", value: stats.total_gallery, icon: ImagePlus },
        { label: "Announcements", value: stats.total_announcements, icon: Megaphone },
      ]
    : [];

  return (
    <div className="space-y-8">
      {statCards.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {statCards.map(({ label, value, icon: Icon }) => (
            <Card key={label}>
              <CardContent className="flex items-center gap-3 p-4">
                <div className="rounded-xl bg-emerald-900 p-2.5 text-white">
                  <Icon size={18} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-emerald-950">{value}</p>
                  <p className="text-xs text-stone-500">{label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Tabs defaultValue="events">
        <TabsList className="mb-6">
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="gallery">Gallery</TabsTrigger>
          <TabsTrigger value="announcements">Announcements</TabsTrigger>
        </TabsList>
        <TabsContent value="events">
          <EventsManager />
        </TabsContent>
        <TabsContent value="gallery">
          <GalleryManager />
        </TabsContent>
        <TabsContent value="announcements">
          <AnnouncementsManager />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function SearchInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="relative">
      <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-64 pl-9"
      />
    </div>
  );
}

function EventsManager() {
  const [items, setItems] = useState<
    { id: string; title: string; description: string; date: string; category: string; image_url?: string }[]
  >([]);
  const [form, setForm] = useState({
    title: "",
    description: "",
    date: "",
    category: "general",
    image_url: "",
  });
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");

  const load = useCallback(async () => {
    try {
      const params: Record<string, string> = {};
      if (search) params.search = search;
      const { data } = await api.get("/events", { params });
      setItems(data);
    } catch {
      /* ignore */
    }
  }, [search]);

  useEffect(() => {
    load();
  }, [load]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/events", form);
      toast.success("Event created");
      setForm({ title: "", description: "", date: "", category: "general", image_url: "" });
      setShowForm(false);
      load();
    } catch (err: unknown) {
      const detail =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { detail?: unknown } } }).response?.data?.detail
          : undefined;
      toast.error(formatApiErrorDetail(detail));
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/events/${id}`);
      toast.success("Event deleted");
      load();
    } catch {
      toast.error("Delete failed");
    }
  };

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-lg font-bold text-emerald-950">Manage Events</h2>
        <div className="flex items-center gap-2">
          <SearchInput value={search} onChange={setSearch} placeholder="Search events..." />
          <Button size="sm" onClick={() => setShowForm(!showForm)}>
            <Plus size={16} /> Add Event
          </Button>
        </div>
      </div>

      {showForm && (
        <Card className="mb-4">
          <CardContent className="p-4">
            <form onSubmit={handleCreate} className="grid gap-3 sm:grid-cols-2">
              <Input placeholder="Title" value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} required />
              <Input type="date" value={form.date} onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))} required />
              <select
                value={form.category}
                onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
                className="h-11 rounded-xl border border-stone-200 px-4 text-sm"
              >
                {EVENT_CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c.replace(/_/g, " ")}</option>
                ))}
              </select>
              <Input placeholder="Image URL (optional)" value={form.image_url} onChange={(e) => setForm((p) => ({ ...p, image_url: e.target.value }))} />
              <Textarea placeholder="Description" value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} required rows={3} className="sm:col-span-2" />
              <Button type="submit" variant="accent" size="sm">Save Event</Button>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.length === 0 ? (
          <p className="col-span-full py-12 text-center text-stone-500">No events found</p>
        ) : (
          items.map((event) => (
            <Card key={event.id} className="overflow-hidden">
              {event.image_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={event.image_url} alt={event.title} className="aspect-video w-full object-cover" />
              )}
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <Badge className="mb-2 capitalize">{event.category.replace(/_/g, " ")}</Badge>
                    <h3 className="font-semibold text-emerald-950">{event.title}</h3>
                    <p className="mt-1 line-clamp-2 text-sm text-stone-500">{event.description}</p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(event.id)} className="shrink-0 text-red-600">
                    <Trash2 size={16} />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

function GalleryManager() {
  const [items, setItems] = useState<
    { id: string; title: string; category: string; description?: string }[]
  >([]);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [uploadForm, setUploadForm] = useState({ title: "", category: "general", description: "" });
  const [showForm, setShowForm] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    try {
      const params: Record<string, string> = {};
      if (categoryFilter !== "all") params.category = categoryFilter;
      const { data } = await api.get("/gallery", { params });
      let filtered = data;
      if (search) {
        const q = search.toLowerCase();
        filtered = data.filter(
          (g: { title: string; description?: string }) =>
            g.title.toLowerCase().includes(q) ||
            (g.description || "").toLowerCase().includes(q)
        );
      }
      setItems(filtered);
    } catch {
      /* ignore */
    }
  }, [search, categoryFilter]);

  useEffect(() => {
    load();
  }, [load]);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    const file = fileRef.current?.files?.[0];
    if (!file) {
      toast.error("Please select an image file");
      return;
    }
    const formData = new FormData();
    formData.append("file", file);
    try {
      await api.post(
        `/gallery/upload?title=${encodeURIComponent(uploadForm.title)}&category=${encodeURIComponent(uploadForm.category)}&description=${encodeURIComponent(uploadForm.description)}`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      toast.success("Image uploaded");
      setUploadForm({ title: "", category: "general", description: "" });
      if (fileRef.current) fileRef.current.value = "";
      setShowForm(false);
      load();
    } catch (err: unknown) {
      const detail =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { detail?: unknown } } }).response?.data?.detail
          : undefined;
      toast.error(formatApiErrorDetail(detail));
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/gallery/${id}`);
      toast.success("Image deleted");
      load();
    } catch {
      toast.error("Delete failed");
    }
  };

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-lg font-bold text-emerald-950">Manage Gallery</h2>
        <div className="flex flex-wrap items-center gap-2">
          <SearchInput value={search} onChange={setSearch} placeholder="Search gallery..." />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="h-11 rounded-xl border border-stone-200 px-3 text-sm"
          >
            <option value="all">All categories</option>
            {GALLERY_CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <Button size="sm" onClick={() => setShowForm(!showForm)}>
            <Upload size={16} /> Upload
          </Button>
        </div>
      </div>

      {showForm && (
        <Card className="mb-4">
          <CardContent className="p-4">
            <form onSubmit={handleUpload} className="grid gap-3 sm:grid-cols-2">
              <Input placeholder="Title" value={uploadForm.title} onChange={(e) => setUploadForm((p) => ({ ...p, title: e.target.value }))} required />
              <select
                value={uploadForm.category}
                onChange={(e) => setUploadForm((p) => ({ ...p, category: e.target.value }))}
                className="h-11 rounded-xl border border-stone-200 px-4 text-sm"
              >
                {GALLERY_CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <Input type="file" accept="image/*" ref={fileRef} required className="sm:col-span-2" />
              <Textarea placeholder="Description (optional)" value={uploadForm.description} onChange={(e) => setUploadForm((p) => ({ ...p, description: e.target.value }))} rows={2} className="sm:col-span-2" />
              <Button type="submit" variant="accent" size="sm">
                <ImagePlus size={16} /> Upload Image
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
        {items.length === 0 ? (
          <p className="col-span-full py-12 text-center text-stone-500">No gallery images found</p>
        ) : (
          items.map((item) => (
            <Card key={item.id} className="group overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={galleryImageUrl(item.id)} alt={item.title} className="aspect-square w-full object-cover" />
              <CardContent className="p-3">
                <div className="flex items-start justify-between gap-1">
                  <div>
                    <p className="text-sm font-semibold text-emerald-950">{item.title}</p>
                    <Badge variant="secondary" className="mt-1 text-[10px]">{item.category}</Badge>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)} className="h-8 w-8 text-red-600 opacity-0 transition-opacity group-hover:opacity-100">
                    <Trash2 size={14} />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
      <p className="mt-4 text-xs text-stone-400">Images served from {BACKEND_URL}/api/gallery/image/&#123;id&#125;</p>
    </div>
  );
}

function AnnouncementsManager() {
  const [items, setItems] = useState<
    { id: string; title: string; content: string; priority: string; created_at?: string }[]
  >([]);
  const [form, setForm] = useState({ title: "", content: "", priority: "normal" });
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");

  const load = useCallback(async () => {
    try {
      const params: Record<string, string> = {};
      if (search) params.search = search;
      const { data } = await api.get("/announcements", { params });
      setItems(data);
    } catch {
      /* ignore */
    }
  }, [search]);

  useEffect(() => {
    load();
  }, [load]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/announcements", form);
      toast.success("Announcement created");
      setForm({ title: "", content: "", priority: "normal" });
      setShowForm(false);
      load();
    } catch (err: unknown) {
      const detail =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { detail?: unknown } } }).response?.data?.detail
          : undefined;
      toast.error(formatApiErrorDetail(detail));
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/announcements/${id}`);
      toast.success("Deleted");
      load();
    } catch {
      toast.error("Delete failed");
    }
  };

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-lg font-bold text-emerald-950">Manage Announcements</h2>
        <div className="flex items-center gap-2">
          <SearchInput value={search} onChange={setSearch} placeholder="Search..." />
          <Button size="sm" onClick={() => setShowForm(!showForm)}>
            <Plus size={16} /> Add
          </Button>
        </div>
      </div>

      {showForm && (
        <Card className="mb-4">
          <CardContent className="p-4">
            <form onSubmit={handleCreate} className="space-y-3">
              <Input placeholder="Title" value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} required />
              <Textarea placeholder="Content" value={form.content} onChange={(e) => setForm((p) => ({ ...p, content: e.target.value }))} required rows={3} />
              <select value={form.priority} onChange={(e) => setForm((p) => ({ ...p, priority: e.target.value }))} className="h-11 w-full rounded-xl border border-stone-200 px-4 text-sm">
                <option value="normal">Normal</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
              <Button type="submit" variant="accent" size="sm">Save</Button>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {items.length === 0 ? (
          <p className="py-12 text-center text-stone-500">No announcements found</p>
        ) : (
          items.map((a) => (
            <Card key={a.id}>
              <CardContent className="flex items-start justify-between gap-4 p-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-emerald-950">{a.title}</h3>
                    <Badge variant={a.priority === "urgent" ? "destructive" : "default"}>{a.priority}</Badge>
                  </div>
                  <p className="mt-1 text-sm text-stone-600">{a.content}</p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => handleDelete(a.id)} className="text-red-600">
                  <Trash2 size={16} />
                </Button>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
