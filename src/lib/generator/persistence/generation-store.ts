import { GenerationDocument, GenerationJob } from '../contracts/types';

export interface GenerationStore {
  createDocument(document: GenerationDocument): Promise<void>;
  getDocument(ownerId: string, documentId: string): Promise<GenerationDocument | null>;
  saveDocument(document: GenerationDocument): Promise<void>;
  getJob(ownerId: string, documentId: string, jobId: string): Promise<GenerationJob | null>;
  listJobs(ownerId: string, documentId: string): Promise<GenerationJob[]>;
  saveJob(ownerId: string, documentId: string, job: GenerationJob): Promise<void>;
}
