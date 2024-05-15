import {
  LitElement,
  html,
  css,
  asyncReplace,
} from "/vendor/@lit/all@3.1.2/lit-all.min.js";

import { bindToClass } from "/utils/class-bind.js";
import * as classMethods from "./lib/index.js";
import { hexMapStyles } from "./styles.js";

/* 
  This component assumes the following are globally available (see index.html):
  - d3, -d3-geo-projection, -d3-hexgrid
  -simple-statistics
*/

class HexMap extends LitElement {
  static get properties() {
    return {
      world: { type: Object },
      points: { type: Object },
    };
  }

  static styles = hexMapStyles;

  constructor() {
    super();
    this.counter = countUp();
    
    // Place holders for things established in /lib/setup.js
    this.canvas;
    this.renderingContext;
    this.projection;
    this.color;
    this.hexagon;
    this.hex;
    this.width = 0
    this.height = 0
    this.pixelRatio = 1;

    // We have placed some of this class methods
    // into separate files for organisation sake
    // bindToClass glues each to this class.
    bindToClass(classMethods, this);
  }

  connectedCallback() {
    super.connectedCallback();
  }

  firstUpdated() {
    // On first update (when this component is provided world & point data)
    // Perform the extensive setup function that produces the hexgrig.
    // Refer to /lib/setup.js
    this.setup();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
  }

  render() {
    return html`
      <canvas id="Hexmap"></canvas>

      <div class="floating center">
        <p>HexMap Run Time: <span>${asyncReplace(this.counter)}</span></p>
      </div>
    `;
  }
}

customElements.define("hex-map", HexMap);

async function* countUp() {
  let count = 0;
  while (true) {
    yield count++;
    await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait for one second
  }
}
