import fc from 'fast-check';
import { describe, expect, it, vi } from 'vitest';
import { GeocodingService } from '../src/services/GeocodingService';

const jsonResponse = (body: unknown, status = 200): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

describe('GeocodingService', () => {
  it('P4: extrae sin modificar las coordenadas del primer resultado', async () => {
    await fc.assert(fc.asyncProperty(
      fc.double({ min: -90, max: 90, noNaN: true, noDefaultInfinity: true }),
      fc.double({ min: -180, max: 180, noNaN: true, noDefaultInfinity: true }),
      fc.string(),
      async (latitude, longitude, name) => {
        const request = vi.fn().mockResolvedValue(jsonResponse({
          results: [{ latitude, longitude, name }, { latitude: 0, longitude: 0 }],
        }));
        const result = await new GeocodingService({ request }).geocode('entrada');
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.latitude === latitude).toBe(true);
          expect(result.data.longitude === longitude).toBe(true);
          expect(result.data.cityName).toBe(name);
        }
      },
    ));
  });

  it('P5: coordenadas ausentes o nulas se tratan como ciudad no encontrada', async () => {
    await fc.assert(fc.asyncProperty(
      fc.constantFrom(null, undefined),
      fc.constantFrom(null, undefined),
      async (latitude, longitude) => {
        const request = vi.fn().mockResolvedValue(jsonResponse({ results: [{ latitude, longitude }] }));
        const result = await new GeocodingService({ request }).geocode('Lima');
        expect(result).toEqual({ success: false, error: { type: 'CITY_NOT_FOUND' } });
      },
    ));
  });

  it('P8: todo estado HTTP 300–599 se trata como error de servicio', async () => {
    await fc.assert(fc.asyncProperty(fc.integer({ min: 300, max: 599 }), async (status) => {
      const request = vi.fn().mockResolvedValue({ ok: false, status });
      const result = await new GeocodingService({ request }).geocode('Lima');
      expect(result).toEqual({ success: false, error: { type: 'SERVICE_ERROR', statusCode: status } });
    }));
  });

  it('devuelve CITY_NOT_FOUND cuando no hay resultados', async () => {
    const request = vi.fn().mockResolvedValue(jsonResponse({ results: [] }));
    expect(await new GeocodingService({ request }).geocode('X')).toEqual({
      success: false,
      error: { type: 'CITY_NOT_FOUND' },
    });
  });

  it('distingue fallos de red de respuestas inválidas', async () => {
    const networkRequest = vi.fn().mockRejectedValue(new TypeError('Failed to fetch'));
    expect(await new GeocodingService({ request: networkRequest }).geocode('X')).toEqual({
      success: false,
      error: { type: 'NETWORK_ERROR' },
    });

    const invalidRequest = vi.fn().mockResolvedValue(new Response('{', { status: 200 }));
    expect(await new GeocodingService({ request: invalidRequest }).geocode('X')).toEqual({
      success: false,
      error: { type: 'INVALID_RESPONSE' },
    });
  });
});
