'use client';

import { SessionPlan, Session, Course } from '../../types';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';

interface SessionPlanPrintProps {
  plano: SessionPlan;
  sessao: Session;
  curso?: Course;
}

export function SessionPlanPrint({ plano, sessao, curso }: SessionPlanPrintProps) {
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
            <div><strong>Curso:</strong> {curso?.nome || 'N/A'}</div>
            <div><strong>Data:</strong> {sessao.data}</div>
          </div>
        </div>
      </div>

      {/* Informações Gerais */}
      <div className="print-section">
        <div className="print-section-title">1. INFORMAÇÕES GERAIS</div>
        <div className="print-info-grid">
          <div className="print-info-item">
            <span className="print-info-label">Sessão:</span>
            <span className="print-info-value">{sessao.nome}</span>
          </div>
          <div className="print-info-item">
            <span className="print-info-label">Curso:</span>
            <span className="print-info-value">{curso?.nome || 'N/A'}</span>
          </div>
          <div className="print-info-item">
            <span className="print-info-label">Formador:</span>
            <span className="print-info-value">{sessao.formador || 'A designar'}</span>
          </div>
          <div className="print-info-item">
            <span className="print-info-label">Horário:</span>
            <span className="print-info-value">{sessao.horaInicio} - {sessao.horaFim}</span>
          </div>
          <div className="print-info-item">
            <span className="print-info-label">Local:</span>
            <span className="print-info-value">{sessao.local || 'A definir'}</span>
          </div>
          <div className="print-info-item">
            <span className="print-info-label">Módulos:</span>
            <span className="print-info-value">{curso?.modulos.length || 0}</span>
          </div>
        </div>
      </div>

      {/* Objetivos da Sessão */}
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

      {/* Objetivos do Curso */}
      {curso && curso.objetivosGerais.length > 0 && (
        <div className="print-section">
          <div className="print-section-title">OBJETIVOS GERAIS DO CURSO</div>
          <ul className="print-list">
            {curso.objetivosGerais.map((obj, index) => (
              <li key={index}>{obj}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Métodos e Técnicas */}
      {(plano.metodos.length > 0 || plano.tecnicas.length > 0) && (
        <div className="print-section">
          <div className="print-section-title">3. MÉTODOS E TÉCNICAS PEDAGÓGICAS</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5mm' }}>
            {plano.metodos.length > 0 && (
              <div>
                <strong style={{ fontSize: '9pt', color: '#475569' }}>Métodos:</strong>
                <ul className="print-list" style={{ marginTop: '2mm' }}>
                  {plano.metodos.map((met, index) => (
                    <li key={index}>{met}</li>
                  ))}
                </ul>
              </div>
            )}
            {plano.tecnicas.length > 0 && (
              <div>
                <strong style={{ fontSize: '9pt', color: '#475569' }}>Técnicas:</strong>
                <ul className="print-list" style={{ marginTop: '2mm' }}>
                  {plano.tecnicas.map((tec, index) => (
                    <li key={index}>{tec}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
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

      {/* Módulos do Curso */}
      {curso && curso.modulos.length > 0 && (
        <div className="print-section">
          <div className="print-section-title">5. MÓDULOS DO CURSO</div>
          <table className="print-table">
            <thead>
              <tr>
                <th style={{ width: '8%' }}>Nº</th>
                <th style={{ width: '40%' }}>Módulo</th>
                <th style={{ width: '12%' }}>Horas</th>
                <th style={{ width: '40%' }}>Descrição</th>
              </tr>
            </thead>
            <tbody>
              {curso.modulos.map((modulo, index) => (
                <tr key={modulo.id}>
                  <td style={{ textAlign: 'center' }}>{index + 1}</td>
                  <td>{modulo.nome}</td>
                  <td style={{ textAlign: 'center' }}>{modulo.duracaoHoras}h</td>
                  <td>{modulo.descricao || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Recursos */}
      {sessao.recursos.length > 0 && (
        <div className="print-section">
          <div className="print-section-title">6. MATERIAIS E RECURSOS</div>
          <ul className="print-list">
            {sessao.recursos.map((recurso) => (
              <li key={recurso.id}>{recurso.nome} ({recurso.tipo}) x{recurso.quantidade}</li>
            ))}
          </ul>
        </div>
      )}

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
