import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { formatHumidity, formatPrecipitation, formatTemperature } from '../src/utils/formatters';

describe('formateadores', () => {
  it('P11: temperatura y precipitación tienen un decimal; humedad es entera', () => {
    const finite = fc.double({ min: -10_000, max: 10_000, noNaN: true, noDefaultInfinity: true });
    fc.assert(fc.property(finite, (value) => {
      expect(formatTemperature(value)).toMatch(/^-?\d+\.\d °C$/);
      expect(formatPrecipitation(value)).toMatch(/^-?\d+\.\d mm$/);
      expect(formatHumidity(value)).toMatch(/^-?\d+ %$/);
    }));
  });
});
