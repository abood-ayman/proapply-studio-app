import type { CoverLetterResult, CvProfile } from '../types';

export interface TemplateCoverLetterOptions {
  companyName: string;
  jobTitle: string;
}

function clean(value: string): string {
  return value.trim().replace(/\s+/g, ' ');
}

function topSkills(profile: CvProfile, count: number): string[] {
  return profile.coreCompetencies.map(clean).filter(Boolean).slice(0, count);
}

/**
 * Builds a cover letter from the user's own profile data only.
 * Nothing is invented: every sentence is composed from fields the user
 * already entered in the CV Builder tab. The result stays editable.
 */
export function buildTemplateCoverLetter(
  profile: CvProfile,
  options: TemplateCoverLetterOptions
): CoverLetterResult {
  const name = clean(profile.fullName);
  const jobTitle = clean(options.jobTitle) || clean(profile.targetRole) || 'the advertised role';
  const company = clean(options.companyName);
  const target = company ? `${jobTitle} at ${company}` : jobTitle;

  const skills = topSkills(profile, 3);
  const latest = profile.experiences.find(
    (exp) => clean(exp.role) || clean(exp.company)
  );
  const degree = clean(profile.education.degree);
  const institution = clean(profile.education.institution);

  const paragraphs: string[] = [];

  paragraphs.push(
    company
      ? `Dear Hiring Team at ${company},`
      : 'Dear Hiring Team,'
  );

  paragraphs.push(
    `I am writing to apply for ${target}.` +
      (clean(profile.summary) ? ` ${clean(profile.summary)}` : '')
  );

  const evidence: string[] = [];
  if (latest) {
    const role = clean(latest.role);
    const org = clean(latest.company);
    const period = clean(latest.period);
    const orgHasPeriod = period && (role.includes(period) || org.includes(period));
    let line = '';
    if (role && org) {
      line = `In my role as ${role} at ${org}`;
    } else if (role) {
      line = `In my role as ${role}`;
    }
    if (line && period && !orgHasPeriod) line += ` (${period})`;
    const bullets = latest.bullets.map(clean).filter(Boolean).slice(0, 2);
    if (line && bullets.length > 0) {
      line += `, I ${bullets.join('; and ')}`;
    }
    if (line) evidence.push(/[.!?]$/.test(line) ? line : line + '.');
  }
  if (skills.length > 0) {
    evidence.push(`My core skills include ${skills.join(', ')}.`);
  }
  if (degree || institution) {
    evidence.push(
      degree && institution
        ? `I am currently studying ${degree} at ${institution}.`
        : `My education: ${degree || institution}.`
    );
  }
  if (evidence.length > 0) paragraphs.push(evidence.join(' '));

  paragraphs.push(
    `I would welcome the chance to discuss how I can contribute to your team. Thank you for your time and consideration.`
  );

  paragraphs.push(`Sincerely,\n${name || 'Your Name'}`);

  return {
    subjectLine: company ? `Application for ${jobTitle} – ${company}` : `Application for ${jobTitle}`,
    letterBody: paragraphs.join('\n\n'),
    generatedAt: new Date().toISOString(),
  };
}

export function isProfileEmpty(profile: CvProfile): boolean {
  return (
    !clean(profile.fullName) &&
    !clean(profile.summary) &&
    profile.coreCompetencies.every((s) => !clean(s)) &&
    profile.experiences.every((e) => !clean(e.role) && !clean(e.company))
  );
}
