import React, { useMemo, useRef, useCallback } from 'react';
import {
  CheckCircle2, AlertCircle, Type, MinusCircle, PlusCircle,
  FileText, Eye,
} from 'lucide-react';
import { generateDetailedAnalysis } from './lib/generateDetailedAnalysis';

// ─────────────────────────────────────────────────────────────────────────────
// Demo data (shown when no props supplied)
// ─────────────────────────────────────────────────────────────────────────────
const DEMO_ORIGINAL =
  'This petition under Article 226 of the Constitution challenges the order ' +
  'dated 15th March, 2024 passed by the Education Department withdrawing ' +
  'recognition from Bright Future Public School on grounds of non-compliance ' +
  'with infrastructural norms, violation of natural justice, and provisions of ' +
  'the Right of Children to Free and Compulsory Education Act, 2009. The order ' +
  'was passed without prior notice, lacks proper facilities including adequate ' +
  'classroom space, and violates procedural requirements.';

const DEMO_TYPED =
  'This petition under Article 226 of the Constitution challenges the order ' +
  'dated 15th March, 2024 passed by the education Department withdrawing ' +
  'recognition from Bright Future Public School on grounds of non-compliance ' +
  'with infrastructural norms, violation of natural justice, and provisions of ' +
  'Right of Children to Free and compulsory Education Act, 2009. The order ' +
  'was passed without prior notice, lacks proper facilites including adequate ' +
  'classroom space violates procedural requirements having.';

