import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";

export default function AnuncioHost() {
  const { toast } = useToast();
  const [user, setUser] = useState(null);
  const [host, setHost] = useState(null);
  const [f, setF] = useState({ nome: "", descricao: "", cidade: "", capacidade: 1, fotos: "", tipos_servico: ["Hospedagem"], hospedagem: 80, creche: 50, passeio: 30, adaptacao: 40, aceite_imediato: true, exige_pre_encontro: false, exige_creche_adaptacao: false, exige_hospedagem_teste: false });
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    (async () => {
      try {
        const u = await base44.auth.me(); setUser(u);
        const hs = await base44.entities.HostProfile.list();
        const mine = hs.find(h => h.user_id === u.id);
        if (mine) {
          setHost(mine);
          setF({
            nome: mine.nome || "", descricao: mine.descricao || "", cidade: mine.cidade || "", capacidade: mine.capacidade || 1, fotos: (mine.fotos || []).join(", "), tipos_servico: mine.tipos_servico || ["Hospedagem"],
            hospedagem: mine.precos_servicos?.hospedagem || 80, creche: mine.precos_servicos?.creche || 50, passeio: mine.precos_servicos?.passeio || 30, adaptacao: mine.precos_servicos?.adaptacao || 40,
            aceite_imediato: mine.regras_aceite?.aceite_imediato ?? true, exige_pre_encontro: mine.regras_aceite?.exige_pre_encontro ?? false, exige_creche_adaptacao: mine.regras_aceite?.exige_creche_adaptacao ?? false, exige_hospedagem_teste: mine.regras_aceite?.exige_hospedagem_teste ?? false
          });
        }
      } catch (e) { }
    })();
  }, []);
  const toggleServico = (s) => setF(p => ({ ...p, tipos_servico: p.tipos_servico.includes(s) ? p.tipos_servico.filter(x => x !== s) : [...p.tipos_servico, s] }));
  const save = async () => {
    setSaving(true);
    try {
      const payload = {
        user_id: user.id, nome: f.nome, descricao: f.descricao, cidade: f.cidade, capacidade: Number(f.capacidade), fotos: f.fotos.split(",").map(s => s.trim()).filter(Boolean), tipos_servico: f.tipos_servico,
        precos_servicos: { hospedagem: Number(f.hospedagem), creche: Number(f.creche), passeio: Number(f.passeio), adaptacao: Number(f.adaptacao) },
        regras_aceite: { aceite_imediato: f.aceite_imediato, exige_pre_encontro: f.exige_pre_encontro, exige_creche_adaptacao: f.exige_creche_adaptacao, exige_hospedagem_teste: f.exige_hospedagem_teste },
        status_aprovacao: host?.status_aprovacao || "pendente"
      };
      if (host) await base44.entities.HostProfile.update(host.id, payload);
      else { const created = await base44.entities.HostProfile.create(payload); setHost(created); }
      toast({ title: "Anúncio salvo!" });
    } catch (e) { toast({ title: "Erro", description: e.message }); }
    setSaving(false);
  };
  return (
    <div className="space-y-4 max-w-lg">
      <h1 className="text-2xl font-heading font-bold">Meu anúncio</h1>
      <div className="rounded-3xl bg-card border border-border p-5 space-y-4">
        <div className="space-y-1.5"><Label>Nome do anúncio</Label><Input value={f.nome} onChange={e => setF(p => ({ ...p, nome: e.target.value }))} className="rounded-xl" /></div>
        <div className="space-y-1.5"><Label>Descrição</Label><Textarea value={f.descricao} onChange={e => setF(p => ({ ...p, descricao: e.target.value }))} className="rounded-xl" rows={3} /></div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5"><Label>Cidade</Label><Input value={f.cidade} onChange={e => setF(p => ({ ...p, cidade: e.target.value }))} className="rounded-xl" /></div>
          <div className="space-y-1.5"><Label>Capacidade</Label><Input type="number" value={f.capacidade} onChange={e => setF(p => ({ ...p, capacidade: e.target.value }))} className="rounded-xl" /></div>
        </div>
        <div className="space-y-1.5"><Label>Fotos (URLs separadas por vírgula)</Label><Input value={f.fotos} onChange={e => setF(p => ({ ...p, fotos: e.target.value }))} className="rounded-xl" /></div>
        <div className="space-y-1.5"><Label>Tipos de serviço</Label><div className="flex flex-wrap gap-2">{["Hospedagem", "Creche", "Passeio"].map(s => <button key={s} onClick={() => toggleServico(s)} className={`px-3 py-1.5 rounded-full text-sm font-medium border ${f.tipos_servico.includes(s) ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border"}`}>{s}</button>)}</div></div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5"><Label>Hospedagem (R$/diária)</Label><Input type="number" value={f.hospedagem} onChange={e => setF(p => ({ ...p, hospedagem: e.target.value }))} className="rounded-xl" /></div>
          <div className="space-y-1.5"><Label>Creche (R$)</Label><Input type="number" value={f.creche} onChange={e => setF(p => ({ ...p, creche: e.target.value }))} className="rounded-xl" /></div>
          <div className="space-y-1.5"><Label>Passeio (R$)</Label><Input type="number" value={f.passeio} onChange={e => setF(p => ({ ...p, passeio: e.target.value }))} className="rounded-xl" /></div>
          <div className="space-y-1.5"><Label>Adaptação (R$)</Label><Input type="number" value={f.adaptacao} onChange={e => setF(p => ({ ...p, adaptacao: e.target.value }))} className="rounded-xl" /></div>
        </div>
        <div className="space-y-2"><Label>Regras de aceite</Label>{[["aceite_imediato", "Aceite imediato"], ["exige_pre_encontro", "Exigir pré-encontro"], ["exige_creche_adaptacao", "Exigir creche de adaptação"], ["exige_hospedagem_teste", "Exigir hospedagem teste"]].map(([k, l]) => <label key={k} className="flex items-center gap-2 text-sm"><input type="checkbox" checked={f[k]} onChange={e => setF(p => ({ ...p, [k]: e.target.checked }))} className="rounded" />{l}</label>)}</div>
        <Button onClick={save} disabled={saving} className="rounded-full w-full">{saving ? "Salvando..." : "Salvar anúncio"}</Button>
      </div>
    </div>
  );
}