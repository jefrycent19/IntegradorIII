import { IonContent, IonPage } from "@ionic/react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, ArrowRight, AlertCircle, Eye, EyeOff, Wrench, CheckCircle2, ArrowLeft, Send } from "lucide-react";
import { useState } from "react";
import { useHistory } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";

const MOTO = "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1920&q=85&auto=format&fit=crop";

type Mode = "login" | "forgot" | "forgot-done";

const Login: React.FC = () => {
  const { login } = useAuth();
  const history = useHistory();

  // Login state
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  // Forgot state
  const [mode, setMode]             = useState<Mode>("login");
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);

  const showError = (msg: string) => {
    setError(msg);
    setTimeout(() => setError(""), 3000);
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

  return (
    <IonPage>
      <IonContent fullscreen scrollY={false}>
        <div className="relative flex h-full min-h-screen overflow-hidden" style={{ background: "var(--bg-base)" }}>

          {/* === FOTO MOTO — lado izquierdo === */}
          <div className="hidden lg:block lg:w-1/2 relative overflow-hidden">
            <img src={MOTO} alt="" className="absolute inset-0 w-full h-full object-cover"
              style={{ filter: "brightness(0.3) saturate(0.8)" }} />
            <div className="absolute inset-0" style={{ background: "linear-gradient(to right, transparent 60%, var(--bg-base))" }} />
            <div className="absolute inset-0" style={{ background: "linear-gradient(to top, var(--bg-base) 0%, transparent 40%)" }} />

            <div className="relative h-full flex flex-col justify-between p-12">
              <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "var(--accent)" }}>
                  <Wrench size={20} className="text-white" />
                </div>
                <div>
                  <p className="font-black text-sm tracking-wider" style={{ color: "var(--text-primary)" }}>TALLER MOTOS</p>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>Sistema de Gestion</p>
                </div>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.8 }}>
                <p className="text-xs font-bold tracking-widest uppercase mb-4" style={{ color: "var(--accent)" }}>
                  Control total del taller
                </p>
                <h1 className="font-black leading-none mb-6"
                  style={{ fontSize: "clamp(2.5rem,5vw,4rem)", letterSpacing: "-0.04em", color: "var(--text-primary)" }}>
                  GESTIÓN<br />
                  <span style={{ color: "var(--accent)" }}>INTELIGENTE</span><br />
                  DE MOTOS
                </h1>
                <p className="text-base leading-relaxed max-w-sm" style={{ color: "var(--text-secondary)" }}>
                  OT, inventario, clientes y métricas en tiempo real para tu taller.
                </p>
              </motion.div>
            </div>
          </div>

          {/* === FORMULARIO — lado derecho === */}
          <div className="flex items-center justify-center w-full lg:w-1/2 p-6" style={{ background: "var(--bg-base)" }}>
            <div className="w-full max-w-sm overflow-hidden">

              {/* Mobile logo */}
              <div className="flex lg:hidden items-center gap-2 mb-10">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "var(--accent)" }}>
                  <Wrench size={16} className="text-white" />
                </div>
                <p className="font-black text-sm tracking-wider" style={{ color: "var(--text-primary)" }}>TALLER MOTOS</p>
              </div>

              <AnimatePresence mode="wait">

                {/* ===== LOGIN ===== */}
                {mode === "login" && (
                  <motion.div key="login"
                    initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.25 }}>

                    <p className="text-xs font-semibold tracking-widest uppercase mb-2" style={{ color: "var(--accent)" }}>
                      Bienvenido de vuelta
                    </p>
                    <h2 className="font-black text-3xl mb-1" style={{ color: "var(--text-primary)", letterSpacing: "-0.03em" }}>
                      Iniciar sesion
                    </h2>
                    <p className="text-sm mb-8" style={{ color: "var(--text-muted)" }}>
                      Ingresa tus credenciales para continuar
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-4">
                      {/* Email */}
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "var(--text-muted)" }}>
                          Correo electronico
                        </label>
                        <div className="relative">
                          <Mail size={15} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
                          <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                            placeholder="correo@taller.com"
                            className="w-full pl-11 pr-4 py-3.5 text-sm rounded-xl outline-none transition-all"
                            style={{ background: "var(--bg-card)", border: error ? "1px solid var(--danger)" : "1px solid var(--border)", color: "var(--text-primary)" }}
                            onFocus={e => e.currentTarget.style.border = "1px solid var(--accent)"}
                            onBlur={e => e.currentTarget.style.border = error ? "1px solid var(--danger)" : "1px solid var(--border)"} />
                        </div>
                      </div>

                      {/* Password */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
                            Contrasena
                          </label>
                          <button type="button" onClick={() => setMode("forgot")}
                            className="text-xs font-medium transition-colors"
                            style={{ color: "var(--accent)" }}
                            onMouseEnter={e => e.currentTarget.style.opacity = "0.75"}
                            onMouseLeave={e => e.currentTarget.style.opacity = "1"}>
                            ¿Olvidaste tu contraseña?
                          </button>
                        </div>
                        <div className="relative">
                          <Lock size={15} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
                          <input type={showPass ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)}
                            placeholder="••••••••••"
                            className="w-full pl-11 pr-11 py-3.5 text-sm rounded-xl outline-none transition-all"
                            style={{ background: "var(--bg-card)", border: error ? "1px solid var(--danger)" : "1px solid var(--border)", color: "var(--text-primary)" }}
                            onFocus={e => e.currentTarget.style.border = "1px solid var(--accent)"}
                            onBlur={e => e.currentTarget.style.border = error ? "1px solid var(--danger)" : "1px solid var(--border)"} />
                          <button type="button" onClick={() => setShowPass(!showPass)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 transition-colors"
                            style={{ color: "var(--text-muted)" }}>
                            {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                          </button>
                        </div>
                      </div>

                      {/* Error */}
                      {error && (
                        <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
                          className="flex items-center gap-2 rounded-xl px-4 py-3 text-sm"
                          style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "var(--danger)" }}>
                          <AlertCircle size={14} className="flex-shrink-0" />{error}
                        </motion.div>
                      )}

                      {/* Submit */}
                      <motion.button type="submit" disabled={loading} whileTap={{ scale: 0.98 }}
                        className="relative w-full overflow-hidden font-bold text-sm text-white flex items-center justify-center gap-2 mt-2 group"
                        style={{
                          padding: "14px 24px", borderRadius: "999px",
                          background: loading ? "var(--border)" : "linear-gradient(135deg, #F97316 0%, #EA580C 50%, #C2410C 100%)",
                          boxShadow: !loading ? "0 4px 32px rgba(249,115,22,0.35), inset 0 1px 0 rgba(255,255,255,0.15)" : "none",
                          transition: "all 0.2s ease",
                        }}
                        onMouseEnter={e => { if (!loading) { e.currentTarget.style.boxShadow = "0 8px 40px rgba(249,115,22,0.5), inset 0 1px 0 rgba(255,255,255,0.2)"; e.currentTarget.style.transform = "translateY(-1px)"; } }}
                        onMouseLeave={e => { e.currentTarget.style.boxShadow = loading ? "none" : "0 4px 32px rgba(249,115,22,0.35), inset 0 1px 0 rgba(255,255,255,0.15)"; e.currentTarget.style.transform = "translateY(0)"; }}>
                        {!loading && (
                          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                            style={{ background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.08) 50%, transparent 100%)" }} />
                        )}
                        {loading
                          ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          : <span className="relative flex items-center gap-2">Entrar al sistema <ArrowRight size={16} /></span>}
                      </motion.button>
                    </form>

                    <p className="text-center text-xs mt-8" style={{ color: "var(--text-muted)" }}>
                      UTN Guanacaste · Proyecto Integrador 2026
                    </p>
                  </motion.div>
                )}

                {/* ===== FORGOT PASSWORD ===== */}
                {mode === "forgot" && (
                  <motion.div key="forgot"
                    initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.25 }}>

                    <button onClick={() => setMode("login")} className="flex items-center gap-1.5 text-xs font-medium mb-8 transition-colors"
                      style={{ color: "var(--text-muted)" }}
                      onMouseEnter={e => e.currentTarget.style.color = "var(--text-primary)"}
                      onMouseLeave={e => e.currentTarget.style.color = "var(--text-muted)"}>
                      <ArrowLeft size={13} /> Volver al inicio de sesion
                    </button>

                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-6"
                      style={{ background: "var(--accent-subtle)", border: "1px solid rgba(249,115,22,0.2)" }}>
                      <Mail size={22} style={{ color: "var(--accent)" }} />
                    </div>

                    <h2 className="font-black text-2xl mb-1" style={{ color: "var(--text-primary)", letterSpacing: "-0.03em" }}>
                      Recuperar contraseña
                    </h2>
                    <p className="text-sm mb-8" style={{ color: "var(--text-muted)" }}>
                      Ingresa tu correo y te enviaremos las instrucciones para restablecerla.
                    </p>

                    <form onSubmit={handleForgot} className="space-y-4">
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "var(--text-muted)" }}>
                          Correo electronico
                        </label>
                        <div className="relative">
                          <Mail size={15} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
                          <input type="email" value={forgotEmail} onChange={e => setForgotEmail(e.target.value)}
                            placeholder="correo@taller.com" autoFocus
                            className="w-full pl-11 pr-4 py-3.5 text-sm rounded-xl outline-none transition-all"
                            style={{ background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
                            onFocus={e => e.currentTarget.style.border = "1px solid var(--accent)"}
                            onBlur={e => e.currentTarget.style.border = "1px solid var(--border)"} />
                        </div>
                      </div>

                      <motion.button type="submit" disabled={forgotLoading || !forgotEmail} whileTap={{ scale: 0.98 }}
                        className="relative w-full overflow-hidden font-bold text-sm text-white flex items-center justify-center gap-2 group"
                        style={{
                          padding: "14px 24px", borderRadius: "999px",
                          background: (forgotLoading || !forgotEmail) ? "var(--border)" : "linear-gradient(135deg, #F97316 0%, #EA580C 50%, #C2410C 100%)",
                          boxShadow: (!forgotLoading && forgotEmail) ? "0 4px 32px rgba(249,115,22,0.35)" : "none",
                          transition: "all 0.2s ease",
                        }}>
                        {forgotLoading
                          ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          : <span className="flex items-center gap-2">Enviar instrucciones <Send size={14} /></span>}
                      </motion.button>
                    </form>
                  </motion.div>
                )}

                {/* ===== FORGOT DONE ===== */}
                {mode === "forgot-done" && (
                  <motion.div key="forgot-done"
                    initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex flex-col items-center text-center py-8">

                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: 0.1 }}
                      className="w-16 h-16 rounded-full flex items-center justify-center mb-6"
                      style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.25)" }}>
                      <CheckCircle2 size={32} style={{ color: "var(--success)" }} />
                    </motion.div>

                    <h2 className="font-black text-2xl mb-3" style={{ color: "var(--text-primary)", letterSpacing: "-0.03em" }}>
                      Correo enviado
                    </h2>
                    <p className="text-sm leading-relaxed mb-2" style={{ color: "var(--text-secondary)" }}>
                      Si <span className="font-semibold" style={{ color: "var(--text-primary)" }}>{forgotEmail}</span> está registrado,
                      recibirás las instrucciones para restablecer tu contraseña.
                    </p>
                    <p className="text-xs mb-8" style={{ color: "var(--text-muted)" }}>
                      Revisa también tu carpeta de spam.
                    </p>

                    <button onClick={() => { setMode("login"); setForgotEmail(""); }}
                      className="flex items-center gap-2 text-sm font-semibold transition-colors"
                      style={{ color: "var(--accent)" }}
                      onMouseEnter={e => e.currentTarget.style.opacity = "0.75"}
                      onMouseLeave={e => e.currentTarget.style.opacity = "1"}>
                      <ArrowLeft size={14} /> Volver al inicio de sesion
                    </button>
                  </motion.div>
                )}

              </AnimatePresence>
            </div>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Login;
