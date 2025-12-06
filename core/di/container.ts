import { Cache, ImageGenerator, Logger, RedisClient, SupabaseClient, TextGenerator, HttpClient, HttpRequestBuilder } from '../interfaces';
import { createTextGenerator } from '@/services/textGenerator';
import { createImageGenerator } from '@/services/imageGenerator';
import { createSupabaseClient } from '@/services/supabaseService';
import { createRedisClient } from '@/services/redisService';
import { logger } from '@/utils/logger';
import { createHttpClient } from '@/services/httpService';
import { createHttpRequestBuilder } from '@/core/http/httpRequestBuilder';

export interface Container {
  text: TextGenerator;
  image: ImageGenerator;
  supabase: SupabaseClient;
  redis: RedisClient;
  cache: Cache;
  logger: Logger;
  http: HttpClient;
  httpBuilder: HttpRequestBuilder;
}

class MapCache implements Cache {
  private store = new Map<string, string>();
  get(key: string) { return this.store.get(key); }
  set(key: string, value: string) { this.store.set(key, value); }
}

export const createContainer = (): Container => {
  const cache = new MapCache();
  return {
    text: createTextGenerator(cache),
    image: createImageGenerator(),
    supabase: createSupabaseClient(),
    redis: createRedisClient(),
    cache,
    logger,
    http: createHttpClient(logger),
    httpBuilder: createHttpRequestBuilder(),
  };
};
