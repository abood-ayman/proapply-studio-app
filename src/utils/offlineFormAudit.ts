import type { AuditFinding, AuditReport } from '../types';
import { buildAuditReport } from './formAuditParser';

export type AuditUiLang = 'en' | 'ar';

const PORTAL_HINTS: Array<{ pattern: RegExp; name: string }> = [
  { pattern: /taleo/i, name: 'Oracle Taleo' },
  { pattern: /workday/i, name: 'Workday' },
  { pattern: /successfactors|sap\b/i, name: 'SAP SuccessFactors' },
  { pattern: /un careers|unesco|unicef|undp|fao/i, name: 'UN Careers' },
  { pattern: /google forms/i, name: 'Google Forms' },
  { pattern: /linkedin/i, name: 'LinkedIn Easy Apply' },
  { pattern: /greenhouse/i, name: 'Greenhouse' },
  { pattern: /lever\.co|lever\b/i, name: 'Lever' },
];

const DISQUALIFYING_QUESTION = /convicted|felony|criminal|dismissed|terminated|disciplinary|conflict of interest|sanction|debarred|banned|fraud|theft|investigat/i;
const WILLINGNESS_QUESTION = /willing|accept|relocate|shift|night|travel|short[- ]term|temporary|available|notice period|start(ing)? date|overtime|weekend/i;
const EMAIL_ANSWER = /email/i;
const PHONE_ANSWER = /phone|mobile|telephone/i;
const BLANK_ANSWER = /^(\[?blank\]?|n\/?a|-|—|none|no answer|)$/i;
const VAGUE_ANSWER = /^(maybe|not sure|idk|unknown|later|possibly)/i;

const COPY: Record<AuditUiLang, {
  criticalYesIssue: string; criticalYesRec: string;
  blankIssue: string; blankRec: string;
  invalidEmailIssue: string; invalidEmailRec: string;
  invalidPhoneIssue: string; invalidPhoneRec: string;
  vagueIssue: string; vagueRec: string;
  unwillingIssue: string; unwillingRec: string;
  okIssue: string; okRec: string;
  noQuestions: string;
}> = {
  en: {
    criticalYesIssue: 'A "Yes" answer here usually disqualifies the application.',
    criticalYesRec: 'Double-check this question carefully. If "Yes" was selected by mistake, correct it before submitting. Answer honestly.',
    blankIssue: 'This field appears to be required but was left blank.',
    blankRec: 'Fill in a clear, honest answer before submitting.',
    invalidEmailIssue: 'The email address looks invalid or mistyped.',
    invalidEmailRec: 'Use a professional email you check daily.',
    invalidPhoneIssue: 'The phone number looks incomplete or mistyped.',
    invalidPhoneRec: 'Enter your full number with country code.',
    vagueIssue: 'This answer looks incomplete or unclear.',
    vagueRec: 'Replace it with a specific, confident answer.',
    unwillingIssue: 'A "No" on a flexibility question can filter you out.',
    unwillingRec: 'If you can genuinely be flexible, correct it; otherwise be sure this is your real answer.',
    okIssue: 'Answer looks complete.',
    okRec: 'No action needed.',
    noQuestions: 'No questions with answers were detected. Paste the full review page text.',
  },
  ar: {
    criticalYesIssue: 'إجابة "نعم" هنا غالباً تستبعد الطلب.',
    criticalYesRec: 'راجع السؤال جيداً. لو اخترت "نعم" بالخطأ صححها قبل الإرسال، وأجب بصدق.',
    blankIssue: 'هذا الحقل يبدو مطلوباً لكنه فارغ.',
    blankRec: 'املأ إجابة واضحة وصادقة قبل الإرسال.',
    invalidEmailIssue: 'البريد الإلكتروني يبدو غير صحيح.',
    invalidEmailRec: 'استخدم بريداً مهنياً تتابعه يومياً.',
    invalidPhoneIssue: 'رقم الهاتف يبدو ناقصاً أو غير صحيح.',
    invalidPhoneRec: 'اكتب رقمك كاملاً بكود الدولة.',
    vagueIssue: 'هذه الإجابة تبدو ناقصة أو غير واضحة.',
    vagueRec: 'استبدلها بإجابة محددة وواثقة.',
    unwillingIssue: 'إجابة "لا" على سؤال مرونة قد تستبعدك.',
    unwillingRec: 'لو تقدر فعلاً تكون مرناً صححها، وإلا تأكد أنها إجابتك الحقيقية.',
    okIssue: 'الإجابة تبدو مكتملة.',
    okRec: 'لا حاجة لأي إجراء.',
    noQuestions: 'لم يتم العثور على أسئلة بإجابات. الصق نص صفحة المراجعة كاملاً.',
  },
};

