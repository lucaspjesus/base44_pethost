import { MapPin, PawPrint } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function HostCard({ host, onReserve }) {
  const preco = host.precos_servicos?.hospedagem || 0;
  return (
    <div className="rounded-3xl bg-card border border-border overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <div className="h-40 bg-accent relative">
        {host.fotos?.[0] ? (
          <img src={host.fotos[0]} className="w-full h-full object-cover" alt={host.nome} />
        ) : (
          <div className="w-full h-full grid place-items-center text-accent-foreground/40"><PawPrint className="w-10 h-10" /></div>
        )}
        {host.super_host && <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground">Super Host</Badge>}
      </div>
      <div className="p-4 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-heading font-semibold text-lg leading-tight">{host.nome}</h3>
            {host.cidade && <p className="text-xs text-muted-foreground flex items-center gap-1"><MapPin className="w-3 h-3" />{host.cidade}</p>}
          </div>
          <div className="text-right">
            <p className="font-heading font-bold text-primary">R$ {preco.toFixed(0)}</p>
            <p className="text-[10px] text-muted-foreground">/diária</p>
          </div>
        </div>
        <p className="text-sm text-muted-foreground line-clamp-2">{host.descricao}</p>
        <div className="flex flex-wrap gap-1.5 pt-1">
          {host.tipos_servico?.map(s => <Badge key={s} variant="secondary" className="text-[11px]">{s}</Badge>)}
        </div>
        <button onClick={() => onReserve(host)} className="mt-2 w-full rounded-full bg-primary text-primary-foreground py-2.5 text-sm font-semibold hover:opacity-90 transition">Reservar</button>
      </div>
    </div>
  );
}