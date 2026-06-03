import { IonContent, IonPage } from "@ionic/react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, ArrowRight, AlertCircle, Eye, EyeOff, Wrench, CheckCircle2, ArrowLeft, Send } from "lucide-react";

/* SVG paths de redes sociales */
const SOCIAL = [
  {
    label: "Instagram",
    path: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z",
  },
  {
    label: "Facebook",
    path: "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z",
  },
  {
    label: "WhatsApp",
    path: "M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z",
  },
  {
    label: "TikTok",
    path: "M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.73a4.85 4.85 0 01-1.01-.04z",
  },
];

const SocialIcon: React.FC<{ label: string; path: string }> = ({ label, path }) => (
  <a href="#" title={label} aria-label={label}
    className="w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-150 flex-shrink-0"
    style={{ background: "var(--bg-card)", border: "1px solid var(--border-light)" }}
    onMouseEnter={e => {
      e.currentTarget.style.borderColor = "#DC2626";
      e.currentTarget.style.background = "rgba(220,38,38,0.1)";
      e.currentTarget.style.transform = "translateY(-2px)";
    }}
    onMouseLeave={e => {
      e.currentTarget.style.borderColor = "var(--border-light)";
      e.currentTarget.style.background = "var(--bg-card)";
      e.currentTarget.style.transform = "translateY(0)";
    }}>
    <svg width="19" height="19" viewBox="0 0 24 24" fill="currentColor" style={{ color: "var(--text-secondary)" }}>
      <path d={path} />
    </svg>
  </a>
);
import { useState } from "react";
import { useHistory } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";

const MOTO = "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1920&q=85&auto=format&fit=crop";

type Mode = "login" | "forgot" | "forgot-done";

