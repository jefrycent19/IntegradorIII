import React from "react";

/**
 * Botón estilo Atlassian/Jira adaptado a la marca (naranja).
 * Plano, color sólido (sin gradiente), radio 6px, peso 500, compacto.
 * Interacción: solo oscurece el fondo al hover/active (sin glow ni sombras).
 */
type Variant = "primary" | "default" | "subtle" | "danger";
type Size = "sm" | "md" | "lg";

const variants: Record<Variant, { bg: string; hover: string; active: string; color: string; border: string }> = {
  // Rojo enterprise (acción principal)
  primary: { bg: "#DC2626", hover: "#B91C1C", active: "#991B1B", color: "#ffffff", border: "transparent" },
  // Gris sutil sobre fondo oscuro (acción estándar) — equivalente al "default" de Atlassian
  default: { bg: "rgba(255,255,255,0.08)", hover: "rgba(255,255,255,0.13)", active: "rgba(255,255,255,0.18)", color: "var(--text-primary)", border: "transparent" },
  // Fantasma (terciario)
  subtle:  { bg: "transparent", hover: "rgba(255,255,255,0.08)", active: "rgba(255,255,255,0.13)", color: "var(--text-secondary)", border: "transparent" },
  // Peligro
  danger:  { bg: "#EF4444", hover: "#DC2626", active: "#B91C1C", color: "#ffffff", border: "transparent" },
};

const sizes: Record<Size, React.CSSProperties> = {
  sm: { padding: "5px 10px", fontSize: 13, borderRadius: 6 },
  md: { padding: "7px 14px", fontSize: 14, borderRadius: 6 },
  lg: { padding: "10px 16px", fontSize: 15, borderRadius: 8 },
};

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  block?: boolean;
  iconBefore?: React.ReactNode;
  iconAfter?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = "default", size = "md", block, iconBefore, iconAfter,
  children, style, disabled, ...rest
}) => {
  const v = variants[variant];
  const s = sizes[size];
  return (
    <button {...rest} disabled={disabled}
      className="inline-flex items-center justify-center gap-1.5 select-none"
      style={{
        ...s,
        width: block ? "100%" : undefined,
        background: v.bg,
        color: v.color,
        border: `1px solid ${v.border}`,
        fontWeight: 500,
        lineHeight: 1.2,
        whiteSpace: "nowrap",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
        transition: "background-color 0.1s var(--ease-out)",
        ...style,
      }}
      onMouseEnter={e => { if (!disabled) e.currentTarget.style.background = v.hover; }}
      onMouseLeave={e => { if (!disabled) e.currentTarget.style.background = v.bg; }}
      onMouseDown={e => { if (!disabled) e.currentTarget.style.background = v.active; }}
      onMouseUp={e => { if (!disabled) e.currentTarget.style.background = v.hover; }}>
      {iconBefore}
      {children}
      {iconAfter}
    </button>
  );
};

export default Button;
