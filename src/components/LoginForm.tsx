"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Props {
  locale: string;
}

const labels = {
  es: {
    title: "Acceso al Sistema",
    subtitle: "Panel de Administración Techlandiard",
    email: "Correo electrónico",
    password: "Contraseña",
    signIn: "Iniciar Sesión",
    signUp: "Crear Cuenta",
    google: "Continuar con Google",
    or: "O",
    noAccount: "¿No tienes cuenta?",
    hasAccount: "¿Ya tienes cuenta?",
    createHere: "Crear una aquí",
    loginHere: "Iniciar sesión",
    name: "Nombre completo",
    emailPlaceholder: "tu@email.com",
    passwordPlaceholder: "••••••••",
    namePlaceholder: "Tu nombre",
    error: "Error de autenticación",
    backHome: "← Volver al inicio",
  },
  en: {
    title: "System Access",
    subtitle: "Techlandiard Admin Panel",
    email: "Email",
    password: "Password",
    signIn: "Sign In",
    signUp: "Create Account",
    google: "Continue with Google",
    or: "Or",
    noAccount: "Don't have an account?",
    hasAccount: "Already have an account?",
    createHere: "Create one here",
    loginHere: "Sign in",
    name: "Full name",
    emailPlaceholder: "you@email.com",
    passwordPlaceholder: "••••••••",
    namePlaceholder: "Your name",
    error: "Authentication error",
    backHome: "← Back to home",
  },
};

export default function LoginForm({ locale }: Props) {
  const l = locale === "en" ? labels.en : labels.es;
  const { signIn, signUp, signInWithGoogle } = useAuth();
  const router = useRouter();

  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (mode === "login") {
        await signIn(email, password);
      } else {
        await signUp(email, password, name);
      }
      router.push(`/${locale}/admin`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError("");
    setLoading(true);
    try {
      await signInWithGoogle();
      router.push(`/${locale}/admin`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full bg-[#0e0e0e] border border-[#484847]/30 rounded-xl py-3.5 px-4 text-white placeholder:text-[#767575] focus:ring-2 focus:ring-[#c1fffe]/50 focus:border-[#c1fffe]/30 outline-none transition-all text-sm";

  return (
    <div className="min-h-screen bg-[#0e0e0e] flex items-center justify-center px-4">
      {/* Background glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-[#c1fffe]/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Back link */}
        <Link href={`/${locale}`} className="inline-flex items-center gap-2 text-sm text-[#767575] hover:text-[#c1fffe] transition-colors mb-8">
          {l.backHome}
        </Link>

        {/* Card */}
        <div className="bg-[#131313] rounded-3xl border border-[#484847]/15 p-8 md:p-10 shadow-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-[#c1fffe]/10 flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-[#c1fffe] text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                shield_person
              </span>
            </div>
            <h1 className="text-2xl font-black text-white mb-1">{l.title}</h1>
            <p className="text-sm text-[#767575]">{l.subtitle}</p>
          </div>

          {/* Google button */}
          <button
            onClick={handleGoogle}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 py-3.5 rounded-xl border border-[#484847]/30 text-white text-sm font-medium hover:bg-[#1a1a1a] hover:border-[#484847]/50 transition-all disabled:opacity-50 mb-6"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            {l.google}
          </button>

          {/* Divider */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-px bg-[#484847]/20"></div>
            <span className="text-[10px] uppercase tracking-widest text-[#767575]">{l.or}</span>
            <div className="flex-1 h-px bg-[#484847]/20"></div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "register" && (
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-[#767575] mb-2">{l.name}</label>
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder={l.namePlaceholder} className={inputClass} required />
              </div>
            )}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-[#767575] mb-2">{l.email}</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={l.emailPlaceholder} className={inputClass} required />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-[#767575] mb-2">{l.password}</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder={l.passwordPlaceholder} className={inputClass} required minLength={6} />
            </div>

            {error && (
              <div className="bg-[#ff716c]/10 border border-[#ff716c]/20 rounded-xl px-4 py-3 text-sm text-[#ff716c]">
                {l.error}: {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-[#c1fffe] text-[#006767] font-black text-sm uppercase tracking-tight hover:shadow-[0_0_25px_rgba(0,255,255,0.3)] transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? "..." : mode === "login" ? l.signIn : l.signUp}
            </button>
          </form>

          {/* Toggle */}
          <p className="text-sm text-[#767575] text-center mt-6">
            {mode === "login" ? l.noAccount : l.hasAccount}{" "}
            <button
              onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); }}
              className="text-[#c1fffe] font-bold hover:underline"
            >
              {mode === "login" ? l.createHere : l.loginHere}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
