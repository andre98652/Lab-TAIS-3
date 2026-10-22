import type { WeatherData } from '../types';
import { formatHumidity, formatPrecipitation, formatTemperature } from '../utils/formatters';

export class WeatherDisplay {
  constructor(private readonly element: HTMLElement) {}

  render(cityName: string, fallbackCityName: string, weather: WeatherData): void {
    const heading = document.createElement('h2');
    heading.textContent = cityName.trim() || fallbackCityName;

    const grid = document.createElement('div');
    grid.className = 'weather-grid';
    grid.append(
      this.createMetric('Temperatura', formatTemperature(weather.temperature)),
      this.createMetric('Humedad', formatHumidity(weather.humidity)),
      this.createMetric('Precipitación', formatPrecipitation(weather.precipitation)),
    );

    this.element.replaceChildren(heading, grid);
    this.element.hidden = false;
  }

  clear(): void {
    this.element.replaceChildren();
    this.element.hidden = true;
  }

  private createMetric(label: string, value: string): HTMLElement {
    const article = document.createElement('article');
    article.className = 'metric';
    const labelElement = document.createElement('span');
    labelElement.textContent = label;
    const valueElement = document.createElement('strong');
    valueElement.textContent = value;
    article.append(labelElement, valueElement);
    return article;
  }
}
