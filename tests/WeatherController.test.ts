import { describe, expect, it, vi } from 'vitest';
import { WeatherController } from '../src/WeatherController';

const coordinates = { latitude: -12.0464, longitude: -77.0428, cityName: 'Lima' };
const weather = { temperature: 22, humidity: 70, precipitation: 0 };

function setup(geocodingResult: unknown, forecastResult: unknown) {
  const dependencies = {
    geocoding: { geocode: vi.fn().mockResolvedValue(geocodingResult) },
    forecast: { getForecast: vi.fn().mockResolvedValue(forecastResult) },
    form: { setBusy: vi.fn() },
    display: { clear: vi.fn(), render: vi.fn() },
    loading: { show: vi.fn(), hide: vi.fn() },
    error: { show: vi.fn(), clear: vi.fn() },
  };
  const controller = new WeatherController(
    dependencies.geocoding,
    dependencies.forecast,
    dependencies.form,
    dependencies.display,
    dependencies.loading,
    dependencies.error,
  );
  return { controller, ...dependencies };
}

describe('WeatherController', () => {
  it('ejecuta el flujo completo y renderiza el resultado', async () => {
    const context = setup(
      { success: true, data: coordinates },
      { success: true, data: weather },
    );
    await context.controller.search('Lima');
    expect(context.display.clear).toHaveBeenCalledBefore(context.geocoding.geocode);
    expect(context.forecast.getForecast).toHaveBeenCalledWith(-12.0464, -77.0428);
    expect(context.display.render).toHaveBeenCalledWith('Lima', 'Lima', weather);
    expect(context.loading.show).toHaveBeenCalledOnce();
    expect(context.loading.hide).toHaveBeenCalledOnce();
  });

  it('muestra ciudad no encontrada sin consultar el pronóstico', async () => {
    const context = setup(
      { success: false, error: { type: 'CITY_NOT_FOUND' } },
      { success: true, data: weather },
    );
    await context.controller.search('Inexistente');
    expect(context.error.show).toHaveBeenCalledWith('No se encontró la ciudad indicada.');
    expect(context.forecast.getForecast).not.toHaveBeenCalled();
    expect(context.loading.hide).toHaveBeenCalledOnce();
  });

  it('muestra el error de datos incompletos y finaliza la carga', async () => {
    const context = setup(
      { success: true, data: coordinates },
      { success: false, error: { type: 'INCOMPLETE_DATA' } },
    );
    await context.controller.search('Lima');
    expect(context.error.show).toHaveBeenCalledWith('Los datos meteorológicos recibidos están incompletos.');
    expect(context.form.setBusy).toHaveBeenLastCalledWith(false);
  });
});
