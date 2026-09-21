import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { User as UserIcon, ShieldCheck } from "lucide-react";

export default function Perfil() {
  const { toast } = useToast();
  const [user, setUser] = useState(null);
  const [f, setF] = useState({ full_name: "", telefone: "", foto: "", bio: "", role: "tutor", dados_bancarios: "" });
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    base44.auth.me().then(u => { setUser(u); setF({ full_name: u.full_name || "", telefone: u.telefone || "", foto: u.foto || "", bio: u.bio || "", role: u.role || "tutor", dados_bancarios: u.dados_bancarios || "" }); }).catch(() => { });
  }, []);
  const save = async () => {
    setSaving(true);
    try {
      await base44.auth.updateMe({ telefone: f.telefone, foto: f.foto, bio: f.bio, role: f.role, dados_bancarios: f.dados_bancarios });
      toast({ title: "Perfil atualizado!" });
    } catch (e) { toast({ title: "Erro", description: e.message }); }
    setSaving(false);
  };
  const roleLabel = { tutor: "Tutor", anfitriao: "Anfitrião", admin: "Admin" };
  return (
    <div className="space-y-5 max-w-lg">
      <h1 className="text-2xl font-heading font-bold">Perfil</h1>
      <div className="rounded-3xl bg-card border border-border p-5 flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-accent grid place-items-center overflow-hidden shrink-0">{f.foto ? <img src={f.foto} className="w-full h-full object-cover" /> : <UserIcon className="w-8 h-8 text-muted-foreground" />}</div>
        <div><h2 className="font-heading font-semibold text-lg">{user?.full_name || "Usuário"}</h2><p className="text-sm text-muted-foreground">{user?.email}</p><div className="flex gap-2 mt-1"><Badge className="bg-primary/10 text-primary border-0">{roleLabel[f.role]}</Badge>{user?.verificado && <Badge className="bg-emerald-100 text-emerald-700 border-0"><ShieldCheck className="w-3 h-3 mr-0.5" />Verificado</Badge>}</div></div>
      </div>
      <div className="rounded-3xl bg-card border border-border p-5 space-y-4">
        <div className="space-y-1.5"><Label>Nome</Label><Input value={f.full_name} disabled className="rounded-xl" /></div>
        <div className="space-y-1.5"><Label>Papel</Label><Select value={f.role} onValueChange={v => setF(s => ({ ...s, role: v }))}><SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="tutor">Tutor</SelectItem><SelectItem value="anfitriao">Anfitrião</SelectItem><SelectItem value="admin">Admin</SelectItem></SelectContent></Select><p className="text-xs text-muted-foreground">Altere para testar os diferentes painéis.</p></div>
        <div className="space-y-1.5"><Label>Telefone</Label><Input value={f.telefone} onChange={e => setF(s => ({ ...s, telefone: e.target.value }))} className="rounded-xl" /></div>
        <div className="space-y-1.5"><Label>URL da foto</Label><Input value={f.foto} onChange={e => setF(s => ({ ...s, foto: e.target.value }))} className="rounded-xl" /></div>
        <div className="space-y-1.5"><Label>Bio</Label><Textarea value={f.bio} onChange={e => setF(s => ({ ...s, bio: e.target.value }))} className="rounded-xl" rows={2} /></div>
        {f.role === "anfitriao" && <div className="space-y-1.5"><Label>Dados bancários (PIX)</Label><Input value={f.dados_bancarios} onChange={e => setF(s => ({ ...s, dados_bancarios: e.target.value }))} className="rounded-xl" /></div>}
        <Button onClick={save} disabled={saving} className="rounded-full w-full">{saving ? "Salvando..." : "Salvar perfil"}</Button>
      </div>
    </div>
  );
}