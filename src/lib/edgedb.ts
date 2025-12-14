import { createClient } from 'edgedb';
import { config } from './config';

if (!config.edgedb.instance || !config.edgedb.secretKey) {
  throw new Error('Missing EdgeDB environment variables');
}

export const edgedb = createClient({
  instance: config.edgedb.instance,
  secretKey: config.edgedb.secretKey,
}); 