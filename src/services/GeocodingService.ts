import { GeocodingClient } from '../clients/GeocodingClient';
import { TimeoutError } from '../clients/http';
import type { GeocodingResult } from '../types';

interface GeocodingApiResult {
  name?: unknown;
  latitude?: unknown;
  longitude?: unknown;
}

interface GeocodingApiResponse {
  results?: GeocodingApiResult[];
}

export class GeocodingService {
  constructor(private readonly client: Pick<GeocodingClient, 'request'>) {}

  async geocode(cityName: string): Promise<GeocodingResult> {
    try {
      const response = await this.client.request(cityName);
      if (!response.ok) {
        return { success: false, error: { type: 'SERVICE_ERROR', statusCode: response.status } };
      }

      let body: unknown;
      try {
        body = await response.json();
      } catch {
        return { success: false, error: { type: 'INVALID_RESPONSE' } };
      }

      if (typeof body !== 'object' || body === null || Array.isArray(body)) {
        return { success: false, error: { type: 'INVALID_RESPONSE' } };
      }

      const { results } = body as GeocodingApiResponse;
      if (results === undefined || (Array.isArray(results) && results.length === 0)) {
        return { success: false, error: { type: 'CITY_NOT_FOUND' } };
      }
      if (!Array.isArray(results)) {
        return { success: false, error: { type: 'INVALID_RESPONSE' } };
      }

      const first = results[0];
      if (
        first === undefined ||
        typeof first.latitude !== 'number' ||
        !Number.isFinite(first.latitude) ||
        first.latitude < -90 ||
        first.latitude > 90 ||
        typeof first.longitude !== 'number' ||
        !Number.isFinite(first.longitude) ||
        first.longitude < -180 ||
        first.longitude > 180
      ) {
        return { success: false, error: { type: 'CITY_NOT_FOUND' } };
      }

      return {
        success: true,
        data: {
          latitude: first.latitude,
          longitude: first.longitude,
          cityName: typeof first.name === 'string' ? first.name : '',
        },
      };
    } catch (error) {
      if (error instanceof TimeoutError) {
        return { success: false, error: { type: 'TIMEOUT' } };
      }
      return { success: false, error: { type: 'NETWORK_ERROR' } };
    }
  }
}
