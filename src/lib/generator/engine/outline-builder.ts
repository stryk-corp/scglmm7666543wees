import { DocumentType, OutlineNode, AcademicLevel, ProjectContext } from '../types';

export function generateDefaultOutline(
  documentType: DocumentType,
  title: string,
  academicLevel: AcademicLevel,
  context: ProjectContext,
  targetPagesMin: number = 10
): OutlineNode[] {
  const totalWords = targetPagesMin * 300; // ~300 words per double-spaced academic page

  switch (documentType) {
    case 'essay':
      return createEssayOutline(title, totalWords, context);
    case 'term_paper':
      return createTermPaperOutline(title, totalWords, academicLevel, context);
    case 'siwes_report':
      return createSiwesOutline(title, totalWords, context);
    default:
      return [];
  }
}

function createEssayOutline(title: string, totalWords: number, context: ProjectContext): OutlineNode[] {
  const introWords = Math.round(totalWords * 0.15);
  const bodyWords = Math.round(totalWords * 0.65);
  const conclusionWords = Math.round(totalWords * 0.15);
  const perArgWords = Math.round(bodyWords / 3);

  return [
    {
      id: 'essay-intro',
      title: 'Introduction & Thesis Framing',
      level: 1,
      chapterNumber: 1,
      estimatedWords: introWords,
      status: 'not_started',
      purpose: 'Establish context, state the background problem, and clearly articulate the core thesis statement.',
      keyQuestions: [
        'What is the central topic and its scholarly importance?',
        'What is the primary thesis statement or stance?',
        'How will the rest of the essay be structured?'
      ],
      children: [
        {
          id: 'essay-background',
          title: 'Context & Background',
          level: 2,
          sectionNumber: '1.1',
          estimatedWords: Math.round(introWords * 0.6),
          status: 'not_started',
          purpose: 'Introduce the historical, social, or theoretical backdrop of the essay topic.'
        },
        {
          id: 'essay-thesis',
          title: 'Thesis Statement',
          level: 2,
          sectionNumber: '1.2',
          estimatedWords: Math.round(introWords * 0.4),
          status: 'not_started',
          purpose: 'Deliver an unambiguous, contentious thesis statement.'
        }
      ]
    },
    {
      id: 'essay-body-1',
      title: 'Primary Argument & Theoretical Foundation',
      level: 1,
      chapterNumber: 2,
      estimatedWords: perArgWords,
      status: 'not_started',
      purpose: 'Present the strongest supporting claim, reinforced with academic evidence and analytical reasoning.',
      keyQuestions: [
        'What is the primary supportive claim?',
        'What scholarly sources or data prove this assertion?',
        'How does this directly validate the thesis statement?'
      ]
    },
    {
      id: 'essay-body-2',
      title: 'Secondary Analysis & Real-World Application',
      level: 1,
      chapterNumber: 3,
      estimatedWords: perArgWords,
      status: 'not_started',
      purpose: 'Develop secondary arguments, exploring nuances and practical implications.',
      keyQuestions: [
        'What secondary mechanisms or variables support the core argument?',
        'What empirical evidence illustrates this point in practice?'
      ]
    },
    {
      id: 'essay-counter',
      title: 'Counterarguments & Critical Rebuttal',
      level: 1,
      chapterNumber: 4,
      estimatedWords: perArgWords,
      status: 'not_started',
      purpose: 'Acknowledge competing scholarly perspectives or objections, followed by a rigorous critical rebuttal.',
      keyQuestions: [
        'What is the most prominent opposing viewpoint or limitation?',
        'Why does the primary thesis remain superior or more persuasive despite this counterargument?'
      ]
    },
    {
      id: 'essay-conclusion',
      title: 'Conclusion & Academic Synthesis',
      level: 1,
      chapterNumber: 5,
      estimatedWords: conclusionWords,
      status: 'not_started',
      purpose: 'Synthesize findings without mere repetition, emphasizing broader academic or societal implications.',
      keyQuestions: [
        'How do the demonstrated claims unify back to the thesis?',
        'What final takeaway or future outlook should the reader retain?'
      ]
    },
    {
      id: 'essay-references',
      title: 'References',
      level: 1,
      estimatedWords: 100,
      status: 'not_started',
      purpose: 'Compile peer-reviewed literature in the requested referencing style.'
    }
  ];
}

