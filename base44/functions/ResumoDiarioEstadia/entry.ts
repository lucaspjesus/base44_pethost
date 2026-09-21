import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    const body = await req.json();
    const bookingId = body?.booking_id;
    if (!bookingId) return Response.json({ error: 'booking_id obrigatorio' }, { status: 400 });
    const events = await base44.entities.StayTimelineEvent.filter({ booking_id: bookingId });
    const recent = events.filter(e => e.tipo_evento !== 'resumo_ia').slice(-20);
    if (recent.length === 0) return Response.json({ resumo: 'Ainda nao ha eventos registrados hoje.' });
    const prompt = `Voce e um assistente pet. Consolide os eventos da estadia em um paragrafo amigavel e reconfortante para o tutor, em primeira pessoa como se o anfitriao escrevesse. Max 4 frases. Eventos: ${JSON.stringify(recent.map(e => ({ tipo: e.tipo_evento, descricao: e.descricao, hora: new Date(e.created_date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) })))}`;
    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({ prompt });
    const resumo = typeof result === 'string' ? result : (result?.content || result?.response || JSON.stringify(result));
    await base44.entities.StayTimelineEvent.create({ booking_id: bookingId, autor_id: user.id, autor_nome: 'Assistente IA', tipo_evento: 'resumo_ia', descricao: resumo });
    return Response.json({ resumo });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}