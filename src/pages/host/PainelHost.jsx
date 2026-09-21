import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ClipboardList, TrendingUp, DollarSign } from "lucide-react";

const statusMap = { solicitada: "Solicitada", em_adaptacao: "Em adaptação", confirmada: "Confirmada", em_andamento: "Em andamento", concluida: "Concluída", cancelada: "Cancelada" };

export default function PainelHost() {
  const [bookings, setBookings] = useState([]);
  const [host, setHost] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    (async () => {
      try {
        const u = await base44.auth.me();
        const hs = await base44.entities.HostProfile.list();
        const myHost = hs.find(h => h.user_id === u.id);
        setHost(myHost);
        const bs = await base44.entities.Booking.list("-created_date", 50);
        setBookings(myHost ? bs.filter(b => b.host_id === myHost.id) : []);
      } catch (e) { }
      setLoading(false);
    })();
  }, []);
  const receber = bookings.filter(b => b.status === "concluida").reduce((s, b) => s + (b.valor_total || 0), 0);
  const andamento = bookings.filter(b => ["em_adaptacao", "confirmada", "em_andamento"].includes(b.status)).length;
  const solicitadas = bookings.filter(b => b.status === "solicitada").length;
  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-heading font-bold">Painel do anfitrião</h1>
      {!host ? <div className="rounded-2xl bg-accent/50 border border-border p-5 text-center"><p className="text-sm text-muted-foreground mb-3">Você ainda não criou seu anúncio.</p><Link to="/anuncio"><Button className="rounded-full">Criar anúncio</Button></Link></div> :
        <div className={`rounded-2xl p-4 border ${host.status_aprovacao === "aprovado" ? "bg-emerald-50 border-emerald-200" : host.status_aprovacao === "reprovado" ? "bg-red-50 border-red-200" : "bg-amber-50 border-amber-200"}`}>
          <p className="text-sm font-medium">Anúncio: {host.nome} — {host.status_aprovacao === "aprovado" ? "Aprovado" : host.status_aprovacao === "reprovado" ? "Reprovado" : "Em análise"}{host.super_host && " • Super Host"}</p>
        </div>
      }
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-2xl bg-card border border-border p-4"><DollarSign className="w-5 h-5 text-primary mb-1" /><p className="text-xs text-muted-foreground">A receber</p><p className="font-heading font-bold">R$ {receber.toFixed(0)}</p></div>
        <div className="rounded-2xl bg-card border border-border p-4"><ClipboardList className="w-5 h-5 text-primary mb-1" /><p className="text-xs text-muted-foreground">Solicitadas</p><p className="font-heading font-bold">{solicitadas}</p></div>
        <div className="rounded-2xl bg-card border border-border p-4"><TrendingUp className="w-5 h-5 text-primary mb-1" /><p className="text-xs text-muted-foreground">Ativas</p><p className="font-heading font-bold">{andamento}</p></div>
      </div>
      <div className="flex items-center justify-between"><h2 className="font-heading font-semibold">Reservas recentes</h2><Link to="/host/reservas"><Button variant="secondary" size="sm" className="rounded-full">Ver todas</Button></Link></div>
      {loading ? <p className="text-muted-foreground">Carregando...</p> : bookings.length === 0 ? <p className="text-sm text-muted-foreground">Nenhuma reserva ainda.</p> :
        <div className="space-y-2">{bookings.slice(0, 5).map(b => (
          <Link to={`/reserva/${b.id}`} key={b.id} className="block rounded-2xl bg-card border border-border p-3"><div className="flex justify-between"><span className="text-sm font-medium">{b.tipo.replace(/_/g, " ")}</span><Badge className="bg-primary/10 text-primary border-0 text-[11px]">{statusMap[b.status]}</Badge></div><p className="text-xs text-muted-foreground">{new Date(b.data_inicio).toLocaleDateString("pt-BR")} • R$ {b.valor_total?.toFixed(0)}</p></Link>
        ))}</div>}
    </div>
  );
}