function createTermPaperOutline(
  title: string,
  totalWords: number,
  academicLevel: AcademicLevel,
  context: ProjectContext
): OutlineNode[] {
  const ch1Words = Math.round(totalWords * 0.15);
  const ch2Words = Math.round(totalWords * 0.30);
  const ch3Words = Math.round(totalWords * 0.15);
  const ch4Words = Math.round(totalWords * 0.25);
  const ch5Words = Math.round(totalWords * 0.15);

  return [
    {
      id: 'tp-prelim',
      title: 'Abstract & Preliminary Overview',
      level: 1,
      estimatedWords: 250,
      status: 'not_started',
      purpose: 'Provide a concise summary of the study problem, methodology, findings, and contributions.'
    },
    {
      id: 'tp-ch1',
      title: 'Chapter 1: Introduction',
      level: 1,
      chapterNumber: 1,
      estimatedWords: ch1Words,
      status: 'not_started',
      purpose: 'Establish the research subject, problem statement, objectives, and significance.',
      children: [
        {
          id: 'tp-ch1-1',
          title: 'Background of the Study',
          level: 2,
          sectionNumber: '1.1',
          estimatedWords: Math.round(ch1Words * 0.35),
          status: 'not_started',
          purpose: 'Introduce the global, regional, and institutional context.'
        },
        {
          id: 'tp-ch1-2',
          title: 'Statement of the Problem',
          level: 2,
          sectionNumber: '1.2',
          estimatedWords: Math.round(ch1Words * 0.25),
          status: 'not_started',
          purpose: 'Identify the exact gap, deficiency, or conflict under investigation.'
        },
        {
          id: 'tp-ch1-3',
          title: 'Objectives of the Study',
          level: 2,
          sectionNumber: '1.3',
          estimatedWords: Math.round(ch1Words * 0.20),
          status: 'not_started',
          purpose: 'State the general and specific research objectives.'
        },
        {
          id: 'tp-ch1-4',
          title: 'Significance and Scope of the Study',
          level: 2,
          sectionNumber: '1.4',
          estimatedWords: Math.round(ch1Words * 0.20),
          status: 'not_started',
          purpose: 'Detail the academic relevance and delimit boundaries of the study.'
        }
      ]
    },
    {
      id: 'tp-ch2',
      title: 'Chapter 2: Literature Review',
      level: 1,
      chapterNumber: 2,
      estimatedWords: ch2Words,
      status: 'not_started',
      purpose: 'Critically synthesize existing scholarship, models, and empirical studies.',
      children: [
        {
          id: 'tp-ch2-1',
          title: 'Conceptual Framework & Core Definitions',
          level: 2,
          sectionNumber: '2.1',
          estimatedWords: Math.round(ch2Words * 0.3),
          status: 'not_started',
          purpose: 'Define and deconstruct essential terminology.'
        },
        {
          id: 'tp-ch2-2',
          title: 'Theoretical Framework',
          level: 2,
          sectionNumber: '2.2',
          estimatedWords: Math.round(ch2Words * 0.3),
          status: 'not_started',
          purpose: 'Anchor the research to foundational academic theories.'
        },
        {
          id: 'tp-ch2-3',
          title: 'Empirical Literature Review',
          level: 2,
          sectionNumber: '2.3',
          estimatedWords: Math.round(ch2Words * 0.4),
          status: 'not_started',
          purpose: 'Critically analyze prior studies and highlight the research gap.'
        }
      ]
    },
    {
      id: 'tp-ch3',
      title: 'Chapter 3: Methodology',
      level: 1,
      chapterNumber: 3,
      estimatedWords: ch3Words,
      status: 'not_started',
      purpose: 'Describe the research design, data collection mechanisms, and analysis frameworks.',
      children: [
        {
          id: 'tp-ch3-1',
          title: 'Research Design & Strategy',
          level: 2,
          sectionNumber: '3.1',
          estimatedWords: Math.round(ch3Words * 0.4),
          status: 'not_started',
          purpose: 'Justify the choice of qualitative, quantitative, or analytical approach.'
        },
        {
          id: 'tp-ch3-2',
          title: 'Data Collection & Sources',
          level: 2,
          sectionNumber: '3.2',
          estimatedWords: Math.round(ch3Words * 0.3),
          status: 'not_started',
          purpose: 'Detail primary and secondary data gathering techniques.'
        },
        {
          id: 'tp-ch3-3',
          title: 'Data Analysis Techniques & Limitations',
          level: 2,
          sectionNumber: '3.3',
          estimatedWords: Math.round(ch3Words * 0.3),
          status: 'not_started',
          purpose: 'Explain tools and parameters used to analyze findings.'
        }
      ]
    },
    {
      id: 'tp-ch4',
      title: 'Chapter 4: Results, Analysis & Discussion',
      level: 1,
      chapterNumber: 4,
      estimatedWords: ch4Words,
      status: 'not_started',
      purpose: 'Present synthesized findings, test research questions, and cross-examine with literature.',
      children: [
        {
          id: 'tp-ch4-1',
          title: 'Presentation & Thematic Analysis of Findings',
          level: 2,
          sectionNumber: '4.1',
          estimatedWords: Math.round(ch4Words * 0.5),
          status: 'not_started',
          purpose: 'Present the synthesized data and thematic patterns.'
        },
        {
          id: 'tp-ch4-2',
          title: 'Discussion & Synthesis with Prior Literature',
          level: 2,
          sectionNumber: '4.2',
          estimatedWords: Math.round(ch4Words * 0.5),
          status: 'not_started',
          purpose: 'Discuss how findings confirm or dispute existing theories.'
        }
      ]
    },
    {
      id: 'tp-ch5',
      title: 'Chapter 5: Summary, Conclusions & Recommendations',
      level: 1,
      chapterNumber: 5,
      estimatedWords: ch5Words,
      status: 'not_started',
      purpose: 'Summarize insights, state conclusive findings, and outline actionable recommendations.',
      children: [
        {
          id: 'tp-ch5-1',
          title: 'Summary of Major Findings',
          level: 2,
          sectionNumber: '5.1',
          estimatedWords: Math.round(ch5Words * 0.4),
          status: 'not_started',
          purpose: 'Concise summary of findings corresponding to research objectives.'
        },
        {
          id: 'tp-ch5-2',
          title: 'Conclusion',
          level: 2,
          sectionNumber: '5.2',
          estimatedWords: Math.round(ch5Words * 0.3),
          status: 'not_started',
          purpose: 'Definitive scholarly conclusion.'
        },
        {
          id: 'tp-ch5-3',
          title: 'Recommendations & Areas for Future Research',
          level: 2,
          sectionNumber: '5.3',
          estimatedWords: Math.round(ch5Words * 0.3),
          status: 'not_started',
          purpose: 'Actionable policy/academic recommendations and next investigative steps.'
        }
      ]
    },
    {
      id: 'tp-references',
      title: 'References',
      level: 1,
      estimatedWords: 200,
      status: 'not_started',
      purpose: 'Complete bibliographic list formatted according to the required style guide.'
    }
  ];
}

