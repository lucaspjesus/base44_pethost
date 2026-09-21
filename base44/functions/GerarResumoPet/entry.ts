import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    const body = await req.json();
    const petId = body?.pet_id;
    if (!petId) return Response.json({ error: 'pet_id obrigatorio' }, { status: 400 });
    const pet = await base44.entities.Pet.get(petId);
    if (!pet) return Response.json({ error: 'Pet nao encontrado' }, { status: 404 });
    const prompt = `Voce e um assistente pet. Gere um resumo curto, amigavel e objetivo (max 4 frases) do pet para o anfitriao ler rapidamente, destacando cuidados essenciais, temperamento e alertas de saude. Use tom acolhedor. Dados do pet: ${JSON.stringify({ nome: pet.nome, especie: pet.especie, raca: pet.raca, porte: pet.porte, sexo: pet.sexo, idade: pet.idade, castrado: pet.castrado, nivel_energia: pet.nivel_energia, sociabilidade_animais: pet.sociabilidade_animais, sociabilidade_criancas: pet.sociabilidade_criancas, rotina_alimentar: pet.rotina_alimentar, horarios_passeio: pet.horarios_passeio, habitos_sono: pet.habitos_sono, alergias_medicamentos: pet.alergias_medicamentos, info_saude_basica: pet.info_saude_basica, vet_emergencia: pet.vet_emergencia })}`;
    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({ prompt });
    const resumo = typeof result === 'string' ? result : (result?.content || result?.response || JSON.stringify(result));
    await base44.entities.Pet.update(petId, { resumo_ia: resumo });
    return Response.json({ resumo });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}