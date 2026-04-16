"use client";

import { useState, useCallback, useEffect } from "react";
import {
  COLLECTIONS,
  createDocument,
  getDocuments,
  deleteDocument,
  type SocialPost,
  type SocialPlatform,
  type PostStatus,
} from "@/lib/firestore";

/* ═══════════════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════════════ */
interface Props {
  locale: string;
}

interface PlatformInfo {
  key: SocialPlatform;
  name: string;
  icon: string;
  color: string;
  bgColor: string;
  followers: string;
  growth: string;
  posts: number;
}

/* ═══════════════════════════════════════════════════════
   TRANSLATIONS
   ═══════════════════════════════════════════════════════ */
const labels = {
  es: {
    title: "Redes Sociales",
    subtitle: "Gestiona publicaciones, calendario y analítica desde un solo lugar",
    newPost: "Nueva Publicación",
    schedule: "Programar",
    analytics: "Analítica",
    recentPosts: "Publicaciones Recientes",
    scheduledPosts: "Programadas",
    drafts: "Borradores",
    published: "Publicadas",
    all: "Todas",
    contentCalendar: "Calendario de Contenido",
    engagement: "Engagement",
    reach: "Alcance",
    impressions: "Impresiones",
    clicks: "Clics",
    followers: "Seguidores",
    growth: "Crecimiento",
    posts: "Posts",
    createPost: "Crear Publicación",
    postContent: "Contenido de la publicación",
    selectPlatforms: "Seleccionar plataformas",
    addHashtags: "Agregar hashtags",
    scheduleDate: "Fecha de programación",
    saveDraft: "Guardar Borrador",
    publishNow: "Publicar Ahora",
    schedulePost: "Programar",
    cancel: "Cancelar",
    preview: "Vista Previa",
    delete: "Eliminar",
    edit: "Editar",
    noPostsYet: "No hay publicaciones aún. ¡Crea tu primera!",
    platformStats: "Estadísticas por Plataforma",
    weeklyOverview: "Resumen Semanal",
    bestTime: "Mejor Hora",
    topPost: "Mejor Post",
    characters: "caracteres",
    hashtagPlaceholder: "#domótica #smartHome",
    contentPlaceholder: "¿Qué quieres compartir hoy? Tu audiencia espera contenido valioso sobre domótica y tecnología inteligente...",
    postSaved: "¡Publicación guardada!",
    postDeleted: "Publicación eliminada",
    errorSaving: "Error al guardar",
    confirmDelete: "¿Eliminar esta publicación?",
    todayLabel: "Hoy",
    thisWeek: "Esta Semana",
    thisMonth: "Este Mes",
    quickActions: "Acciones Rápidas",
    duplicatePost: "Duplicar",
    viewMetrics: "Ver Métricas",
    contentIdeas: "Ideas de Contenido",
    ideas: [
      "📸 Antes y después de instalación domótica",
      "🎥 Video tutorial: cómo funciona la iluminación inteligente",
      "💡 Tip del día: ahorro energético con domótica",
      "🏠 Caso de éxito: proyecto residencial completado",
      "📊 Infografía: ROI de la automatización del hogar",
      "🔧 Behind the scenes: nuestro equipo trabajando",
    ],
  },
  en: {
    title: "Social Media",
    subtitle: "Manage posts, calendar and analytics from one place",
    newPost: "New Post",
    schedule: "Schedule",
    analytics: "Analytics",
    recentPosts: "Recent Posts",
    scheduledPosts: "Scheduled",
    drafts: "Drafts",
    published: "Published",
    all: "All",
    contentCalendar: "Content Calendar",
    engagement: "Engagement",
    reach: "Reach",
    impressions: "Impressions",
    clicks: "Clicks",
    followers: "Followers",
    growth: "Growth",
    posts: "Posts",
    createPost: "Create Post",
    postContent: "Post content",
    selectPlatforms: "Select platforms",
    addHashtags: "Add hashtags",
    scheduleDate: "Schedule date",
    saveDraft: "Save Draft",
    publishNow: "Publish Now",
    schedulePost: "Schedule",
    cancel: "Cancel",
    preview: "Preview",
    delete: "Delete",
    edit: "Edit",
    noPostsYet: "No posts yet. Create your first one!",
    platformStats: "Platform Statistics",
    weeklyOverview: "Weekly Overview",
    bestTime: "Best Time",
    topPost: "Top Post",
    characters: "characters",
    hashtagPlaceholder: "#domotics #smartHome",
    contentPlaceholder: "What do you want to share today? Your audience awaits valuable content about domotics and smart technology...",
    postSaved: "Post saved!",
    postDeleted: "Post deleted",
    errorSaving: "Error saving",
    confirmDelete: "Delete this post?",
    todayLabel: "Today",
    thisWeek: "This Week",
    thisMonth: "This Month",
    quickActions: "Quick Actions",
    duplicatePost: "Duplicate",
    viewMetrics: "View Metrics",
    contentIdeas: "Content Ideas",
    ideas: [
      "📸 Before and after domotics installation",
      "🎥 Video tutorial: how smart lighting works",
      "💡 Tip of the day: energy savings with domotics",
      "🏠 Success story: completed residential project",
      "📊 Infographic: ROI of home automation",
      "🔧 Behind the scenes: our team at work",
    ],
  },
};

