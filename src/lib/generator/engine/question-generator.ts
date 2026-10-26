import { DocumentType, InquiryQuestion, AcademicLevel } from '../types';

export function getInquiryQuestions(
  documentType: DocumentType,
  academicLevel: AcademicLevel,
  discipline: string
): InquiryQuestion[] {
  switch (documentType) {
    case 'essay':
      return [
        {
          id: 'prompt_question',
          fieldKey: 'primarySubject',
          question: 'What is the exact assignment question or prompt?',
          subtext: 'Paste the instructor prompt or define the specific thesis topic to be investigated.',
          type: 'textarea',
          placeholder: 'e.g., Assess the ethical implications of artificial intelligence in healthcare diagnostics.',
          required: true,
        },
        {
          id: 'thesis_stance',
          fieldKey: 'thesisStatement',
          question: 'What is your core stance or working thesis statement?',
          subtext: 'The central claim or point of view that your essay will defend.',
          type: 'textarea',
          placeholder: 'e.g., While AI improves diagnostic accuracy, its lack of transparency necessitates mandatory human-in-the-loop oversight to ensure patient safety.',
          required: true,
        },
        {
          id: 'key_arguments',
          fieldKey: 'targetObjectives',
          question: 'What are the main 2 to 3 arguments supporting your stance?',
          subtext: 'Provide key points or themes you want emphasized in the body paragraphs.',
          type: 'textarea',
          placeholder: '1. Reduction of diagnostic error rates in radiology\n2. The black-box dilemma in clinical accountability\n3. Regulatory frameworks under HIPAA and EU AI Act',
          required: true,
        },
        {
          id: 'counterarguments',
          fieldKey: 'counterargumentsRequested',
          question: 'Should the essay address and rebut counterarguments?',
          subtext: 'Addressing opposing viewpoints strengthens critical analysis.',
          type: 'select',
          options: ['Yes - include dedicated counterarguments and rebuttal', 'No - focus purely on supportive arguments'],
          required: true,
        },
      ];

    case 'term_paper':
      return [
        {
          id: 'tp_title',
          fieldKey: 'primarySubject',
          question: 'What is the full title or research problem statement?',
          subtext: 'Clearly state the subject, industry, or theoretical concept under study.',
          type: 'textarea',
          placeholder: 'e.g., Impact of Mobile Banking Adoption on Financial Inclusion in Rural Communities',
          required: true,
        },
        {
          id: 'tp_objectives',
          fieldKey: 'targetObjectives',
          question: 'What are the specific research objectives or questions?',
          subtext: 'Enter at least 2 or 3 distinct objectives.',
          type: 'textarea',
          placeholder: '1. To evaluate the accessibility of USSD-based banking in sub-Saharan rural areas.\n2. To identify demographic barriers preventing elderly adoption.\n3. To propose an offline cryptographic protocol for merchant settlement.',
          required: true,
        },
        {
          id: 'tp_methodology',
          fieldKey: 'methodologyType',
          question: 'What research methodology does this term paper utilize?',
          subtext: 'Determines the structure of Chapter 3.',
          type: 'select',
          options: [
            'Systematic Literature Review & Meta-Synthesis',
            'Quantitative Survey / Statistical Analysis',
            'Qualitative Case Study / Thematic Analysis',
            'Mixed Methods',
          ],
          required: true,
        },
        {
          id: 'tp_theory',
          fieldKey: 'theoreticalFramework',
          question: 'Is there a specific theory or framework to anchor the review?',
          subtext: 'e.g., Technology Acceptance Model (TAM), Agency Theory, Keynesian Model.',
          type: 'text',
          placeholder: 'e.g., Technology Acceptance Model (TAM) & Diffusion of Innovations Theory',
          required: false,
        },
      ];

    case 'siwes_report':
      return [
        {
          id: 'org_name',
          fieldKey: 'companyName',
          question: 'Where did you complete your Industrial Training (SIWES)?',
          subtext: 'Company or organization name and branch/city location.',
          type: 'text',
          placeholder: 'e.g., Chevron Nigeria Limited, Lekki Peninsula, Lagos',
          required: true,
        },
        {
          id: 'department_assigned',
          fieldKey: 'departmentAssigned',
          question: 'Which department or technical unit were you attached to?',
          subtext: 'The specific section where your daily training took place.',
          type: 'text',
          placeholder: 'e.g., Network Infrastructure & Systems Engineering Unit',
          required: true,
        },
        {
          id: 'supervisor_name',
          fieldKey: 'supervisorName',
          question: 'Industry-based supervisor name & designation',
          subtext: 'Used for certification and preliminary acknowledgements.',
          type: 'text',
          placeholder: 'e.g., Engr. Adekunle Balogun (Chief Network Architect)',
          required: false,
        },
        {
          id: 'tools_used',
          fieldKey: 'toolsAndTech',
          question: 'What instruments, software, or tools did you actively use?',
          subtext: 'List specific hardware, apparatus, programming languages, or tools.',
          type: 'textarea',
          placeholder: 'e.g., Cisco Packet Tracer, Cat6 Crimping Tools, Wireshark, Fluke Network Analyzer, Linux Terminal, MikroTik Routers',
          required: true,
        },
        {
          id: 'weekly_tasks',
          fieldKey: 'weeklyTasksSummary',
          question: 'Summarize your actual daily/weekly tasks and projects',
          subtext: 'Authentic logs prevent fictitious descriptions and ground Chapter 4.',
          type: 'textarea',
          placeholder: 'Weeks 1-4: Basic safety drills, fiber optic splicing, and termination.\nWeeks 5-12: Structured LAN cabling for new administrative block, configuring VLANs on Cisco 2960 switches, troubleshooting DHCP IP conflicts.\nWeeks 13-24: Assisting in server room migration and weekly backup tape rotations.',
          required: true,
        },
      ];

    case 'research_project':
      return [
        {
          id: 'rp_title',
          fieldKey: 'primarySubject',
          question: 'What is the research topic or project title?',
          subtext: 'State the focus of the study and its domain.',
          type: 'textarea',
          placeholder: 'e.g., Evaluating the effect of solar-powered irrigation on smallholder productivity in Northern Nigeria.',
          required: true,
        },
        {
          id: 'rp_objectives',
          fieldKey: 'targetObjectives',
          question: 'What are the core research objectives?',
          subtext: 'Include the principal aim and 2-3 specific objectives.',
          type: 'textarea',
          placeholder: '1. Assess the adoption barriers to solar irrigation systems.\n2. Measure crop yield improvements after deployment.\n3. Recommend a policy model for rural stakeholders.',
          required: true,
        },
        {
          id: 'rp_methodology',
          fieldKey: 'methodologyType',
          question: 'Which methodology best fits this project?',
          subtext: 'This determines the structure of the methodology chapter.',
          type: 'select',
          options: ['Quantitative Survey', 'Qualitative Interview Study', 'Mixed Methods', 'Experimental Design'],
          required: true,
        },
        {
          id: 'rp_theory',
          fieldKey: 'theoreticalFramework',
          question: 'Is there an underlying theory or framework?',
          subtext: 'E.g., TAM, Diffusion of Innovation, or institutional theory.',
          type: 'text',
          placeholder: 'e.g., Technology Acceptance Model (TAM)',
          required: false,
        },
      ];

    default:
      return [];
  }
}
