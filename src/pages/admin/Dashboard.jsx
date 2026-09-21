import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, ResponsiveContainer, Tooltip, CartesianGrid } from "recharts";
import { Users, Calendar, DollarSign, TrendingUp } from "lucide-react";

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [chart, setChart] = useState([]);
  useEffect(() => {
    (async () => {
      try {
        const [bs, hs, ps, us] = await Promise.all([base44.entities.Booking.list("-created_date", 200), base44.entities.HostProfile.list(), base44.entities.Pet.list(), base44.entities.User.list()]);
        const concluidas = bs.filter(b => b.status === "concluida");
        const gmv = concluidas.reduce((s, b) => s + (b.valor_total || 0), 0);
        const ticket = gmv / (concluidas.length || 1);
        const adaptadas = bs.filter(b => b.avaliacao_adaptacao && Object.keys(b.avaliacao_adaptacao).length > 0);
        const convAdapt = adaptadas.length ? (adaptadas.filter(b => b.status === "concluida").length / adaptadas.length * 100) : 0;
        setStats({ reservas: bs.length, concluidas: concluidas.length, gmv, ticket, hosts: hs.length, pets: ps.length, users: us.length, convAdapt });
        const meses = {};
        bs.forEach(b => { const m = new Date(b.created_date).toLocaleDateString("pt-BR", { month: "short" }); meses[m] = (meses[m] || 0) + 1; });
        setChart(Object.entries(meses).map(([name, reservas]) => ({ name, reservas })).slice(-6));
      } catch (e) { }
    })();
  }, []);
  if (!stats) return <div className="py-20 text-center text-muted-foreground">Carregando dashboard...</div>;
  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-heading font-bold">Dashboard executivo</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="rounded-2xl bg-card border border-border p-4"><Calendar className="w-5 h-5 text-primary mb-1" /><p className="text-xs text-muted-foreground">Reservas</p><p className="font-heading font-bold text-xl">{stats.reservas}</p></div>
        <div className="rounded-2xl bg-card border border-border p-4"><TrendingUp className="w-5 h-5 text-primary mb-1" /><p className="text-xs text-muted-foreground">Concluídas</p><p className="font-heading font-bold text-xl">{stats.concluidas}</p></div>
        <div className="rounded-2xl bg-card border border-border p-4"><DollarSign className="w-5 h-5 text-primary mb-1" /><p className="text-xs text-muted-foreground">GMV</p><p className="font-heading font-bold text-xl">R$ {stats.gmv.toFixed(0)}</p></div>
        <div className="rounded-2xl bg-card border border-border p-4"><Users className="w-5 h-5 text-primary mb-1" /><p className="text-xs text-muted-foreground">Ticket médio</p><p className="font-heading font-bold text-xl">R$ {stats.ticket.toFixed(0)}</p></div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <div className="rounded-2xl bg-card border border-border p-4"><p className="text-xs text-muted-foreground">Anfitriões</p><p className="font-heading font-bold text-lg">{stats.hosts}</p></div>
        <div className="rounded-2xl bg-card border border-border p-4"><p className="text-xs text-muted-foreground">Pets</p><p className="font-heading font-bold text-lg">{stats.pets}</p></div>
        <div className="rounded-2xl bg-card border border-border p-4"><p className="text-xs text-muted-foreground">Conv. pós-adaptação</p><p className="font-heading font-bold text-lg">{stats.convAdapt.toFixed(0)}%</p></div>
      </div>
      {chart.length > 0 && <div className="rounded-2xl bg-card border border-border p-4"><h3 className="font-heading font-semibold mb-3">Reservas por mês</h3><ResponsiveContainer width="100%" height={200}><BarChart data={chart}><CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="name" fontSize={12} /><Tooltip /><Bar dataKey="reservas" fill="hsl(162 52% 42%)" radius={[8, 8, 0, 0]} /></BarChart></ResponsiveContainer></div>}
      <div className="flex flex-wrap gap-2"><Link to="/anfitrioes"><Button variant="secondary" className="rounded-full">Aprovar anfitriões</Button></Link><Link to="/admin/reservas"><Button variant="secondary" className="rounded-full">Gerenciar reservas</Button></Link></div>
    </div>
  );
}