import { ServiceLandingPage } from '@/components/seo/service-landing-page';
import { createPageMetadata } from '@/lib/seo';

const path = '/siwes-it-report-generator';
const title = 'Generate a SIWES or IT Report Online | Industrial Training Report';
const description =
  'Prepare an editable SIWES or industrial training report draft online. Organize your placement details, activities, skills, and report sections with Scholarverse.';

export const metadata = createPageMetadata(title, description, path);

export default function SiwesReportGeneratorPage() {
  return (
    <ServiceLandingPage
      path={path}
      title={title}
      description={description}
      heading="Generate a SIWES / IT report online"
      introduction="Turn your real industrial training experience into a structured SIWES or IT report draft. Scholarverse helps Nigerian students organize placement information, work activities, and skills learned into an editable report."
      benefitsHeading="An SIWES report built around your actual placement"
      benefits={[
        {
          title: 'Organize your placement information',
          description:
            'Bring together your institution, department, company, training period, and supervisor details in one report workflow.',
        },
        {
          title: 'Document activities and skills',
          description:
            'Use the guided process to describe the tasks you performed, equipment or tools you used, and practical knowledge gained during training.',
        },
        {
          title: 'Structure the report clearly',
          description:
            'Prepare a readable report draft with sections suitable for describing your organization, training experience, and conclusions.',
        },
        {
          title: 'Review before submission',
          description:
            'Edit the report so it accurately reflects your own placement. Check your department’s SIWES handbook for required sections and formatting.',
        },
      ]}
      steps={[
        {
          title: 'Add your school and placement details',
          description:
            'Enter your university, department, course, organization, training period, and the details required by your supervisor.',
        },
        {
          title: 'Describe the work you completed',
          description:
            'Record the real duties, projects, equipment, and skills from your industrial attachment so the draft is grounded in your experience.',
        },
        {
          title: 'Generate, edit, and check the report',
          description:
            'Create the draft, correct any inaccuracies, and review structure and formatting against your institution’s SIWES requirements.',
        },
      ]}
      faqs={[
        {
          question: 'Can I generate a SIWES or IT report online?',
          answer:
            'Scholarverse provides an online tool to help organize and draft an SIWES, IT, or industrial training report using the placement details you provide.',
        },
        {
          question: 'Will the report describe my actual industrial training?',
          answer:
            'The draft is based on information you enter. Include only work and skills that reflect your real placement, and carefully edit the output before submission.',
        },
        {
          question: 'Is an IT report the same as a SIWES report?',
          answer:
            'Students often use IT report, industrial training report, and SIWES report to describe reports about a supervised work placement. Required format and terminology can vary by institution.',
        },
        {
          question: 'Can I use the report without checking it?',
          answer:
            'No. You should verify all details, add accurate evidence from your placement, and follow your department’s report guidelines before submitting.',
        },
      ]}
    />
  );
}
