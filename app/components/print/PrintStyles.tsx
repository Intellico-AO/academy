'use client';

export function PrintStyles() {
  return (
    <style jsx global>{`
      @media print {
        body {
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
          background: white !important;
        }

        .no-print {
          display: none !important;
        }

        .print-only {
          display: block !important;
        }

        .print-container {
          width: 100%;
          max-width: 210mm;
          margin: 0 auto;
          padding: 15mm;
          background: white;
        }

        .print-header {
          border-bottom: 2px solid #10b981;
          padding-bottom: 10mm;
          margin-bottom: 8mm;
        }

        .print-title {
          font-size: 18pt;
          font-weight: bold;
          color: #1e293b;
          margin-bottom: 2mm;
        }

        .print-subtitle {
          font-size: 12pt;
          color: #64748b;
        }

        .print-section {
          margin-bottom: 8mm;
          page-break-inside: avoid;
        }

        .print-section-title {
          font-size: 11pt;
          font-weight: bold;
          color: #10b981;
          border-bottom: 1px solid #e2e8f0;
          padding-bottom: 2mm;
          margin-bottom: 3mm;
        }

        .print-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 9pt;
        }

        .print-table th,
        .print-table td {
          border: 1px solid #e2e8f0;
          padding: 2mm 3mm;
          text-align: left;
        }

        .print-table th {
          background: #f8fafc;
          font-weight: 600;
          color: #475569;
        }

        .print-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .print-list li {
          padding: 1.5mm 0;
          padding-left: 4mm;
          position: relative;
        }

        .print-list li::before {
          content: "•";
          position: absolute;
          left: 0;
          color: #10b981;
        }

        .print-numbered-list {
          list-style: decimal;
          padding-left: 5mm;
          margin: 0;
        }

        .print-numbered-list li {
          padding: 1.5mm 0;
        }

        .print-info-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 3mm;
          font-size: 9pt;
        }

        .print-info-item {
          display: flex;
          gap: 2mm;
        }

        .print-info-label {
          font-weight: 600;
          color: #475569;
          min-width: 30mm;
        }

        .print-info-value {
          color: #1e293b;
        }

        .print-footer {
          margin-top: 10mm;
          padding-top: 5mm;
          border-top: 1px solid #e2e8f0;
          font-size: 8pt;
          color: #94a3b8;
          display: flex;
          justify-content: space-between;
        }

        .print-page-break {
          page-break-before: always;
        }

        .print-exercise-box {
          border: 1px solid #e2e8f0;
          padding: 4mm;
          margin-bottom: 4mm;
          border-radius: 2mm;
        }

        .print-exercise-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 2mm;
          font-weight: 600;
        }

        .print-answer-lines {
          border-bottom: 1px dotted #cbd5e1;
          height: 8mm;
          margin: 2mm 0;
        }

        .print-checkbox {
          display: inline-block;
          width: 4mm;
          height: 4mm;
          border: 1px solid #475569;
          margin-right: 2mm;
          vertical-align: middle;
        }

        @page {
          size: A4;
          margin: 10mm;
        }
      }

      .print-only {
        display: none;
      }
    `}</style>
  );
}
