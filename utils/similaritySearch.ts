import { getDatabase, inspectImportedData } from '@/src/database';
import { similaritySearch } from '@/src/search';

export async function performClientSimilaritySearch(query: string) {
  const db = await getDatabase();
  return similaritySearch(db, query);
}