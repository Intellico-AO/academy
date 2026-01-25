'use client';

import { Session, SessionPlan, Course, CourseModule } from '../../types';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';

interface SessionPlanPrintProps {
  sessao: Session;
  plano: SessionPlan;
  curso: Course | undefined;
  modulo: CourseModule | undefined;
}

export function SessionPlanPrint({ sessao, plano, curso, modulo }: SessionPlanPrintProps) {
  return (
    <div className="print-container print-only" id="print-session-plan">
      {/* Cabeçalho */}
      <div className="print-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div className="print-title">PLANO DE SESSÃO</div>
            <div className="print-subtitle">{sessao.nome}</div>
          </div>
          <div style={{ textAlign: 'right', fontSize: '9pt', color: '#64748b' }}>
            <div><strong>Código:</strong> {curso?.codigo || 'N/A'}</div>
            <div><strong>Data:</strong> {format(new Date(sessao.dataInicio), "d 'de' MMMM 'de' yyyy", { locale: pt })}</div>
          </div>
        </div>
      </div>

      {/* Informações Gerais */}
      <div className="print-section">
        <div className="print-section-title">1. INFORMAÇÕES GERAIS</div>
        <div className="print-info-grid">
          <div className="print-info-item">
            <span className="print-info-label">Curso:</span>
            <span className="print-info-value">{curso?.nome || 'N/A'}</span>
          </div>
          <div className="print-info-item">
            <span className="print-info-label">Módulo:</span>
            <span className="print-info-value">{modulo?.nome || 'N/A'}</span>
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
            <span className="print-info-label">Horário:</span>
            <span className="print-info-value">{sessao.horaInicio} - {sessao.horaFim}</span>
          </div>
          <div className="print-info-item">
            <span className="print-info-label">Duração:</span>
            <span className="print-info-value">{plano.tempoEstimado} minutos</span>
          </div>
          <div className="print-info-item">
            <span className="print-info-label">Tipo:</span>
            <span className="print-info-value">{sessao.tipo === 'presencial' ? 'Presencial' : sessao.tipo === 'online' ? 'Online' : 'Híbrido'}</span>
          </div>
          <div className="print-info-item">
            <span className="print-info-label">Capacidade:</span>
            <span className="print-info-value">{sessao.capacidadeMaxima} formandos</span>
          </div>
        </div>
      </div>

      {/* Objetivos */}
      {sessao.objetivosSessao.length > 0 && (
        <div className="print-section">
          <div className="print-section-title">2. OBJETIVOS DA SESSÃO</div>
          <ul className="print-list">
            {sessao.objetivosSessao.map((obj, index) => (
              <li key={index}>{obj}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Metodologias */}
      {plano.metodologias.length > 0 && (
        <div className="print-section">
          <div className="print-section-title">3. METODOLOGIAS PEDAGÓGICAS</div>
          <ul className="print-list">
            {plano.metodologias.map((met, index) => (
              <li key={index}>{met}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Estrutura da Sessão */}
      <div className="print-section">
        <div className="print-section-title">4. ESTRUTURA PEDAGÓGICA</div>
        
        {plano.introducao && (
          <div style={{ marginBottom: '4mm' }}>
            <strong style={{ color: '#475569', fontSize: '9pt' }}>Introdução / Enquadramento:</strong>
            <p style={{ margin: '2mm 0', fontSize: '9pt', lineHeight: '1.5' }}>{plano.introducao}</p>
          </div>
        )}

        {plano.desenvolvimento && (
          <div style={{ marginBottom: '4mm' }}>
            <strong style={{ color: '#475569', fontSize: '9pt' }}>Desenvolvimento:</strong>
            <p style={{ margin: '2mm 0', fontSize: '9pt', lineHeight: '1.5', whiteSpace: 'pre-wrap' }}>{plano.desenvolvimento}</p>
          </div>
        )}

        {plano.conclusao && (
          <div>
            <strong style={{ color: '#475569', fontSize: '9pt' }}>Conclusão / Síntese:</strong>
            <p style={{ margin: '2mm 0', fontSize: '9pt', lineHeight: '1.5' }}>{plano.conclusao}</p>
          </div>
        )}
      </div>

      {/* Plano de Atividades */}
      {sessao.atividades.length > 0 && (
        <div className="print-section">
          <div className="print-section-title">5. PLANO DE ATIVIDADES</div>
          <table className="print-table">
            <thead>
              <tr>
                <th style={{ width: '8%' }}>Nº</th>
                <th style={{ width: '35%' }}>Atividade</th>
                <th style={{ width: '15%' }}>Tipo</th>
                <th style={{ width: '12%' }}>Duração</th>
                <th style={{ width: '30%' }}>Descrição</th>
              </tr>
            </thead>
            <tbody>
              {sessao.atividades.map((atividade, index) => (
                <tr key={atividade.id}>
                  <td style={{ textAlign: 'center' }}>{index + 1}</td>
                  <td>{atividade.nome}</td>
                  <td>{atividade.tipo === 'teorica' ? 'Teórica' : atividade.tipo === 'pratica' ? 'Prática' : atividade.tipo === 'avaliacao' ? 'Avaliação' : 'Intervalo'}</td>
                  <td style={{ textAlign: 'center' }}>{atividade.duracaoMinutos} min</td>
                  <td>{atividade.descricao || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Materiais e Recursos */}
      <div className="print-section">
        <div className="print-section-title">6. MATERIAIS E RECURSOS</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5mm' }}>
          {plano.materiaisNecessarios.length > 0 && (
            <div>
              <strong style={{ fontSize: '9pt', color: '#475569' }}>Materiais Pedagógicos:</strong>
              <ul className="print-list" style={{ marginTop: '2mm' }}>
                {plano.materiaisNecessarios.map((mat, index) => (
                  <li key={index}>{mat}</li>
                ))}
              </ul>
            </div>
          )}
          {sessao.recursos.length > 0 && (
            <div>
              <strong style={{ fontSize: '9pt', color: '#475569' }}>Equipamentos/Recursos:</strong>
              <ul className="print-list" style={{ marginTop: '2mm' }}>
                {sessao.recursos.map((rec) => (
                  <li key={rec.id}>{rec.nome} (x{rec.quantidade})</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Avaliação */}
      {plano.avaliacaoFormativa && (
        <div className="print-section">
          <div className="print-section-title">7. AVALIAÇÃO FORMATIVA</div>
          <p style={{ fontSize: '9pt', lineHeight: '1.5' }}>{plano.avaliacaoFormativa}</p>
        </div>
      )}

      {/* Adaptações */}
      {plano.adaptacoes && (
        <div className="print-section">
          <div className="print-section-title">8. ADAPTAÇÕES / DIFERENCIAÇÃO PEDAGÓGICA</div>
          <p style={{ fontSize: '9pt', lineHeight: '1.5' }}>{plano.adaptacoes}</p>
        </div>
      )}

      {/* Observações */}
      {plano.observacoes && (
        <div className="print-section">
          <div className="print-section-title">9. OBSERVAÇÕES</div>
          <p style={{ fontSize: '9pt', lineHeight: '1.5' }}>{plano.observacoes}</p>
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
