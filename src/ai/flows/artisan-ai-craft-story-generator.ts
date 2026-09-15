'use server';
/**
 * @fileOverview A Genkit flow for generating culturally authentic craft stories based on structured artisan input.
 *
 * - artisanAiCraftStoryGenerator - A function that generates a narrative story about a craft.
 * - ArtisanAiCraftStoryGeneratorInput - The input type for the artisanAiCraftStoryGenerator function.
 * - ArtisanAiCraftStoryGeneratorOutput - The return type for the artisanAiCraftStoryGenerator function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ArtisanAiCraftStoryGeneratorInputSchema = z.object({
  productName: z
    .string()
    .describe('The name of the product for which the story is being generated.'),
  region: z
    .string()
    .describe('The geographical region where the craft originates or is practiced.'),
  craftTradition: z
    .string()
    .describe('The historical or cultural tradition associated with this craft.'),
  materials: z
    .string()
    .describe('The primary materials used in crafting the product.'),
  yearsOfExperience: z
    .number()
    .describe('The number of years the artisan has practiced this craft.'),
  specialTechnique: z
    .string()
    .describe('Any unique or special techniques used in creating the product.'),
});
export type ArtisanAiCraftStoryGeneratorInput = z.infer<
  typeof ArtisanAiCraftStoryGeneratorInputSchema
>;

const ArtisanAiCraftStoryGeneratorOutputSchema = z.object({
  story: z
    .string()
    .describe('A culturally authentic narrative story about the craft and product.'),
});
export type ArtisanAiCraftStoryGeneratorOutput = z.infer<
  typeof ArtisanAiCraftStoryGeneratorOutputSchema
>;

export async function artisanAiCraftStoryGenerator(
  input: ArtisanAiCraftStoryGeneratorInput
): Promise<ArtisanAiCraftStoryGeneratorOutput> {
  return artisanAiCraftStoryGeneratorFlow(input);
}

const artisanCraftStoryPrompt = ai.definePrompt({
  name: 'artisanCraftStoryPrompt',
  input: {schema: ArtisanAiCraftStoryGeneratorInputSchema},
  output: {schema: ArtisanAiCraftStoryGeneratorOutputSchema},
  prompt: `You are a skilled storyteller specializing in authentic craft narratives. Your task is to generate a culturally rich and engaging story about a handcrafted product, based *solely* on the provided facts. Do NOT invent any details or information not explicitly given. The story should highlight the heritage and uniqueness of the product.

Product Name: {{{productName}}}

Facts about the craft:
Region: {{{region}}}
Craft Tradition: {{{craftTradition}}}
Materials: {{{materials}}}
Years of Artisan Experience: {{{yearsOfExperience}}}
Special Technique: {{{specialTechnique}}}

Please craft a narrative story that captivates potential buyers and conveys the product's cultural significance and the artisan's dedication.`,
});

const artisanAiCraftStoryGeneratorFlow = ai.defineFlow(
  {
    name: 'artisanAiCraftStoryGeneratorFlow',
    inputSchema: ArtisanAiCraftStoryGeneratorInputSchema,
    outputSchema: ArtisanAiCraftStoryGeneratorOutputSchema,
  },
  async input => {
    try {
      const {output} = await artisanCraftStoryPrompt(input);
      if (output) return output;
    } catch (err: any) {
      console.warn('Story generator AI failed, using template fallback:', err?.message || err);
    }
    // Template fallback — strictly fact-based, no hallucination
    return {
      story: `${input.productName} is a remarkable example of ${input.craftTradition} from ${input.region}, crafted with ${input.materials} by an artisan with ${input.yearsOfExperience} years of dedicated practice. Using the ${input.specialTechnique} technique, this piece embodies the living heritage and patient devotion that defines authentic Indian handicraft traditions. Every detail reflects the artisan's commitment to preserving cultural authenticity while creating something truly unique.`,
    };
  }
);
