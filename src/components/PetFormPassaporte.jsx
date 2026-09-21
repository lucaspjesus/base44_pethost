import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Sparkles } from "lucide-react";

export default function PetFormPassaporte({ pet, onDone }) {
  const { toast } = useToast();
  const [f, setF] = useState({
    rotina_alimentar: pet.rotina_alimentar || "", horarios_passeio: pet.horarios_passeio || "",
    habitos_sono: pet.habitos_sono || "", vet_emergencia: pet.vet_emergencia || "",
    contato_emergencia: pet.contato_emergencia || "", alergias_medicamentos: pet.alergias_medicamentos || "",
    carteira_vacinacao_url: pet.carteira_vacinacao_url || "", resumo_ia: pet.resumo_ia || ""
  });
  const [saving, setSaving] = useState(false);
  const [gerando, setGerando] = useState(false);
  const set = (k, v) => setF(s => ({ ...s, [k]: v }));
  const salvar = async () => {
    setSaving(true);
    try {
      await base44.entities.Pet.update(pet.id, { ...f, passaporte_completo: true });
      toast({ title: "Passaporte salvo!" });
      onDone?.();
    } catch (e) { toast({ title: "Erro", description: e.message }); }
    setSaving(false);
  };
  const gerarResumo = async () => {
    setGerando(true);
    try {
      const res = await base44.functions.invoke("GerarResumoPet", { pet_id: pet.id });
      setF(s => ({ ...s, resumo_ia: res.data.resumo }));
      toast({ title: "Resumo gerado!" });
    } catch (e) { toast({ title: "Erro ao gerar resumo", description: e.message }); }
    setGerando(false);
  };
  return (
    <div className="space-y-4">
      <div className="space-y-1.5"><Label>Rotina alimentar</Label><Textarea value={f.rotina_alimentar} onChange={e => set("rotina_alimentar", e.target.value)} className="rounded-xl" rows={2} /></div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5"><Label>Horários de passeio</Label><Input value={f.horarios_passeio} onChange={e => set("horarios_passeio", e.target.value)} className="rounded-xl" /></div>
        <div className="space-y-1.5"><Label>Hábitos de sono</Label><Input value={f.habitos_sono} onChange={e => set("habitos_sono", e.target.value)} className="rounded-xl" /></div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5"><Label>Vet de emergência</Label><Input value={f.vet_emergencia} onChange={e => set("vet_emergencia", e.target.value)} className="rounded-xl" /></div>
        <div className="space-y-1.5"><Label>Contato de emergência</Label><Input value={f.contato_emergencia} onChange={e => set("contato_emergencia", e.target.value)} className="rounded-xl" /></div>
      </div>
      <div className="space-y-1.5"><Label>Alergias e medicamentos</Label><Textarea value={f.alergias_medicamentos} onChange={e => set("alergias_medicamentos", e.target.value)} className="rounded-xl" rows={2} /></div>
      <div className="space-y-1.5"><Label>Carteira de vacinação (URL)</Label><Input value={f.carteira_vacinacao_url} onChange={e => set("carteira_vacinacao_url", e.target.value)} className="rounded-xl" /></div>
      <div className="rounded-2xl bg-accent/60 p-4 space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-semibold">Resumo IA para o anfitrião</Label>
          <Button size="sm" variant="secondary" onClick={gerarResumo} disabled={gerando} className="rounded-full"><Sparkles className="w-3.5 h-3.5 mr-1" />{gerando ? "Gerando..." : "Gerar"}</Button>
        </div>
        {f.resumo_ia ? <p className="text-sm text-accent-foreground/80">{f.resumo_ia}</p> : <p className="text-sm text-muted-foreground">Gere um resumo rápido do pet para o anfitrião.</p>}
      </div>
      <Button onClick={salvar} disabled={saving} className="rounded-full w-full">{saving ? "Salvando..." : "Salvar passaporte"}</Button>
    </div>
  );
}