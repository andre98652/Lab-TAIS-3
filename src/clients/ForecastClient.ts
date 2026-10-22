import { fetchWithTimeout, type FetchLike } from './http';

const FORECAST_ENDPOINT = 'https://api.open-meteo.com/v1/forecast';

export class ForecastClient {
  constructor(
    private readonly fetchFn: FetchLike = fetch,
    private readonly timeoutMs = 10_000,
  ) {}

  buildUrl(latitude: number, longitude: number): string {
    const url = new URL(FORECAST_ENDPOINT);
    url.searchParams.set('latitude', String(latitude));
    url.searchParams.set('longitude', String(longitude));
    url.searchParams.set(
      'current',
      'temperature_2m,relative_humidity_2m,precipitation',
    );
    return url.toString();
  }

  request(latitude: number, longitude: number): Promise<Response> {
    return fetchWithTimeout(this.buildUrl(latitude, longitude), this.fetchFn, this.timeoutMs);
  }
}
