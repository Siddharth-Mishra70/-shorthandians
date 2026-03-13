import React, { useRef, useState, useEffect } from 'react';
import {
  Download, Printer, ArrowLeft,
  CheckCircle2, XCircle, AlertTriangle, Type,
  MinusCircle, PlusCircle, Hash, FileText,
  TrendingUp, User, Calendar, Loader2,
} from 'lucide-react';
import { supabase } from './supabaseClient';
import { fetchTestResult } from './lib/saveTestResult';
import DetailedAnalysisPanel from './DetailedAnalysisPanel';
import TypingPracticeWidget from './TypingPracticeWidget';

// ─────────────────────────────────────────────────────────────────────────────
// Demo report data (replace with real props in production)
// ─────────────────────────────────────────────────────────────────────────────
const DEMO_DATA = {
  studentName: 'Rahul Verma',
  date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }),
  exercise: 'Kailash Chandra Vol. 1 — Exercise 3',
  speed: '80 WPM',
  duration: '10:00',
  totalWords: 203,
  userWords: 198,
  totalMistakes: 68,
  capitalMistakes: 15,
  spellingMistakes: 12,
  accuracy: 66.5,
  original:
    'This petition under Article 226 of the Constitution challenges the order dated 15th March, 2024 passed by the Education Department withdrawing recognition from "Bright Future Public School" on grounds of non-compliance with infrastructural norms, violation of natural justice, and provisions of the Right of Children to Free and Compulsory Education Act, 2009. The order was passed without prior notice, lacks proper facilities including adequate classroom space, and violates procedural requirements. The petitioner seeks quashing of the order and directions for fresh consideration, having heard eminent learned counsel for the parties and perused the record this Court finds that the impugned order suffer from.',
  typed:
    'This petition under Article 226 of the Constitution challenges the order dated 15th March, 2024 passed by the education Department withdrawing recognition from "Bright Future Public School" on grounds of non-compliance with infrastructural norms, violation of natural justice, and provisions of the Right of Children to Free and compulsory Education Act, 2009. The order was passed without prior notice, lacks proper facilites including adequate classroom space, violates procedural requirements. The petitioner seeks quashing of the order and direction for fresh consideration. having heard emminent learned counsel for parties and perused the record this Court finds that the impugned order suffers from.',
  missingWords: ['the', 'and', 'eminent', 'suffer', 'from.'],
  extraWords: ['having', 'of', 'the', 'an'],
  spellingErrors: [
    { typed: 'facilites',  correct: 'facilities' },
    { typed: 'emminent',   correct: 'eminent' },
    { typed: 'direction',  correct: 'directions' },
    { typed: 'suffers',    correct: 'suffer' },
    { typed: 'compulsory', correct: 'Compulsory' },
  ],
  capitalErrors: [
    { typed: 'education',  correct: 'Education' },
    { typed: 'department', correct: 'Department' },
    { typed: 'compulsory', correct: 'Compulsory' },
    { typed: 'court',      correct: 'Court' },
    { typed: 'petitioner', correct: 'Petitioner' },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// Word-level diff: returns array of {word, type}
// type: 'correct' | 'capital' | 'missing' | 'wrong'
// ─────────────────────────────────────────────────────────────────────────────
const buildWordDiff = (original, typed) => {
  const origWords  = original.split(/\s+/);
  const typedWords = typed.split(/\s+/);
  const maxLen = Math.max(origWords.length, typedWords.length);
  const result = [];

  for (let i = 0; i < maxLen; i++) {
    const o = origWords[i]  || '';
    const t = typedWords[i] || '';
    if (!t) {
      result.push({ word: `[${o}]`, type: 'missing' });
    } else if (t === o) {
      result.push({ word: t, type: 'correct' });
    } else if (t.toLowerCase() === o.toLowerCase()) {
      result.push({ word: t, type: 'capital' });
    } else {
      result.push({ word: t, type: 'wrong' });
    }
  }
  return result;
};

// ─────────────────────────────────────────────────────────────────────────────
// Stat Card
// ─────────────────────────────────────────────────────────────────────────────
const StatCard = ({ icon: Icon, value, label, valueColor, bg, border }) => (
  <div className={`flex flex-col items-center justify-center p-4 rounded-2xl border print:rounded-lg print:p-3 ${bg} ${border}`}>
    <Icon className="w-5 h-5 mb-2 print:w-4 print:h-4" style={{ color: valueColor }} />
    <span className="text-2xl font-black print:text-xl" style={{ color: valueColor }}>{value}</span>
    <span className="text-xs font-semibold text-gray-500 text-center leading-tight mt-0.5">{label}</span>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// Mistake List Section
// ─────────────────────────────────────────────────────────────────────────────
const MistakeList = ({ title, icon: Icon, iconColor, bg, border, items, columns = 1 }) => (
  <div className={`rounded-2xl border print:rounded-lg overflow-hidden ${border}`}>
    <div className={`flex items-center space-x-2 px-4 py-3 border-b print:py-2 ${bg} ${border}`}>
      <Icon className="w-4 h-4 flex-shrink-0" style={{ color: iconColor }} />
      <h4 className="font-black text-gray-800 text-sm">{title}</h4>
      <span
        className="ml-auto text-xs font-bold px-2 py-0.5 rounded-full"
        style={{ background: iconColor + '20', color: iconColor }}
      >
        {items.length}
      </span>
    </div>

    <div className="p-3 max-h-52 overflow-y-auto print:overflow-visible print:max-h-none">
      {columns === 2 ? (
        /* Two-column layout for spelling/capital errors */
        <div>
          <div className="grid grid-cols-2 gap-1 mb-1.5">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Typed (Wrong)</span>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Correct</span>
          </div>
          <div className="space-y-1.5">
            {items.map((item, i) => (
              <div key={i} className="grid grid-cols-2 gap-1">
                <span className="text-xs font-bold px-2.5 py-1.5 rounded-lg bg-red-50 text-red-700 border border-red-100 line-through decoration-red-400">
                  {item.typed}
                </span>
                <span className="text-xs font-bold px-2.5 py-1.5 rounded-lg bg-green-50 text-green-700 border border-green-100">
                  {item.correct}
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Single word pill list */
        <div className="flex flex-wrap gap-1.5">
          {items.map((word, i) => (
            <span
              key={i}
              className="text-xs font-bold px-2.5 py-1.5 rounded-lg"
              style={{ background: iconColor + '15', color: iconColor, border: `1px solid ${iconColor}30` }}
            >
              {word}
            </span>
          ))}
        </div>
      )}
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// Result Analysis Page
// ─────────────────────────────────────────────────────────────────────────────
const ResultAnalysisPage = ({ data: propData, attemptId, onBack }) => {
  const reportRef = useRef(null);
  const [liveData,  setLiveData]  = useState(null);
  const [loadError, setLoadError] = useState(null);
  const [loading,   setLoading]   = useState(!!attemptId);

  // ── Fetch real attempt from Supabase if attemptId is given ──
  useEffect(() => {
    if (!attemptId) return;
    setLoading(true);
    fetchTestResult(supabase, attemptId)
      .then((row) => {
        // Map Supabase snake_case columns → DEMO_DATA shape
        setLiveData({
          studentName:    row.student_name   ?? 'Student',
          date:           new Date(row.created_at).toLocaleDateString('en-IN', {
                            day: '2-digit', month: 'long', year: 'numeric',
                          }),
          exercise:       row.exercise_id    ?? '—',
          speed:          `${row.wpm} WPM`,
          duration:       '—',
          totalWords:     (row.original_text ?? '').split(/\s+/).length,
          userWords:      (row.attempted_text ?? '').split(/\s+/).length,
          totalMistakes:  row.mistakes_count ?? 0,
          capitalMistakes: row.capital_mistakes  ?? 0,
          spellingMistakes: row.spelling_mistakes ?? 0,
          accuracy:       row.accuracy       ?? 0,
          original:       row.original_text  ?? '',
          typed:          row.attempted_text ?? '',
          missingWords:   row.missing_words  ?? [],
          extraWords:     row.extra_words    ?? [],
          spellingErrors: row.spelling_errors ?? [],
          capitalErrors:  row.capital_errors  ?? [],
        });
      })
      .catch((err) => {
        console.error('[ResultAnalysisPage] fetch error:', err);
        setLoadError(err.message);
      })
      .finally(() => setLoading(false));
  }, [attemptId]);

  // resolved data: live DB row > prop > demo
  const data = liveData ?? propData ?? DEMO_DATA;
  const diff = buildWordDiff(data.original, data.typed);

  const handlePrint = () => window.print();

  // ── Loading skeleton ─────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-[#1e3a8a] animate-spin mx-auto mb-4" />
          <p className="font-bold text-gray-600">Loading your result…</p>
          <p className="text-gray-400 text-sm mt-1">Fetching from Shorthandians database</p>
        </div>
      </div>
    );
  }

  // ── Error state ──────────────────────────────────────────────
  if (loadError) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl shadow-xl p-10 max-w-md w-full text-center">
          <XCircle className="w-14 h-14 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-black text-gray-900 mb-2">Couldn't Load Result</h2>
          <p className="text-gray-500 text-sm mb-6">{loadError}</p>
          {onBack && (
            <button
              onClick={onBack}
              className="bg-[#1e3a8a] text-white font-bold px-6 py-2.5 rounded-xl hover:bg-blue-700 transition-colors"
            >
              Back to Dashboard
            </button>
          )}
        </div>
      </div>
    );
  }

  const stats = [
    { icon: Hash,       value: data.totalWords,           label: 'Total Words',      valueColor: '#1e3a8a', bg: 'bg-blue-50',   border: 'border-blue-100' },
    { icon: FileText,   value: data.userWords,             label: 'User Words',       valueColor: '#0369a1', bg: 'bg-sky-50',    border: 'border-sky-100' },
    { icon: XCircle,    value: data.totalMistakes,         label: 'Total Mistakes',   valueColor: '#dc2626', bg: 'bg-red-50',    border: 'border-red-100' },
    { icon: AlertTriangle, value: data.capitalMistakes,   label: 'Capital Mistakes', valueColor: '#d97706', bg: 'bg-amber-50',  border: 'border-amber-100' },
    { icon: Type,       value: data.spellingMistakes,      label: 'Spelling Mistakes',valueColor: '#7c3aed', bg: 'bg-purple-50', border: 'border-purple-100' },
    { icon: TrendingUp, value: `${data.accuracy}%`,        label: 'Accuracy',         valueColor: '#16a34a', bg: 'bg-green-50',  border: 'border-green-100' },
  ];

  const mistakeSections = [
    {
      title: 'Missing Words',
      icon: MinusCircle,
      iconColor: '#dc2626',
      bg: 'bg-red-50',
      border: 'border-red-100',
      items: data.missingWords,
      columns: 1,
    },
    {
      title: 'Extra Words',
      icon: PlusCircle,
      iconColor: '#16a34a',
      bg: 'bg-green-50',
      border: 'border-green-100',
      items: data.extraWords,
      columns: 1,
    },
    {
      title: 'Spelling Mistakes',
      icon: Type,
      iconColor: '#7c3aed',
      bg: 'bg-purple-50',
      border: 'border-purple-100',
      items: data.spellingErrors,
      columns: 2,
    },
    {
      title: 'Capitalisation Mistakes',
      icon: AlertTriangle,
      iconColor: '#d97706',
      bg: 'bg-amber-50',
      border: 'border-amber-100',
      items: data.capitalErrors,
      columns: 2,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-100 print:bg-white">
      {/* ── Screen-only action bar ───────────────────────────── */}
      <div className="print:hidden sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          {onBack && (
            <button
              onClick={onBack}
              className="flex items-center space-x-2 text-gray-600 hover:text-[#1e3a8a] font-semibold text-sm transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Dashboard</span>
            </button>
          )}
          <div className="flex items-center space-x-3 ml-auto">
            <button
              onClick={handlePrint}
              className="flex items-center space-x-2 border-2 border-[#1e3a8a] text-[#1e3a8a] hover:bg-blue-50 font-bold px-4 py-2 rounded-xl transition-colors text-sm"
            >
              <Printer className="w-4 h-4" />
              <span>Print</span>
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center space-x-2 bg-[#1e3a8a] hover:bg-blue-700 text-white font-bold px-5 py-2 rounded-xl transition-all hover:shadow-lg hover:shadow-blue-500/25 text-sm"
            >
              <Download className="w-4 h-4" />
              <span>Download Report</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Printable Report ─────────────────────────────────── */}
      <div
        ref={reportRef}
        id="printable-report"
        className="max-w-5xl mx-auto my-8 print:my-0 bg-white rounded-3xl shadow-xl print:shadow-none print:rounded-none overflow-hidden"
      >
        {/* ── Report Header ─────────────────────────────────── */}
        <div
          className="px-8 py-8 print:py-6 relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #0f2167 0%, #1e3a8a 60%, #1a56db 100%)' }}
        >
          {/* Decorative orbs */}
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-blue-300/10 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            {/* Brand */}
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-amber-400 rounded-xl flex items-center justify-center font-black text-blue-900 text-2xl shadow-lg print:w-10 print:h-10 print:text-xl">
                S
              </div>
              <div>
                <h1 className="text-xl font-black text-white leading-tight print:text-lg">Shorthandians</h1>
                <p className="text-blue-200 text-sm font-medium">Analysis Report</p>
              </div>
            </div>

            {/* Print download button (visible in print) */}
            <button
              onClick={handlePrint}
              className="print:hidden flex items-center space-x-2 bg-white/15 hover:bg-white/25 border border-white/25 text-white font-bold px-4 py-2 rounded-xl transition-colors text-sm"
            >
              <Download className="w-4 h-4" />
              <span>Download Report</span>
            </button>
          </div>

          {/* Meta info row */}
          <div className="relative z-10 mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { icon: User,     label: 'Student',  value: data.studentName },
              { icon: Calendar, label: 'Date',     value: data.date },
              { icon: FileText, label: 'Exercise', value: data.exercise },
              { icon: TrendingUp, label: 'Speed',  value: data.speed },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="bg-white/10 border border-white/15 rounded-xl px-4 py-3 print:py-2">
                <div className="flex items-center space-x-1.5 text-blue-300 text-xs font-bold uppercase tracking-wider mb-1">
                  <Icon className="w-3 h-3" />
                  <span>{label}</span>
                </div>
                <p className="text-white font-bold text-sm truncate">{value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="px-6 sm:px-8 py-8 print:py-6 space-y-8 print:space-y-5">

          {/* ── Paragraph Panels (DetailedAnalysisPanel) ─────── */}
          <div className="print:hidden">
            <h2 className="text-sm font-black text-gray-500 uppercase tracking-widest mb-4">
              📄 Paragraph Comparison
            </h2>
            <DetailedAnalysisPanel
              originalText={data.original}
              attemptedText={data.typed}
              title="Comparison View"
            />
          </div>

          {/* ── Print-only simple paragraph view ─────────────── */}
          <div className="hidden print:block">
            <h2 className="text-sm font-black text-gray-500 uppercase tracking-widest mb-2">
              Paragraph Comparison
            </h2>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-gray-200 overflow-hidden">
                <div className="bg-gray-50 border-b border-gray-200 px-4 py-2 text-sm font-black text-gray-700">Original Paragraph</div>
                <div className="p-3 text-sm text-gray-700 leading-7 font-mono">{data.original}</div>
              </div>
              <div className="rounded-lg border border-blue-100 overflow-hidden">
                <div className="bg-blue-50 border-b border-blue-100 px-4 py-2 text-sm font-black text-blue-800">Typed Text</div>
                <div className="p-3 text-sm leading-7 font-mono">
                  {diff.map((token, i) => {
                    let cls = '';
                    if (token.type === 'correct') cls = 'text-green-700';
                    if (token.type === 'capital') cls = 'text-blue-700 underline font-bold';
                    if (token.type === 'missing') cls = 'text-red-600 italic';
                    if (token.type === 'wrong')   cls = 'text-red-700 line-through';
                    return <span key={i} className={cls}>{token.word} </span>;
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* ── Stats Grid ───────────────────────────────────── */}
          <div>
            <h2 className="text-sm font-black text-gray-500 uppercase tracking-widest mb-4 print:mb-2">
              📊 Performance Statistics
            </h2>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 print:gap-2">
              {stats.map((s) => (
                <StatCard key={s.label} {...s} />
              ))}
            </div>

            {/* Accuracy bar */}
            <div className="mt-4 print:mt-3">
              <div className="flex items-center justify-between text-sm font-bold text-gray-600 mb-1.5">
                <span>Overall Accuracy</span>
                <span style={{ color: data.accuracy >= 80 ? '#16a34a' : data.accuracy >= 60 ? '#d97706' : '#dc2626' }}>
                  {data.accuracy}%
                </span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden print:h-2">
                <div
                  className="h-full rounded-full transition-all duration-1000"
                  style={{
                    width: `${data.accuracy}%`,
                    background: data.accuracy >= 80
                      ? 'linear-gradient(90deg, #16a34a, #22c55e)'
                      : data.accuracy >= 60
                      ? 'linear-gradient(90deg, #d97706, #f59e0b)'
                      : 'linear-gradient(90deg, #dc2626, #ef4444)',
                  }}
                />
              </div>
            </div>
          </div>

          {/* ── Mistake Summary ──────────────────────────────── */}
          <div>
            <div className="flex items-center justify-between mb-4 print:mb-2">
              <h2 className="text-sm font-black text-gray-500 uppercase tracking-widest">
                🔍 Detailed Mistake Summary
              </h2>
              <span className="text-xs text-gray-400 font-medium">
                {data.totalMistakes} total errors found
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 print:gap-3">
              {mistakeSections.map((sec) => (
                <MistakeList key={sec.title} {...sec} />
              ))}
            </div>
          </div>

          {/* ── Practice This Passage (screen only) ──────────── */}
          <div className="print:hidden">
            <h2 className="text-sm font-black text-gray-500 uppercase tracking-widest mb-4">
              ⌨️ Practice This Passage
            </h2>
            <TypingPracticeWidget
              originalText={data.original}
              exerciseTitle={data.exercise}
            />
          </div>

          {/* ── Footer ──────────────────────────────────────── */}
          <div className="border-t border-gray-100 pt-6 print:pt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-[#1e3a8a] rounded-lg flex items-center justify-center">
                <span className="text-white font-black text-sm">S</span>
              </div>
              <div>
                <p className="font-black text-[#1e3a8a] text-sm">Shorthandians</p>
                <p className="text-gray-400 text-xs">Under the guidance of Ayush Pandey · Prayagraj</p>
              </div>
            </div>
            <p className="text-gray-400 text-xs text-center">
              Generated on {data.date} · Shorthandians.in · Contact: 7080811235
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ResultAnalysisPage;
