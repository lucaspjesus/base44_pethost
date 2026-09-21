import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { Star, CheckCircle2, XCircle } from "lucide-react";

export default function Anfitrioes() {
  const { toast } = useToast();
  const [hosts, setHosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const load = async () => { setLoading(true); try { const hs = await base44.entities.HostProfile.list(); setHosts(hs); } catch (e) { } setLoading(false); };
  useEffect(() => { load(); }, []);
  const setStatus = async (h, status) => { await base44.entities.HostProfile.update(h.id, { status_aprovacao: status }); toast({ title: `Anfitrião ${status === "aprovado" ? "aprovado" : "reprovado"}` }); load(); };
  const toggleSuper = async (h) => { await base44.entities.HostProfile.update(h.id, { super_host: !h.super_host }); load(); };
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-heading font-bold">Gestão de anfitriões</h1>
      {loading ? <p className="text-muted-foreground">Carregando...</p> : hosts.length === 0 ? <p className="text-sm text-muted-foreground">Nenhum anfitrião.</p> :
        <div className="space-y-3">{hosts.map(h => (
          <div key={h.id} className="rounded-2xl bg-card border border-border p-4">
            <div className="flex items-start justify-between">
              <div><h3 className="font-heading font-semibold">{h.nome}</h3><p className="text-xs text-muted-foreground">{h.cidade} • {h.tipos_servico?.join(", ")}</p>{h.descricao && <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{h.descricao}</p>}</div>
              <Badge className={`${h.status_aprovacao === "aprovado" ? "bg-emerald-100 text-emerald-700" : h.status_aprovacao === "reprovado" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"} border-0`}>{h.status_aprovacao}</Badge>
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              <Button size="sm" onClick={() => setStatus(h, "aprovado")} className="rounded-full bg-emerald-600 hover:bg-emerald-700"><CheckCircle2 className="w-4 h-4 mr-1" />Aprovar</Button>
              <Button size="sm" variant="secondary" onClick={() => setStatus(h, "reprovado")} className="rounded-full"><XCircle className="w-4 h-4 mr-1" />Reprovar</Button>
              <Button size="sm" variant="secondary" onClick={() => toggleSuper(h)} className={`rounded-full ${h.super_host ? "bg-primary text-primary-foreground" : ""}`}><Star className="w-4 h-4 mr-1" />{h.super_host ? "Super Host" : "Tornar Super"}</Button>
            </div>
          </div>
        ))}</div>}
    </div>
  );
}