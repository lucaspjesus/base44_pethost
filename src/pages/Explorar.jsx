import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Search, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import HostCard from "@/components/HostCard";

export default function Explorar() {
  const { toast } = useToast();
  const [user, setUser] = useState(null);
  const [hosts, setHosts] = useState([]);
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [reservaHost, setReservaHost] = useState(null);
  const [form, setForm] = useState({ pet_id: "", data_inicio: "", data_fim: "", tipo: "Hospedagem" });
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const u = await base44.auth.me();
      setUser(u);
      const hs = await base44.entities.HostProfile.filter({ status_aprovacao: "aprovado" });
      setHosts(hs);
      const ps = await base44.entities.Pet.list();
      setPets(ps.filter(p => p.created_by_id === u.id));
    } catch (e) { toast({ title: "Erro ao carregar", description: e.message }); }
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const filtered = hosts.filter(h => !q || (h.nome || "").toLowerCase().includes(q.toLowerCase()) || (h.cidade || "").toLowerCase().includes(q.toLowerCase()));

  const submitReserva = async () => {
    if (!form.pet_id || !form.data_inicio) { toast({ title: "Selecione pet e data" }); return; }
    setSubmitting(true);
    try {
      const fim = form.data_fim || form.data_inicio;
      const dias = Math.max(1, Math.ceil((new Date(fim) - new Date(form.data_inicio)) / 86400000) + 1);
      const preco = reservaHost.precos_servicos?.hospedagem || 0;
      const total = dias * preco;
      await base44.entities.Booking.create({
        tutor_id: user.id, host_id: reservaHost.id, pet_id: form.pet_id,
        tipo: form.tipo, status: "solicitada",
        data_inicio: form.data_inicio, data_fim: fim,
        valor_total: total, valor_adaptacao: 0, desconto_aplicado: 0
      });
      toast({ title: "Reserva solicitada!", description: "Aguarde a resposta do anfitrião." });
      setReservaHost(null);
      setForm({ pet_id: "", data_inicio: "", data_fim: "", tipo: "Hospedagem" });
    } catch (e) { toast({ title: "Erro", description: e.message }); }
    setSubmitting(false);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold">Explorar anfitriões</h1>
          <p className="text-sm text-muted-foreground">Encontre o lugar ideal para seu pet.</p>
        </div>
        <Link to="/pets"><Button size="sm" variant="secondary" className="rounded-full"><Plus className="w-4 h-4 mr-1" />Meus pets</Button></Link>
      </div>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar por nome ou cidade" className="pl-9 rounded-full bg-card" />
      </div>
      {loading ? <div className="py-16 text-center text-muted-foreground">Carregando...</div> :
        filtered.length === 0 ? <div className="py-16 text-center text-muted-foreground">Nenhum anfitrião encontrado.</div> :
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filtered.map(h => <HostCard key={h.id} host={h} onReserve={setReservaHost} />)}
        </div>
      }
      <Dialog open={!!reservaHost} onOpenChange={o => !o && setReservaHost(null)}>
        <DialogContent className="rounded-3xl">
          <DialogHeader><DialogTitle>Reservar com {reservaHost?.nome}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Pet</Label>
              <Select value={form.pet_id} onValueChange={v => setForm(f => ({ ...f, pet_id: v }))}>
                <SelectTrigger className="rounded-xl"><SelectValue placeholder="Selecione seu pet" /></SelectTrigger>
                <SelectContent>
                  {pets.length === 0 ? <p className="p-3 text-sm text-muted-foreground">Cadastre um pet primeiro.</p> :
                    pets.map(p => <SelectItem key={p.id} value={p.id}>{p.nome}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Tipo de serviço</Label>
              <Select value={form.tipo} onValueChange={v => setForm(f => ({ ...f, tipo: v }))}>
                <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Hospedagem">Hospedagem</SelectItem>
                  <SelectItem value="Pre_Encontro">Pré-Encontro</SelectItem>
                  <SelectItem value="Creche Adaptacao">Creche Adaptação</SelectItem>
                  <SelectItem value="Hospedagem Teste">Hospedagem Teste</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label>Data início</Label><Input type="date" value={form.data_inicio} onChange={e => setForm(f => ({ ...f, data_inicio: e.target.value }))} className="rounded-xl" /></div>
              <div className="space-y-1.5"><Label>Data fim</Label><Input type="date" value={form.data_fim} onChange={e => setForm(f => ({ ...f, data_fim: e.target.value }))} className="rounded-xl" /></div>
            </div>
          </div>
          <DialogFooter><Button onClick={submitReserva} disabled={submitting} className="rounded-full">{submitting ? "Enviando..." : "Solicitar reserva"}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}