const Login: React.FC = () => {
  const { login } = useAuth();
  const history = useHistory();

  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  const [mode, setMode]               = useState<Mode>("login");
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);

  const showError = (msg: string) => {
    setError(msg);
    setTimeout(() => setError(""), 3500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { showError("Completa todos los campos."); return; }
    setLoading(true); setError("");
    try { await login(email, password); history.replace("/dashboard"); }
    catch { showError("Credenciales incorrectas."); }
    finally { setLoading(false); }
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) return;
    setForgotLoading(true);
    try { await api.post("/forgot-password", { email: forgotEmail }); } catch {}
    finally { setForgotLoading(false); }
    setMode("forgot-done");
  };

  /* ── Formulario (mismo en móvil y desktop) ── */
  const FormContent = () => (
    <AnimatePresence mode="wait">

      {/* LOGIN */}
      {mode === "login" && (
        <motion.div key="login"
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}>

          <p className="text-[10px] font-bold tracking-[0.2em] uppercase mb-2" style={{ color: "#DC2626" }}>
            Acceso al panel
          </p>
          <h2 style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-0.03em", color: "#F5F5F5", lineHeight: 1.1, marginBottom: 4 }}>
            Iniciar sesión
          </h2>
          <p className="text-sm mb-6" style={{ color: "var(--text-muted)" }}>
            Ingresa tus credenciales para continuar
          </p>

          <div style={{ height: 1, background: "var(--border)", marginBottom: 22 }} />

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            {/* Email */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-[0.14em] mb-1.5"
                style={{ color: "var(--text-muted)" }}>
                Correo electrónico
              </label>
              <div className="relative">
                <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="correo@taller.com" autoComplete="email"
                  className="w-full pl-10 pr-4 py-3 text-sm outline-none"
                  style={{
                    background: "var(--bg-card)", borderRadius: 10, color: "var(--text-primary)",
                    border: error ? "1px solid var(--danger)" : "1px solid var(--border)",
                    transition: "border-color 0.15s",
                  }}
                  onFocus={e => e.currentTarget.style.borderColor = "#DC2626"}
                  onBlur={e => e.currentTarget.style.borderColor = error ? "var(--danger)" : "var(--border)"} />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[11px] font-bold uppercase tracking-[0.14em]" style={{ color: "var(--text-muted)" }}>
                  Contraseña
                </label>
                <button type="button" onClick={() => setMode("forgot")}
                  className="text-xs font-semibold" style={{ color: "#DC2626" }}
                  onMouseEnter={e => e.currentTarget.style.opacity = "0.7"}
                  onMouseLeave={e => e.currentTarget.style.opacity = "1"}>
                  ¿Olvidaste la contraseña?
                </button>
              </div>
              <div className="relative">
                <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
                <input type={showPass ? "text" : "password"} value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••••" autoComplete="current-password"
                  className="w-full pl-10 pr-10 py-3 text-sm outline-none"
                  style={{
                    background: "var(--bg-card)", borderRadius: 10, color: "var(--text-primary)",
                    border: error ? "1px solid var(--danger)" : "1px solid var(--border)",
                    transition: "border-color 0.15s",
                  }}
                  onFocus={e => e.currentTarget.style.borderColor = "#DC2626"}
                  onBlur={e => e.currentTarget.style.borderColor = error ? "var(--danger)" : "var(--border)"} />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }}
                  onMouseEnter={e => e.currentTarget.style.opacity = "0.6"}
                  onMouseLeave={e => e.currentTarget.style.opacity = "1"}>
                  {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="flex items-center gap-2 px-3.5 py-3 text-sm"
                  style={{ background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 10, color: "var(--danger)" }}>
                  <AlertCircle size={14} className="flex-shrink-0" />{error}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit */}
            <motion.button type="submit" disabled={loading} whileTap={{ scale: 0.985 }}
              className="relative w-full font-bold text-sm text-white flex items-center justify-center gap-2 overflow-hidden group"
              style={{
                padding: "13px 24px", borderRadius: 10,
                background: loading ? "var(--border)" : "linear-gradient(135deg, #DC2626 0%, #B91C1C 60%, #991B1B 100%)",
                boxShadow: !loading ? "0 4px 28px rgba(220,38,38,0.35), inset 0 1px 0 rgba(255,255,255,0.1)" : "none",
                transition: "box-shadow 0.2s var(--ease-out), transform 0.2s var(--ease-out)",
              }}
              onMouseEnter={e => { if (!loading) { e.currentTarget.style.boxShadow = "0 6px 36px rgba(220,38,38,0.5)"; e.currentTarget.style.transform = "translateY(-1px)"; } }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = loading ? "none" : "0 4px 28px rgba(220,38,38,0.35)"; e.currentTarget.style.transform = "translateY(0)"; }}>
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.07), transparent)" }} />
              {loading
                ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <span className="relative flex items-center gap-2">Entrar al sistema <ArrowRight size={15} /></span>
              }
            </motion.button>
          </form>

        </motion.div>
      )}

      {/* FORGOT PASSWORD */}
      {mode === "forgot" && (
        <motion.div key="forgot"
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}>

          <button onClick={() => setMode("login")}
            className="flex items-center gap-1.5 text-xs font-semibold mb-7"
            style={{ color: "var(--text-muted)" }}
            onMouseEnter={e => e.currentTarget.style.color = "var(--text-primary)"}
            onMouseLeave={e => e.currentTarget.style.color = "var(--text-muted)"}>
            <ArrowLeft size={13} /> Volver al inicio de sesión
          </button>

          <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-5"
            style={{ background: "var(--accent-subtle)", border: "1px solid rgba(220,38,38,0.2)" }}>
            <Mail size={20} style={{ color: "#DC2626" }} />
          </div>

          <h2 style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.03em", color: "#F5F5F5", lineHeight: 1.1, marginBottom: 6 }}>
            Recuperar contraseña
          </h2>
          <p className="text-sm mb-7" style={{ color: "var(--text-muted)" }}>
            Ingresa tu correo y te enviaremos las instrucciones para restablecerla.
          </p>

          <form onSubmit={handleForgot} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-[0.14em] mb-1.5"
                style={{ color: "var(--text-muted)" }}>
                Correo electrónico
              </label>
              <div className="relative">
                <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
                <input type="email" value={forgotEmail} onChange={e => setForgotEmail(e.target.value)}
                  placeholder="correo@taller.com" autoFocus
                  className="w-full pl-10 pr-4 py-3 text-sm outline-none"
                  style={{
                    background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 10,
                    color: "var(--text-primary)", transition: "border-color 0.15s",
                  }}
                  onFocus={e => e.currentTarget.style.borderColor = "#DC2626"}
                  onBlur={e => e.currentTarget.style.borderColor = "var(--border)"} />
              </div>
            </div>
            <motion.button type="submit" disabled={forgotLoading || !forgotEmail} whileTap={{ scale: 0.985 }}
              className="w-full font-bold text-sm text-white flex items-center justify-center gap-2"
              style={{
                padding: "13px 24px", borderRadius: 10,
                background: (forgotLoading || !forgotEmail) ? "var(--border)" : "linear-gradient(135deg, #DC2626 0%, #991B1B 100%)",
                boxShadow: (!forgotLoading && forgotEmail) ? "0 4px 28px rgba(220,38,38,0.35)" : "none",
                transition: "background 0.15s, box-shadow 0.15s",
              }}>
              {forgotLoading
                ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <span className="flex items-center gap-2">Enviar instrucciones <Send size={13} /></span>
              }
            </motion.button>
          </form>
        </motion.div>
      )}

      {/* FORGOT DONE */}
      {mode === "forgot-done" && (
        <motion.div key="forgot-done"
          initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
          transition={{ duration: 0.28, ease: [0.23, 1, 0.32, 1] }}
          className="flex flex-col items-center text-center py-6">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.1, stiffness: 260, damping: 20 }}
            className="w-16 h-16 rounded-full flex items-center justify-center mb-5"
            style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)" }}>
            <CheckCircle2 size={30} style={{ color: "var(--success)" }} />
          </motion.div>
          <h2 style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.03em", color: "#F5F5F5", marginBottom: 8 }}>
            Correo enviado
          </h2>
          <p className="text-sm leading-relaxed mb-2" style={{ color: "var(--text-secondary)" }}>
            Si <span className="font-semibold" style={{ color: "#F5F5F5" }}>{forgotEmail}</span> está
            registrado, recibirás las instrucciones en tu bandeja.
          </p>
          <p className="text-xs mb-8" style={{ color: "var(--text-muted)" }}>Revisa también la carpeta de spam.</p>
          <button onClick={() => { setMode("login"); setForgotEmail(""); }}
            className="flex items-center gap-2 text-sm font-semibold" style={{ color: "#DC2626" }}
            onMouseEnter={e => e.currentTarget.style.opacity = "0.7"}
            onMouseLeave={e => e.currentTarget.style.opacity = "1"}>
            <ArrowLeft size={13} /> Volver al inicio de sesión
          </button>
        </motion.div>
      )}

    </AnimatePresence>
  );

  return (
    <IonPage>
      <IonContent fullscreen scrollY={true}>

        {/* ════════════════════════════════════
            MÓVIL — layout vertical stacked
            ════════════════════════════════════ */}
        <div className="lg:hidden flex flex-col" style={{ minHeight: "100vh" }}>

          {/* Hero: foto con logo + headline */}
          <div className="relative overflow-hidden flex-shrink-0" style={{ height: "44vh", minHeight: 220 }}>
            <img src={MOTO} alt="" className="absolute inset-0 w-full h-full object-cover"
              style={{ filter: "brightness(0.25) saturate(0.5)" }} />
            <div className="absolute inset-0"
              style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.05) 0%, rgba(12,12,12,0.85) 100%)" }} />

            <div className="relative h-full flex flex-col justify-between p-6 pt-10">
              {/* Logo */}
              <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.45 }}
                className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: "#DC2626" }}>
                  <Wrench size={16} className="text-white" strokeWidth={2.5} />
                </div>
                <div>
                  <p className="font-black text-xs tracking-[0.18em]" style={{ color: "#F5F5F5" }}>TALLER MOTOS</p>
                  <p className="text-[9px] tracking-widest font-semibold" style={{ color: "rgba(255,255,255,0.38)" }}>
                    SERVICIO TÉCNICO ESPECIALIZADO
                  </p>
                </div>
              </motion.div>

              {/* Headline */}
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35, duration: 0.5 }}>
                <div style={{ width: 30, height: 2.5, background: "#DC2626", borderRadius: 2, marginBottom: 10 }} />
                <h1 className="font-black leading-[0.9]"
                  style={{ fontSize: "clamp(1.9rem, 8vw, 2.6rem)", letterSpacing: "-0.04em", color: "#F5F5F5" }}>
                  EXPERTOS<br />EN CADA<br />
                  <span style={{ color: "#DC2626" }}>REPARACIÓN.</span>
                </h1>
              </motion.div>
            </div>
          </div>

          {/* Formulario: fondo sólido, sin tarjeta flotante */}
          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.45 }}
            className="flex-1 px-5 pt-7 pb-10"
            style={{ background: "var(--bg-base)" }}>
            <FormContent />

            {/* Redes sociales móvil */}
            <div style={{ marginTop: 28 }}>
              <div style={{ height: 1, background: "var(--border)", marginBottom: 20 }} />
              <div className="flex items-center justify-between mb-3">
                <p className="text-[11px] font-bold tracking-[0.16em] uppercase"
                  style={{ color: "var(--text-muted)" }}>
                  Síguenos
                </p>
                <p className="text-[11px]" style={{ color: "#3A3A3A" }}>
                  UTN Guanacaste · 2026
                </p>
              </div>
              <div className="flex items-center gap-3">
                {SOCIAL.map(s => <SocialIcon key={s.label} {...s} />)}
              </div>
            </div>
          </motion.div>
        </div>

        {/* ════════════════════════════════════
            DESKTOP — layout dos columnas
            ════════════════════════════════════ */}
        <div className="hidden lg:flex h-screen overflow-hidden" style={{ background: "var(--bg-base)" }}>

          {/* Panel izquierdo — foto */}
          <div className="lg:w-1/2 relative overflow-hidden">
            <img src={MOTO} alt="" className="absolute inset-0 w-full h-full object-cover"
              style={{ filter: "brightness(0.28) saturate(0.6)" }} />
            <div className="absolute inset-0"
              style={{ background: "linear-gradient(to right, transparent 60%, var(--bg-base))" }} />
            <div className="absolute inset-0"
              style={{ background: "linear-gradient(to top, var(--bg-base) 0%, transparent 40%)" }} />

            <div className="relative h-full flex flex-col justify-between p-12">
              <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "#DC2626" }}>
                  <Wrench size={20} className="text-white" strokeWidth={2.5} />
                </div>
                <div>
                  <p className="font-black text-sm tracking-[0.18em]" style={{ color: "var(--text-primary)" }}>
                    TALLER MOTOS
                  </p>
                  <p className="text-[10px] tracking-widest font-medium" style={{ color: "var(--text-muted)" }}>
                    SERVICIO TÉCNICO ESPECIALIZADO
                  </p>
                </div>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45, duration: 0.75 }}>
                <div style={{ width: 40, height: 3, background: "#DC2626", borderRadius: 2, marginBottom: 22 }} />
                <p className="text-[11px] font-bold tracking-[0.2em] uppercase mb-4" style={{ color: "#DC2626" }}>
                  Tu moto, nuestra prioridad
                </p>
                <h1 className="font-black leading-[0.93] mb-6"
                  style={{ fontSize: "clamp(2.6rem,5vw,4.2rem)", letterSpacing: "-0.04em", color: "var(--text-primary)" }}>
                  EXPERTOS<br />EN CADA<br />
                  <span style={{ color: "#DC2626" }}>REPARACIÓN.</span>
                </h1>
                <p style={{ fontSize: 14, lineHeight: 1.7, color: "#7A7A7A", maxWidth: 340, marginBottom: 28 }}>
                  Técnicos certificados, diagnóstico preciso y seguimiento en tiempo real de cada trabajo.
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {["✦  Diagnóstico profesional garantizado", "✦  Entrega puntual, siempre", "✦  Transparencia total en cada etapa"].map((item, i) => (
                    <motion.p key={item}
                      initial={{ opacity: 0, x: -14 }} animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.7 + i * 0.1, duration: 0.45 }}
                      style={{ fontSize: 12, color: "#6B6B6B" }}>
                      {item}
                    </motion.p>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>

          {/* Panel derecho — formulario */}
          <div className="lg:w-[48%] flex items-center justify-center"
            style={{ background: "var(--bg-base)" }}>

            <div className="w-full max-w-[420px] px-10">

              {/* Formulario */}
              <FormContent />

              {/* Redes sociales — justo debajo del form */}
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.55 }}
                style={{ marginTop: 28 }}>
                <div style={{ height: 1, background: "var(--border)", marginBottom: 20 }} />
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-bold tracking-[0.16em] uppercase"
                    style={{ color: "var(--text-muted)" }}>
                    Síguenos
                  </p>
                  <p className="text-[11px]" style={{ color: "#3A3A3A" }}>
                    UTN Guanacaste · 2026
                  </p>
                </div>
                <div className="flex items-center gap-3 mt-3">
                  {SOCIAL.map(s => <SocialIcon key={s.label} {...s} />)}
                </div>
              </motion.div>

            </div>
          </div>

        </div>

      </IonContent>
    </IonPage>
  );
};

export default Login;
