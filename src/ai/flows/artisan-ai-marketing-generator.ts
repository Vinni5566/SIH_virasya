
'use server';
/**
 * @fileOverview A Genkit flow for generating social media promotional content.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { translateMarketingContent } from './translate-content-flow';

const MarketingInputSchema = z.object({
  productName: z.string(),
  craftType: z.string(),
  region: z.string(),
  description: z.string(),
  targetLanguage: z.string().optional(),
});

const MarketingOutputSchema = z.object({
  instagram: z.string().describe('Max 60 words.'),
  whatsapp: z.string().describe('Around 100 words.'),
  hashtags: z.array(z.string()).describe('8-10 tags.'),
  promoLine: z.string().describe('A catchy short line.'),
});

export async function generateMarketingContent(input: z.infer<typeof MarketingInputSchema>) {
  return marketingGeneratorFlow(input);
}

const marketingPrompt = ai.definePrompt({
  name: 'marketingPrompt',
  input: {schema: MarketingInputSchema},
  output: {schema: MarketingOutputSchema},
  prompt: `Generate promotional social media content for this authentic Indian handicraft product. 

Product: {{{productName}}}
Craft: {{{craftType}}}
Region: {{{region}}}
Description: {{{description}}}
{{#if targetLanguage}}Target Language: {{{targetLanguage}}}{{/if}}

Requirements:
{{#if targetLanguage}}
- CRITICAL LANGUAGE INSTRUCTION: Write all marketing copy (Instagram caption, WhatsApp message, and Promo line) strictly in {{{targetLanguage}}}.
{{else}}
- Write all marketing copy in English.
{{/if}}
- Instagram caption: Max 60 words.
- WhatsApp message: Around 100 words, written as a warm and complete product introduction that encourages people to view or buy the product.
- Hashtags: 8-10 relevant tags (can include craft and region names).
- Promo Line: A short, punchy one-liner.

Tone: Warm, authentic, premium, heritage-focused.`,
});

/**
 * Detects Indian regional script from text if targetLanguage wasn't explicitly supplied.
 * Ensures that Hindi/Marathi/Tamil/Bengali products generate 100% in their native language
 * instead of returning half-English, half-regional output.
 */
function detectLanguageFromText(text?: string): string | null {
  if (!text) return null;
  if (/[\u0B80-\u0BFF]/.test(text)) return 'Tamil';
  if (/[\u0980-\u09FF]/.test(text)) return 'Bengali';
  if (/[\u0A80-\u0AFF]/.test(text)) return 'Gujarati';
  if (/[\u0C00-\u0C7F]/.test(text)) return 'Telugu';
  if (/[\u0C80-\u0CFF]/.test(text)) return 'Kannada';
  if (/[\u0D00-\u0D7F]/.test(text)) return 'Malayalam';
  if (/[\u0A00-\u0A7F]/.test(text)) return 'Punjabi';
  if (/[\u0900-\u097F]/.test(text)) return 'Hindi';
  return null;
}

const marketingGeneratorFlow = ai.defineFlow(
  {
    name: 'marketingGeneratorFlow',
    inputSchema: MarketingInputSchema,
    outputSchema: MarketingOutputSchema,
  },
  async input => {
    // Automatically detect language from product text if not explicitly provided
    const detectedLang = detectLanguageFromText(`${input.productName} ${input.description} ${input.region}`);
    const targetLang = input.targetLanguage || detectedLang || 'English';
    const effectiveInput = { ...input, targetLanguage: targetLang };

    // 1. Try Genkit AI prompt if API key is configured
    if (process.env.GEMINI_API_KEY && !process.env.GEMINI_API_KEY.startsWith('AQ.')) {
      try {
        const { output } = await marketingPrompt(effectiveInput);
        if (output && output.instagram && output.whatsapp) {
          return output;
        }
      } catch (err: any) {
        console.warn('Marketing AI prompt failed, using zero-failure fallback:', err?.message || err);
      }
    }

    // 2. Base Template fallback
    const rawCraft = (input.craftType || '').trim();
    const craft = (rawCraft && rawCraft.toLowerCase() !== 'other') ? rawCraft : 'traditional handcraft';
    const region = input.region || 'India';
    const name = input.productName || 'Artisan Piece';
    const regionSlug = region.split(',')[0].trim().replace(/[\s/]+/g, '');
    const craftSlug = craft.replace(/[\s/]+/g, '');

    const baseContent = {
      instagram: `✨ Meet *${name}* — a stunning ${craft} from ${region}! 🇮🇳 Every stitch, every curve carries centuries of heritage. Now available on Virasya. Shop authentic India. 🛍️`,
      whatsapp: `🎨 *Introducing: ${name}*\n\nThis exquisite piece of ${craft} from ${region} is a living tribute to India's rich artisan heritage. Crafted by master artisans using time-honoured techniques passed down through generations, each piece is one-of-a-kind.\n\n✅ 100% Authentic & Handmade\n✅ Directly from the artisan\n✅ Fair-trade pricing\n\n🛍️ Explore & purchase on *Virasya* — India's trusted platform for authentic handcrafted art.\n\n📦 Fast delivery | 🔒 Secure payment`,
      hashtags: [
        '#HandmadeInIndia',
        '#IndianCraft',
        '#Virasya',
        '#ArtisanMade',
        '#HeritageArt',
        craftSlug && craftSlug.toLowerCase() !== 'traditionalhandcraft' ? `#${craftSlug}` : '#HeritageCraft',
        `#${regionSlug}Craft`,
        '#SupportArtisans',
        '#EthicalLiving',
        '#AuthenticIndia',
      ].filter(Boolean),
      promoLine: `Own a piece of India's living heritage — ${name}.`,
    };

    // If target language is English, return directly
    if (targetLang === 'English') {
      return baseContent;
    }

    // 3. For any regional language, translate the fallback using our zero-failure neural translator
    try {
      const translated = await translateMarketingContent(baseContent, targetLang);
      return translated;
    } catch (err) {
      console.warn('Neural translation of marketing fallback failed, returning base:', err);
      return baseContent;
    }
  }
);
