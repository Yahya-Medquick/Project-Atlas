import { useState, useEffect, useRef } from 'react';
import jsPDF from 'jspdf';
import { MarkdownRenderer } from './MarkdownRenderer';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  compiledText: string;
  subjectTags: string[];
}

export const CompiledNotesModal = ({ isOpen, onClose, compiledText, subjectTags }: Props) => {
  const [editableContent, setEditableContent] = useState(compiledText);
  const [viewMode, setViewMode] = useState<'edit' | 'preview'>('preview');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setEditableContent(compiledText);
    setViewMode('preview');
  }, [compiledText]);

  if (!isOpen) return null;

  const today = new Date().toLocaleDateString('en-PK', {
    year: 'numeric', month: 'long', day: 'numeric'
  });

  const fileName = `G-AGE_AI_Notes_${subjectTags[0] || 'Study'}_${new Date().toISOString().split('T')[0]}.pdf`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(editableContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Strip markdown for plain PDF — equations converted to readable text
  const stripMarkdown = (text: string): string => {
    let clean = text;

    const convertLatex = (latex: string): string => {
      let eq = latex.trim();
      // Remove display math markers
      eq = eq.replace(/^\$\$|\$\$$/g, '').replace(/^\$|\$$/g, '');
      // Common symbols first
      eq = eq.replace(/\\times/g, '×');
      eq = eq.replace(/\\approx/g, '≈');
      eq = eq.replace(/\\to/g, '→');
      eq = eq.replace(/\\infty/g, '∞');
      eq = eq.replace(/\\cdot/g, '·');
      eq = eq.replace(/\\pm/g, '±');
      eq = eq.replace(/\\geq/g, '≥');
      eq = eq.replace(/\\leq/g, '≤');
      eq = eq.replace(/\\neq/g, '≠');
      eq = eq.replace(/\\alpha/g, 'α');
      eq = eq.replace(/\\beta/g, 'β');
      eq = eq.replace(/\\gamma/g, 'γ');
      eq = eq.replace(/\\Delta/g, 'Δ');
      eq = eq.replace(/\\pi/g, 'π');
      // Handle \frac{a}{b} → (a)/(b) — do this multiple times for nested fracs
      for (let i = 0; i < 5; i++) {
        eq = eq.replace(/\\frac\{([^{}]+)\}\{([^{}]+)\}/g, '($1)/($2)');
      }
      // Handle \sqrt{a} → √(a)
      for (let i = 0; i < 3; i++) {
        eq = eq.replace(/\\sqrt\{([^{}]+)\}/g, '√($1)');
      }
      // Handle superscripts ^{...} and ^x
      eq = eq.replace(/\^\{([^{}]+)\}/g, '^$1');
      eq = eq.replace(/\^(\w)/g, '^$1');
      // Handle subscripts _{...} and _x
      eq = eq.replace(/_\{([^{}]+)\}/g, '_$1');
      eq = eq.replace(/_(\w)/g, '_$1');
      // Remove remaining backslash commands
      eq = eq.replace(/\\[a-zA-Z]+/g, '');
      // Clean up extra braces
      eq = eq.replace(/\{([^{}]*)\}/g, '$1');
      // Clean up extra spaces
      eq = eq.replace(/\s+/g, ' ').trim();
      return eq;
    };

    // Block equations $$...$$
    clean = clean.replace(/\$\$([^$]+)\$\$/g, (_match, eq) =>
      `\n[Equation: ${convertLatex(eq)}]\n`
    );
    // Inline equations $...$
    clean = clean.replace(/\$([^$\n]+)\$/g, (_match, eq) =>
      convertLatex(eq)
    );
    // Remove headings but keep text
    clean = clean.replace(/^#{1,6}\s+(.+)$/gm, '$1');
    // Remove bold italic
    clean = clean.replace(/\*\*\*(.+?)\*\*\*/g, '$1');
    clean = clean.replace(/\*\*(.+?)\*\*/g, '$1');
    clean = clean.replace(/\*(.+?)\*/g, '$1');
    clean = clean.replace(/__(.+?)__/g, '$1');
    clean = clean.replace(/_(.+?)_/g, '$1');
    // Convert bullets
    clean = clean.replace(/^\s*[-*+]\s+/gm, '• ');
    // Remove numbered list markers
    clean = clean.replace(/^\s*\d+\.\s+/gm, '');
    // Mark horizontal rules for special handling
    clean = clean.replace(/^[-*_]{3,}$/gm, '---HRULE---');
    // Remove code blocks
    clean = clean.replace(/```[\s\S]*?```/gm, '');
    clean = clean.replace(/`([^`]+)`/g, '$1');
    // Remove blockquotes
    clean = clean.replace(/^\s*>\s*/gm, '');
    // Remove links keep text
    clean = clean.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
    // Remove image syntax
    clean = clean.replace(/!\[([^\]]*)\]\([^)]+\)/g, '');
    // Remove HTML tags
    clean = clean.replace(/<[^>]+>/g, '');
    // Collapse extra blank lines
    clean = clean.replace(/\n{3,}/g, '\n\n');
    return clean.trim();
  };

  // Detect if content has LaTeX equations
  const hasEquations = /\$\$?[^$]+\$\$?/.test(editableContent);

  const handleDownloadPDF = async () => {
    setIsGenerating(true);
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 18;
      const contentWidth = pageWidth - margin * 2;
      let y = 28;

      // Slim header — just a thin top line and text
      pdf.setDrawColor(30, 58, 95);
      pdf.setLineWidth(0.8);
      pdf.line(margin, 8, pageWidth - margin, 8);

      pdf.setTextColor(30, 58, 95);
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'bold');
      pdf.text('G-AGE AI Study Notes', margin, 14);

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(8);
      pdf.setTextColor(120, 120, 120);
      const headerRight = `${today}${subjectTags.length > 0 ? '  •  ' + subjectTags.join(', ') : ''}`;
      pdf.text(headerRight, pageWidth - margin, 14, { align: 'right' });

      pdf.setDrawColor(220, 220, 220);
      pdf.setLineWidth(0.3);
      pdf.line(margin, 18, pageWidth - margin, 18);

      // Process content
      const cleanContent = stripMarkdown(editableContent);
      const paragraphs = cleanContent.split('\n');

      paragraphs.forEach((paragraph: string) => {
        const trimmed = paragraph.trim();

        if (y > pageHeight - 20) {
          pdf.addPage();
          y = 20;
          // Repeat slim header on new pages
          pdf.setDrawColor(220, 220, 220);
          pdf.setLineWidth(0.3);
          pdf.line(margin, 8, pageWidth - margin, 8);
        }

        // Empty line
        if (trimmed === '') {
          y += 3;
          return;
        }

        // Horizontal rule — draw a real line
        if (trimmed === '---HRULE---') {
          pdf.setDrawColor(200, 200, 200);
          pdf.setLineWidth(0.3);
          pdf.line(margin, y, pageWidth - margin, y);
          y += 5;
          return;
        }

        // Heading detection — short line not starting with bullet
        const isHeading = trimmed.length < 80 &&
          !trimmed.startsWith('•') &&
          !trimmed.startsWith('[Equation') &&
          /^[A-Z0-9]/.test(trimmed);

        // Equation line
        if (trimmed.startsWith('[Equation:')) {
          pdf.setFillColor(245, 247, 250);
          const eqLines = pdf.splitTextToSize(trimmed, contentWidth - 8);
          const boxHeight = eqLines.length * 6 + 6;
          pdf.rect(margin, y - 4, contentWidth, boxHeight, 'F');
          pdf.setFont('courier', 'normal');
          pdf.setFontSize(9);
          pdf.setTextColor(40, 40, 120);
          eqLines.forEach((line: string) => {
            pdf.text(line, margin + 4, y);
            y += 6;
          });
          y += 3;
          pdf.setFont('helvetica', 'normal');
          pdf.setTextColor(50, 50, 50);
          return;
        }

        if (isHeading && trimmed.length < 60) {
          y += 3;
          pdf.setFont('helvetica', 'bold');
          pdf.setFontSize(12);
          pdf.setTextColor(20, 40, 80);
        } else if (trimmed.startsWith('•')) {
          pdf.setFont('helvetica', 'normal');
          pdf.setFontSize(10);
          pdf.setTextColor(50, 50, 50);
        } else {
          pdf.setFont('helvetica', 'normal');
          pdf.setFontSize(10);
          pdf.setTextColor(50, 50, 50);
        }

        const lines = pdf.splitTextToSize(trimmed, contentWidth);
        lines.forEach((line: string) => {
          if (y > pageHeight - 20) {
            pdf.addPage();
            y = 20;
          }
          pdf.text(line, trimmed.startsWith('•') ? margin + 3 : margin, y);
          y += trimmed.startsWith('•') ? 5.5 : 6.5;
        });
      });

      // Footer on every page
      const totalPages = (pdf as any).internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        pdf.setFontSize(7);
        pdf.setTextColor(180, 180, 180);
        pdf.setFont('helvetica', 'normal');
        pdf.text('Generated by G-AGE AI', margin, pageHeight - 6);
        pdf.text(`Page ${i} of ${totalPages}`, pageWidth - margin, pageHeight - 6, { align: 'right' });
      }

      pdf.save(fileName);
    } catch (err) {
      console.error('PDF generation failed:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  // Print view for documents with equations
  const handlePrintView = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>${fileName}</title>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css">
        <script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js"><\/script>
        <script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/contrib/auto-render.min.js"><\/script>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Georgia', serif; font-size: 11pt; color: #1a1a1a; padding: 20mm 18mm; line-height: 1.7; }
          .header { border-bottom: 2px solid #1e3a5f; padding-bottom: 8px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: flex-end; }
          .header-brand { font-size: 11pt; font-weight: bold; color: #1e3a5f; font-family: Arial, sans-serif; }
          .header-meta { font-size: 8pt; color: #888; font-family: Arial, sans-serif; text-align: right; }
          h1 { font-size: 15pt; font-weight: bold; color: #1e3a5f; margin: 18px 0 8px; }
          h2 { font-size: 13pt; font-weight: bold; color: #1e3a5f; margin: 14px 0 6px; }
          h3 { font-size: 11pt; font-weight: bold; color: #2d4a7a; margin: 10px 0 4px; }
          p { margin-bottom: 10px; }
          ul, ol { padding-left: 20px; margin-bottom: 10px; }
          li { margin-bottom: 4px; }
          strong { font-weight: bold; }
          hr { border: none; border-top: 1px solid #ddd; margin: 14px 0; }
          .katex-display { margin: 12px 0; padding: 10px; background: #f5f7fa; border-left: 3px solid #1e3a5f; border-radius: 4px; overflow-x: auto; }
          .footer { position: fixed; bottom: 10mm; left: 18mm; right: 18mm; font-size: 7pt; color: #aaa; font-family: Arial, sans-serif; display: flex; justify-content: space-between; border-top: 1px solid #eee; padding-top: 4px; }
          @media print {
            body { padding: 15mm 15mm; }
            .no-print { display: none; }
            @page { margin: 15mm; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="header-brand">⚡ G-AGE AI Study Notes</div>
          <div class="header-meta">${today}${subjectTags.length > 0 ? '<br>' + subjectTags.join(', ') : ''}</div>
        </div>
        <div id="content"></div>
        <div class="footer no-print">
          <span>Generated by G-AGE AI</span>
          <button onclick="window.print()" style="background:#1e3a5f;color:white;border:none;padding:4px 14px;border-radius:4px;cursor:pointer;font-size:9pt;">🖨️ Print / Save as PDF</button>
        </div>
        <script>
          let content = ${JSON.stringify(editableContent)};
          content = content
            .replace(/^### (.+)$/gm, '<h3>$1</h3>')
            .replace(/^## (.+)$/gm, '<h2>$1</h2>')
            .replace(/^# (.+)$/gm, '<h1>$1</h1>')
            .replace(/\\*\\*\\*(.+?)\\*\\*\\*/g, '<strong><em>$1</em></strong>')
            .replace(/\\*\\*(.+?)\\*\\*/g, '<strong>$1</strong>')
            .replace(/\\*(.+?)\\*/g, '<em>$1</em>')
            .replace(/^[-*+] (.+)$/gm, '<li>$1</li>')
            .replace(/(<li>[\\s\\S]*?<\\/li>)/g, '<ul>$1</ul>')
            .replace(/^---$/gm, '<hr>')
            .replace(/\\n\\n/g, '</p><p>')
            .replace(/^(?!<[hupli]|<hr)(.+)$/gm, '<p>$1</p>');
          document.getElementById('content').innerHTML = content;

          // Wait for KaTeX auto-render script to load then render
          function tryRender(attempts) {
            if (typeof renderMathInElement !== 'undefined') {
              renderMathInElement(document.body, {
                delimiters: [
                  {left: '$$', right: '$$', display: true},
                  {left: '$', right: '$', display: false}
                ],
                throwOnError: false
              });
            } else if (attempts > 0) {
              setTimeout(() => tryRender(attempts - 1), 200);
            }
          }
          // Start trying after a short delay to allow scripts to load
          setTimeout(() => tryRender(10), 300);
        <\/script>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="bg-gray-900 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl border border-gray-700">

        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-700">
          <div>
            <h2 className="text-lg font-bold text-white">📄 Compiled Study Notes</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              G-AGE AI • {today}
              {subjectTags.length > 0 && ` • ${subjectTags.join(', ')}`}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl leading-none cursor-pointer">✕</button>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-2 px-5 pt-3 pb-2 border-b border-gray-800">
          <button
            onClick={() => setViewMode('preview')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              viewMode === 'preview' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            👁 Preview
          </button>
          <button
            onClick={() => setViewMode('edit')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              viewMode === 'edit' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            ✏️ Edit
          </button>
          {hasEquations && (
            <span className="ml-auto text-xs text-amber-400 flex items-center gap-1">
              ∑ Contains equations — use Print View for best PDF quality
            </span>
          )}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-5 min-h-[380px]">
          {viewMode === 'preview' ? (
            <div className="bg-gray-800/60 border border-gray-700/60 rounded-xl p-5 min-h-[380px]">
              <MarkdownRenderer content={editableContent} />
            </div>
          ) : (
            <textarea
              className="w-full h-full min-h-[380px] bg-gray-800 text-gray-100 rounded-xl p-4 text-sm leading-relaxed resize-none border border-gray-600 focus:border-blue-500 focus:outline-none font-mono"
              value={editableContent}
              onChange={(e) => setEditableContent(e.target.value)}
              placeholder="Your compiled notes will appear here..."
            />
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 p-5 border-t border-gray-700">
          <button
            onClick={handleCopy}
            className="px-4 py-2.5 rounded-xl border border-gray-600 text-gray-300 hover:text-white hover:border-gray-400 transition-colors font-medium text-sm cursor-pointer"
          >
            {copied ? '✓ Copied!' : '📋 Copy'}
          </button>
          <button
            onClick={handlePrintView}
            className="px-4 py-2.5 rounded-xl border border-amber-600 text-amber-400 hover:bg-amber-600 hover:text-white transition-colors font-medium text-sm cursor-pointer"
          >
            🖨️ Print View
          </button>
          <button
            onClick={handleDownloadPDF}
            disabled={isGenerating}
            className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-medium text-sm transition-colors cursor-pointer"
          >
            {isGenerating ? '⏳ Generating...' : '⬇️ Download PDF'}
          </button>
        </div>
      </div>
    </div>
  );
};