// ─────────────────────────────────────────────────────────────────────────────
// Token styles per error type
// ─────────────────────────────────────────────────────────────────────────────
const TOKEN_CONFIG = {
  correct: {
    base:  'bg-green-100 text-green-800 rounded',
    icon:  CheckCircle2,
    color: '#16a34a',
    tip:   'Correct',
    label: 'Correct',
  },
  wrong: {
    base:  'bg-red-100 text-red-700 rounded line-through decoration-red-500',
    icon:  AlertCircle,
    color: '#dc2626',
    tip:   (orig) => `Spelling — correct: "${orig}"`,
    label: 'Spelling Error',
  },
  capital: {
    base:  'text-blue-700 underline decoration-blue-500 decoration-2 underline-offset-2 rounded',
    icon:  Type,
    color: '#2563eb',
    tip:   (orig) => `Capitalisation — should be: "${orig}"`,
    label: 'Capitalisation',
  },
  missing: {
    base:  'bg-red-100 text-red-500 rounded italic',
    icon:  MinusCircle,
    color: '#dc2626',
    tip:   (orig) => `Missing word: "${orig}"`,
    label: 'Missing',
  },
  extra: {
    base:  'bg-amber-100 text-amber-700 rounded',
    icon:  PlusCircle,
    color: '#d97706',
    tip:   'Extra word (not in original)',
    label: 'Extra Word',
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Tooltip wrapper
// ─────────────────────────────────────────────────────────────────────────────
const WordToken = ({ token }) => {
  const cfg = TOKEN_CONFIG[token.type];
  if (!cfg) return <span>{token.word} </span>;

  const Icon     = cfg.icon;
  const tipText  = typeof cfg.tip === 'function' ? cfg.tip(token.orig || token.word) : cfg.tip;

  return (
    <span className="relative inline-block group">
      {/* The word chip */}
      <span
        className={`
          inline-flex items-center gap-0.5 px-1 py-0.5 text-sm font-mono leading-relaxed
          cursor-help transition-all duration-150 group-hover:shadow-md
          ${cfg.base}
        `}
      >
        {token.word}
        {/* Tiny icon beside the word */}
        {token.type !== 'correct' && (
          <Icon
            className="inline-block flex-shrink-0 ml-0.5"
            style={{ width: 10, height: 10, color: cfg.color }}
          />
        )}
      </span>

      {/* Tooltip bubble */}
      <span
        className="
          pointer-events-none absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2
          hidden group-hover:flex items-center gap-1.5
          whitespace-nowrap px-2.5 py-1.5 rounded-lg shadow-xl
          text-[11px] font-bold text-white
        "
        style={{ background: cfg.color, minWidth: 80 }}
      >
        {/* Arrow */}
        <span
          className="absolute top-full left-1/2 -translate-x-1/2 -mt-px"
          style={{
            width: 0, height: 0,
            borderLeft: '5px solid transparent',
            borderRight: '5px solid transparent',
            borderTop: `5px solid ${cfg.color}`,
          }}
        />
        <Icon style={{ width: 11, height: 11 }} />
        {tipText}
      </span>
    </span>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Legend chip (top of comparison panel)
// ─────────────────────────────────────────────────────────────────────────────
const LegendChip = ({ icon: Icon, label, color, bg }) => (
  <span
    className="flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-bold leading-none"
    style={{ background: bg, color }}
  >
    <Icon style={{ width: 10, height: 10 }} />
    {label}
  </span>
);

// ─────────────────────────────────────────────────────────────────────────────
// Stats bar (bottom)
// ─────────────────────────────────────────────────────────────────────────────
const MiniStat = ({ label, value, color }) => (
  <div className="flex flex-col items-center">
    <span className="text-xl font-black" style={{ color }}>{value}</span>
    <span className="text-[10px] font-semibold text-gray-500 text-center leading-tight">{label}</span>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────
/**
 * DetailedAnalysisPanel
 *
 * Props:
 *   originalText  {string}   Reference / dictation text.
 *   attemptedText {string}   Student's typed text.
 *   durationSec   {number}   Test duration for WPM (optional).
 *   title         {string}   Panel heading (optional).
 */
const DetailedAnalysisPanel = ({
  originalText  = DEMO_ORIGINAL,
  attemptedText = DEMO_TYPED,
  durationSec   = null,
  title         = 'Detailed Analysis',
}) => {
  // ── Run analysis ────────────────────────────────────────────
  const analysis = useMemo(
    () => generateDetailedAnalysis(originalText, attemptedText, { durationSec }),
    [originalText, attemptedText, durationSec]
  );

  const { summary, wordDiff } = analysis;

  // ── Build enriched diff tokens (attach orig for tooltip) ───
  // We need "orig" word for the wrong/capital/missing tooltips.
  // Walk through ops to marry each typed/missing word with its original.
  const enrichedDiff = useMemo(() => {
    // generateDetailedAnalysis already puts [origWord] in the 'word' field for missing
    // For wrong/capital tokens we need the correct word — re-run a simple merge:
    const origWords  = originalText.trim().split(/\s+/).filter(Boolean);
    let origIdx = 0;

    return wordDiff.map((token) => {
      if (token.type === 'correct' || token.type === 'capital' || token.type === 'wrong') {
        const orig = origWords[origIdx++] || '';
        return { ...token, orig };
      }
      if (token.type === 'missing') {
        const orig = origWords[origIdx++] || '';
        return { ...token, word: orig, orig }; // show the missing word (not [word])
      }
      // extra: no orig counterpart
      return { ...token, orig: '' };
    });
  }, [wordDiff, originalText]);

  // ── Sync scroll between panels ──────────────────────────────
  const origRef  = useRef(null);
  const compRef  = useRef(null);
  const syncing  = useRef(false);

  const syncScroll = useCallback((source, target) => () => {
    if (syncing.current) return;
    syncing.current = true;
    if (target.current) {
      const pct = source.current.scrollTop / (source.current.scrollHeight - source.current.clientHeight);
      target.current.scrollTop = pct * (target.current.scrollHeight - target.current.clientHeight);
    }
    requestAnimationFrame(() => { syncing.current = false; });
  }, []);

  // ── Stats ────────────────────────────────────────────────────
  const stats = [
    { label: 'Total Words',  value: summary.totalWords,    color: '#1e3a8a' },
    { label: 'Correct',      value: summary.correctWords,  color: '#16a34a' },
    { label: 'Mistakes',     value: summary.totalMistakes, color: '#dc2626' },
    { label: 'Accuracy',     value: `${summary.accuracy}%`, color: summary.accuracy >= 80 ? '#16a34a' : summary.accuracy >= 60 ? '#d97706' : '#dc2626' },
    ...(summary.wpm !== null ? [{ label: 'WPM', value: summary.wpm, color: '#7c3aed' }] : []),
  ];

  return (
    <div className="w-full bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">

      {/* ── Panel Header ──────────────────────────────────────── */}
      <div
        className="px-6 py-4 flex items-center justify-between"
        style={{ background: 'linear-gradient(135deg, #0f2167 0%, #1e3a8a 100%)' }}
      >
        <div className="flex items-center space-x-3">
          {/* Mac-style dots */}
          <div className="flex space-x-1.5">
            <div className="w-3 h-3 bg-red-400 rounded-full" />
            <div className="w-3 h-3 bg-amber-400 rounded-full" />
            <div className="w-3 h-3 bg-green-400 rounded-full" />
          </div>
          <span className="text-white font-black text-base tracking-tight">{title}</span>
        </div>
        <span className="text-blue-200 text-xs font-semibold opacity-70">
          Shorthandians Analyser
        </span>
      </div>

      {/* ── Stats bar ─────────────────────────────────────────── */}
      <div className="flex items-center justify-around px-6 py-3 bg-gray-50 border-b border-gray-100">
        {stats.map((s) => (
          <MiniStat key={s.label} {...s} />
        ))}

        {/* accuracy progress bar */}
        <div className="hidden sm:block flex-1 max-w-xs mx-4">
          <div className="flex justify-between text-[10px] font-bold text-gray-400 mb-1">
            <span>Accuracy</span>
            <span>{summary.accuracy}%</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-1000"
              style={{
                width: `${summary.accuracy}%`,
                background: summary.accuracy >= 80
                  ? 'linear-gradient(90deg,#16a34a,#22c55e)'
                  : summary.accuracy >= 60
                  ? 'linear-gradient(90deg,#d97706,#f59e0b)'
                  : 'linear-gradient(90deg,#dc2626,#ef4444)',
              }}
            />
          </div>
        </div>
      </div>

      {/* ── Two panels ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-100">

        {/* ── Left: Original Text ───────────────────────────── */}
        <div className="flex flex-col">
          {/* Panel header */}
          <div className="flex items-center space-x-2 px-5 py-3 bg-gray-50 border-b border-gray-100">
            <FileText className="w-4 h-4 text-gray-400" />
            <span className="text-sm font-black text-gray-700">Original Text</span>
            <span className="ml-auto text-[10px] font-bold bg-gray-200 text-gray-500 px-2 py-0.5 rounded-full">
              {summary.totalWords} words
            </span>
          </div>

          {/* Content */}
          <div
            ref={origRef}
            onScroll={syncScroll(origRef, compRef)}
            className="p-5 h-64 overflow-y-auto text-sm text-gray-700 leading-8 font-mono"
          >
            {originalText.trim().split(/\s+/).map((word, i) => (
              <span key={i}>
                <span className="inline-block px-1 py-0.5 text-sm font-mono leading-loose text-gray-700">
                  {word}
                </span>
                {' '}
              </span>
            ))}
          </div>
        </div>

        {/* ── Right: Comparison View ────────────────────────── */}
        <div className="flex flex-col">
          {/* Panel header */}
          <div className="flex flex-wrap items-center gap-2 px-5 py-3 bg-blue-50 border-b border-blue-100">
            <Eye className="w-4 h-4 text-[#1e3a8a] flex-shrink-0" />
            <span className="text-sm font-black text-[#1e3a8a] mr-1">Comparison View</span>

            {/* Legend chips */}
            <div className="flex flex-wrap gap-1.5 ml-auto">
              <LegendChip icon={CheckCircle2} label="Correct"      color="#16a34a" bg="#dcfce7" />
              <LegendChip icon={AlertCircle}  label="Spelling"     color="#dc2626" bg="#fee2e2" />
              <LegendChip icon={Type}         label="Capital"      color="#2563eb" bg="#dbeafe" />
              <LegendChip icon={MinusCircle}  label="Missing"      color="#9f1239" bg="#ffe4e6" />
              <LegendChip icon={PlusCircle}   label="Extra"        color="#b45309" bg="#fef3c7" />
            </div>
          </div>

          {/* Content */}
          <div
            ref={compRef}
            onScroll={syncScroll(compRef, origRef)}
            className="p-5 h-64 overflow-y-auto leading-8"
          >
            {enrichedDiff.map((token, i) => (
              <span key={i}>
                <WordToken token={token} />
                {' '}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── Mistake counts footer bar ─────────────────────────── */}
      <div className="flex flex-wrap gap-2 items-center px-5 py-3 bg-gray-50 border-t border-gray-100">
        <span className="text-xs font-black text-gray-500 uppercase tracking-widest mr-2">Breakdown:</span>
        {[
          { icon: MinusCircle, label: 'Missing',        count: summary.missingCount,          color: '#dc2626', bg: '#fee2e2' },
          { icon: PlusCircle,  label: 'Extra',          count: summary.extraCount,            color: '#b45309', bg: '#fef3c7' },
          { icon: AlertCircle, label: 'Spelling',       count: summary.spellingCount,         color: '#7c3aed', bg: '#f3e8ff' },
          { icon: Type,        label: 'Capitalisation', count: summary.capitalisationCount,   color: '#2563eb', bg: '#dbeafe' },
        ].map(({ icon: Icon, label, count, color, bg }) => (
          <span
            key={label}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold"
            style={{ background: bg, color }}
          >
            <Icon style={{ width: 12, height: 12 }} />
            {label}
            <span
              className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] font-black"
              style={{ background: color }}
            >
              {count}
            </span>
          </span>
        ))}
      </div>

    </div>
  );
};

export default DetailedAnalysisPanel;
