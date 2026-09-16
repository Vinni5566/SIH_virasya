
'use server';
/**
 * @fileOverview A Genkit flow for generating social media promotional content.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const MarketingInputSchema = z.object({
  productName: z.string(),
  craftType: z.string(),
  region: z.string(),
  description: z.string(),
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
  prompt: `Generate promotional social media content for this artisan product. 

Product: {{{productName}}}
Craft: {{{craftType}}}
Region: {{{region}}}
Description: {{{description}}}

Requirements:
- Instagram caption: Max 60 words.
- WhatsApp message: Around 100 words, written as a warm and complete product introduction that encourages people to view or buy the product.
- Hashtags: 8-10 relevant tags.
- Promo Line: A short, punchy one-liner.

Tone: Warm, authentic, premium.`,
});

const marketingGeneratorFlow = ai.defineFlow(
  {
    name: 'marketingGeneratorFlow',
    inputSchema: MarketingInputSchema,
    outputSchema: MarketingOutputSchema,
  },
  async input => {
    try {
      const { output } = await marketingPrompt(input);
      if (output) return output;
    } catch (err: any) {
      console.warn('Marketing AI prompt failed, using template fallback:', err?.message || err);
    }
    // Template fallback — never crashes, always returns valid marketing content
    const craft = input.craftType || 'handcraft';
    const region = input.region || 'India';
    const name = input.productName || 'Artisan Piece';
    const regionSlug = region.split(',')[0].trim().replace(/\s+/g, '');
    const craftSlug = craft.replace(/\s+/g, '');
    return {
      instagram: `✨ Meet *${name}* — a stunning ${craft} from ${region}! 🇮🇳 Every stitch, every curve carries centuries of heritage. Now available on Virasya. Shop authentic India. 🛍️`,
      whatsapp: `🎨 *Introducing: ${name}*\n\nThis exquisite piece of ${craft} from ${region} is a living tribute to India's rich artisan heritage. Crafted by master artisans using time-honoured techniques passed down through generations, each piece is one-of-a-kind.\n\n✅ 100% Authentic & Handmade\n✅ Directly from the artisan\n✅ Fair-trade pricing\n\n🛍️ Explore & purchase on *Virasya* — India's trusted platform for authentic handcrafted art.\n\n📦 Fast delivery | 🔒 Secure payment`,
      hashtags: [
        '#HandmadeInIndia',
        '#IndianCraft',
        '#Virasya',
        '#ArtisanMade',
        '#HeritageArt',
        `#${craftSlug}`,
        `#${regionSlug}Craft`,
        '#SupportArtisans',
        '#EthicalLiving',
        '#AuthenticIndia',
      ],
      promoLine: `Own a piece of India's living heritage — ${name}.`,
    };
  }
);
