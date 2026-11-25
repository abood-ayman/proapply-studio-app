import type { CvProfile, CvScaleMetrics, ExperienceItem } from '../types';

export const PROFILE_STORAGE_KEY = 'proapply_profile_v1';
export const VAULT_STORAGE_KEY = 'proapply_vault_v1';

export const EMPTY_PROFILE: CvProfile = {
  fullName: '',
  targetRole: '',
  location: '',
  phone: '',
  email: '',
  linkedin: '',
  summary: '',
  coreCompetencies: [],
  experiences: [],
  education: {
    id: 'edu-1',
    degree: '',
    institution: '',
    expectedGraduation: '',
  },
  certificates: [],
};

export const DEFAULT_PROFILE: CvProfile = {
  fullName: 'Sample Candidate',
  targetRole: 'Sample Target Role',
  location: 'City, Country',
  phone: '+00 000 000 0000',
  email: 'name@example.com',
  linkedin: 'https://www.linkedin.com/in/example',
  summary: 'Sample summary. Replace with your own details.',
  coreCompetencies: ['Sample skill one', 'Sample skill two'],
  experiences: [
    {
      id: 'exp-sample',
      role: 'Sample Role',
      company: 'Sample Organization',
      location: 'City, Country',
      period: 'Period',
      bullets: [],
    },
  ],
  education: {
    id: 'edu-sample',
    degree: 'Sample Degree',
    institution: 'Sample Institute',
    expectedGraduation: 'Year',
  },
  certificates: ['Sample certificate'],
};

export function cloneProfile(profile: CvProfile): CvProfile {
  return {
    ...profile,
    coreCompetencies: [...profile.coreCompetencies],
    experiences: profile.experiences.map((exp) => ({
      ...exp,
      bullets: [...exp.bullets],
    })),
    education: { ...profile.education },
    certificates: [...profile.certificates],
  };
}

export function loadSavedProfile(): CvProfile {
  if (typeof window === 'undefined') {
    return cloneProfile(EMPTY_PROFILE);
  }
  try {
    const raw = window.localStorage.getItem(PROFILE_STORAGE_KEY);
    if (!raw) return cloneProfile(EMPTY_PROFILE);
    const parsed = JSON.parse(raw) as Partial<CvProfile>;
    return mergeProfile(EMPTY_PROFILE, parsed, true);
  } catch {
    return cloneProfile(EMPTY_PROFILE);
  }
}

export function mergeProfile(
  base: CvProfile,
  incoming: Partial<CvProfile>,
  allowEmpty = false
): CvProfile {
  const pickStr = (inc: unknown, fallback: string): string => {
    if (typeof inc !== 'string') return fallback;
    if (allowEmpty) return inc;
    return inc.trim() ? inc : fallback;
  };

  return {
    fullName: pickStr(incoming.fullName, base.fullName),
    targetRole: pickStr(incoming.targetRole, base.targetRole),
    location: pickStr(incoming.location, base.location),
    phone: pickStr(incoming.phone, base.phone),
    email: pickStr(incoming.email, base.email),
    linkedin: typeof incoming.linkedin === 'string' ? incoming.linkedin : base.linkedin,
    summary: pickStr(incoming.summary, base.summary),
    coreCompetencies: Array.isArray(incoming.coreCompetencies)
      ? incoming.coreCompetencies.filter((s): s is string => typeof s === 'string' && s.trim().length > 0)
      : [...base.coreCompetencies],
    experiences: Array.isArray(incoming.experiences)
      ? allowEmpty || incoming.experiences.length > 0
        ? incoming.experiences.map((exp, idx) => ({
            id: typeof exp.id === 'string' && exp.id ? exp.id : `exp-${idx + 1}`,
            role: typeof exp.role === 'string' ? exp.role : '',
            company: typeof exp.company === 'string' ? exp.company : '',
            location: typeof exp.location === 'string' ? exp.location : '',
            period: typeof exp.period === 'string' ? exp.period : '',
            bullets: Array.isArray(exp.bullets)
              ? exp.bullets.filter((b): b is string => typeof b === 'string' && b.trim().length > 0)
              : [],
          }))
        : base.experiences.map((e) => ({ ...e, bullets: [...e.bullets] }))
      : base.experiences.map((e) => ({ ...e, bullets: [...e.bullets] })),
    education:
      incoming.education && typeof incoming.education === 'object'
        ? {
            id: incoming.education.id || base.education.id,
            degree: typeof incoming.education.degree === 'string' ? incoming.education.degree : base.education.degree,
            institution:
              typeof incoming.education.institution === 'string'
                ? incoming.education.institution
                : base.education.institution,
            expectedGraduation:
              typeof incoming.education.expectedGraduation === 'string'
                ? incoming.education.expectedGraduation
                : base.education.expectedGraduation,
          }
        : { ...base.education },
    certificates: Array.isArray(incoming.certificates)
      ? incoming.certificates.filter((c): c is string => typeof c === 'string' && c.trim().length > 0)
      : [...base.certificates],
  };
}

