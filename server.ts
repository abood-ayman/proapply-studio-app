import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT || 3000);
const MODEL_NAME = 'gemini-2.5-flash';

function createGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured in the server environment.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

async function startServer() {
  const app = express();
  app.disable('x-powered-by');
  app.use((_req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Strict-Transport-Security', 'max-age=15552000');
    next();
  });
  app.use(express.json({ limit: '2mb' }));

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true });
  });

  // Free-tier Gemini terms do not allow personal or confidential inputs, and CVs are personal data.
  // AI routes stay off in the public build unless GEMINI_PUBLIC_ENABLED=1 is set on purpose.
  app.use('/api/ai', (_req, res, next) => {
    if (process.env.GEMINI_PUBLIC_ENABLED === '1') {
      next();
      return;
    }
    res.status(403).json({ error: 'AI features are turned off in this public build.' });
  });

  app.post('/api/ai/tailor-cv', async (req, res) => {
    try {
      const body = req.body as { jobAd?: string; profile?: unknown };
      const jobAd = typeof body.jobAd === 'string' ? body.jobAd.trim() : '';
      if (!jobAd) {
        res.status(400).json({ error: 'Job advertisement text is required.' });
        return;
      }
      if (!body.profile || typeof body.profile !== 'object') {
        res.status(400).json({ error: 'Candidate profile payload is required.' });
        return;
      }

      const ai = createGeminiClient();
      const prompt = [
        'You are an executive ATS resume writer and career strategist.',
        'Analyze the target job advertisement (which may be written in Arabic or English) and tailor the candidate profile strictly in crisp, corporate, ATS-optimized ENGLISH.',
        'Rules:',
        '1. Output MUST be 100% professional English regardless of the job ad language.',
        '2. Keep everything truthful to the candidate profile (do not fabricate companies, degrees, or dates).',
        '3. Keep the CV concise enough to fit comfortably on a single A4 page: summary max 3 sentences (<= 55 words), 8-10 high-signal core competencies, and 2-4 sharp action-verb bullet points per experience.',
        '4. Update targetRole to align naturally with the posted role and candidate background.',
        '',
        'Target Job Advertisement:',
        jobAd,
        '',
        'Candidate Base Profile JSON:',
        JSON.stringify(body.profile),
      ].join('\n');

      const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: prompt,
        config: {
          systemInstruction:
            'Always return valid JSON matching the requested schema. All text fields must be in sharp, ATS-friendly corporate English.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              targetRole: { type: Type.STRING },
              summary: { type: Type.STRING },
              coreCompetencies: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              experiences: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    role: { type: Type.STRING },
                    company: { type: Type.STRING },
                    location: { type: Type.STRING },
                    period: { type: Type.STRING },
                    bullets: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                    },
                  },
                  required: ['id', 'role', 'company', 'location', 'period', 'bullets'],
                },
              },
            },
            required: ['targetRole', 'summary', 'coreCompetencies', 'experiences'],
          },
        },
      });

      const rawText = (response.text ?? '').trim();
      if (!rawText) {
        res.status(502).json({ error: 'Empty response received from Gemini API.' });
        return;
      }

      const tailored = JSON.parse(rawText);
      res.json({ tailored });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to tailor CV with Gemini API.';
      const status = message.includes('GEMINI_API_KEY') ? 503 : 500;
      res.status(status).json({ error: message });
    }
  });

  app.post('/api/ai/cover-letter', async (req, res) => {
    try {
      const body = req.body as { jobAd?: string; profile?: unknown; companyName?: string };
      const jobAd = typeof body.jobAd === 'string' ? body.jobAd.trim() : '';
      if (!jobAd) {
        res.status(400).json({ error: 'Target job description is required.' });
        return;
      }
      if (!body.profile || typeof body.profile !== 'object') {
        res.status(400).json({ error: 'Candidate profile payload is required.' });
        return;
      }

      const ai = createGeminiClient();
      const companyHint =
        typeof body.companyName === 'string' && body.companyName.trim()
          ? `Target Organization: ${body.companyName.trim()}`
          : '';

      const prompt = [
        'You are an executive career writer. Draft a concise, persuasive, ATS-friendly cover letter in polished corporate ENGLISH tailored to the job description and candidate profile below.',
        'Rules:',
        '1. Output MUST be strictly in professional English.',
        '2. Keep it concise (220-290 words, 3-4 crisp paragraphs) so it fits neatly on 1 A4 page.',
        '3. Ground every claim truthfully in the candidate profile (no invented metrics or employers).',
        companyHint,
        '',
        'Target Job Description:',
        jobAd,
        '',
        'Candidate Profile JSON:',
        JSON.stringify(body.profile),
      ]
        .filter(Boolean)
        .join('\n');

      const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: prompt,
        config: {
          systemInstruction:
            'Always return valid JSON matching the requested schema with a concise, high-impact corporate English cover letter.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              subjectLine: { type: Type.STRING },
              letterBody: { type: Type.STRING },
            },
            required: ['subjectLine', 'letterBody'],
          },
        },
      });

      const rawText = (response.text ?? '').trim();
      if (!rawText) {
        res.status(502).json({ error: 'Empty response received from Gemini API.' });
        return;
      }

      const coverLetter = JSON.parse(rawText);
      res.json({ coverLetter });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to generate cover letter with Gemini API.';
      const status = message.includes('GEMINI_API_KEY') ? 503 : 500;
      res.status(status).json({ error: message });
    }
  });

  app.post('/api/ai/audit-form', async (req, res) => {
    try {
      const body = req.body as { formText?: string; uiLang?: string };
      const formText = typeof body.formText === 'string' ? body.formText.trim() : '';
      if (!formText) {
        res.status(400).json({ error: 'Application form review text is required.' });
        return;
      }

      const ai = createGeminiClient();
      const uiLang = body.uiLang === 'ar' ? 'Arabic' : 'English';
      const prompt = [
        'You are a meticulous job application compliance auditor reviewing a candidate final review page from a job portal (UN/FAO, Oracle Taleo, Workday, Google Forms, etc.).',
        'Inspect EVERY question, field, and answer in the pasted text for critical mistakes, accidental "Yes" to disqualifying disclosures (criminal convictions, disciplinary dismissal, conflict of interest), blank required fields (such as short-term employment willingness, availability, or contact info), or formatting/consistency errors.',
        `Write the issue and recommendation descriptions clearly in ${uiLang}, while quoting the original fieldOrQuestion and detectedAnswer accurately.`,
        'Classify each checked item strictly into one of:',
        '- "critical" (Red): Disqualifying answers, blank mandatory disclosures, or invalid contact details.',
        '- "warning" (Yellow): Incomplete details, ambiguous phrasing, or items needing double-checking.',
        '- "ok" (Green): Verified, complete, and safe answers.',
        '',
        'Application Form Review Text:',
        formText,
      ].join('\n');

      const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: prompt,
        config: {
          systemInstruction:
            'Always return valid JSON matching the schema. Scan every field exhaustively and do not miss disqualifying Yes/No mistakes or blank questions.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              portalDetected: { type: Type.STRING },
              overallRisk: { type: Type.STRING },
              findings: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    severity: { type: Type.STRING },
                    fieldOrQuestion: { type: Type.STRING },
                    detectedAnswer: { type: Type.STRING },
                    issue: { type: Type.STRING },
                    recommendation: { type: Type.STRING },
                  },
                  required: [
                    'id',
                    'severity',
                    'fieldOrQuestion',
                    'detectedAnswer',
                    'issue',
                    'recommendation',
                  ],
                },
              },
            },
            required: ['portalDetected', 'overallRisk', 'findings'],
          },
        },
      });

      const rawText = (response.text ?? '').trim();
      if (!rawText) {
        res.status(502).json({ error: 'Empty response received from Gemini API.' });
        return;
      }

      const report = JSON.parse(rawText);
      res.json({ report });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to audit form with Gemini API.';
      const status = message.includes('GEMINI_API_KEY') ? 503 : 500;
      res.status(status).json({ error: message });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: false },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get('*', (_req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });
    }
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ProApply Studio server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Server failed to start:', err);
  process.exit(1);
});