interface ParsedItem {
  question: string;
  answer: string;
}

export function splitFormItems(formText: string): ParsedItem[] {
  const items: ParsedItem[] = [];
  const lines = formText.split(/\r?\n/);
  let current: ParsedItem | null = null;

  const pushCurrent = () => {
    if (current && current.question) items.push(current);
    current = null;
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;

    // Pattern: "1. Question? Answer: X" or "Question: X"
    const qaMatch = line.match(/^(?:\d+[.)]\s*)?(.+?)\s*(?:Answer|الإجابة)\s*:\s*(.+)$/i)
      || line.match(/^(?:\d+[.)]\s*)?(.+?[?:])\s+(.+)$/);
    const fieldMatch = line.match(/^(?:\d+[.)]\s*)?([A-Z][A-Za-z /()&-]{2,60}):\s*(.+)$/);

    if (qaMatch) {
      pushCurrent();
      current = { question: qaMatch[1].trim(), answer: qaMatch[2].trim() };
    } else if (fieldMatch && !/https?:\/\//.test(fieldMatch[1])) {
      pushCurrent();
      current = { question: fieldMatch[1].trim() + ':', answer: fieldMatch[2].trim() };
    } else if (current) {
      current.answer += ' ' + line;
    }
  }
  pushCurrent();
  return items;
}

function classify(item: ParsedItem, lang: AuditUiLang): AuditFinding {
  const c = COPY[lang];
  const q = item.question.trim();
  const a = item.answer.trim();
  const base = { id: '', fieldOrQuestion: q, detectedAnswer: a || '(blank)' };

  if (BLANK_ANSWER.test(a)) {
    if (DISQUALIFYING_QUESTION.test(q) || WILLINGNESS_QUESTION.test(q)) {
      return { ...base, severity: 'critical', issue: c.blankIssue, recommendation: c.blankRec };
    }
    return { ...base, severity: 'warning', issue: c.blankIssue, recommendation: c.blankRec };
  }
  if (DISQUALIFYING_QUESTION.test(q) && /^(yes|نعم|true)\b/i.test(a)) {
    return { ...base, severity: 'critical', issue: c.criticalYesIssue, recommendation: c.criticalYesRec };
  }
  if (WILLINGNESS_QUESTION.test(q) && /^(no|لا|false)\b/i.test(a)) {
    return { ...base, severity: 'warning', issue: c.unwillingIssue, recommendation: c.unwillingRec };
  }
  if (EMAIL_ANSWER.test(q) && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(a)) {
    return { ...base, severity: 'critical', issue: c.invalidEmailIssue, recommendation: c.invalidEmailRec };
  }
  if (PHONE_ANSWER.test(q) && (a.replace(/\D/g, '').length < 8)) {
    return { ...base, severity: 'critical', issue: c.invalidPhoneIssue, recommendation: c.invalidPhoneRec };
  }
  if (VAGUE_ANSWER.test(a)) {
    return { ...base, severity: 'warning', issue: c.vagueIssue, recommendation: c.vagueRec };
  }
  return { ...base, severity: 'ok', issue: c.okIssue, recommendation: c.okRec };
}

export function auditFormOffline(formText: string, lang: AuditUiLang = 'en'): AuditReport {
  const c = COPY[lang];
  const portal = PORTAL_HINTS.find((p) => p.pattern.test(formText))?.name;
  const items = splitFormItems(formText);
  const findings = items.map((item, i) => ({
    ...classify(item, lang),
    id: `finding-${i + 1}`,
  }));
  if (findings.length === 0) {
    findings.push({
      id: 'finding-1',
      severity: 'warning',
      fieldOrQuestion: 'Form text',
      detectedAnswer: '(blank)',
      issue: c.noQuestions,
      recommendation: c.blankRec,
    });
  }
  return buildAuditReport({ portalDetected: portal, findings });
}