/**
 * Applies an AI-tailored profile onto the base profile without letting the
 * model change facts. Only wording (summary, competencies, bullets, target role)
 * is taken from the AI. Company, role, location and period of each experience
 * stay as the user wrote them; experiences the AI invented (unknown id) are
 * dropped, and experiences the AI omitted are kept unchanged.
 */
export function applyTailoredProfile(base: CvProfile, tailored: Partial<CvProfile>): CvProfile {
  const merged = mergeProfile(base, {
    targetRole: tailored.targetRole,
    summary: tailored.summary,
    coreCompetencies: tailored.coreCompetencies,
  });
  const byId = new Map<string, ExperienceItem>();
  if (Array.isArray(tailored.experiences)) {
    for (const exp of tailored.experiences) {
      if (exp && typeof exp.id === 'string') byId.set(exp.id, exp);
    }
  }
  merged.experiences = base.experiences.map((original) => {
    const ai = byId.get(original.id);
    const bullets = Array.isArray(ai?.bullets)
      ? ai!.bullets.filter((b): b is string => typeof b === 'string' && b.trim().length > 0)
      : [];
    return { ...original, bullets: bullets.length > 0 ? bullets : [...original.bullets] };
  });
  return merged;
}

export function buildCvFilename(fullName: string): string {
  const cleaned = fullName
    .trim()
    .replace(/[^a-zA-Z0-9\s-]/g, '')
    .replace(/[\s-]+/g, '_')
    .replace(/^_+|_+$/g, '');
  const namePart = cleaned || 'Candidate';
  return `${namePart}_English_CV.pdf`;
}

export function buildCoverLetterFilename(fullName: string): string {
  const cleaned = fullName
    .trim()
    .replace(/[^a-zA-Z0-9\s-]/g, '')
    .replace(/[\s-]+/g, '_')
    .replace(/^_+|_+$/g, '');
  const namePart = cleaned || 'Candidate';
  return `${namePart}_Cover_Letter.pdf`;
}

/**
 * Estimates total rendered vertical height on an A4 page (210mm x 297mm)
 * and computes deterministic auto-scaling typography/margins so the CV strictly
 * fits onto 1 single A4 page.
 */
