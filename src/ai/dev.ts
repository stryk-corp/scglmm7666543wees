
'use server';
import { config } from 'dotenv';
config();

import '@/ai/flows/provide-ai-suggestions.ts';
import '@/ai/flows/generate-report-sections.ts';
import '@/ai/flows/generate-company-profile.ts';
import '@/ai/flows/generate-skills-chapter.ts';
import '@/ai/flows/generate-chapter-five.ts';
import '@/ai/flows/generate-diagram-flow.ts';
import '@/ai/flows/normalize-university-name.ts';
import '@/ai/flows/generate-technical-details.ts';
import '@/ai/flows/generate-chapter-four.ts';
import '@/ai/flows/moderate-testimonial.ts';
import '@/ai/flows/enhance-testimonial-text.ts';

