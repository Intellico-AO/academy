import OpenAI from 'openai';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'OPENAI_API_KEY não configurada' },
        { status: 500 }
      );
    }

    const openai = new OpenAI({ apiKey });

    const { campo, contexto } = await request.json();

    if (!campo) {
      return NextResponse.json(
        { error: 'Campo é obrigatório' },
        { status: 400 }
      );
    }

    const systemPrompt = `És um profissional experiente em formação profissional em Angola a preencher um formulário de gestão formativa.

REGRAS:
- Escreve em Português, de forma directa e prática
- Gera texto PRONTO A USAR no formulário — como se fosses tu a preencher o campo
- NÃO expliques o que é o campo nem dês definições
- NÃO uses bullet points nem listas — escreve em texto corrido
- Sê específico ao contexto fornecido (curso, sessão, programa, formador, etc.)
- Máximo 2-3 parágrafos curtos e objectivos
- Usa o contexto dos campos já preenchidos para manter coerência`;

    const userPrompt = `Preenche o campo "${campo}" com base no seguinte contexto do formulário:

${contexto}

Escreve o conteúdo para o campo "${campo}":`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      max_tokens: 500,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
    });

    const text = completion.choices[0]?.message?.content || '';

    return NextResponse.json({ text });
  } catch (error) {
    console.error('Erro ao gerar texto:', error);
    return NextResponse.json(
      { error: JSON.stringify(error) },
      { status: 500 }
    );
  }
}
