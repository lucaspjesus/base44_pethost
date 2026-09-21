import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "lucide-react";

const statusMap = { solicitada: "Solicitada", em_adaptacao: "Em adaptação", confirmada: "Confirmada", em_andamento: "Em andamento", concluida: "Concluída", cancelada: "Cancelada" };
const statusColor = { solicitada: "bg-amber-100 text-amber-700", em_adaptacao: "bg-blue-100 text-blue-700", confirmada: "bg-emerald-100 text-emerald-700", em_andamento: "bg-primary/10 text-primary", concluida: "bg-secondary text-secondary-foreground", cancelada: "bg-red-100 text-red-700" };

export default function Reservas() {
  const [bookings, setBookings] = useState([]);
  const [pets, setPets] = useState([]);
  const [hosts, setHosts] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    (async () => {
      try {
        const u = await base44.auth.me();
        const bs = await base44.entities.Booking.list("-created_date", 50);
        setBookings(bs.filter(b => b.created_by_id === u.id));
        const ps = await base44.entities.Pet.list(); setPets(ps);
        const hs = await base44.entities.HostProfile.list(); setHosts(hs);
      } catch (e) { }
      setLoading(false);
    })();
  }, []);
  const petName = id => pets.find(p => p.id === id)?.nome || "Pet";
  const hostName = id => hosts.find(h => h.id === id)?.nome || "Anfitrião";
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-heading font-bold">Minhas reservas</h1>
      {loading ? <div className="py-16 text-center text-muted-foreground">Carregando...</div> :
        bookings.length === 0 ? <div className="py-16 text-center text-muted-foreground">Nenhuma reserva ainda.</div> :
        <div className="space-y-3">{bookings.map(b => (
          <Link to={`/reserva/${b.id}`} key={b.id} className="block rounded-2xl bg-card border border-border p-4 hover:shadow-sm transition">
            <div className="flex items-center justify-between">
              <div><h3 className="font-heading font-semibold">{hostName(b.host_id)}</h3><p className="text-xs text-muted-foreground">{petName(b.pet_id)} • {b.tipo.replace(/_/g, " ")}</p></div>
              <Badge className={`${statusColor[b.status] || ""} border-0`}>{statusMap[b.status] || b.status}</Badge>
            </div>
            <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground"><Calendar className="w-3 h-3" />{new Date(b.data_inicio).toLocaleDateString("pt-BR")} {b.data_fim && `→ ${new Date(b.data_fim).toLocaleDateString("pt-BR")}`}</div>
            <div className="mt-1 text-sm font-semibold text-primary">R$ {b.valor_total?.toFixed(2).replace(".", ",")}</div>
          </Link>
        ))}</div>}
    </div>
  );
}