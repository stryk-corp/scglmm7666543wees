import { Firestore } from 'firebase-admin/firestore';
import { GenerationDocument, GenerationJob } from '../contracts/types';
import { GenerationStore } from './generation-store';

export class FirestoreGenerationStore implements GenerationStore {
  constructor(private readonly db: Firestore) {}

  async createDocument(document: GenerationDocument): Promise<void> {
    await this.documentRef(document.ownerId, document.id).create(document);
  }

  async getDocument(ownerId: string, documentId: string): Promise<GenerationDocument | null> {
    const snapshot = await this.documentRef(ownerId, documentId).get();
    return snapshot.exists ? snapshot.data() as GenerationDocument : null;
  }

  async saveDocument(document: GenerationDocument): Promise<void> {
    await this.documentRef(document.ownerId, document.id).set({
      ...document,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
  }

  async getJob(ownerId: string, documentId: string, jobId: string): Promise<GenerationJob | null> {
    const snapshot = await this.jobRef(ownerId, documentId, jobId).get();
    return snapshot.exists ? snapshot.data() as GenerationJob : null;
  }

  async listJobs(ownerId: string, documentId: string): Promise<GenerationJob[]> {
    const snapshot = await this.documentRef(ownerId, documentId).collection('generationJobs').get();
    return snapshot.docs.map((document) => document.data() as GenerationJob);
  }

  async saveJob(ownerId: string, documentId: string, job: GenerationJob): Promise<void> {
    const batch = this.db.batch();
    batch.set(this.jobRef(ownerId, documentId, job.id), job);
    batch.set(this.documentRef(ownerId, documentId), {
      updatedAt: new Date().toISOString(),
    }, { merge: true });
    await batch.commit();
  }

  private documentRef(ownerId: string, documentId: string) {
    return this.db.collection('users').doc(ownerId).collection('generationDocuments').doc(documentId);
  }

  private jobRef(ownerId: string, documentId: string, jobId: string) {
    return this.documentRef(ownerId, documentId).collection('generationJobs').doc(jobId);
  }
}
