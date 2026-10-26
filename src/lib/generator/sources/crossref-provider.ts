import { Source } from '../contracts/types';
import { SourceProvider } from './source-pool';

interface CrossrefWork {
  DOI?: string;
  title?: string[];
  author?: Array<{ given?: string; family?: string }>;
  abstract?: string;
  published?: { 'date-parts'?: number[][] };
  type?: string;
}

interface CrossrefResponse {
  message?: { items?: CrossrefWork[] };
}

function plainAbstract(value: string): string {
  return value
    .replace(/<[^>]+>/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

export class CrossrefSourceProvider implements SourceProvider {
  async search(topic: string, query: string): Promise<Source[]> {
    const url = new URL('https://api.crossref.org/works');
    url.searchParams.set('query.bibliographic', `${topic} ${query}`);
    url.searchParams.set('filter', 'type:journal-article');
    url.searchParams.set('rows', '20');
    const response = await fetch(url, { signal: AbortSignal.timeout(12000) });
    if (!response.ok) throw new Error(`Crossref source search failed with HTTP ${response.status}.`);

    const payload = await response.json() as CrossrefResponse;
    return (payload.message?.items ?? []).flatMap((work) => {
      const year = work.published?.['date-parts']?.[0]?.[0];
      const title = work.title?.[0]?.trim();
      const finding = work.abstract ? plainAbstract(work.abstract) : '';
      const authors = (work.author ?? [])
        .map((author) => [author.given, author.family].filter(Boolean).join(' ').trim())
        .filter(Boolean);
      if (!work.DOI || !title || !finding || !year || authors.length === 0) return [];
      const sourceId = `crossref:${work.DOI.toLowerCase()}`;
      return [{
        sourceId,
        authors,
        year,
        title,
        finding,
        relevance: `Retrieved from Crossref for the topic "${topic}" and query "${query}".`,
        doiOrUrl: `https://doi.org/${work.DOI}`,
      }];
    });
  }
}
