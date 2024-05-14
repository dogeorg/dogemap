import { LitElement, html } from '/vendor/@lit/all@3.1.2/lit-all.min.js';

class RenderCount extends LitElement {
  static properties = {
    message: { type: String, reflect: true }
  }

  constructor() {
    super();
    this.renderCount = 0;
    this.message = "";
  }

  render() {
    this.renderCount += 1;
    return html`
      <span class="debug-render-count">${this.renderCount}</span>
      `
  }
}

customElements.define('render-count', RenderCount);


