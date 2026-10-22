import type { CitySearchForm } from './components/CitySearchForm';
import type { ErrorMessage } from './components/ErrorMessage';
import type { LoadingIndicator } from './components/LoadingIndicator';
import type { WeatherDisplay } from './components/WeatherDisplay';
import type { ForecastService } from './services/ForecastService';
import type { GeocodingService } from './services/GeocodingService';
import type { ForecastError, GeocodingError } from './types';

export class WeatherController {
  constructor(
    private readonly geocodingService: Pick<GeocodingService, 'geocode'>,
    private readonly forecastService: Pick<ForecastService, 'getForecast'>,
    private readonly form: Pick<CitySearchForm, 'setBusy'>,
    private readonly display: Pick<WeatherDisplay, 'clear' | 'render'>,
    private readonly loading: Pick<LoadingIndicator, 'show' | 'hide'>,
    private readonly errorMessage: Pick<ErrorMessage, 'show' | 'clear'>,
  ) {}

  async search(cityName: string): Promise<void> {
    this.display.clear();
    this.errorMessage.clear();
    this.loading.show();
    this.form.setBusy(true);

    try {
      const geocoding = await this.geocodingService.geocode(cityName);
      if (!geocoding.success) {
        this.errorMessage.show(this.geocodingErrorMessage(geocoding.error));
        return;
      }

      const forecast = await this.forecastService.getForecast(
        geocoding.data.latitude,
        geocoding.data.longitude,
      );
      if (!forecast.success) {
        this.errorMessage.show(this.forecastErrorMessage(forecast.error));
        return;
      }

      this.display.render(geocoding.data.cityName, cityName, forecast.data);
    } finally {
      this.loading.hide();
      this.form.setBusy(false);
    }
  }

  private geocodingErrorMessage(error: GeocodingError): string {
    switch (error.type) {
      case 'CITY_NOT_FOUND': return 'No se encontró la ciudad indicada.';
      case 'TIMEOUT': return 'El servicio de geocodificación no respondió a tiempo.';
      case 'NETWORK_ERROR': return 'El servicio de geocodificación no está disponible.';
      case 'SERVICE_ERROR': return `El servicio de geocodificación retornó un error (${error.statusCode}).`;
      case 'INVALID_RESPONSE': return 'El servicio de geocodificación devolvió datos no válidos.';
    }
  }

  private forecastErrorMessage(error: ForecastError): string {
    switch (error.type) {
      case 'TIMEOUT': return 'El servicio de pronóstico no respondió a tiempo.';
      case 'NETWORK_ERROR': return 'El servicio de pronóstico no está disponible.';
      case 'SERVICE_ERROR': return `El servicio de pronóstico retornó un error (${error.statusCode}).`;
      case 'INCOMPLETE_DATA': return 'Los datos meteorológicos recibidos están incompletos.';
      case 'INVALID_RESPONSE': return 'El servicio de pronóstico devolvió datos no válidos.';
    }
  }
}
