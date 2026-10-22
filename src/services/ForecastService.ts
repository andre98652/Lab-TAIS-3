import { ForecastClient } from '../clients/ForecastClient';
import { TimeoutError } from '../clients/http';
import type { ForecastResult } from '../types';

interface ForecastApiResponse {
  current?: {
    temperature_2m?: unknown;
    relative_humidity_2m?: unknown;
    precipitation?: unknown;
  };
}

export class ForecastService {
  constructor(private readonly client: Pick<ForecastClient, 'request'>) {}

  async getForecast(latitude: number, longitude: number): Promise<ForecastResult> {
    if (
      !Number.isFinite(latitude) || latitude < -90 || latitude > 90 ||
      !Number.isFinite(longitude) || longitude < -180 || longitude > 180
    ) {
      return { success: false, error: { type: 'INVALID_RESPONSE' } };
    }

    try {
      const response = await this.client.request(latitude, longitude);
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

      const current = (body as ForecastApiResponse).current;
      if (typeof current !== 'object' || current === null) {
        return { success: false, error: { type: 'INVALID_RESPONSE' } };
      }

      const values = [current.temperature_2m, current.relative_humidity_2m, current.precipitation];
      if (values.some((value) => typeof value !== 'number' || !Number.isFinite(value))) {
        return { success: false, error: { type: 'INCOMPLETE_DATA' } };
      }

      return {
        success: true,
        data: {
          temperature: current.temperature_2m as number,
          humidity: current.relative_humidity_2m as number,
          precipitation: current.precipitation as number,
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
