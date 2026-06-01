import {
  IonContent, IonFab, IonFabButton, IonHeader, IonIcon,
  IonInfiniteScroll, IonInfiniteScrollContent, IonMenuButton,
  IonPage, IonSpinner, IonTitle, IonToolbar,
} from "@ionic/react";
import { addOutline } from "ionicons/icons";
import { Users, Phone, CreditCard, Bike, Search, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useHistory } from "react-router-dom";
import api from "../../services/api";
import { useCanEditClientes } from "../../hooks/useCanEdit";
import { motion } from "framer-motion";

const colors = [
  "rgba(249,115,22,0.15)", "rgba(59,130,246,0.15)", "rgba(34,197,94,0.15)",
  "rgba(139,92,246,0.15)", "rgba(234,179,8,0.15)", "rgba(236,72,153,0.15)",
];
const textColors = ["#F97316","#3B82F6","#22C55E","#8B5CF6","#EAB308","#EC4899"];

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.04 } } };
const fadeUp  = { hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } };

const Clientes: React.FC = () => {
  const canEdit = useCanEditClientes();
  const [clientes, setClientes] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const history = useHistory();
  const timer = useRef<any>(null);

  const cargar = async (reset = false) => {
    const p = reset ? 1 : page;
    try {
      const { data } = await api.get("/clientes", { params: { search, page: p } });
      setClientes(reset ? data.data : prev => [...prev, ...data.data]);
      setHasMore(data.current_page < data.last_page);
      setPage(p + 1);
    } catch { setClientes([]); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    setLoading(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => cargar(true), 350);
  }, [search]);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonMenuButton slot="start" />
          <IonTitle>Clientes</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        {/* Search */}
        <div className="px-4 pt-4 pb-3">
          <div className="relative">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Nombre, cedula o telefono..."
              className="w-full pl-10 pr-9 py-3 text-sm rounded-xl outline-none transition-colors"
              style={{ background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
              onFocus={e => e.currentTarget.style.border = "1px solid var(--accent)"}
              onBlur={e => e.currentTarget.style.border = "1px solid var(--border)"} />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }}>
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-48">
            <IonSpinner name="crescent" />
          </div>
        ) : clientes.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 gap-3" style={{ color: "var(--text-muted)" }}>
            <Users size={40} className="opacity-30" />
            <p className="text-sm">No se encontraron clientes</p>
          </div>
        ) : (
          <motion.div variants={stagger} initial="hidden" animate="show"
            className="px-4 pb-24 space-y-2">
            {clientes.map((c, i) => {
              const ci = i % colors.length;
              return (
                <motion.button key={c.id} variants={fadeUp}
                  onClick={() => history.push(`/clientes/${c.id}`)}
                  className="press w-full flex items-center gap-3 p-4 rounded-2xl text-left"
                  style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--border-light)"; e.currentTarget.style.background = "var(--bg-hover)"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.background = "var(--bg-card)"; }}>
                  {/* Avatar */}
                  <div className="w-11 h-11 rounded-full flex items-center justify-center text-sm font-black flex-shrink-0"
                    style={{ background: colors[ci], color: textColors[ci] }}>
                    {c.nombre?.[0]}{c.apellido?.[0]}
                  </div>
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate" style={{ color: "var(--text-primary)" }}>
                      {c.nombre} {c.apellido}
                    </p>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="flex items-center gap-1 text-xs" style={{ color: "var(--text-muted)" }}>
                        <CreditCard size={10} /> {c.cedula}
                      </span>
                      <span className="flex items-center gap-1 text-xs" style={{ color: "var(--text-muted)" }}>
                        <Phone size={10} /> {c.telefono}
                      </span>
                    </div>
                  </div>
                  {/* Badge motos */}
                  {(c.motocicletas?.length ?? 0) > 0 && (
                    <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg flex-shrink-0"
                      style={{ background: "rgba(249,115,22,0.1)", color: "var(--accent)" }}>
                      <Bike size={11} />
                      <span className="text-xs font-bold">{c.motocicletas.length}</span>
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
          <IonFabButton onClick={() => history.push("/clientes/nuevo")}>
            <IonIcon icon={addOutline} />
          </IonFabButton>
        </IonFab>
      )}
    </IonPage>
  );
};

export default Clientes;