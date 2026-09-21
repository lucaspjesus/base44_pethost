import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { Plus, PawPrint, BookOpen, CheckCircle2 } from "lucide-react";
import PetFormEssencial from "@/components/PetFormEssencial";
import PetFormPassaporte from "@/components/PetFormPassaporte";

export default function PetCadastro() {
  const { toast } = useToast();
  const [user, setUser] = useState(null);
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [novoOpen, setNovoOpen] = useState(false);
  const [passaportePet, setPassaportePet] = useState(null);
  const load = async () => {
    setLoading(true);
    try {
      const u = await base44.auth.me(); setUser(u);
      const ps = await base44.entities.Pet.list();
      setPets(ps.filter(p => p.created_by_id === u.id));
    } catch (e) { toast({ title: "Erro", description: e.message }); }
    setLoading(false);
  };
  useEffect(() => { load(); }, []);
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-heading font-bold">Meus pets</h1><p className="text-sm text-muted-foreground">Cadastre e complete o passaporte.</p></div>
        <Button onClick={() => setNovoOpen(true)} className="rounded-full"><Plus className="w-4 h-4 mr-1" />Novo pet</Button>
      </div>
      {loading ? <div className="py-16 text-center text-muted-foreground">Carregando...</div> :
        pets.length === 0 ? <div className="py-16 text-center"><PawPrint className="w-12 h-12 mx-auto text-muted-foreground/40 mb-3" /><p className="text-muted-foreground">Você ainda não cadastrou pets.</p></div> :
        <div className="grid gap-3">
          {pets.map(p => (
            <div key={p.id} className="rounded-2xl bg-card border border-border p-4 flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-accent grid place-items-center overflow-hidden shrink-0">{p.foto ? <img src={p.foto} className="w-full h-full object-cover" /> : <PawPrint className="w-6 h-6 text-muted-foreground" />}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2"><h3 className="font-heading font-semibold">{p.nome}</h3>{p.passaporte_completo && <Badge className="bg-primary/10 text-primary text-[10px]"><CheckCircle2 className="w-3 h-3 mr-0.5" />Passaporte</Badge>}</div>
                <p className="text-xs text-muted-foreground capitalize">{p.especie} • {p.porte} • {p.sexo} • {p.idade} anos</p>
              </div>
              <Button size="sm" variant="secondary" className="rounded-full" onClick={() => setPassaportePet(p)}><BookOpen className="w-4 h-4 mr-1" />Passaporte</Button>
            </div>
          ))}
        </div>}
      <Dialog open={novoOpen} onOpenChange={o => { if (!o) load(); setNovoOpen(o); }}>
        <DialogContent className="rounded-3xl max-w-lg"><DialogHeader><DialogTitle>Cadastro essencial do pet</DialogTitle></DialogHeader><PetFormEssencial user={user} onDone={() => { setNovoOpen(false); load(); }} /></DialogContent>
      </Dialog>
      <Dialog open={!!passaportePet} onOpenChange={o => { if (!o) load(); setPassaportePet(o ? passaportePet : null); }}>
        <DialogContent className="rounded-3xl max-w-lg max-h-[85vh] overflow-y-auto"><DialogHeader><DialogTitle>Passaporte de {passaportePet?.nome}</DialogTitle></DialogHeader>{passaportePet && <PetFormPassaporte pet={passaportePet} onDone={() => { setPassaportePet(null); load(); }} />}</DialogContent>
      </Dialog>
    </div>
  );
}