export function calculateCvScaleMetrics(profile: CvProfile): CvScaleMetrics {
  const A4_HEIGHT_MM = 297;
  const A4_WIDTH_MM = 210;

  const estimateHeightAtScale = (
    scale: number,
    marginMm: number,
    sectionGapMm: number,
    itemGapMm: number,
    lineHeight: number
  ): number => {
    const contentWidthMm = A4_WIDTH_MM - marginMm * 2;
    const bodyPt = 9.8 * scale;
    const metaPt = 8.6 * scale;
    const sectionHeadingPt = 10.6 * scale;
    const namePt = 19.5 * scale;
    const rolePt = 11.2 * scale;

    const ptToMm = 0.352778;
    const avgCharWidthMm = bodyPt * ptToMm * 0.48;
    const charsPerLine = Math.max(42, Math.floor(contentWidthMm / avgCharWidthMm));

    const wrapLines = (text: string, factor = 1): number => {
      if (!text.trim()) return 0;
      return Math.max(1, Math.ceil(text.trim().length / (charsPerLine * factor)));
    };

    const bodyLineMm = bodyPt * ptToMm * lineHeight;
    const metaLineMm = metaPt * ptToMm * 1.25;
    const headingMm = sectionHeadingPt * ptToMm * 1.35 + 2.2;

    let total =
      namePt * ptToMm * 1.15 +
      rolePt * ptToMm * 1.25 +
      metaLineMm * 1.8 +
      4.5;

    if (profile.summary.trim()) {
      total += headingMm + wrapLines(profile.summary) * bodyLineMm + sectionGapMm;
    }

    if (profile.coreCompetencies.length > 0) {
      const skillsText = profile.coreCompetencies.join('  •  ');
      total += headingMm + wrapLines(skillsText, 0.96) * bodyLineMm + sectionGapMm;
    }

    if (profile.experiences.length > 0) {
      total += headingMm;
      for (const exp of profile.experiences) {
        total += bodyLineMm * 1.15 + metaLineMm + 0.8;
        for (const bullet of exp.bullets) {
          total += wrapLines(bullet, 0.92) * bodyLineMm + 0.7;
        }
        total += itemGapMm;
      }
      total += sectionGapMm;
    }

    if (profile.education.degree.trim()) {
      total += headingMm + bodyLineMm * 2.1 + sectionGapMm;
    }

    if (profile.certificates.length > 0) {
      total += headingMm;
      const certRows =
        profile.certificates.length >= 4
          ? Math.ceil(profile.certificates.length / 2)
          : profile.certificates.length;
      total += certRows * (metaLineMm * 1.35 + 0.6);
    }

    return total + marginMm * 2;
  };

  const presets: Array<{
    tier: CvScaleMetrics['densityTier'];
    fontScale: number;
    marginMm: number;
    sectionGapMm: number;
    itemGapMm: number;
    lineHeight: number;
  }> = [
    { tier: 'relaxed', fontScale: 1.0, marginMm: 14, sectionGapMm: 4.5, itemGapMm: 3.0, lineHeight: 1.38 },
    { tier: 'balanced', fontScale: 0.94, marginMm: 12.5, sectionGapMm: 3.6, itemGapMm: 2.3, lineHeight: 1.32 },
    { tier: 'compact', fontScale: 0.87, marginMm: 11, sectionGapMm: 2.8, itemGapMm: 1.8, lineHeight: 1.26 },
    { tier: 'ultra-compact', fontScale: 0.8, marginMm: 9.5, sectionGapMm: 2.2, itemGapMm: 1.4, lineHeight: 1.2 },
  ];

  for (const preset of presets) {
    const used = estimateHeightAtScale(
      preset.fontScale,
      preset.marginMm,
      preset.sectionGapMm,
      preset.itemGapMm,
      preset.lineHeight
    );
    if (used <= A4_HEIGHT_MM - 4 || preset.tier === 'ultra-compact') {
      const overflowRatio = used > A4_HEIGHT_MM - 4 ? (A4_HEIGHT_MM - 6) / used : 1;
      const finalScale = Number((preset.fontScale * overflowRatio).toFixed(3));
      const finalUsed = Math.min(A4_HEIGHT_MM - 2, Number((used * overflowRatio).toFixed(1)));
      return {
        densityTier: preset.tier,
        fontScale: finalScale,
        namePt: Number((19.5 * finalScale).toFixed(1)),
        rolePt: Number((11.2 * finalScale).toFixed(1)),
        sectionHeadingPt: Number((10.6 * finalScale).toFixed(1)),
        bodyPt: Number((9.8 * finalScale).toFixed(1)),
        metaPt: Number((8.6 * finalScale).toFixed(1)),
        lineHeight: preset.lineHeight,
        marginMm: preset.marginMm,
        sectionGapMm: Number((preset.sectionGapMm * overflowRatio).toFixed(2)),
        itemGapMm: Number((preset.itemGapMm * overflowRatio).toFixed(2)),
        estimatedUsedHeightMm: finalUsed,
        fitsSinglePage: finalUsed <= A4_HEIGHT_MM,
      };
    }
  }

  return {
    densityTier: 'balanced',
    fontScale: 0.94,
    namePt: 18.3,
    rolePt: 10.5,
    sectionHeadingPt: 10,
    bodyPt: 9.2,
    metaPt: 8.1,
    lineHeight: 1.32,
    marginMm: 12.5,
    sectionGapMm: 3.6,
    itemGapMm: 2.3,
    estimatedUsedHeightMm: 265,
    fitsSinglePage: true,
  };
}
