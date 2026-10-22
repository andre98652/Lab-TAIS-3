import './styles.css';
import { ForecastClient } from './clients/ForecastClient';
import { GeocodingClient } from './clients/GeocodingClient';
import { CitySearchForm } from './components/CitySearchForm';
import { ErrorMessage } from './components/ErrorMessage';
import { LoadingIndicator } from './components/LoadingIndicator';
import { WeatherDisplay } from './components/WeatherDisplay';
import { ForecastService } from './services/ForecastService';
import { GeocodingService } from './services/GeocodingService';
import { WeatherController } from './WeatherController';

function requiredElement<T extends HTMLElement>(selector: string): T {
  const element = document.querySelector<T>(selector);
  if (!element) throw new Error(`No se encontró el elemento ${selector}`);
  return element;
}

const form = new CitySearchForm(
  requiredElement<HTMLFormElement>('#city-search-form'),
  requiredElement<HTMLInputElement>('#city-input'),
  requiredElement<HTMLElement>('#validation-message'),
);
const display = new WeatherDisplay(requiredElement('#weather-display'));
const loading = new LoadingIndicator(requiredElement('#loading-indicator'));
const errorMessage = new ErrorMessage(requiredElement('#error-message'));

const controller = new WeatherController(
  new GeocodingService(new GeocodingClient()),
  new ForecastService(new ForecastClient()),
  form,
  display,
  loading,
  errorMessage,
);

form.setSearchHandler((cityName) => void controller.search(cityName));
