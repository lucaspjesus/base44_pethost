import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

const statusMap = { solicitada: "Solicitada", em_adaptacao: "Em adaptação", confirmada: "Confirmada", em_andamento: "Em andamento", concluida: "Concluída", cancelada: "Cancelada" };

export default function ReservasHost() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    (async () => {
      try {
        const u = await base44.auth.me();
        const hs = await base44.entities.HostProfile.list();
        const myHost = hs.find(h => h.user_id === u.id);
        const bs = await base44.entities.Booking.list("-created_date", 100);
        setBookings(myHost ? bs.filter(b => b.host_id === myHost.id) : []);
      } catch (e) { }
      setLoading(false);
    })();
  }, []);
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-heading font-bold">Reservas recebidas</h1>
      {loading ? <p className="text-muted-foreground">Carregando...</p> : bookings.length === 0 ? <p className="text-sm text-muted-foreground">Nenhuma reserva.</p> :
        <div className="space-y-2">{bookings.map(b => (
          <Link to={`/reserva/${b.id}`} key={b.id} className="block rounded-2xl bg-card border border-border p-4"><div className="flex justify-between"><span className="font-medium">{b.tipo.replace(/_/g, " ")}</span><Badge className="bg-primary/10 text-primary border-0">{statusMap[b.status]}</Badge></div><p className="text-xs text-muted-foreground mt-1">{new Date(b.data_inicio).toLocaleDateString("pt-BR")} • R$ {b.valor_total?.toFixed(0)}</p></Link>
        ))}</div>}
    </div>
  );
}