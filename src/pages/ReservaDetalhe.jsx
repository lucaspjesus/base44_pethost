import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { ArrowLeft, Sparkles, Camera, Utensils, Footprints, Pill, Droplets, Moon, Send, CheckCircle2 } from "lucide-react";

const statusMap = { solicitada: "Solicitada", em_adaptacao: "Em adaptação", confirmada: "Confirmada", em_andamento: "Em andamento", concluida: "Concluída", cancelada: "Cancelada" };
const eventIcons = { alimentacao: Utensils, passeio: Footprints, medicacao: Pill, agua: Droplets, descanso: Moon, foto: Camera, nota: Send, resumo_ia: Sparkles };
const eventLabel = { alimentacao: "Refeição servida", passeio: "Passeio realizado", medicacao: "Remédio dado", agua: "Água trocada", descanso: "Soneca", foto: "Foto", nota: "Nota", resumo_ia: "Resumo IA" };

export default function ReservaDetalhe() {
  const { id } = useParams();
  const { toast } = useToast();
  const [user, setUser] = useState(null);
  const [booking, setBooking] = useState(null);
  const [pet, setPet] = useState(null);
  const [host, setHost] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [nota, setNota] = useState("");
  const [checklist, setChecklist] = useState({ ambiente: "", ansiedade: "", alimentacao: "", interacao: "", recomenda: "", justificativa: "" });
  const [gerando, setGerando] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const u = await base44.auth.me(); setUser(u);
      const b = await base44.entities.Booking.get(id); setBooking(b);
      if (b?.pet_id) { try { setPet(await base44.entities.Pet.get(b.pet_id)); } catch { } }
      if (b?.host_id) { try { const hs = await base44.entities.HostProfile.list(); setHost(hs.find(h => h.id === b.host_id)); } catch { } }
      const evs = await base44.entities.StayTimelineEvent.filter({ booking_id: id });
      setEvents(evs.sort((a, b) => new Date(b.created_date) - new Date(a.created_date)));
    } catch (e) { toast({ title: "Erro", description: e.message }); }
    setLoading(false);
  };
  useEffect(() => { load(); }, [id]);

  const isHost = user && booking && host && host.user_id === user.id;

  const addEvent = async (tipo) => {
    try {
      await base44.entities.StayTimelineEvent.create({ booking_id: id, autor_id: user.id, autor_nome: user.full_name || "Anfitrião", tipo_evento: tipo, descricao: eventLabel[tipo] });
      toast({ title: eventLabel[tipo] + " registrado" });
      load();
    } catch (e) { toast({ title: "Erro", description: e.message }); }
  };
  const sendNota = async () => {
    if (!nota.trim()) return;
    await base44.entities.StayTimelineEvent.create({ booking_id: id, autor_id: user.id, autor_nome: user.full_name || "Você", tipo_evento: "nota", descricao: nota });
    setNota(""); load();
  };
  const responder = async (resp) => {
    const map = { aceitar: "confirmada", pre_encontro: "em_adaptacao", creche_adaptacao: "em_adaptacao", hospedagem_teste: "em_adaptacao" };
    await base44.entities.Booking.update(id, { resposta_host: resp, status: map[resp] });
    toast({ title: "Resposta enviada" }); load();
  };
  const finalizarChecklist = async () => {
    await base44.entities.Booking.update(id, { avaliacao_adaptacao: checklist, status: "confirmada" });
    toast({ title: "Adaptação registrada! Reserva confirmada." }); load();
  };
  const resumoDia = async () => {
    setGerando(true);
    try {
      await base44.functions.invoke("ResumoDiarioEstadia", { booking_id: id });
      toast({ title: "Resumo do dia gerado" });
      load();
    } catch (e) { toast({ title: "Erro", description: e.message }); }
    setGerando(false);
  };

  if (loading) return <div className="py-20 text-center text-muted-foreground">Carregando...</div>;
  if (!booking) return <div className="py-20 text-center text-muted-foreground">Reserva não encontrada.</div>;

  return (
    <div className="space-y-5">
      <Link to="/reservas" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="w-4 h-4 mr-1" />Voltar</Link>
      <div className="rounded-3xl bg-card border border-border p-5">
        <div className="flex items-center justify-between">
          <div><h1 className="text-xl font-heading font-bold">{host?.nome || "Anfitrião"}</h1><p className="text-sm text-muted-foreground">{pet?.nome} • {booking.tipo.replace(/_/g, " ")}</p></div>
          <Badge className="bg-primary/10 text-primary border-0">{statusMap[booking.status]}</Badge>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
          <div><span className="text-muted-foreground">Início:</span> {new Date(booking.data_inicio).toLocaleDateString("pt-BR")}</div>
          <div><span className="text-muted-foreground">Fim:</span> {booking.data_fim ? new Date(booking.data_fim).toLocaleDateString("pt-BR") : "-"}</div>
          <div><span className="text-muted-foreground">Total:</span> R$ {booking.valor_total?.toFixed(2).replace(".", ",")}</div>
          {booking.desconto_aplicado > 0 && <div className="text-emerald-600">Desconto adaptação: -R$ {booking.desconto_aplicado.toFixed(2)}</div>}
        </div>
      </div>

      {isHost && booking.status === "solicitada" && (
        <div className="rounded-3xl bg-accent/50 border border-border p-5 space-y-3">
          <h2 className="font-heading font-semibold">Responder solicitação</h2>
          <div className="grid grid-cols-2 gap-2">
            <Button onClick={() => responder("aceitar")} className="rounded-xl bg-emerald-600 hover:bg-emerald-700">Aceitar agora</Button>
            <Button variant="secondary" onClick={() => responder("pre_encontro")} className="rounded-xl">Pré-encontro</Button>
            <Button variant="secondary" onClick={() => responder("creche_adaptacao")} className="rounded-xl">Creche adaptação</Button>
            <Button variant="secondary" onClick={() => responder("hospedagem_teste")} className="rounded-xl">Hospedagem teste</Button>
          </div>
        </div>
      )}

      {isHost && booking.status === "em_adaptacao" && (
        <div className="rounded-3xl bg-card border border-border p-5 space-y-3">
          <h2 className="font-heading font-semibold">Checklist pós-adaptação</h2>
          {[["ambiente", "Adaptação ao ambiente?"], ["ansiedade", "Nível de ansiedade?"], ["alimentacao", "Alimentação normal?"], ["interacao", "Interação com outros cães?"], ["recomenda", "Recomenda estadia longa?"]].map(([k, l]) => (
            <div key={k} className="space-y-1"><label className="text-sm font-medium">{l}</label><Textarea rows={1} value={checklist[k]} onChange={e => setChecklist(s => ({ ...s, [k]: e.target.value }))} className="rounded-xl" /></div>
          ))}
          <div className="space-y-1"><label className="text-sm font-medium">Justificativa/Notas</label><Textarea rows={2} value={checklist.justificativa} onChange={e => setChecklist(s => ({ ...s, justificativa: e.target.value }))} className="rounded-xl" /></div>
          <Button onClick={finalizarChecklist} className="rounded-full w-full"><CheckCircle2 className="w-4 h-4 mr-1" />Confirmar reserva</Button>
        </div>
      )}

      {isHost && ["em_andamento", "confirmada", "em_adaptacao"].includes(booking.status) && (
        <div className="rounded-3xl bg-card border border-border p-5 space-y-3">
          <h2 className="font-heading font-semibold">Registro rápido de eventos</h2>
          <div className="grid grid-cols-3 gap-2">
            {[["alimentacao", Utensils], ["passeio", Footprints], ["medicacao", Pill], ["agua", Droplets], ["descanso", Moon], ["foto", Camera]].map(([t, Icon]) => (
              <button key={t} onClick={() => addEvent(t)} className="rounded-2xl bg-accent/60 hover:bg-accent transition p-3 flex flex-col items-center gap-1 text-xs font-medium">
                <Icon className="w-5 h-5 text-primary" />{eventLabel[t]}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <Textarea value={nota} onChange={e => setNota(e.target.value)} placeholder="Nota para o tutor..." className="rounded-xl" rows={1} />
            <Button onClick={sendNota} className="rounded-xl"><Send className="w-4 h-4" /></Button>
          </div>
          <Button onClick={resumoDia} disabled={gerando} variant="secondary" className="rounded-full w-full"><Sparkles className="w-4 h-4 mr-1" />{gerando ? "Gerando..." : "Resumo do dia por IA"}</Button>
        </div>
      )}

      <div className="rounded-3xl bg-card border border-border p-5">
        <h2 className="font-heading font-semibold mb-3">Diário da estadia</h2>
        {events.length === 0 ? <p className="text-sm text-muted-foreground">Nenhum evento registrado ainda.</p> :
          <div className="space-y-3">{events.map(ev => {
            const Icon = eventIcons[ev.tipo_evento] || Send;
            const isResumo = ev.tipo_evento === "resumo_ia";
            return (
              <div key={ev.id} className={`flex gap-3 ${isResumo ? "bg-accent/50 rounded-2xl p-3" : ""}`}>
                <div className={`w-8 h-8 rounded-full grid place-items-center shrink-0 ${isResumo ? "bg-primary text-primary-foreground" : "bg-accent text-primary"}`}><Icon className="w-4 h-4" /></div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between"><span className="text-sm font-medium">{eventLabel[ev.tipo_evento]}</span><span className="text-[11px] text-muted-foreground">{new Date(ev.created_date).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}</span></div>
                  {ev.descricao && <p className="text-sm text-muted-foreground">{ev.descricao}</p>}
                  {ev.foto_url && <img src={ev.foto_url} className="mt-1 rounded-xl max-h-40 object-cover" />}
                  {ev.autor_nome && <p className="text-[10px] text-muted-foreground mt-0.5">por {ev.autor_nome}</p>}
                </div>
              </div>
            );
          })}</div>}
      </div>
    </div>
  );
}