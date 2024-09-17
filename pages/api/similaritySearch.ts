import { NextApiRequest, NextApiResponse } from 'next';
import { getDatabase } from '@/src/database';
import { similaritySearch } from '@/src/search';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const { query } = req.body;
      const db = await getDatabase();
      const searchResults = await similaritySearch(db, query);
      res.status(200).json(searchResults);
    } catch (error) {
      console.error('Error in similarity search:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}