import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { Plus, Heart, AlertCircle, Download, PawPrint } from "lucide-react";

const tipoLabel = { vacina: "Vacina", vermifugo: "Vermífugo", antipulgas: "Antipulgas", sintoma: "Sintoma", ocorrencia_fezes: "Fezes", consulta: "Consulta" };
const tipoColor = { vacina: "bg-emerald-100 text-emerald-700", vermifugo: "bg-blue-100 text-blue-700", antipulgas: "bg-purple-100 text-purple-700", sintoma: "bg-red-100 text-red-700", ocorrencia_fezes: "bg-amber-100 text-amber-700", consulta: "bg-secondary text-secondary-foreground" };

export default function SaudePet() {
  const { toast } = useToast();
  const [pets, setPets] = useState([]);
  const [petId, setPetId] = useState("");
  const [events, setEvents] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ tipo: "vacina", data_registro: new Date().toISOString().slice(0, 10), data_proxima_dose: "", observacoes: "" });

  useEffect(() => { (async () => { try { const u = await base44.auth.me(); const ps = await base44.entities.Pet.list(); const mine = ps.filter(p => p.created_by_id === u.id); setPets(mine); if (!petId && mine.length) setPetId(mine[0].id); } catch (e) { } })(); }, []);
  useEffect(() => { if (petId) (async () => { const evs = await base44.entities.HealthTrackerEvent.filter({ pet_id: petId }); setEvents(evs.sort((a, b) => new Date(b.data_registro) - new Date(a.data_registro))); })(); }, [petId]);

  const addEvent = async () => {
    await base44.entities.HealthTrackerEvent.create({ ...form, pet_id: petId });
    toast({ title: "Evento registrado" }); setOpen(false);
    setForm({ tipo: "vacina", data_registro: new Date().toISOString().slice(0, 10), data_proxima_dose: "", observacoes: "" });
    const evs = await base44.entities.HealthTrackerEvent.filter({ pet_id: petId });
    setEvents(evs.sort((a, b) => new Date(b.data_registro) - new Date(a.data_registro)));
  };
  const exportar = () => {
    const pet = pets.find(p => p.id === petId);
    const win = window.open("", "_blank");
    win.document.write(`<html><head><title>Histórico de Saúde - ${pet?.nome || ""}</title><style>body{font-family:sans-serif;padding:32px;color:#333}h1{color:#2a8a6b}table{width:100%;border-collapse:collapse;margin-top:16px}th,td{border:1px solid #ddd;padding:8px;text-align:left;font-size:14px}th{background:#f5f5f5}</style></head><body><h1>Histórico de Saúde - ${pet?.nome || ""}</h1><table><tr><th>Data</th><th>Tipo</th><th>Próxima dose</th><th>Observações</th></tr>${events.map(e => `<tr><td>${new Date(e.data_registro).toLocaleDateString("pt-BR")}</td><td>${tipoLabel[e.tipo]}</td><td>${e.data_proxima_dose ? new Date(e.data_proxima_dose).toLocaleDateString("pt-BR") : "-"}</td><td>${e.observacoes || ""}</td></tr>`).join("")}</table></body></html>`);
    win.print();
  };

  const proximos = events.filter(e => e.data_proxima_dose && new Date(e.data_proxima_dose) >= new Date()).sort((a, b) => new Date(a.data_proxima_dose) - new Date(b.data_proxima_dose));

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-heading font-bold">Saúde do pet</h1><p className="text-sm text-muted-foreground">Calendário e histórico contínuo.</p></div>
        <Button onClick={() => setOpen(true)} className="rounded-full"><Plus className="w-4 h-4 mr-1" />Registrar</Button>
      </div>
      {pets.length > 0 && (
        <Select value={petId} onValueChange={setPetId}><SelectTrigger className="rounded-xl"><SelectValue placeholder="Selecione o pet" /></SelectTrigger><SelectContent>{pets.map(p => <SelectItem key={p.id} value={p.id}>{p.nome}</SelectItem>)}</SelectContent></Select>
      )}
      {pets.length === 0 ? <div className="py-16 text-center text-muted-foreground"><PawPrint className="w-12 h-12 mx-auto mb-3 opacity-40" />Cadastre um pet para acompanhar a saúde.</div> :
        <>
          {proximos.length > 0 && (
            <div className="rounded-2xl bg-amber-50 border border-amber-200 p-4 space-y-2">
              <h3 className="font-semibold text-amber-800 flex items-center gap-1.5 text-sm"><AlertCircle className="w-4 h-4" />Próximos cuidados</h3>
              {proximos.slice(0, 3).map(e => (
                <div key={e.id} className="flex items-center justify-between text-sm"><span>{tipoLabel[e.tipo]} {e.observacoes && `- ${e.observacoes}`}</span><span className="text-amber-700 font-medium">{new Date(e.data_proxima_dose).toLocaleDateString("pt-BR")}</span></div>
              ))}
            </div>
          )}
          <div className="flex items-center justify-between">
            <h2 className="font-heading font-semibold">Histórico</h2>
            <Button variant="secondary" size="sm" onClick={exportar} className="rounded-full"><Download className="w-4 h-4 mr-1" />Exportar</Button>
          </div>
          <div className="space-y-2">
            {events.length === 0 ? <p className="text-sm text-muted-foreground text-center py-8">Nenhum registro ainda.</p> :
              events.map(e => (
                <div key={e.id} className="rounded-2xl bg-card border border-border p-3 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-accent grid place-items-center shrink-0"><Heart className="w-5 h-5 text-primary" /></div>
                  <div className="flex-1 min-w-0"><div className="flex items-center gap-2"><Badge className={`${tipoColor[e.tipo]} border-0 text-[11px]`}>{tipoLabel[e.tipo]}</Badge><span className="text-xs text-muted-foreground">{new Date(e.data_registro).toLocaleDateString("pt-BR")}</span></div>{e.observacoes && <p className="text-sm text-muted-foreground mt-0.5">{e.observacoes}</p>}</div>
                  {e.data_proxima_dose && <div className="text-right text-xs shrink-0"><p className="text-muted-foreground">Próx.</p><p className="font-medium">{new Date(e.data_proxima_dose).toLocaleDateString("pt-BR")}</p></div>}
                </div>
              ))}
          </div>
        </>}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="rounded-3xl"><DialogHeader><DialogTitle>Registrar evento de saúde</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5"><Label>Tipo</Label><Select value={form.tipo} onValueChange={v => setForm(s => ({ ...s, tipo: v }))}><SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger><SelectContent>{Object.entries(tipoLabel).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent></Select></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label>Data</Label><Input type="date" value={form.data_registro} onChange={e => setForm(s => ({ ...s, data_registro: e.target.value }))} className="rounded-xl" /></div>
              <div className="space-y-1.5"><Label>Próxima dose</Label><Input type="date" value={form.data_proxima_dose} onChange={e => setForm(s => ({ ...s, data_proxima_dose: e.target.value }))} className="rounded-xl" /></div>
            </div>
            <div className="space-y-1.5"><Label>Observações</Label><Textarea value={form.observacoes} onChange={e => setForm(s => ({ ...s, observacoes: e.target.value }))} className="rounded-xl" rows={2} /></div>
          </div>
          <DialogFooter><Button onClick={addEvent} className="rounded-full">Registrar</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}