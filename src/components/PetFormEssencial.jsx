import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";

const initial = { nome: "", especie: "cachorro", raca: "", porte: "medio", sexo: "macho", idade: "", castrado: false, sociabilidade_animais: true, sociabilidade_criancas: true, nivel_energia: "medio", info_saude_basica: "", foto: "" };

export default function PetFormEssencial({ user, onDone }) {
  const { toast } = useToast();
  const [f, setF] = useState(initial);
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setF(s => ({ ...s, [k]: v }));
  const submit = async () => {
    if (!f.nome) { toast({ title: "Informe o nome" }); return; }
    setSaving(true);
    try {
      await base44.entities.Pet.create({ ...f, idade: Number(f.idade) || 0, tutor_id: user.id });
      toast({ title: "Pet cadastrado!" });
      setF(initial);
      onDone?.();
    } catch (e) { toast({ title: "Erro", description: e.message }); }
    setSaving(false);
  };
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5 col-span-2"><Label>Nome*</Label><Input value={f.nome} onChange={e => set("nome", e.target.value)} className="rounded-xl" /></div>
        <div className="space-y-1.5"><Label>Espécie</Label><Select value={f.especie} onValueChange={v => set("especie", v)}><SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="cachorro">Cachorro</SelectItem><SelectItem value="gato">Gato</SelectItem><SelectItem value="outro">Outro</SelectItem></SelectContent></Select></div>
        <div className="space-y-1.5"><Label>Raça</Label><Input value={f.raca} onChange={e => set("raca", e.target.value)} className="rounded-xl" /></div>
        <div className="space-y-1.5"><Label>Porte</Label><Select value={f.porte} onValueChange={v => set("porte", v)}><SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="pequeno">Pequeno</SelectItem><SelectItem value="medio">Médio</SelectItem><SelectItem value="grande">Grande</SelectItem></SelectContent></Select></div>
        <div className="space-y-1.5"><Label>Sexo</Label><Select value={f.sexo} onValueChange={v => set("sexo", v)}><SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="macho">Macho</SelectItem><SelectItem value="femea">Fêmea</SelectItem></SelectContent></Select></div>
        <div className="space-y-1.5"><Label>Idade (anos)</Label><Input type="number" value={f.idade} onChange={e => set("idade", e.target.value)} className="rounded-xl" /></div>
        <div className="space-y-1.5"><Label>Nível de energia</Label><Select value={f.nivel_energia} onValueChange={v => set("nivel_energia", v)}><SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="baixo">Baixo</SelectItem><SelectItem value="medio">Médio</SelectItem><SelectItem value="alto">Alto</SelectItem></SelectContent></Select></div>
      </div>
      <div className="flex flex-wrap gap-4">
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={f.castrado} onChange={e => set("castrado", e.target.checked)} className="rounded" />Castrado</label>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={f.sociabilidade_animais} onChange={e => set("sociabilidade_animais", e.target.checked)} className="rounded" />Convive com animais</label>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={f.sociabilidade_criancas} onChange={e => set("sociabilidade_criancas", e.target.checked)} className="rounded" />Convive com crianças</label>
      </div>
      <div className="space-y-1.5"><Label>Info de saúde básica</Label><Textarea value={f.info_saude_basica} onChange={e => set("info_saude_basica", e.target.value)} className="rounded-xl" rows={2} /></div>
      <div className="space-y-1.5"><Label>URL da foto</Label><Input value={f.foto} onChange={e => set("foto", e.target.value)} placeholder="https://..." className="rounded-xl" /></div>
      <Button onClick={submit} disabled={saving} className="rounded-full w-full">{saving ? "Salvando..." : "Cadastrar pet"}</Button>
    </div>
  );
}