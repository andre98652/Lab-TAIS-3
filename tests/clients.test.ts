import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { ForecastClient } from '../src/clients/ForecastClient';
import { GeocodingClient } from '../src/clients/GeocodingClient';

describe('clientes HTTP — propiedades de construcción de URL', () => {
  it('P3: conserva cualquier nombre no vacío y limita el resultado a uno', () => {
    fc.assert(fc.property(
      fc.string({ minLength: 1 }),
      (cityName) => {
        const url = new URL(new GeocodingClient().buildUrl(cityName));
        expect(url.searchParams.get('name')).toBe(cityName);
        expect(url.searchParams.get('count')).toBe('1');
      },
    ));
  });

  it('P6: incluye coordenadas válidas y las tres variables meteorológicas', () => {
    fc.assert(fc.property(
      fc.double({ min: -90, max: 90, noNaN: true, noDefaultInfinity: true }),
      fc.double({ min: -180, max: 180, noNaN: true, noDefaultInfinity: true }),
      (latitude, longitude) => {
        const url = new URL(new ForecastClient().buildUrl(latitude, longitude));
        expect(Number(url.searchParams.get('latitude')) === latitude).toBe(true);
        expect(Number(url.searchParams.get('longitude')) === longitude).toBe(true);
        expect(url.searchParams.get('current')).toBe(
          'temperature_2m,relative_humidity_2m,precipitation',
        );
      },
    ));
  });
});
