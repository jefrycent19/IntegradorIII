import {
  IonContent, IonFab, IonFabButton, IonHeader, IonIcon,
  IonInfiniteScroll, IonInfiniteScrollContent, IonMenuButton,
  IonPage, IonSpinner, IonTitle, IonToolbar,
} from "@ionic/react";
import { addOutline } from "ionicons/icons";
import { ClipboardList, Bike, Clock, AlertTriangle, Search, X, SlidersHorizontal } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useHistory } from "react-router-dom";
import api from "../../services/api";
import { useCanEdit } from "../../hooks/useCanEdit";
import { motion } from "framer-motion";

const estados = [
  { key: "todos",       label: "Todos",       color: "#F97316" },
  { key: "recepcion",   label: "Recepción",   color: "#94A3B8" },
  { key: "diagnostico", label: "Diagnóstico", color: "#EAB308" },
  { key: "reparacion",  label: "Reparación",  color: "#3B82F6" },
  { key: "lista",       label: "Lista",       color: "#22C55E" },
  { key: "entregada",   label: "Entregada",   color: "#64748B" },
];

const prioColor: Record<string, string> = {
  emergencia: "var(--danger)", garantia: "#8B5CF6",
  rapido: "var(--warning)",    mayor: "var(--info)",
  preventivo: "var(--text-muted)",
};

const dotColor: Record<string, string> = {
  recepcion: "var(--border-light)", diagnostico: "#EAB308",
  reparacion: "var(--info)",        lista: "var(--success)", entregada: "var(--text-muted)",
};

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };
const fadeUp  = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } };

const OrdenesTrabajo: React.FC = () => {
  const canEdit = useCanEdit();
  const [ots, setOts] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [estado, setEstado] = useState("todos");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const history = useHistory();
  const timer = useRef<any>(null);

  const cargar = async (reset = false) => {
    const p = reset ? 1 : page;
    try {
      const { data } = await api.get("/ordenes-trabajo", {
        params: { search, estado: estado === "todos" ? undefined : estado, page: p },
      });
      setOts(reset ? data.data : prev => [...prev, ...data.data]);
      setHasMore(data.current_page < data.last_page);
      setPage(p + 1);
    } catch { setOts([]); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    setLoading(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => cargar(true), 300);
  }, [search, estado]);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonMenuButton slot="start" />
          <IonTitle>Ordenes de Trabajo</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        {/* Search */}
        <div className="px-4 pt-4 pb-3">
          <div className="relative">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Numero de OT..."
              className="w-full pl-10 pr-9 py-3 text-sm rounded-xl outline-none transition-colors"
              style={{ background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
              onFocus={e => e.currentTarget.style.border = "1px solid var(--accent)"}
              onBlur={e => e.currentTarget.style.border = "1px solid var(--border)"} />
            {search && <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }}><X size={14} /></button>}
          </div>
        </div>

        {/* Filtros por estado — chips con color semántico */}
        <div className="px-4 pb-3 flex gap-2 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
          {estados.map(e => {
            const active = estado === e.key;
            return (
              <button key={e.key} onClick={() => setEstado(e.key)}
                className="press flex-shrink-0 flex items-center gap-2.5 px-5 py-2.5 rounded-full text-sm font-semibold"
                style={{
                  background: active ? `${e.color}26` : "var(--bg-hover)",
                  color: active ? e.color : "var(--text-secondary)",
                  border: `1px solid ${active ? e.color : "var(--border-light)"}`,
                  boxShadow: active ? `0 2px 14px ${e.color}40` : "none",
                }}>
                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ background: e.color, opacity: active ? 1 : 0.8, boxShadow: active ? `0 0 6px ${e.color}` : "none" }} />
                {e.label}
              </button>
            );
          })}
        </div>

        {/* Lista */}
        {loading ? (
          <div className="flex items-center justify-center h-48"><IonSpinner name="crescent" /></div>
        ) : ots.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-56 gap-3" style={{ color: "var(--text-muted)" }}>
            <ClipboardList size={40} className="opacity-30" />
            <p className="text-sm">No hay ordenes de trabajo</p>
          </div>
        ) : (
          <motion.div variants={stagger} initial="hidden" animate="show" className="px-4 pb-24 space-y-2.5">
            {ots.map(ot => {
              const dot = dotColor[ot.estado] ?? "var(--border-light)";
              const atrasada = ot.fecha_estimada_entrega && new Date(ot.fecha_estimada_entrega) < new Date() && ot.estado !== "entregada";
              return (
                <motion.button key={ot.id} variants={fadeUp}
                  onClick={() => history.push(`/ordenes-trabajo/${ot.id}`)}
                  className="press w-full p-4 rounded-2xl text-left"
                  style={{ background: "var(--bg-card)", border: atrasada ? "1px solid rgba(239,68,68,0.25)" : "1px solid var(--border)" }}
                  onMouseEnter={e => { e.currentTarget.style.background = "var(--bg-hover)"; e.currentTarget.style.borderColor = "var(--border-light)"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "var(--bg-card)"; e.currentTarget.style.borderColor = atrasada ? "rgba(239,68,68,0.25)" : "var(--border)"; }}>

                  {/* Row 1: Número + badges */}
                  <div className="flex items-center justify-between mb-2.5">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: dot }} />
                      <span className="font-black text-sm" style={{ color: "var(--text-primary)" }}>{ot.numero_ot}</span>
                      {atrasada && (
                        <span className="flex items-center gap-1 text-xs font-semibold" style={{ color: "var(--danger)" }}>
                          <AlertTriangle size={10} /> Atrasada
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-lg capitalize"
                        style={{ background: `${prioColor[ot.prioridad]}14`, color: prioColor[ot.prioridad] ?? "var(--text-muted)" }}>
                        {ot.prioridad}
                      </span>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-lg"
                        style={{ background: "var(--bg-hover)", color: dotColor[ot.estado] ?? "var(--text-muted)" }}>
                        {ot.estado}
                      </span>
                    </div>
                  </div>

                  {/* Row 2: Cliente + moto */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-xs mb-0.5" style={{ color: "var(--text-muted)" }}>Cliente</p>
                      <p className="text-sm font-medium truncate" style={{ color: "var(--text-primary)" }}>
                        {ot.cliente?.nombre} {ot.cliente?.apellido}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs mb-0.5" style={{ color: "var(--text-muted)" }}>Moto</p>
                      <div className="flex items-center gap-1">
                        <Bike size={11} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
                        <p className="text-sm font-medium truncate" style={{ color: "var(--text-primary)" }}>
                          {ot.motocicleta?.marca} {ot.motocicleta?.modelo}
                        </p>
                      </div>
                      <p className="text-xs" style={{ color: "var(--text-muted)" }}>{ot.motocicleta?.placa}</p>
                    </div>
                  </div>

                  {/* Row 3: Tecnico + fecha */}
                  {(ot.tecnico || ot.fecha_estimada_entrega) && (
                    <div className="flex items-center justify-between mt-2.5 pt-2.5" style={{ borderTop: "1px solid var(--border)" }}>
                      {ot.tecnico && (
                        <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                          🔧 {ot.tecnico.nombre} {ot.tecnico.apellido}
                        </p>
                      )}
                      {ot.fecha_estimada_entrega && (
                        <p className="text-xs flex items-center gap-1" style={{ color: atrasada ? "var(--danger)" : "var(--text-muted)" }}>
                          <Clock size={10} />
                          {new Date(ot.fecha_estimada_entrega).toLocaleDateString("es-CR")}
                        </p>
                      )}
                    </div>
                  )}
                </motion.button>
              );
            })}
          </motion.div>
        )}

        <IonInfiniteScroll onIonInfinite={async ev => { await cargar(); ev.target.complete(); }} disabled={!hasMore}>
          <IonInfiniteScrollContent />
        </IonInfiniteScroll>
      </IonContent>

      {canEdit && (
        <IonFab slot="fixed" vertical="bottom" horizontal="end">
          <IonFabButton onClick={() => history.push("/ordenes-trabajo/nueva")}>
            <IonIcon icon={addOutline} />
          </IonFabButton>
        </IonFab>
      )}
    </IonPage>
  );
};

export default OrdenesTrabajo;