/* ═══════════════════════════════════════════════════════
   COMPONENT
   ═══════════════════════════════════════════════════════ */
export default function SocialMediaHub({ locale }: Props) {
  const l = locale === "en" ? labels.en : labels.es;

  // ── State ──
  const [activeTab, setActiveTab] = useState<"feed" | "calendar" | "analytics">("feed");
  const [filterStatus, setFilterStatus] = useState<"all" | PostStatus>("all");
  const [showComposer, setShowComposer] = useState(false);
  const [posts, setPosts] = useState<(SocialPost & { id: string })[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Composer state
  const [content, setContent] = useState("");
  const [selectedPlatforms, setSelectedPlatforms] = useState<SocialPlatform[]>(["instagram"]);
  const [hashtags, setHashtags] = useState("");
  const [scheduleDate, setScheduleDate] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Platform data
  const platforms: PlatformInfo[] = [
    { key: "instagram", name: "Instagram", icon: "photo_camera", color: "#E1306C", bgColor: "#E1306C1a", followers: "0", growth: "0%", posts: 0 },
    { key: "facebook", name: "Facebook", icon: "group", color: "#1877F2", bgColor: "#1877F21a", followers: "0", growth: "0%", posts: 0 },
    { key: "linkedin", name: "LinkedIn", icon: "work", color: "#0A66C2", bgColor: "#0A66C21a", followers: "0", growth: "0%", posts: 0 },
    { key: "tiktok", name: "TikTok", icon: "music_note", color: "#00F2EA", bgColor: "#00F2EA1a", followers: "0", growth: "0%", posts: 0 },
    { key: "x", name: "X / Twitter", icon: "tag", color: "#ffffff", bgColor: "#ffffff1a", followers: "0", growth: "0%", posts: 0 },
    { key: "whatsapp", name: "WhatsApp Business", icon: "chat", color: "#25D366", bgColor: "#25D3661a", followers: "0", growth: "0%", posts: 0 },
  ];

  // ── Load posts from Firestore ──
  const loadPosts = useCallback(async () => {
    setIsLoading(true);
    try {
      const docs = await getDocuments<SocialPost>(
        COLLECTIONS.SOCIAL_POSTS,
        undefined,
        { field: "createdAt", direction: "desc" },
        50
      );
      setPosts(docs);
    } catch (e) {
      console.error("Error loading posts:", e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { loadPosts(); }, [loadPosts]);

  // ── Toggle platform ──
  const togglePlatform = (p: SocialPlatform) => {
    setSelectedPlatforms((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]
    );
  };

  // ── Save Post ──
  const handleSavePost = async (status: PostStatus) => {
    if (!content.trim()) return;
    setIsSaving(true);
    try {
      // 1. Crear Objeto Dinámicamente para no enviar "undefined"
      const postData: any = {
        content: content.trim(),
        platforms: selectedPlatforms,
        mediaUrls: [],
        status,
        hashtags: hashtags.split(" ").filter((h) => h.startsWith("#")),
      };
      
      if (scheduleDate) postData.scheduledAt = scheduleDate;
      if (status === "published") {
        postData.publishedAt = new Date().toISOString();
        postData.metrics = { likes: 0, comments: 0, shares: 0, reach: 0, impressions: 0 };
      }
      
      // 2. Guardar en Base de Datos (Disparar y Olvidar si está offline)
      let docId = "temp-" + Date.now().toString(36);
      
      try {
        // Envolvemos createDocument en un timeout de 2 segundos.
        // Si tienes Brave Shields o un adblocker y el websocket está bloqueado,
        // no se quedará en estado de "carga infinita".
        const firestorePromise = createDocument(COLLECTIONS.SOCIAL_POSTS, postData);
        const timeoutPromise = new Promise<string>((_, reject) => 
          setTimeout(() => reject(new Error("Firebase Timeout_Offline")), 2000)
        );
        
        docId = await Promise.race([firestorePromise, timeoutPromise]);
      } catch (dbErr) {
        console.warn("⚠️ Firebase offline o bloqueado (Brave Shields). El post se guardará al reconectar.", dbErr);
      }

      // 3. Integración Externa: Enviar payload a Make.com
      if (status === "published" || status === "scheduled") {
        try {
          const MAKE_WEBHOOK_URL = "https://hook.us2.make.com/btxwmkz3vlsiqehwbrcs9hnkoojsr362";
          
          await fetch(MAKE_WEBHOOK_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              postId: docId,
              action: status, 
              content: postData.content,
              hashtags: postData.hashtags?.join(" ") || "",
              platforms: postData.platforms,
              scheduledAt: postData.scheduledAt,
            })
          });
          console.log("🚀 Post enviado exitosamente a la automatización de Make.com");
        } catch (webhookErr) {
          console.error("❌ Error al contactar Make.com (pero la app sigue):", webhookErr);
        }
      }

      alert(l.postSaved);
      setContent("");
      setHashtags("");
      setScheduleDate("");
      setShowComposer(false);
      loadPosts();
    } catch (e) {
      console.error(e);
      alert(l.errorSaving);
    } finally {
      setIsSaving(false);
    }
  };

  // ── Delete Post ──
  const handleDeletePost = async (postId: string) => {
    if (!confirm(l.confirmDelete)) return;
    try {
      // Ignorar bloqueo offline al eliminar también
      const deletePromise = deleteDocument(COLLECTIONS.SOCIAL_POSTS, postId);
      const timeout = new Promise((_, r) => setTimeout(() => r(new Error("Timeout")), 1500));
      await Promise.race([deletePromise, timeout]).catch(() => console.warn("Delete pending sync"));
      
      setPosts((prev) => prev.filter((p) => p.id !== postId));
    } catch (e) {
      console.error(e);
    }
  };

  // ── Filter posts ──
  const filteredPosts = filterStatus === "all" ? posts : posts.filter((p) => p.status === filterStatus);

  // ── Styles ──
  const inputSm = "w-full bg-[#0e0e0e] border border-[#484847]/20 rounded-xl px-4 py-3 text-white placeholder:text-[#484847] focus:ring-1 focus:ring-[#c1fffe] outline-none text-sm transition-all";

  const statusBadge = (status: PostStatus) => {
    const map: Record<PostStatus, { color: string; label: string }> = {
      draft: { color: "#767575", label: locale === "es" ? "Borrador" : "Draft" },
      scheduled: { color: "#6e9bff", label: locale === "es" ? "Programado" : "Scheduled" },
      published: { color: "#8eff71", label: locale === "es" ? "Publicado" : "Published" },
      failed: { color: "#ff716c", label: locale === "es" ? "Fallido" : "Failed" },
    };
    const { color, label } = map[status];
    return (
      <span
        className="px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider"
        style={{ backgroundColor: color + "1a", color, border: `1px solid ${color}33` }}
      >
        {label}
      </span>
    );
  };

  const platformIcon = (p: SocialPlatform) => {
    const info = platforms.find((pl) => pl.key === p);
    return info ? (
      <span
        className="w-6 h-6 rounded-md flex items-center justify-center text-xs"
        style={{ backgroundColor: info.bgColor }}
        title={info.name}
      >
        <span className="material-symbols-outlined" style={{ color: info.color, fontSize: "14px", fontVariationSettings: "'FILL' 1" }}>
          {info.icon}
        </span>
      </span>
    ) : null;
  };

  // ── Weekly calendar data ──
  const weekDays = locale === "es"
    ? ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"]
    : ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const calendarSlots = weekDays.map((day, i) => ({
    day,
    count: 0,
    isToday: i === new Date().getDay() - 1,
  }));

  return (
    <div className="space-y-8">
      {/* ══════════ HEADER ══════════ */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="font-[var(--font-headline)] text-4xl md:text-5xl font-bold tracking-tighter mb-2">{l.title}</h2>
          <p className="text-[#adaaaa] text-sm">{l.subtitle}</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowComposer(true)}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#c1fffe] text-[#006767] font-bold text-sm uppercase tracking-tight hover:shadow-[0_0_20px_rgba(0,255,255,0.4)] transition-all active:scale-95"
          >
            <span className="material-symbols-outlined text-base">add</span>
            {l.newPost}
          </button>
        </div>
      </div>

      {/* ══════════ PLATFORM CARDS ══════════ */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {platforms.map((p) => (
          <div
            key={p.key}
            className="bg-[#131313] rounded-2xl p-4 border border-[#484847]/10 hover:border-[#484847]/30 transition-all group cursor-pointer relative overflow-hidden"
          >
            {/* Glow effect */}
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              style={{ background: `radial-gradient(circle at center, ${p.color}08, transparent 70%)` }}
            />
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: p.bgColor }}>
                  <span className="material-symbols-outlined" style={{ color: p.color, fontVariationSettings: "'FILL' 1" }}>{p.icon}</span>
                </div>
                <span className="text-[10px] font-bold" style={{ color: p.color }}>{p.growth}</span>
              </div>
              <p className="text-[10px] text-[#767575] uppercase tracking-wider mb-0.5">{p.name}</p>
              <p className="text-lg font-bold">{p.followers}</p>
              <p className="text-[9px] text-[#484847] mt-1">{p.posts} {l.posts}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ══════════ TABS ══════════ */}
      <div className="flex items-center gap-1 bg-[#131313] p-1.5 rounded-2xl border border-[#484847]/10 w-fit">
        {(["feed", "calendar", "analytics"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-2 ${
              activeTab === tab ? "bg-[#c1fffe] text-[#006767]" : "text-[#adaaaa] hover:text-white"
            }`}
          >
            <span className="material-symbols-outlined text-sm">
              {tab === "feed" ? "dynamic_feed" : tab === "calendar" ? "calendar_month" : "analytics"}
            </span>
            {tab === "feed" ? l.recentPosts : tab === "calendar" ? l.contentCalendar : l.analytics}
          </button>
        ))}
      </div>

      {/* ══════════ TAB: FEED ══════════ */}
      {activeTab === "feed" && (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
          {/* Posts list */}
          <div className="space-y-4">
            {/* Filter pills */}
            <div className="flex items-center gap-2 mb-2">
              {(["all", "published", "scheduled", "draft"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setFilterStatus(s)}
                  className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider border transition-all ${
                    filterStatus === s
                      ? "bg-[#c1fffe]/10 border-[#c1fffe]/30 text-[#c1fffe]"
                      : "border-[#484847]/20 text-[#767575] hover:text-white"
                  }`}
                >
                  {s === "all" ? l.all : s === "published" ? l.published : s === "scheduled" ? l.scheduledPosts : l.drafts}
                </button>
              ))}
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <span className="material-symbols-outlined text-4xl text-[#484847] animate-spin">progress_activity</span>
              </div>
            ) : filteredPosts.length === 0 ? (
              <div className="bg-[#131313] rounded-3xl border border-[#484847]/10 p-12 text-center">
                <span className="material-symbols-outlined text-5xl text-[#484847] mb-4 block">post_add</span>
                <p className="text-[#767575] text-sm">{l.noPostsYet}</p>
                <button
                  onClick={() => setShowComposer(true)}
                  className="mt-4 px-6 py-2 rounded-xl bg-[#c1fffe]/10 border border-[#c1fffe]/20 text-[#c1fffe] text-xs font-bold hover:bg-[#c1fffe]/20 transition-all"
                >
                  {l.newPost}
                </button>
              </div>
            ) : (
              filteredPosts.map((post) => (
                <div
                  key={post.id}
                  className="bg-[#131313] rounded-2xl border border-[#484847]/10 overflow-hidden hover:border-[#484847]/25 transition-all group"
                >
                  <div className="p-5">
                    {/* Post header */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {post.platforms.map((p) => (
                          <span key={p}>{platformIcon(p)}</span>
                        ))}
                        {statusBadge(post.status)}
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleDeletePost(post.id)}
                          className="p-1.5 rounded-lg hover:bg-[#ff716c]/10 text-[#767575] hover:text-[#ff716c] transition-all"
                          title={l.delete}
                        >
                          <span className="material-symbols-outlined text-base">delete</span>
                        </button>
                        <button className="p-1.5 rounded-lg hover:bg-[#6e9bff]/10 text-[#767575] hover:text-[#6e9bff] transition-all" title={l.duplicatePost}>
                          <span className="material-symbols-outlined text-base">content_copy</span>
                        </button>
                      </div>
                    </div>

                    {/* Content */}
                    <p className="text-sm text-[#e0e0e0] leading-relaxed mb-3">{post.content}</p>

                    {/* Hashtags */}
                    {post.hashtags && post.hashtags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {post.hashtags.map((tag) => (
                          <span key={tag} className="px-2 py-0.5 rounded-md bg-[#c1fffe]/5 text-[#c1fffe] text-[10px] font-bold">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Metrics (if published) */}
                    {post.metrics && post.status === "published" && (
                      <div className="grid grid-cols-5 gap-2 mt-3 pt-3 border-t border-[#484847]/10">
                        {[
                          { icon: "favorite", val: post.metrics.likes, label: "Likes" },
                          { icon: "chat_bubble", val: post.metrics.comments, label: "Comments" },
                          { icon: "share", val: post.metrics.shares, label: "Shares" },
                          { icon: "visibility", val: post.metrics.reach, label: l.reach },
                          { icon: "trending_up", val: post.metrics.impressions, label: l.impressions },
                        ].map((m) => (
                          <div key={m.label} className="text-center">
                            <span className="material-symbols-outlined text-xs text-[#484847] block mb-0.5">{m.icon}</span>
                            <p className="text-xs font-bold text-[#adaaaa]">{m.val}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Schedule info */}
                    {post.scheduledAt && post.status === "scheduled" && (
                      <div className="mt-3 pt-3 border-t border-[#484847]/10 flex items-center gap-2 text-[#6e9bff]">
                        <span className="material-symbols-outlined text-sm">schedule</span>
                        <span className="text-xs font-bold">{new Date(post.scheduledAt).toLocaleString(locale)}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Right sidebar */}
          <div className="space-y-4">
            {/* Content Ideas */}
            <div className="bg-[#131313] rounded-2xl border border-[#484847]/10 overflow-hidden">
              <div className="px-5 py-4 border-b border-[#484847]/10">
                <h4 className="text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm text-[#c1fffe]">lightbulb</span>
                  {l.contentIdeas}
                </h4>
              </div>
              <div className="p-3 space-y-1">
                {l.ideas.map((idea, i) => (
                  <button
                    key={i}
                    onClick={() => { setContent(idea); setShowComposer(true); }}
                    className="w-full text-left px-3 py-2.5 rounded-xl text-xs text-[#adaaaa] hover:bg-[#1a1a1a] hover:text-white transition-all"
                  >
                    {idea}
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-[#131313] rounded-2xl border border-[#484847]/10 p-5">
              <h4 className="text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-sm text-[#c1fffe]">query_stats</span>
                {l.weeklyOverview}
              </h4>
              <div className="space-y-3">
                {[
                  { label: l.engagement, value: "0.0%", icon: "favorite", color: "#E1306C" },
                  { label: l.reach, value: "0", icon: "visibility", color: "#c1fffe" },
                  { label: l.impressions, value: "0", icon: "trending_up", color: "#8eff71" },
                  { label: l.clicks, value: "0", icon: "touch_app", color: "#6e9bff" },
                ].map((s) => (
                  <div key={s.label} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-sm" style={{ color: s.color }}>{s.icon}</span>
                      <span className="text-xs text-[#adaaaa]">{s.label}</span>
                    </div>
                    <span className="text-sm font-bold" style={{ color: s.color }}>{s.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Best time to post */}
            <div className="bg-gradient-to-br from-[#c1fffe]/5 to-[#6e9bff]/5 rounded-2xl border border-[#c1fffe]/10 p-5">
              <div className="flex items-center gap-2 mb-3">
                <span className="material-symbols-outlined text-[#c1fffe]">access_time</span>
                <h4 className="text-xs font-bold uppercase tracking-widest">{l.bestTime}</h4>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] text-[#767575] uppercase">Instagram</p>
                  <p className="text-lg font-bold text-[#c1fffe]">--:--</p>
                </div>
                <div>
                  <p className="text-[10px] text-[#767575] uppercase">LinkedIn</p>
                  <p className="text-lg font-bold text-[#6e9bff]">--:--</p>
                </div>
                <div>
                  <p className="text-[10px] text-[#767575] uppercase">TikTok</p>
                  <p className="text-lg font-bold text-[#00F2EA]">--:--</p>
                </div>
                <div>
                  <p className="text-[10px] text-[#767575] uppercase">X / Twitter</p>
                  <p className="text-lg font-bold text-white">--:--</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════ TAB: CALENDAR ══════════ */}
      {activeTab === "calendar" && (
        <div className="bg-[#131313] rounded-3xl border border-[#484847]/10 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-lg">{l.contentCalendar}</h3>
            <div className="flex items-center gap-2">
              {[l.thisWeek, l.thisMonth].map((p) => (
                <button key={p} className="px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider border border-[#484847]/20 text-[#767575] hover:text-white transition-all">
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Week grid */}
          <div className="grid grid-cols-7 gap-3">
            {calendarSlots.map((slot, i) => (
              <div
                key={i}
                className={`rounded-2xl border p-4 min-h-[140px] transition-all ${
                  slot.isToday
                    ? "border-[#c1fffe]/30 bg-[#c1fffe]/5"
                    : "border-[#484847]/10 hover:border-[#484847]/20"
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-xs font-bold ${slot.isToday ? "text-[#c1fffe]" : "text-[#767575]"}`}>
                    {slot.day}
                  </span>
                  {slot.isToday && (
                    <span className="w-2 h-2 rounded-full bg-[#c1fffe] animate-pulse" />
                  )}
                </div>

                {/* Post indicators */}
                <div className="space-y-1.5">
                  {Array.from({ length: slot.count }).map((_, j) => {
                    const colors = ["#E1306C", "#0A66C2", "#c1fffe", "#00F2EA"];
                    return (
                      <div
                        key={j}
                        className="h-6 rounded-md px-2 flex items-center text-[9px] font-bold truncate"
                        style={{ backgroundColor: colors[j % colors.length] + "1a", color: colors[j % colors.length] }}
                      >
                        {j === 0 ? "📸 Post" : j === 1 ? "🎥 Reel" : j === 2 ? "📊 Story" : "💬 Thread"}
                      </div>
                    );
                  })}
                </div>

                {/* Add button */}
                <button
                  onClick={() => setShowComposer(true)}
                  className="mt-2 w-full py-1 rounded-md border border-dashed border-[#484847]/20 text-[#484847] hover:border-[#c1fffe]/30 hover:text-[#c1fffe] transition-all text-[10px] flex items-center justify-center gap-1"
                >
                  <span className="material-symbols-outlined text-xs">add</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ══════════ TAB: ANALYTICS ══════════ */}
      {activeTab === "analytics" && (
        <div className="space-y-6">
          {/* Top metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: l.followers, value: "0", delta: "0", icon: "group", color: "#c1fffe" },
              { label: l.engagement, value: "0.0%", delta: "0", icon: "favorite", color: "#E1306C" },
              { label: l.reach, value: "0", delta: "0%", icon: "visibility", color: "#8eff71" },
              { label: l.impressions, value: "0", delta: "0%", icon: "trending_up", color: "#6e9bff" },
            ].map((m) => (
              <div key={m.label} className="bg-[#131313] rounded-2xl p-5 border border-[#484847]/10">
                <div className="flex items-center justify-between mb-3">
                  <span className="material-symbols-outlined" style={{ color: m.color + "80", fontVariationSettings: "'FILL' 1" }}>{m.icon}</span>
                  <span className="text-[10px] font-bold" style={{ color: m.color }}>{m.delta}</span>
                </div>
                <p className="text-[10px] text-[#767575] uppercase tracking-wider mb-1">{m.label}</p>
                <p className="text-2xl font-bold" style={{ color: m.color }}>{m.value}</p>
              </div>
            ))}
          </div>

          {/* Platform breakdown */}
          <div className="bg-[#131313] rounded-3xl border border-[#484847]/10 overflow-hidden">
            <div className="px-6 py-4 border-b border-[#484847]/10">
              <h3 className="font-bold">{l.platformStats}</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {platforms.filter(p => p.key !== "whatsapp").map((p) => {
                  const maxFollowers = 12400;
                  const followerNum = parseFloat(p.followers.replace("K", "")) * (p.followers.includes("K") ? 1000 : 1);
                  const widthPct = Math.round((followerNum / maxFollowers) * 100);
                  return (
                    <div key={p.key} className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: p.bgColor }}>
                        <span className="material-symbols-outlined" style={{ color: p.color, fontVariationSettings: "'FILL' 1" }}>{p.icon}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-bold">{p.name}</span>
                          <span className="text-xs text-[#adaaaa]">{p.followers} {l.followers.toLowerCase()}</span>
                        </div>
                        <div className="h-2 bg-[#1a1a1a] rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-1000"
                            style={{ width: `${widthPct}%`, backgroundColor: p.color }}
                          />
                        </div>
                      </div>
                      <span className="text-xs font-bold flex-shrink-0" style={{ color: p.color }}>{p.growth}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Engagement chart placeholder */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-[#131313] rounded-2xl border border-[#484847]/10 p-6">
              <h4 className="text-sm font-bold mb-4">{l.engagement} — {l.thisWeek}</h4>
              {/* Mini bar chart */}
              <div className="flex items-end justify-between h-32 gap-2">
                {weekDays.map((day, i) => {
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <div
                        className="w-full rounded-t-md transition-all hover:opacity-80"
                        style={{
                          height: `10%`,
                          backgroundColor: calendarSlots[i]?.isToday ? "#c1fffe" : "#c1fffe30",
                        }}
                      />
                      <span className={`text-[9px] ${calendarSlots[i]?.isToday ? "text-[#c1fffe] font-bold" : "text-[#484847]"}`}>{day}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-[#131313] rounded-2xl border border-[#484847]/10 p-6">
              <h4 className="text-sm font-bold mb-4">{l.topPost}</h4>
              <div className="bg-[#0e0e0e] rounded-xl p-12 border border-[#484847]/10 text-center">
                 <p className="text-xs text-[#767575]">{locale === "es" ? "Sin datos aún" : "No data yet"}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════ COMPOSER MODAL ══════════ */}
      {showComposer && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#131313] rounded-3xl border border-[#484847]/20 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            {/* Modal header */}
            <div className="flex items-center justify-between p-6 border-b border-[#484847]/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#c1fffe]/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[#c1fffe]">edit_square</span>
                </div>
                <div>
                  <h3 className="font-bold">{l.createPost}</h3>
                  <p className="text-[10px] text-[#767575]">{content.length} {l.characters}</p>
                </div>
              </div>
              <button onClick={() => setShowComposer(false)} className="p-2 rounded-xl hover:bg-white/5 text-[#767575] hover:text-white transition-all">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Platform selector */}
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-[#767575] mb-2 block">{l.selectPlatforms}</label>
                <div className="flex flex-wrap gap-2">
                  {platforms.map((p) => (
                    <button
                      key={p.key}
                      onClick={() => togglePlatform(p.key)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold border transition-all ${
                        selectedPlatforms.includes(p.key)
                          ? "border-transparent text-white"
                          : "border-[#484847]/20 text-[#767575] hover:border-[#484847]/40"
                      }`}
                      style={selectedPlatforms.includes(p.key) ? { backgroundColor: p.bgColor, color: p.color, borderColor: p.color + "40" } : {}}
                    >
                      <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>{p.icon}</span>
                      {p.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Content */}
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-[#767575] mb-2 block">{l.postContent}</label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder={l.contentPlaceholder}
                  rows={5}
                  className={inputSm + " resize-none"}
                />
              </div>

              {/* Hashtags */}
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-[#767575] mb-2 block">{l.addHashtags}</label>
                <input
                  value={hashtags}
                  onChange={(e) => setHashtags(e.target.value)}
                  placeholder={l.hashtagPlaceholder}
                  className={inputSm}
                />
                {hashtags && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {hashtags.split(" ").filter(h => h.startsWith("#")).map((tag) => (
                      <span key={tag} className="px-2 py-0.5 rounded-md bg-[#c1fffe]/10 text-[#c1fffe] text-[10px] font-bold">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Schedule */}
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-[#767575] mb-2 block">{l.scheduleDate}</label>
                <input
                  type="datetime-local"
                  value={scheduleDate}
                  onChange={(e) => setScheduleDate(e.target.value)}
                  className={inputSm}
                />
              </div>

              {/* Media upload area */}
              <div className="border-2 border-dashed border-[#484847]/20 rounded-2xl p-8 text-center hover:border-[#c1fffe]/20 transition-all cursor-pointer">
                <span className="material-symbols-outlined text-3xl text-[#484847] mb-2 block">add_photo_alternate</span>
                <p className="text-xs text-[#767575]">
                  {locale === "es" ? "Arrastra imágenes o haz clic para subir" : "Drag images or click to upload"}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 p-6 border-t border-[#484847]/10">
              <button
                onClick={() => setShowComposer(false)}
                className="px-5 py-2.5 rounded-xl border border-[#484847]/20 text-[#adaaaa] text-sm font-bold hover:bg-white/5 transition-all"
              >
                {l.cancel}
              </button>
              <button
                onClick={() => handleSavePost("draft")}
                disabled={isSaving || !content.trim()}
                className="px-5 py-2.5 rounded-xl border border-[#6e9bff]/30 text-[#6e9bff] text-sm font-bold hover:bg-[#6e9bff]/10 transition-all disabled:opacity-40"
              >
                {l.saveDraft}
              </button>
              {scheduleDate ? (
                <button
                  onClick={() => handleSavePost("scheduled")}
                  disabled={isSaving || !content.trim()}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#6e9bff] text-white text-sm font-bold hover:shadow-[0_0_20px_rgba(110,155,255,0.3)] transition-all disabled:opacity-40"
                >
                  <span className="material-symbols-outlined text-sm">schedule</span>
                  {l.schedulePost}
                </button>
              ) : (
                <button
                  onClick={() => handleSavePost("published")}
                  disabled={isSaving || !content.trim()}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#c1fffe] text-[#006767] text-sm font-black hover:shadow-[0_0_20px_rgba(0,255,255,0.3)] transition-all disabled:opacity-40"
                >
                  <span className="material-symbols-outlined text-sm icon-filled">send</span>
                  {isSaving ? "..." : l.publishNow}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
