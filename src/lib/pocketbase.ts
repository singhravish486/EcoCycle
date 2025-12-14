import PocketBase from 'pocketbase';
import { config } from './config';

if (!config.pocketbase.url) {
  throw new Error('Missing PocketBase environment variables');
}

export const pocketbase = new PocketBase(config.pocketbase.url); 