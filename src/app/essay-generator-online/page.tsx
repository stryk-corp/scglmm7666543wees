import { ServiceLandingPage } from '@/components/seo/service-landing-page';
import { createPageMetadata } from '@/lib/seo';

const path = '/essay-generator-online';
const title = 'Generate an Academic Essay Online | AI Essay Writing Tool';
const description =
  'Create an editable academic essay draft online with Scholarverse. Develop your prompt into a clear structure, then review sources, refine your argument, and edit your work.';

export const metadata = createPageMetadata(title, description, path);

export default function EssayGeneratorPage() {
  return (
    <ServiceLandingPage
      path={path}
      title={title}
      description={description}
      heading="Generate an academic essay online"
      introduction="Use Scholarverse to turn an academic essay prompt into a structured, editable draft. Add your subject, question, and instructions, then develop and review the argument before submitting your work."
      benefitsHeading="Move from essay prompt to a stronger draft"
      benefits={[
        {
          title: 'Clarify the essay question',
          description:
            'Provide the exact prompt and course context so you can begin with a draft focused on the task your lecturer set.',
        },
        {
          title: 'Develop an organized argument',
          description:
            'Use AI-assisted drafting to organize the introduction, main points, and conclusion, then strengthen each point with your own research.',
        },
        {
          title: 'Make the writing your own',
          description:
            'Edit the draft for accuracy, voice, and critical analysis. The final essay should demonstrate your own understanding of the subject.',
        },
        {
          title: 'Check the final presentation',
          description:
            'Review document layout and ensure citations, sources, and formatting meet your department’s requirements.',
        },
      ]}
      steps={[
        {
          title: 'Provide your prompt and subject',
          description:
            'Enter the essay question, course details, department, and any required length or formatting instructions.',
        },
        {
          title: 'Generate an editable draft',
          description:
            'Use the writing workflow to prepare a structured starting draft that you can revise and support with appropriate academic sources.',
        },
        {
          title: 'Review evidence and revise',
          description:
            'Check every factual claim and reference, improve the reasoning, and edit the final essay to comply with your institution’s academic integrity policy.',
        },
      ]}
      faqs={[
        {
          question: 'Can I generate essays online with Scholarverse?',
          answer:
            'Yes. Scholarverse supports academic essay drafting online. Add your prompt and course context, then review and edit the generated draft.',
        },
        {
          question: 'Can the essay generator guarantee correct references?',
          answer:
            'No. Always verify references and factual claims against the original sources. Do not cite a source unless you have checked that it exists and supports the claim.',
        },
        {
          question: 'Should I submit an AI-generated essay as-is?',
          answer:
            'No. Treat generated material as a drafting aid, revise it substantially, add your own research and analysis, and follow the AI-use policy set by your institution.',
        },
        {
          question: 'What information should I enter?',
          answer:
            'Start with the exact essay prompt, course or subject, department, institution, and any length, structure, or citation requirements from your lecturer.',
        },
      ]}
    />
  );
}
