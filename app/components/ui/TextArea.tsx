'use client';

import { TextareaHTMLAttributes, forwardRef, useState } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';

interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  /** Contexto adicional para geração de IA (ex: nome do curso, módulo) */
  aiContext?: string;
  /** Callback chamado quando o texto é gerado pela IA */
  onAiGenerate?: (text: string) => void;
}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ label, error, helperText, className = '', id, aiContext, onAiGenerate, onChange, ...props }, ref) => {
    const textareaId = id || label?.toLowerCase().replace(/\s+/g, '-');
    const [isGenerating, setIsGenerating] = useState(false);

    const handleGenerate = async () => {
      if (!label || isGenerating) return;

      setIsGenerating(true);
      try {
        const res = await fetch('/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            campo: label,
            contexto: aiContext,
          }),
        });

        if (!res.ok) throw new Error('Erro na API');

        const { text } = await res.json();

        if (text && onAiGenerate) {
          onAiGenerate(text);
        }
      } catch (err) {
        console.error('Erro ao gerar texto:', err);
      } finally {
        setIsGenerating(false);
      }
    };

    const showAiButton = label && onAiGenerate;

    return (
      <div className="w-full">
        {label && (
          <div className="flex items-center justify-between mb-1.5">
            <label
              htmlFor={textareaId}
              className="block text-sm font-medium text-slate-700"
            >
              {label}
            </label>
            {showAiButton && (
              <button
                type="button"
                onClick={handleGenerate}
                disabled={isGenerating}
                className="
                  inline-flex items-center gap-1.5 px-2.5 py-1
                  text-xs font-medium rounded-md
                  text-violet-600 bg-violet-50
                  hover:bg-violet-100 hover:text-violet-700
                  disabled:opacity-50 disabled:cursor-not-allowed
                  transition-all duration-200
                "
                title="Gerar com IA"
              >
                {isGenerating ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5" />
                )}
                {isGenerating ? 'A gerar...' : 'IA'}
              </button>
            )}
          </div>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          className={`
            w-full px-3.5 py-2.5
            bg-white border rounded-lg
            text-slate-900 text-sm
            placeholder:text-slate-400
            transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500
            disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed
            resize-y min-h-[100px]
            ${error ? 'border-rose-500 focus:ring-rose-500 focus:border-rose-500' : 'border-slate-300'}
            ${className}
          `}
          onChange={onChange}
          {...props}
        />
        {error && (
          <p className="mt-1.5 text-sm text-rose-600">{error}</p>
        )}
        {helperText && !error && (
          <p className="mt-1.5 text-sm text-slate-500">{helperText}</p>
        )}
      </div>
    );
  }
);

TextArea.displayName = 'TextArea';
