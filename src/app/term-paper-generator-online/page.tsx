import { ServiceLandingPage } from '@/components/seo/service-landing-page';
import { createPageMetadata } from '@/lib/seo';

const path = '/term-paper-generator-online';
const title = 'Generate a Term Paper Online | AI Term Paper Generator';
const description =
  'Plan and draft an academic term paper online with Scholarverse. Add your topic and course details, create an editable draft, and review it before submission.';

export const metadata = createPageMetadata(title, description, path);

export default function TermPaperGeneratorPage() {
  return (
    <ServiceLandingPage
      path={path}
      title={title}
      description={description}
      heading="Generate an academic term paper online"
      introduction="Create a structured academic term paper draft online with Scholarverse. Provide your topic, course, department, and university details to get an editable starting point for your research and writing."
      benefitsHeading="A practical online term paper writing workflow"
      benefits={[
        {
          title: 'Start from your course and topic',
          description:
            'Use your actual assignment prompt, course information, and topic to guide the draft instead of starting from a blank document.',
        },
        {
          title: 'Build a clear academic structure',
          description:
            'Generate a draft organized into relevant sections, then revise the arguments and add evidence from sources you have checked.',
        },
        {
          title: 'Keep control of the final paper',
          description:
            'Edit the generated writing, correct details, and make sure the final submission reflects your own understanding and your lecturer’s requirements.',
        },
        {
          title: 'Prepare a readable document',
          description:
            'Preview page layout and formatting as you work, with document options designed for Nigerian tertiary students.',
        },
      ]}
      steps={[
        {
          title: 'Enter the assignment details',
          description:
            'Add your topic, course, department, institution, and any instructions that should guide your term paper.',
        },
        {
          title: 'Generate and review a draft',
          description:
            'Use the guided AI writing tools to prepare draft sections, then verify claims and references against credible academic sources.',
        },
        {
          title: 'Edit and prepare your paper',
          description:
            'Revise the content in your own words, check it against your course requirements, and preview the final document.',
        },
      ]}
      faqs={[
        {
          question: 'Can I generate a term paper online with Scholarverse?',
          answer:
            'Yes. Scholarverse provides an online workflow to draft and format term papers. You enter your academic details, review the generated material, and edit it before using it.',
        },
        {
          question: 'Does the term paper generator replace my research?',
          answer:
            'No. The generated content is a draft aid. You should conduct and cite your own research, verify claims and references, and follow your institution’s rules for AI assistance.',
        },
        {
          question: 'Can I edit the generated term paper?',
          answer:
            'Yes. Review and edit the generated sections and document details so the final paper matches your assignment prompt and academic requirements.',
        },
        {
          question: 'What details should I prepare before starting?',
          answer:
            'Have your paper topic, course or course code, department, institution, and assignment instructions ready. More accurate input helps you make a more relevant draft.',
        },
      ]}
    />
  );
}
