'use client';

import { Session, DemonstrationPlan, Course } from '../../types';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';

interface DemonstrationPlanPrintProps {
  sessao: Session;
  plano: DemonstrationPlan;
  curso: Course | undefined;
}

export function DemonstrationPlanPrint({ sessao, plano, curso }: DemonstrationPlanPrintProps) {
  return (
    <div className="print-container print-only" id="print-demonstration-plan">
      {/* Cabeçalho */}
      <div className="print-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div className="print-title">PLANO DE DEMONSTRAÇÃO</div>
            <div className="print-subtitle">{plano.titulo}</div>
          </div>
          <div style={{ textAlign: 'right', fontSize: '9pt', color: '#64748b' }}>
            <div><strong>Código:</strong> {curso?.codigo || 'N/A'}</div>
            <div><strong>Data:</strong> {format(new Date(sessao.dataInicio), "d 'de' MMMM 'de' yyyy", { locale: pt })}</div>
          </div>
        </div>
      </div>

      {/* Informações Gerais */}
      <div className="print-section">
        <div className="print-section-title">1. IDENTIFICAÇÃO</div>
        <div className="print-info-grid">
          <div className="print-info-item">
            <span className="print-info-label">Curso:</span>
            <span className="print-info-value">{curso?.nome || 'N/A'}</span>
          </div>
          <div className="print-info-item">
            <span className="print-info-label">Sessão:</span>
            <span className="print-info-value">{sessao.nome}</span>
          </div>
          <div className="print-info-item">
            <span className="print-info-label">Formador:</span>
            <span className="print-info-value">{sessao.formador || 'A designar'}</span>
          </div>
          <div className="print-info-item">
            <span className="print-info-label">Local:</span>
            <span className="print-info-value">{sessao.local || 'A definir'}</span>
          </div>
          <div className="print-info-item">
            <span className="print-info-label">Público-Alvo:</span>
            <span className="print-info-value">{plano.publicoAlvo || 'N/A'}</span>
          </div>
          <div className="print-info-item">
            <span className="print-info-label">Duração Total:</span>
            <span className="print-info-value">{plano.duracaoTotal} minutos</span>
          </div>
        </div>
      </div>

      {/* Objetivo Geral */}
      <div className="print-section">
        <div className="print-section-title">2. OBJETIVO GERAL</div>
        <p style={{ fontSize: '9pt', lineHeight: '1.5' }}>{plano.objetivoGeral}</p>
      </div>

      {/* Objetivos Específicos */}
      {plano.objetivosEspecificos.length > 0 && (
        <div className="print-section">
          <div className="print-section-title">3. OBJETIVOS ESPECÍFICOS</div>
          <ul className="print-numbered-list">
            {plano.objetivosEspecificos.map((obj, index) => (
              <li key={index}>{obj}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Materiais e Equipamentos */}
      {plano.materiaisEquipamentos.length > 0 && (
        <div className="print-section">
          <div className="print-section-title">4. MATERIAIS E EQUIPAMENTOS</div>
          <ul className="print-list">
            {plano.materiaisEquipamentos.map((mat, index) => (
              <li key={index}>{mat}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Condições de Segurança */}
      {plano.condicoesSeguranca.length > 0 && (
        <div className="print-section">
          <div className="print-section-title">5. CONDIÇÕES DE SEGURANÇA</div>
          <ul className="print-list">
            {plano.condicoesSeguranca.map((cond, index) => (
              <li key={index}>{cond}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Preparação Prévia */}
      {plano.preparacaoPrevia && (
        <div className="print-section">
          <div className="print-section-title">6. PREPARAÇÃO PRÉVIA</div>
          <p style={{ fontSize: '9pt', lineHeight: '1.5', whiteSpace: 'pre-wrap' }}>{plano.preparacaoPrevia}</p>
        </div>
      )}

      {/* Etapas da Demonstração */}
      <div className="print-section">
        <div className="print-section-title">7. ETAPAS DA DEMONSTRAÇÃO</div>
        {plano.etapas.map((etapa, index) => (
          <div key={etapa.id} style={{ marginBottom: '5mm', padding: '3mm', border: '1px solid #e2e8f0', borderRadius: '2mm' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2mm' }}>
              <strong style={{ fontSize: '10pt', color: '#10b981' }}>Etapa {index + 1}</strong>
              <span style={{ fontSize: '9pt', color: '#64748b' }}>{etapa.tempoMinutos} min</span>
            </div>
            <p style={{ fontSize: '9pt', marginBottom: '2mm' }}>{etapa.descricao}</p>
            
            {etapa.pontosChave.length > 0 && (
              <div style={{ marginTop: '2mm' }}>
                <strong style={{ fontSize: '8pt', color: '#475569' }}>Pontos-Chave:</strong>
                <ul className="print-list" style={{ fontSize: '8pt' }}>
                  {etapa.pontosChave.map((ponto, i) => (
                    <li key={i}>{ponto}</li>
                  ))}
                </ul>
              </div>
            )}

            {etapa.errosComuns.length > 0 && (
              <div style={{ marginTop: '2mm' }}>
                <strong style={{ fontSize: '8pt', color: '#dc2626' }}>Erros Comuns a Evitar:</strong>
                <ul className="print-list" style={{ fontSize: '8pt' }}>
                  {etapa.errosComuns.map((erro, i) => (
                    <li key={i}>{erro}</li>
                  ))}
                </ul>
              </div>
            )}

            {etapa.materiaisNecessarios.length > 0 && (
              <div style={{ marginTop: '2mm' }}>
                <strong style={{ fontSize: '8pt', color: '#475569' }}>Materiais:</strong>
                <span style={{ fontSize: '8pt', marginLeft: '2mm' }}>{etapa.materiaisNecessarios.join(', ')}</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Critérios de Avaliação */}
      {plano.criteriosAvaliacao.length > 0 && (
        <div className="print-section">
          <div className="print-section-title">8. CRITÉRIOS DE AVALIAÇÃO</div>
          <ul className="print-list">
            {plano.criteriosAvaliacao.map((crit, index) => (
              <li key={index}>{crit}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Observações */}
      {plano.observacoes && (
        <div className="print-section">
          <div className="print-section-title">9. OBSERVAÇÕES</div>
          <p style={{ fontSize: '9pt', lineHeight: '1.5', whiteSpace: 'pre-wrap' }}>{plano.observacoes}</p>
        </div>
      )}

      {/* Rodapé */}
      <div className="print-footer">
        <div>FormaPro - Sistema de Gestão Formativa</div>
        <div>Gerado em {format(new Date(), "d/MM/yyyy 'às' HH:mm", { locale: pt })}</div>
      </div>
    </div>
  );
}
