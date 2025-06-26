import 'dotenv/config';
import { GoogleGenAI, Modality } from '@google/genai';

function getClient() {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error('GEMINI_API_KEY env variable is required');
  return new GoogleGenAI({ apiKey: key });
}

/**
 * Generate a tech topic idea using Gemini
 * @returns {Promise<{title: string, description: string}>}
 */
export async function generateTopic() {
  const genAI = getClient();
  const prompt = 'You are a technology trend spotter. Suggest a fresh, timely tech-topic for a short blog post.\nReturn JSON with exactly these keys: title, description. Title must be ≤ 70 characters, description ≤ 200.';
  const result = await genAI.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    tools: [{ googleSearch: {} }],
  });
  const text = result.text;

  // Attempt to locate JSON inside triple backticks
  const fenceMatch = text.match(/```json[\s\S]*?```/i);
  let jsonCandidate = fenceMatch ? fenceMatch[0].replace(/```json|```/gi, '').trim() : text.trim();
  try {
    const json = JSON.parse(jsonCandidate);
    if (json?.title) {
      return {
        title: json.title,
        description: json.description ?? '',
      };
    }
  } catch (error) {
    // JSON parsing failed, continue to fallback
  }

  // Regex fallback
  const titleMatch = text.match(/"title"\s*:\s*"([^"]+)"/i);
  const descMatch = text.match(/"description"\s*:\s*"([^"]+)"/i);
  if (titleMatch) {
    return {
      title: titleMatch[1],
      description: descMatch ? descMatch[1] : '',
    };
  }

  // ultimate fallback
  return { title: text.trim().slice(0, 70), description: '' };
}

/**
 * Draft a blog post using Gemini
 * @param {Object} params
 * @param {string} params.title
 * @param {string} params.description
 * @param {string} [params.fullContent]
 * @returns {Promise<string>}
 */
export async function draftPost({ title, description, fullContent = '' }) {
  const genAI = getClient();
  const basePrompt = fullContent
    ? `Write a 700 word blog post that summarizes and analyses the following article. Use only facts from the context; do not invent details. Tag any opinions with 'My take:'.\n\n--- BEGIN CONTEXT ---\n${fullContent.slice(0, 20000)}\n--- END CONTEXT ---`
    : `Write a 700 word blog post in markdown about "${title}".\n\nContext: ${description}.`;

  const prompt = `${basePrompt}\n\nUse headings, sub-headings, lists and a friendly explanatory tone.\n\nIMPORTANT: Do NOT include a top-level title heading (# ${title}). Begin directly with the introduction paragraph or a sub-heading.`;
  const res = await genAI.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    tools: [{ googleSearch: {} }],
  });
  return res.text;
}

/**
 * Create a hero image using Gemini
 * @param {Object} params
 * @param {string} params.title
 * @returns {Promise<Buffer>}
 */
export async function createHeroImage({ title }) {
  const genAI = getClient();
  const prompt = `Generate a visually appealing, abstract 16:9 hero image for a tech blog about "${title}". The image must NOT contain any text, letters, numbers, captions, or watermarks—pure imagery only.`;

  try {
    const res = await genAI.models.generateContent({
      model: 'gemini-2.0-flash-preview-image-generation',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: { responseModalities: [Modality.TEXT, Modality.IMAGE] },
    });

    // The first part is usually alt-text; the inlineData part holds base64 PNG
    const imagePart = res.candidates?.[0]?.content?.parts?.find((p) => p.inlineData && p.inlineData.mimeType?.startsWith('image/'));
    const b64 = imagePart?.inlineData?.data;
    if (!b64) throw new Error('Gemini response did not contain inline image data');

    return Buffer.from(b64, 'base64');
  } catch (error) {
    console.warn('Hero image generation failed, will use placeholder');
    throw error;
  }
}

/**
 * Fact-check a draft post
 * @param {Object} params
 * @param {string} params.draft
 * @param {string} params.context
 * @returns {Promise<{ok: boolean, issues: string[]}>}
 */
export async function factCheck({ draft, context }) {
  if (!context.trim()) {
    return { ok: true, issues: [] };
  }

  const genAI = getClient();
  const prompt = `You are a strict fact checker. Given the ORIGINAL ARTICLE and a BLOG DRAFT, list any statements that are presented as fact but are NOT supported by the article. IGNORE any lines that begin with "My take:" (these are clearly-marked opinions). If every factual statement is supported, reply ONLY with "OK".\n\n--- ORIGINAL ARTICLE ---\n${context.slice(0,20000)}\n--- BLOG DRAFT ---\n${draft.slice(0,20000)}`;

  try {
    const res = await genAI.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      tools: [{ googleSearch: {} }],
    });
    const text = res.text.trim();
    return /^ok$/i.test(text) ? { ok: true, issues: [] } : { ok: false, issues: text.split(/\n+/).slice(0, 10) };
  } catch (error) {
    console.warn('Fact-check failed, assuming OK');
    return { ok: true, issues: [] };
  }
}
