'use client';

import { Session, Worksheet, Course } from '../../types';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';

interface WorksheetPrintProps {
  sessao: Session;
  ficha: Worksheet;
  curso: Course | undefined;
  showAnswers?: boolean;
}

export function WorksheetPrint({ sessao, ficha, curso, showAnswers = false }: WorksheetPrintProps) {
  const renderExercise = (exercicio: Worksheet['exercicios'][0], index: number) => {
    return (
      <div key={exercicio.id} className="print-exercise-box">
        <div className="print-exercise-header">
          <span>Exercício {index + 1}</span>
          <span style={{ fontSize: '8pt', color: '#64748b' }}>{exercicio.pontuacao} pontos</span>
        </div>

        {exercicio.instrucoes && (
          <p style={{ fontSize: '8pt', fontStyle: 'italic', color: '#64748b', marginBottom: '2mm' }}>
            {exercicio.instrucoes}
          </p>
        )}

        <p style={{ fontSize: '9pt', marginBottom: '3mm' }}>{exercicio.pergunta}</p>

        {/* Múltipla Escolha */}
        {exercicio.tipo === 'multipla_escolha' && exercicio.opcoes && (
          <div style={{ marginLeft: '4mm' }}>
            {exercicio.opcoes.map((opcao, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', marginBottom: '2mm', fontSize: '9pt' }}>
                <span className="print-checkbox" />
                <span>{String.fromCharCode(65 + i)}) {opcao}</span>
                {showAnswers && exercicio.respostaCorreta === opcao && (
                  <span style={{ marginLeft: '3mm', color: '#10b981', fontWeight: 'bold' }}>✓</span>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Verdadeiro/Falso */}
        {exercicio.tipo === 'verdadeiro_falso' && (
          <div style={{ display: 'flex', gap: '8mm', marginLeft: '4mm' }}>
            <div style={{ display: 'flex', alignItems: 'center', fontSize: '9pt' }}>
              <span className="print-checkbox" />
              <span>Verdadeiro</span>
              {showAnswers && exercicio.respostaCorreta === 'Verdadeiro' && (
                <span style={{ marginLeft: '2mm', color: '#10b981', fontWeight: 'bold' }}>✓</span>
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', fontSize: '9pt' }}>
              <span className="print-checkbox" />
              <span>Falso</span>
              {showAnswers && exercicio.respostaCorreta === 'Falso' && (
                <span style={{ marginLeft: '2mm', color: '#10b981', fontWeight: 'bold' }}>✓</span>
              )}
            </div>
          </div>
        )}

        {/* Resposta Curta */}
        {exercicio.tipo === 'resposta_curta' && (
          <div>
            <div className="print-answer-lines" />
            {showAnswers && exercicio.respostaCorreta && (
              <p style={{ fontSize: '8pt', color: '#10b981', marginTop: '2mm' }}>
                <strong>Resposta:</strong> {exercicio.respostaCorreta}
              </p>
            )}
          </div>
        )}

        {/* Resposta Longa */}
        {exercicio.tipo === 'resposta_longa' && (
          <div>
            <div className="print-answer-lines" />
            <div className="print-answer-lines" />
            <div className="print-answer-lines" />
            <div className="print-answer-lines" />
            {showAnswers && exercicio.respostaCorreta && (
              <p style={{ fontSize: '8pt', color: '#10b981', marginTop: '2mm' }}>
                <strong>Resposta sugerida:</strong> {exercicio.respostaCorreta}
              </p>
            )}
          </div>
        )}

        {/* Prático */}
        {exercicio.tipo === 'pratico' && (
          <div style={{ padding: '5mm', border: '1px dashed #cbd5e1', borderRadius: '2mm', marginTop: '2mm' }}>
            <p style={{ fontSize: '8pt', color: '#64748b', textAlign: 'center' }}>
              Espaço para resolução prática
            </p>
            {showAnswers && exercicio.respostaCorreta && (
              <p style={{ fontSize: '8pt', color: '#10b981', marginTop: '3mm' }}>
                <strong>Orientações:</strong> {exercicio.respostaCorreta}
              </p>
            )}
          </div>
        )}

        {/* Correspondência */}
        {exercicio.tipo === 'correspondencia' && exercicio.opcoes && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4mm', marginTop: '2mm' }}>
            <div>
              <strong style={{ fontSize: '8pt', color: '#475569' }}>Coluna A:</strong>
              <ol className="print-numbered-list" style={{ fontSize: '9pt', marginTop: '2mm' }}>
                {exercicio.opcoes.filter((_, i) => i % 2 === 0).map((opcao, i) => (
                  <li key={i}>{opcao}</li>
                ))}
              </ol>
            </div>
            <div>
              <strong style={{ fontSize: '8pt', color: '#475569' }}>Coluna B:</strong>
              <ul className="print-list" style={{ fontSize: '9pt', marginTop: '2mm' }}>
                {exercicio.opcoes.filter((_, i) => i % 2 === 1).map((opcao, i) => (
                  <li key={i} style={{ listStyle: 'none' }}>{String.fromCharCode(65 + i)}) {opcao}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="print-container print-only" id="print-worksheet">
      {/* Cabeçalho */}
      <div className="print-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div className="print-title">FICHA DE TRABALHO{showAnswers ? ' - SOLUÇÕES' : ''}</div>
            <div className="print-subtitle">{ficha.titulo}</div>
            {ficha.subtitulo && (
              <div style={{ fontSize: '10pt', color: '#64748b', marginTop: '2mm' }}>{ficha.subtitulo}</div>
            )}
          </div>
          <div style={{ textAlign: 'right', fontSize: '9pt', color: '#64748b' }}>
            <div><strong>Curso:</strong> {curso?.nome || 'N/A'}</div>
            <div><strong>Sessão:</strong> {sessao.nome}</div>
          </div>
        </div>
      </div>

      {/* Área de Identificação do Formando */}
      {!showAnswers && (
        <div className="print-section" style={{ marginBottom: '6mm' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '4mm', fontSize: '9pt' }}>
            <div>
              <strong>Nome:</strong> ___________________________________________
            </div>
            <div>
              <strong>Data:</strong> ____/____/________
            </div>
          </div>
        </div>
      )}

      {/* Informações da Ficha */}
      <div className="print-section">
        <div className="print-info-grid" style={{ fontSize: '9pt' }}>
          <div className="print-info-item">
            <span className="print-info-label">Tempo Recomendado:</span>
            <span className="print-info-value">{ficha.tempoRecomendado} minutos</span>
          </div>
          <div className="print-info-item">
            <span className="print-info-label">Total de Pontos:</span>
            <span className="print-info-value">{ficha.totalPontos} pontos</span>
          </div>
        </div>
      </div>

      {/* Objetivos */}
      {ficha.objetivos.length > 0 && (
        <div className="print-section">
          <div className="print-section-title">OBJETIVOS</div>
          <ul className="print-list">
            {ficha.objetivos.map((obj, index) => (
              <li key={index}>{obj}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Instruções */}
      {ficha.instrucoes && (
        <div className="print-section">
          <div className="print-section-title">INSTRUÇÕES</div>
          <p style={{ fontSize: '9pt', lineHeight: '1.5', whiteSpace: 'pre-wrap' }}>{ficha.instrucoes}</p>
        </div>
      )}

      {/* Exercícios */}
      <div className="print-section">
        <div className="print-section-title">EXERCÍCIOS</div>
        {ficha.exercicios.map((exercicio, index) => renderExercise(exercicio, index))}
      </div>

      {/* Critérios de Avaliação */}
      {ficha.criteriosAvaliacao && (
        <div className="print-section">
          <div className="print-section-title">CRITÉRIOS DE AVALIAÇÃO</div>
          <p style={{ fontSize: '9pt', lineHeight: '1.5', whiteSpace: 'pre-wrap' }}>{ficha.criteriosAvaliacao}</p>
        </div>
      )}

      {/* Tabela de Cotações */}
      <div className="print-section">
        <div className="print-section-title">COTAÇÕES</div>
        <table className="print-table" style={{ width: 'auto' }}>
          <thead>
            <tr>
              {ficha.exercicios.map((_, index) => (
                <th key={index} style={{ textAlign: 'center', minWidth: '15mm' }}>Ex. {index + 1}</th>
              ))}
              <th style={{ textAlign: 'center', minWidth: '20mm' }}>Total</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              {ficha.exercicios.map((ex) => (
                <td key={ex.id} style={{ textAlign: 'center' }}>{ex.pontuacao}</td>
              ))}
              <td style={{ textAlign: 'center', fontWeight: 'bold' }}>{ficha.totalPontos}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Rodapé */}
      <div className="print-footer">
        <div>FormaPro - Sistema de Gestão Formativa</div>
        <div>Gerado em {format(new Date(), "d/MM/yyyy 'às' HH:mm", { locale: pt })}</div>
      </div>
    </div>
  );
}