function createSiwesOutline(title: string, totalWords: number, context: ProjectContext): OutlineNode[] {
  const company = context.organizationProfile?.companyName || 'Host Organization';
  const ch1Words = Math.round(totalWords * 0.15);
  const ch2Words = Math.round(totalWords * 0.20);
  const ch3Words = Math.round(totalWords * 0.20);
  const ch4Words = Math.round(totalWords * 0.30);
  const ch5Words = Math.round(totalWords * 0.15);

  return [
    {
      id: 'siwes-prelim',
      title: 'Preliminary Pages (Title, Certification, Acknowledgement & Abstract)',
      level: 1,
      estimatedWords: 350,
      status: 'not_started',
      purpose: 'Official preliminary declaration, institutional supervisor approvals, and executive summary.'
    },
    {
      id: 'siwes-ch1',
      title: 'Chapter 1: Introduction to SIWES',
      level: 1,
      chapterNumber: 1,
      estimatedWords: ch1Words,
      status: 'not_started',
      purpose: 'Provide the regulatory and pedagogical foundation of Industrial Training.',
      children: [
        {
          id: 'siwes-ch1-1',
          title: 'Background and History of SIWES & ITF',
          level: 2,
          sectionNumber: '1.1',
          estimatedWords: Math.round(ch1Words * 0.4),
          status: 'not_started',
          purpose: 'Establish the founding mission of the Industrial Training Fund (ITF).'
        },
        {
          id: 'siwes-ch1-2',
          title: 'Objectives and Scope of Industrial Training',
          level: 2,
          sectionNumber: '1.2',
          estimatedWords: Math.round(ch1Words * 0.3),
          status: 'not_started',
          purpose: 'State the primary goals (bridging theoretical knowledge with practical skills).'
        },
        {
          id: 'siwes-ch1-3',
          title: 'Roles of Stakeholders (Institutions, Employers & Students)',
          level: 2,
          sectionNumber: '1.3',
          estimatedWords: Math.round(ch1Words * 0.3),
          status: 'not_started',
          purpose: 'Outline the responsibilities of students, employers, and coordinating agencies.'
        }
      ]
    },
    {
      id: 'siwes-ch2',
      title: `Chapter 2: Profile of ${company}`,
      level: 1,
      chapterNumber: 2,
      estimatedWords: ch2Words,
      status: 'not_started',
      purpose: 'Detailed organizational profile, history, core business services, and organizational structure.',
      children: [
        {
          id: 'siwes-ch2-1',
          title: 'Establishment, Location & Core Mandate',
          level: 2,
          sectionNumber: '2.1',
          estimatedWords: Math.round(ch2Words * 0.35),
          status: 'not_started',
          purpose: 'History, physical branch location, and primary corporate services.'
        },
        {
          id: 'siwes-ch2-2',
          title: 'Mission, Vision & Core Values',
          level: 2,
          sectionNumber: '2.2',
          estimatedWords: Math.round(ch2Words * 0.25),
          status: 'not_started',
          purpose: 'Corporate ideology and guiding principles.'
        },
        {
          id: 'siwes-ch2-3',
          title: 'Organizational Structure (Organogram & Hierarchy)',
          level: 2,
          sectionNumber: '2.3',
          estimatedWords: Math.round(ch2Words * 0.40),
          status: 'not_started',
          purpose: 'Departmental hierarchy and reporting chain.'
        }
      ]
    },
    {
      id: 'siwes-ch3',
      title: 'Chapter 3: Department Operations, Equipment & Safety',
      level: 1,
      chapterNumber: 3,
      estimatedWords: ch3Words,
      status: 'not_started',
      purpose: 'Detail the specific department of attachment, tools used, and safety protocols observed.',
      children: [
        {
          id: 'siwes-ch3-1',
          title: 'Department of Attachment & Routine Functions',
          level: 2,
          sectionNumber: '3.1',
          estimatedWords: Math.round(ch3Words * 0.35),
          status: 'not_started',
          purpose: 'Functions and role of the assigned unit within the organization.'
        },
        {
          id: 'siwes-ch3-2',
          title: 'Instruments, Tools, Hardware & Software Utilized',
          level: 2,
          sectionNumber: '3.2',
          estimatedWords: Math.round(ch3Words * 0.40),
          status: 'not_started',
          purpose: 'Technical inventory of apparatus, software frameworks, and tools used.'
        },
        {
          id: 'siwes-ch3-3',
          title: 'Occupational Health, Safety & Environmental Protocols',
          level: 2,
          sectionNumber: '3.3',
          estimatedWords: Math.round(ch3Words * 0.25),
          status: 'not_started',
          purpose: 'Safety drills, PPE standards, and standard operating procedures.'
        }
      ]
    },
    {
      id: 'siwes-ch4',
      title: 'Chapter 4: Work Performed, Projects & Technical Skills Acquired',
      level: 1,
      chapterNumber: 4,
      estimatedWords: ch4Words,
      status: 'not_started',
      purpose: 'The central empirical core of the report: step-by-step tasks, projects executed, and competencies developed.',
      children: [
        {
          id: 'siwes-ch4-1',
          title: 'Routine Maintenance, Workflows & Operational Duties',
          level: 2,
          sectionNumber: '4.1',
          estimatedWords: Math.round(ch4Words * 0.35),
          status: 'not_started',
          purpose: 'Detailed chronicle of weekly operational responsibilities.'
        },
        {
          id: 'siwes-ch4-2',
          title: 'Key Technical Project(s) Executed',
          level: 2,
          sectionNumber: '4.2',
          estimatedWords: Math.round(ch4Words * 0.35),
          status: 'not_started',
          purpose: 'In-depth breakdown of individual or group engineering/software/operational projects completed.'
        },
        {
          id: 'siwes-ch4-3',
          title: 'Practical Skills & Industrial Knowledge Acquired',
          level: 2,
          sectionNumber: '4.3',
          estimatedWords: Math.round(ch4Words * 0.30),
          status: 'not_started',
          purpose: 'Specific technical, collaborative, and analytical competencies gained.'
        }
      ]
    },
    {
      id: 'siwes-ch5',
      title: 'Chapter 5: Challenges, Conclusion & Recommendations',
      level: 1,
      chapterNumber: 5,
      estimatedWords: ch5Words,
      status: 'not_started',
      purpose: 'Reflective evaluation of difficulties faced, overall appraisal, and constructive advice.',
      children: [
        {
          id: 'siwes-ch5-1',
          title: 'Challenges Encountered and Problem-Solving Strategies',
          level: 2,
          sectionNumber: '5.1',
          estimatedWords: Math.round(ch5Words * 0.4),
          status: 'not_started',
          purpose: 'Technical or logistical roadblocks faced and how they were overcome.'
        },
        {
          id: 'siwes-ch5-2',
          title: 'Conclusion',
          level: 2,
          sectionNumber: '5.2',
          estimatedWords: Math.round(ch5Words * 0.3),
          status: 'not_started',
          purpose: 'Appraisal of the training experience in relation to the academic curriculum.'
        },
        {
          id: 'siwes-ch5-3',
          title: 'Recommendations to the Institution, ITF and Employer',
          level: 2,
          sectionNumber: '5.3',
          estimatedWords: Math.round(ch5Words * 0.3),
          status: 'not_started',
          purpose: 'Specific recommendations for improving future SIWES training cycles.'
        }
      ]
    },
    {
      id: 'siwes-references',
      title: 'References & Appendices',
      level: 1,
      estimatedWords: 200,
      status: 'not_started',
      purpose: 'Manuals, company documentation references, and logbook sample entries.'
    }
  ];
}

/**
 * Flattens the hierarchical outline tree into a sequential list of leaf-level writable sections.
 */
export function flattenOutlineSections(nodes: OutlineNode[]): OutlineNode[] {
  const result: OutlineNode[] = [];

  function traverse(node: OutlineNode) {
    if (!node.children || node.children.length === 0) {
      result.push(node);
    } else {
      for (const child of node.children) {
        traverse(child);
      }
    }
  }

  for (const node of nodes) {
    traverse(node);
  }

  return result;
}
