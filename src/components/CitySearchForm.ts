export class CitySearchForm {
  private onSearch: (cityName: string) => void = () => undefined;

  constructor(
    private readonly form: HTMLFormElement,
    private readonly input: HTMLInputElement,
    private readonly validationMessage: HTMLElement,
  ) {
    this.form.addEventListener('submit', (event) => {
      event.preventDefault();
      const cityName = this.input.value.trim();
      if (!cityName) {
        this.showValidation('El nombre de la ciudad es obligatorio.');
        this.input.focus();
        return;
      }
      this.clearValidation();
      this.onSearch(cityName);
    });

    this.input.addEventListener('input', () => this.clearValidation());
  }

  setSearchHandler(handler: (cityName: string) => void): void {
    this.onSearch = handler;
  }

  setBusy(isBusy: boolean): void {
    this.form.setAttribute('aria-busy', String(isBusy));
  }

  private showValidation(message: string): void {
    this.validationMessage.textContent = message;
    this.input.setAttribute('aria-invalid', 'true');
  }

  private clearValidation(): void {
    this.validationMessage.textContent = '';
    this.input.removeAttribute('aria-invalid');
  }
}
