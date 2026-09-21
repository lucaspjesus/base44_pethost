import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Badge } from "@/components/ui/badge";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";

const statusMap = { solicitada: "Solicitada", em_adaptacao: "Em adaptação", confirmada: "Confirmada", em_andamento: "Em andamento", concluida: "Concluída", cancelada: "Cancelada" };

export default function ReservasAdmin() {
  const { toast } = useToast();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const load = async () => { setLoading(true); try { const bs = await base44.entities.Booking.list("-created_date", 200); setBookings(bs); } catch (e) { } setLoading(false); };
  useEffect(() => { load(); }, []);
  const changeStatus = async (b, status) => { await base44.entities.Booking.update(b.id, { status }); toast({ title: "Status atualizado" }); load(); };
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-heading font-bold">Gestão de reservas</h1>
      <p className="text-sm text-muted-foreground">Comissão plataforma: 15% • Repasse anfitrião: 85%</p>
      {loading ? <p className="text-muted-foreground">Carregando...</p> : bookings.length === 0 ? <p className="text-sm text-muted-foreground">Nenhuma reserva.</p> :
        <div className="space-y-3">{bookings.map(b => {
          const comissao = (b.valor_total || 0) * 0.15; const repasse = (b.valor_total || 0) * 0.85;
          return (
            <div key={b.id} className="rounded-2xl bg-card border border-border p-4 space-y-2">
              <div className="flex justify-between"><span className="font-medium">{b.tipo.replace(/_/g, " ")}</span><Badge className="bg-primary/10 text-primary border-0">{statusMap[b.status]}</Badge></div>
              <div className="grid grid-cols-2 text-sm gap-1"><div><span className="text-muted-foreground">Total:</span> R$ {b.valor_total?.toFixed(2)}</div><div><span className="text-muted-foreground">Comissão:</span> R$ {comissao.toFixed(2)}</div><div><span className="text-muted-foreground">Repasse:</span> R$ {repasse.toFixed(2)}</div><div><span className="text-muted-foreground">Início:</span> {new Date(b.data_inicio).toLocaleDateString("pt-BR")}</div></div>
              <Select defaultValue={b.status} onValueChange={v => changeStatus(b, v)}><SelectTrigger className="rounded-xl h-8 text-sm"><SelectValue /></SelectTrigger><SelectContent>{Object.entries(statusMap).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent></Select>
            </div>
          );
        })}</div>}
    </div>
  );
}