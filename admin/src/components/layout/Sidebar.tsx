import {
  LayoutDashboard, Users, Bike, Calendar, ClipboardList,
  Package, Receipt, UserCog, Wrench, LogOut, X, Menu,
  BarChart3, Globe, HardHat, CalendarDays, Timer,
} from "lucide-react";
import { useHistory, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const navGroups = [
  {
    label: "Principal",
    items: [
      { label: "Dashboard",     path: "/dashboard",     icon: LayoutDashboard },
      { label: "Mis Ordenes",   path: "/mis-ordenes",   icon: Timer,        roles: ["Técnico"] },
      { label: "Agenda de Hoy", path: "/agenda-dia",    icon: CalendarDays, roles: ["Administrador","Recepcionista","Jefe de Taller"] },
    ],
  },
  {
    label: "Operaciones",
    items: [
      { label: "Clientes",           path: "/clientes",        icon: Users },
      { label: "Motocicletas",       path: "/motocicletas",    icon: Bike },
      { label: "Citas",              path: "/citas",           icon: Calendar },
      { label: "Ordenes de Trabajo", path: "/ordenes-trabajo", icon: ClipboardList },
      { label: "Inventario",         path: "/inventario",      icon: Package },
      { label: "Carga de Tecnicos",  path: "/carga-tecnicos",  icon: HardHat, roles: ["Administrador","Jefe de Taller"] },
    ],
  },
  {
    label: "Gerencia",
    items: [
      { label: "Facturacion",     path: "/facturacion",     icon: Receipt,   roles: ["Administrador","Gerente"] },
      { label: "Solicitudes Web", path: "/solicitudes-web", icon: Globe,     roles: ["Administrador","Gerente"] },
      { label: "Reportes",        path: "/reportes",        icon: BarChart3, roles: ["Administrador","Gerente","Jefe de Taller"] },
    ],
  },
  {
    label: "Sistema",
    items: [
      { label: "Usuarios", path: "/usuarios", icon: UserCog, roles: ["Administrador"] },
    ],
  },
];

interface NavItem { label: string; path: string; icon: any; roles?: string[] }
interface SidebarProps { open: boolean; onClose: () => void }

export const Sidebar: React.FC<SidebarProps> = ({ open, onClose }) => {
  const { user, logout, tieneRol } = useAuth();
  const history = useHistory();
  const location = useLocation();

  const closeMenu = () => { (document.querySelector("ion-menu") as any)?.close(); };
  const handleLogout = async () => { await logout(); history.replace("/login"); };
  const navigate = (path: string) => { history.push(path); closeMenu(); };

  const filteredGroups = navGroups.map(g => ({
    ...g,
    items: g.items.filter((i: NavItem) => !i.roles || tieneRol(...i.roles)),
  })).filter(g => g.items.length > 0);

  const isActive = (path: string) =>
    location.pathname === path ||
    (path !== "/dashboard" && location.pathname.startsWith(path));

  const rolColor: Record<string, { bg: string; text: string }> = {
    "Administrador":  { bg: "rgba(249,115,22,0.15)",  text: "var(--accent)" },
    "Gerente":        { bg: "rgba(168,85,247,0.15)",   text: "#a855f7" },
    "Jefe de Taller": { bg: "rgba(34,197,94,0.15)",    text: "#22c55e" },
    "Técnico":        { bg: "rgba(59,130,246,0.15)",   text: "#3b82f6" },
    "Recepcionista":  { bg: "rgba(234,179,8,0.15)",    text: "#eab308" },
  };
  const badge = rolColor[user?.rol ?? ""] ?? { bg: "rgba(148,163,184,0.15)", text: "var(--text-muted)" };

  const Content = () => (
    <div className="flex flex-col h-full" style={{ background: "var(--bg-surface)", borderRight: "1px solid var(--border)" }}>

      {/* ── Header / Logo ── */}
      <div style={{ borderBottom: "1px solid var(--border)", background: "linear-gradient(180deg, rgba(249,115,22,0.07) 0%, transparent 100%)" }}>
        <div className="flex items-center justify-between px-5 h-16">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 rounded-xl blur-lg opacity-70" style={{ background: "rgba(249,115,22,0.5)" }} />
              <div className="relative w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: "linear-gradient(135deg, #F97316 0%, #DC6803 100%)", boxShadow: "0 4px 12px rgba(249,115,22,0.4)" }}>
                <Wrench size={19} className="text-white" strokeWidth={2.5} />
              </div>
            </div>
            <div>
              <p className="font-black text-[15px] leading-tight tracking-tight" style={{ color: "var(--text-primary)" }}>
                Taller Motos
              </p>
              <p className="text-[11px] font-semibold tracking-wide" style={{ color: "var(--accent)", opacity: 0.75 }}>
                PANEL ADMIN
              </p>
            </div>
          </div>
          <button onClick={closeMenu}
            className="lg:hidden w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
            style={{ color: "var(--text-muted)" }}
            onMouseEnter={e => { e.currentTarget.style.background = "var(--bg-hover)"; e.currentTarget.style.color = "var(--text-primary)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--text-muted)"; }}>
            <X size={15} />
          </button>
        </div>
      </div>

      {/* ── Nav ── */}
      <div className="flex-1 overflow-y-auto py-3 px-3">
        {filteredGroups.map((group, gi) => (
          <div key={group.label} className={gi > 0 ? "mt-1" : ""}>
            {gi > 0 && (
              <div className="mx-2 mb-3 mt-2" style={{ height: "1px", background: "var(--border)" }} />
            )}
            <p className="px-3 mb-1 text-[10px] font-bold uppercase tracking-[0.14em]"
              style={{ color: "var(--text-muted)", opacity: 0.55 }}>
              {group.label}
            </p>
            <div className="space-y-0.5">
              {group.items.map((item: NavItem) => {
                const active = isActive(item.path);
                return (
                  <button key={item.path} onClick={() => navigate(item.path)}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left relative overflow-hidden transition-all duration-150"
                    style={{
                      background: active
                        ? "linear-gradient(90deg, rgba(249,115,22,0.18) 0%, rgba(249,115,22,0.04) 100%)"
                        : "transparent",
                      color: active ? "var(--text-primary)" : "var(--text-secondary)",
                    }}
                    onMouseEnter={e => {
                      if (!active) {
                        e.currentTarget.style.background = "var(--bg-hover)";
                        e.currentTarget.style.color = "var(--text-primary)";
                      }
                    }}
                    onMouseLeave={e => {
                      if (!active) {
                        e.currentTarget.style.background = "transparent";
                        e.currentTarget.style.color = "var(--text-secondary)";
                      }
                    }}>

                    {/* Glow left bar */}
                    {active && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 rounded-r-full"
                        style={{ background: "var(--accent)", boxShadow: "2px 0 10px rgba(249,115,22,0.7)" }} />
                    )}

                    {/* Icon bubble */}
                    <div className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-150"
                      style={{ background: active ? "rgba(249,115,22,0.18)" : "transparent" }}>
                      <item.icon size={15} strokeWidth={active ? 2.5 : 2}
                        style={{ color: active ? "var(--accent)" : "currentColor" }} />
                    </div>

                    <span className="flex-1 truncate text-[13px] font-medium">{item.label}</span>

                    {active && (
                      <div className="flex-shrink-0 w-1.5 h-1.5 rounded-full"
                        style={{ background: "var(--accent)", boxShadow: "0 0 6px rgba(249,115,22,0.8)" }} />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* ── User card ── */}
      <div className="p-3 flex-shrink-0" style={{ borderTop: "1px solid var(--border)" }}>
        <div className="rounded-xl px-3 py-2.5" style={{ background: "var(--bg-hover)" }}>
          <div className="flex items-center gap-2.5">

            {/* Avatar with gradient ring */}
            <div className="relative flex-shrink-0">
              <div className="absolute inset-[-2px] rounded-full"
                style={{ background: "linear-gradient(135deg, var(--accent) 0%, #DC2626 100%)" }} />
              <div className="relative w-8 h-8 rounded-full flex items-center justify-center text-white text-[11px] font-black"
                style={{ background: "var(--bg-base)" }}>
                {user?.nombre?.[0]}{user?.apellido?.[0]}
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-semibold leading-tight truncate" style={{ color: "var(--text-primary)" }}>
                {user?.nombre} {user?.apellido}
              </p>
              <span className="inline-block mt-0.5 px-1.5 py-px rounded-md text-[10px] font-bold"
                style={{ background: badge.bg, color: badge.text }}>
                {user?.rol}
              </span>
            </div>

            <button onClick={handleLogout}
              className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-150"
              style={{ color: "var(--text-muted)" }}
              title="Cerrar sesión"
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(239,68,68,0.12)"; e.currentTarget.style.color = "#ef4444"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--text-muted)"; }}>
              <LogOut size={13} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <Content />
    </div>
  );
};

export const TopBar: React.FC<{
  title: string; onMenuClick: () => void;
  subtitle?: string; actions?: React.ReactNode;
}> = ({ title, onMenuClick, subtitle, actions }) => (
  <div className="flex items-center justify-between h-14 px-5 flex-shrink-0"
    style={{ background: "var(--bg-surface)", borderBottom: "1px solid var(--border)" }}>
    <div className="flex items-center gap-3">
      <button onClick={onMenuClick}
        className="lg:hidden p-2 rounded-xl transition-colors"
        style={{ color: "var(--text-muted)" }}
        onMouseEnter={e => { e.currentTarget.style.background = "var(--bg-hover)"; e.currentTarget.style.color = "var(--text-primary)"; }}
        onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--text-muted)"; }}>
        <Menu size={18} />
      </button>
      <div>
        <h1 className="font-bold text-base leading-none" style={{ color: "var(--text-primary)" }}>{title}</h1>
        {subtitle && <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{subtitle}</p>}
      </div>
    </div>
    {actions && <div className="flex items-center gap-2">{actions}</div>}
  </div>
);
