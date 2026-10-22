import { fetchWithTimeout, type FetchLike } from './http';

const GEOCODING_ENDPOINT = 'https://geocoding-api.open-meteo.com/v1/search';

export class GeocodingClient {
  constructor(
    private readonly fetchFn: FetchLike = fetch,
    private readonly timeoutMs = 10_000,
  ) {}

  buildUrl(cityName: string): string {
    const url = new URL(GEOCODING_ENDPOINT);
    url.searchParams.set('name', cityName);
    url.searchParams.set('count', '1');
    url.searchParams.set('language', 'es');
    url.searchParams.set('format', 'json');
    return url.toString();
  }

  request(cityName: string): Promise<Response> {
    return fetchWithTimeout(this.buildUrl(cityName), this.fetchFn, this.timeoutMs);
  }
}
