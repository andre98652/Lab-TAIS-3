import fc from 'fast-check';
import { fireEvent } from '@testing-library/dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CitySearchForm } from '../src/components/CitySearchForm';
import { WeatherDisplay } from '../src/components/WeatherDisplay';

describe('componentes de interfaz', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <form id="form"><input id="city" maxlength="100"><p id="validation"></p></form>
      <section id="weather"></section>
    `;
  });

  function setupForm() {
    const formElement = document.querySelector<HTMLFormElement>('#form')!;
    const input = document.querySelector<HTMLInputElement>('#city')!;
    const validation = document.querySelector<HTMLElement>('#validation')!;
    return { component: new CitySearchForm(formElement, input, validation), formElement, input, validation };
  }

  it('P1: rechaza cualquier entrada formada solamente por whitespace', () => {
    fc.assert(fc.property(fc.stringMatching(/^[ \t\n\r]*$/), (value) => {
      const { component, formElement, input, validation } = setupForm();
      const handler = vi.fn();
      component.setSearchHandler(handler);
      input.value = value;
      fireEvent.submit(formElement);
      expect(handler).not.toHaveBeenCalled();
      expect(validation.textContent).toContain('obligatorio');
    }));
  });

  it('P2: recorta espacios antes de invocar la búsqueda', () => {
    fc.assert(fc.property(fc.string({ minLength: 1 }).filter((text) => text.trim().length > 0), (text) => {
      const { component, formElement, input } = setupForm();
      const handler = vi.fn();
      component.setSearchHandler(handler);
      input.value = `  ${text}  `;
      fireEvent.submit(formElement);
      expect(handler).toHaveBeenCalledWith(text.trim());
    }));
  });

  it('P12: muestra ciudad, valores y unidades; P13: puede limpiarlos', () => {
    const element = document.querySelector<HTMLElement>('#weather')!;
    const display = new WeatherDisplay(element);
    display.render('Lima', 'entrada', { temperature: 22.5, humidity: 71, precipitation: 0 });
    expect(element.textContent).toContain('Lima');
    expect(element.textContent).toContain('22.5 °C');
    expect(element.textContent).toContain('71 %');
    expect(element.textContent).toContain('0.0 mm');
    display.clear();
    expect(element.textContent).toBe('');
    expect(element.hidden).toBe(true);
  });

  it('usa el nombre ingresado cuando la API no devuelve nombre', () => {
    const element = document.querySelector<HTMLElement>('#weather')!;
    new WeatherDisplay(element).render('', 'Cusco', { temperature: 10, humidity: 50, precipitation: 1 });
    expect(element.querySelector('h2')?.textContent).toBe('Cusco');
  });
});
