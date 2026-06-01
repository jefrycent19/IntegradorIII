import {
  IonContent, IonFab, IonFabButton, IonHeader, IonIcon,
  IonInfiniteScroll, IonInfiniteScrollContent, IonMenuButton,
  IonPage, IonSpinner, IonTitle, IonToolbar,
} from "@ionic/react";
import { addOutline } from "ionicons/icons";
import { Package, PackageX, Search, X, Tag } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useHistory } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../../services/api";
import { useCanEditInventario } from "../../hooks/useCanEdit";

const fmt = (n: number) => Number(n).toLocaleString("es-CR", { style: "currency", currency: "CRC", maximumFractionDigits: 0 });

const filtros = [
  { key: "todos", label: "Todos" },
  { key: "bajo",  label: "Stock bajo" },
];

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.04 } } };
const fadeUp  = { hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } };

const Inventario: React.FC = () => {
  const canEdit = useCanEditInventario();
  const [repuestos, setRepuestos] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [filtro, setFiltro] = useState("todos");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const history = useHistory();
  const debounce = useRef<any>(null);

  const cargar = async (reset = false) => {
    const p = reset ? 1 : page;
    const params: any = { search, page: p };
    if (filtro === "bajo") params.stock_bajo = true;
    try {
      const { data } = await api.get("/repuestos", { params });
      setRepuestos(reset ? data.data : (prev: any[]) => [...prev, ...data.data]);
      setHasMore(data.current_page < data.last_page);
      setPage(p + 1);
    } catch {
      setRepuestos([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    clearTimeout(debounce.current);
    debounce.current = setTimeout(() => cargar(true), 350);
  }, [search, filtro]);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonMenuButton slot="start" />
          <IonTitle>Inventario</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        {/* Search */}
        <div className="px-4 pt-4 pb-3">
          <div className="relative">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Nombre o codigo..."
              className="w-full pl-10 pr-9 py-3 text-sm rounded-xl outline-none transition-colors"
              style={{ background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
              onFocus={e => e.currentTarget.style.borderColor = "var(--accent)"}
              onBlur={e => e.currentTarget.style.borderColor = "var(--border)"} />
            {search && <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }}><X size={14} /></button>}
          </div>
        </div>

        {/* Filtros */}
        <div className="px-4 pb-3 flex gap-1.5">
          {filtros.map(f => {
            const active = filtro === f.key;
            return (
              <button key={f.key} onClick={() => setFiltro(f.key)}
                className="press flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-semibold"
                style={{
                  background: active ? "var(--accent-subtle)" : "var(--bg-card)",
                  color: active ? "var(--accent)" : "var(--text-muted)",
                  border: active ? "1px solid var(--accent)" : "1px solid var(--border)",
                }}>
                {f.label}
              </button>
            );
          })}
        </div>

        {/* Lista */}
        {loading ? (
          <div className="flex items-center justify-center h-48"><IonSpinner name="crescent" /></div>
        ) : repuestos.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-56 gap-3" style={{ color: "var(--text-muted)" }}>
            <Package size={40} className="opacity-30" />
            <p className="text-sm">No se encontraron repuestos</p>
          </div>
        ) : (
          <motion.div variants={stagger} initial="hidden" animate="show" className="px-4 pb-24 space-y-2">
            {repuestos.map(r => {
              const stockBajo = r.stock_actual <= r.stock_minimo;
              return (
                <motion.button key={r.id} variants={fadeUp}
                  onClick={() => history.push(`/inventario/${r.id}`)}
                  className="press w-full flex items-center gap-3 p-4 rounded-2xl text-left"
                  style={{ background: "var(--bg-card)", border: stockBajo ? "1px solid rgba(239,68,68,0.25)" : "1px solid var(--border)" }}
                  onMouseEnter={e => { e.currentTarget.style.background = "var(--bg-hover)"; e.currentTarget.style.borderColor = stockBajo ? "rgba(239,68,68,0.4)" : "var(--border-light)"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "var(--bg-card)"; e.currentTarget.style.borderColor = stockBajo ? "rgba(239,68,68,0.25)" : "var(--border)"; }}>

                  {/* Icono */}
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: stockBajo ? "rgba(239,68,68,0.12)" : "rgba(249,115,22,0.1)" }}>
                    {stockBajo
                      ? <PackageX size={19} style={{ color: "var(--danger)" }} />
                      : <Package size={19} style={{ color: "var(--accent)" }} />}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate" style={{ color: "var(--text-primary)" }}>{r.nombre}</p>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="flex items-center gap-1 text-xs truncate" style={{ color: "var(--text-muted)" }}>
                        <Tag size={10} /> {r.codigo}
                      </span>
                      <span className="text-xs truncate" style={{ color: "var(--text-muted)" }}>{r.categoria}</span>
                    </div>
                    <p className="text-xs font-medium mt-0.5" style={{ color: "var(--text-secondary)" }}>{fmt(r.precio_venta)}</p>
                  </div>

                  {/* Stock */}
                  <div className="flex flex-col items-end flex-shrink-0">
                    <span className="text-base font-black px-2.5 py-0.5 rounded-lg"
                      style={{ background: stockBajo ? "rgba(239,68,68,0.12)" : "rgba(34,197,94,0.12)", color: stockBajo ? "var(--danger)" : "var(--success)" }}>
                      {r.stock_actual}
                    </span>
                    <span className="text-[10px] mt-0.5" style={{ color: "var(--text-muted)" }}>min {r.stock_minimo}</span>
                  </div>
                </motion.button>
              );
            })}
          </motion.div>
        )}

        <IonInfiniteScroll onIonInfinite={async (ev) => { await cargar(); ev.target.complete(); }} disabled={!hasMore}>
          <IonInfiniteScrollContent />
        </IonInfiniteScroll>
      </IonContent>

      {canEdit && <IonFab slot="fixed" vertical="bottom" horizontal="end">
        <IonFabButton onClick={() => history.push("/inventario/nuevo")}>
          <IonIcon icon={addOutline} />
        </IonFabButton>
      </IonFab>}
    </IonPage>
  );
};

export default Inventario;
