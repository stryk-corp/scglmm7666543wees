
import { Timestamp } from 'firebase/firestore';

export interface ReportData {
  generationPayment?: {
    id: string;
    amount: number;
    status: 'charged' | 'complete' | 'refunded';
    documentType: 'siwes_report' | 'term_paper' | 'essay';
  };
  documentType?: 'siwes_report' | 'term_paper' | 'essay';
  targetPageCount?: number;
  coverTheme?: string;
  academicLevel?: 'secondary' | 'undergraduate' | 'postgraduate';
  reportTitle?: string;
  thesisStatement?: string;
  researchQuestions?: string;
  methodologyType?: string;
  theoreticalFramework?: string;
  chapterOneTitle?: string;
  chapterTwoTitle?: string;
  chapterThreeTitle?: string;
  chapterFourTitle?: string;
  chapterFiveTitle?: string;
  chapterOneText?: string;
  chapterTwoText?: string;
  chapterThreeText?: string;
  chapterFourText?: string;
  chapterFiveText?: string;
  fullName: string;
  regNumber: string;
  universityName: string;
  facultyName: string;
  departmentName: string;
  courseCode: string;
  reportMonth: string;
  reportYear: string;
  placeOfAttachment: string;
  attachmentLocation: string;
  supervisorNames: string;
  ceoName: string;
  companyProfile: string;
  scopeOfSpecialization: string;
  companyVision: string;
  companyMission: string;
  companyValues: string;
  organogramImage: string[];
  organogramCaption: string;
  organogramAbbreviations: string;
  fieldOfStudy: string;
  primarySkill: string;
  technologiesUsed: string;
  programmingLanguage: string;
  framework: string;
  careerPath: string;
  acknowledgementText: string;
  abstractText: string;
  skillsChapterText: string;
  challengesText: string;
  conclusionText: string;
  referencesText: string;
  attachmentImages: string[];
  attachmentCaption: string;
  profileImages: string[];
  profileCaption: string;
  textAlign: 'left' | 'center' | 'justify';
  fontFamily: string;
  fontSize: string;
  lineHeight: string;
  marginTop: string;
  marginRight: string;
  marginBottom: string;
  marginLeft: string;
  pageNumberEnabled: boolean;
  pageNumberPosition: 'bottom-center' | 'bottom-left' | 'bottom-right';
  pageNumberFormat:
    | 'Page {page}'
    | '{page}'
    | 'Page {page_roman_lower}'
    | '{page_roman_lower}'
    | 'Page {page_roman_upper}'
    | '{page_roman_upper}';
  referencesEnabled: boolean;
  referenceStyle: 'APA' | 'MLA' | 'Chicago' | 'Harvard';

  // Chapter 4
  projectsDescription: string;
  projectIntro: string;
  project1_intro: string;
  project1_desc: string;
  project1_useCaseDiagram: string[];
  project1_useCaseCaption: string;
  project1_welcomeScreen: string;
  project1_welcomeScreenImages: string[];
  project1_welcomeScreenCaption: string;
  project1_signInScreen: string;
  project1_validation: string;
  project1_signInImages: string[];
  project1_signInCaption: string;
  project1_signUpScreen: string;
  project1_signUpImages: string[];
  project1_signUpCaption: string;

  project1_homeScreen: string;
  project1_homeScreenImages: string[];
  project1_homeScreenCaption: string;
  project1_tools: string;
  
  project2_intro: string;
  project2_desc: string;
  project2_structure: string;
  project2_ui: string;
  project2_core: string;
  project2_codeSnippetImages: string[];
  project2_codeSnippetCaption: string;
  project2_tools: string;
  createdAt?: Timestamp | Date | string | null;
  expiresAt?: Timestamp | Date | string | null;
}

export interface UserProfileData {
    fullName: string;
    regNumber: string;
    universityName: string;
    facultyName: string;
    departmentName: string;
    isReferralActive: boolean;
    referralCount?: number;
    referralBalance?: number;
    referralCommissionRate?: number; // Rate as a percentage, e.g., 10 for 10%
    referredBy?: string | null;
    bankName?: string;
    accountNumber?: string;
    accountName?: string;
    utm_source?: string;
    utm_medium?: string;
    utm_campaign?: string;
}

export interface Notification {
  id: string;
  title: string;
  body: string;
  icon: string;
  type: 'info' | 'success' | 'warning' | 'error';
  createdAt: Timestamp;
  isRead: boolean;
}

export interface Transaction {
    id: string;
    amount: number;
    status: 'success' | 'failed';
    createdAt: Timestamp;
}

    
