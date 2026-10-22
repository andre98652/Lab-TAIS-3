import fc from 'fast-check';
import { describe, expect, it, vi } from 'vitest';
import { ForecastService } from '../src/services/ForecastService';

const jsonResponse = (body: unknown, status = 200): Response =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

const finiteWeather = fc.double({
  min: -1_000,
  max: 1_000,
  noNaN: true,
  noDefaultInfinity: true,
});

describe('ForecastService', () => {
  it('P7: conserva sin modificar los valores meteorológicos', async () => {
    await fc.assert(fc.asyncProperty(
      finiteWeather,
      finiteWeather,
      finiteWeather,
      async (temperature, humidity, precipitation) => {
        const request = vi.fn().mockResolvedValue(jsonResponse({ current: {
          temperature_2m: temperature,
          relative_humidity_2m: humidity,
          precipitation,
        } }));
        const result = await new ForecastService({ request }).getForecast(0, 0);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.temperature === temperature).toBe(true);
          expect(result.data.humidity === humidity).toBe(true);
          expect(result.data.precipitation === precipitation).toBe(true);
        }
      },
    ));
  });

  it('P10: cada campo meteorológico es obligatorio', async () => {
    const valid = { temperature_2m: 20, relative_humidity_2m: 60, precipitation: 0 };
    await fc.assert(fc.asyncProperty(
      fc.constantFrom('temperature_2m', 'relative_humidity_2m', 'precipitation'),
      fc.constantFrom(null, undefined),
      async (field, missingValue) => {
        const current: Record<string, unknown> = { ...valid, [field]: missingValue };
        const request = vi.fn().mockResolvedValue(jsonResponse({ current }));
        const result = await new ForecastService({ request }).getForecast(0, 0);
        expect(result).toEqual({ success: false, error: { type: 'INCOMPLETE_DATA' } });
      },
    ));
  });

  it('P8: todo estado HTTP 300–599 se trata como error de servicio', async () => {
    await fc.assert(fc.asyncProperty(fc.integer({ min: 300, max: 599 }), async (status) => {
      const request = vi.fn().mockResolvedValue({ ok: false, status });
      const result = await new ForecastService({ request }).getForecast(0, 0);
      expect(result).toEqual({ success: false, error: { type: 'SERVICE_ERROR', statusCode: status } });
    }));
  });

  it('P9: un cuerpo inválido produce INVALID_RESPONSE', async () => {
    const request = vi.fn().mockResolvedValue(new Response('no-es-json', { status: 200 }));
    expect(await new ForecastService({ request }).getForecast(0, 0)).toEqual({
      success: false,
      error: { type: 'INVALID_RESPONSE' },
    });
  });

  it('no llama al cliente con coordenadas fuera del rango terrestre', async () => {
    const request = vi.fn();
    const result = await new ForecastService({ request }).getForecast(91, 181);
    expect(result).toEqual({ success: false, error: { type: 'INVALID_RESPONSE' } });
    expect(request).not.toHaveBeenCalled();
  });
});
