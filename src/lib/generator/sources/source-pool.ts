import { Source } from '../contracts/types';

export interface SourceProvider {
  search(topic: string, query: string): Promise<Source[]>;
}

export function validateSource(source: Source): string[] {
  const errors: string[] = [];
  if (!source.sourceId.trim()) errors.push('sourceId is required.');
  if (source.authors.length === 0 || source.authors.some((author) => !author.trim())) {
    errors.push('At least one named author is required.');
  }
  if (!Number.isInteger(source.year) || source.year === null || source.year < 1800 || source.year > new Date().getFullYear()) {
    errors.push('A valid publication year is required.');
  }
  if (!source.title.trim()) errors.push('A source title is required.');
  if (!source.finding.trim()) errors.push('A source finding is required.');
  if (!source.relevance.trim()) errors.push('Source relevance to the topic is required.');
  return errors;
}

export async function retrieveSources(
  provider: SourceProvider,
  topic: string,
  queries: string[],
): Promise<Source[]> {
  if (!topic.trim()) throw new Error('A research topic is required before source retrieval.');
  const results = await Promise.all(queries.map((query) => provider.search(topic, query)));
  const byId = new Map<string, Source>();
  for (const source of results.flat()) {
    const errors = validateSource(source);
    if (errors.length > 0) {
      throw new Error(`Invalid source record "${source.sourceId}": ${errors.join(' ')}`);
    }
    byId.set(source.sourceId, source);
  }
  return [...byId.values()];
}

export function addSources(current: Source[], incoming: Source[]): Source[] {
  const byId = new Map(current.map((source) => [source.sourceId, source]));
  for (const source of incoming) {
    const errors = validateSource(source);
    if (errors.length > 0) throw new Error(`Invalid source record "${source.sourceId}": ${errors.join(' ')}`);
    byId.set(source.sourceId, source);
  }
  return [...byId.values()];
}
