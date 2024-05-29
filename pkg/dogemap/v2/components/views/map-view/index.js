import {
  LitElement,
  html,
  nothing,
  asyncReplace,
  repeat
} from "/vendor/@lit/all@3.1.2/lit-all.min.js";
import { store } from "/state/store.js";
import { StoreSubscriber } from "/state/subscribe.js";

// Components
import "/components/views/node-inspector/index.js";
import "/components/views/hex-map/hex-map.js";

// APIs
import { getWorld } from "/api/world/world.js";
import { getNodes } from "/api/nodes/nodes.js";

// Utils
import { bindToClass } from "/utils/class-bind.js";

// Lib methods
import * as classMethods from "./lib/index.js";

import { mapViewStyles } from "./styles.js";

class MapView extends LitElement {
  // Declare properties you want the UI to react to changes for.
  static get properties() {
    return {
      map_data_available: { type: Boolean },
      show_inspector: { type: Boolean },
      show_results: { type: Boolean },
      world: { type: Object },
      points: { type: Object },
      last_updated: { type: String }
    };
  }

  static styles = mapViewStyles

  constructor() {
    super();
    // Good place to set defaults.
    this.show_inspector = false;
    this.counter = countUp();
    this.last_updated;

    // Dynamic (changes as filters are applied);
    this.world = false;
    this.points = false;
    
    // Keep record of original state (before filtering);
    this.originalWorld;
    this.originalPoints;

    bindToClass(classMethods, this);
  }

  set world(newValue) {
    this._world = newValue;
    // Whenever world is updated, update the "last_updated" field.
    this.last_updated = Date.now();
  }

  set points(newValue) {
    this._points = newValue;
    // Whenever points is updated, update the "last_updated" field.
    this.last_updated = Date.now();
  }

  get world() {
    return this._world;
  }

  get points() {
    return this._points;
  }

  connectedCallback() {
    super.connectedCallback();
    this.context = new StoreSubscriber(this, store);
    this.fetchData();

    this.addEventListener('sl-hide', this.handleResultsHide);
  }

  disconnectedCallback() {
    this.removeEventListener('sl-hide', this.handleResultsHide);
    super.disconnectedCallback();
  }

  updated(changedProperties) {
    changedProperties.forEach((oldValue, propName) => {
      console.log(`MAP-VIEW: ${propName} changed. oldValue: ${oldValue}`);
    });
  }

  handleResultsHide(e) {
    if (e.originalTarget.id === "ResultsDraw") {
      this.show_results = false;
    }
  }

  async fetchData() {
    if (!this.map_data_available) {
      const [world, points] = await Promise.all([getWorld(), getNodes()]);
      this.world = world;
      this.points = points;

      this.originalWorld = world;
      this.originalPoints = points;

      this.map_data_available = true;
      this.last_updated = Date.now();
    }
  }

  closeNode() {
    store.updateState({
      nodeContext: { inspectedNodeId: null },
    });
  }

  toggleList() {
    this.show_inspector = !this.show_inspector;
  }

  handleResultsTabClick() {
    this.show_results = !this.show_results;
  }

  render() {
    const { nodeContext } = this.context.store;
    const showProfile = Boolean(nodeContext.inspectedNodeId);
    const nodeId = nodeContext.inspectedNodeId;

    const topNodes = [
      "/node/wow-such-node-guy",
      "/node/best-node-ever",
      "/node/such-node-many-uptime",
    ];

    return html`

        <div class="floating topleft">
          <div>
            <sl-button @click=${this.toggleList}>Show Top Nodes List</sl-button>
          </div>

          <div>
            <sl-input type="search" placeholder="Search" @sl-input=${this.handleSearchInput}>
              <sl-icon name="search" slot="prefix"></sl-icon>
            </sl-input>
          </div>
        </div>

        ${!this.map_data_available ? html`
          <div class="initial-loader">
            <sl-progress-bar indeterminate></sl-progress-bar>
          </div>
        ` : nothing}

        ${this.map_data_available ? html`
          <hex-map
            .world=${this.world}
            .points=${this.points}
            nonce=${this.last_updated}
          ></hex-map>
        ` : nothing}

        <div id="minimap" class="floating middleright">
        ${this.map_data_available ? html`
          <hex-map
            .world=${this.world}
            .points=${this.points}
            nonce=${this.last_updated}
          ></hex-map>
        ` : nothing}
        </div>

        <div class="floating bottomright">
          <node-inspector
            ?open=${this.show_inspector || showProfile}
            .list=${topNodes}
            .selected=${nodeId}
          >
          </node-inspector>
        </div>

        ${this.map_data_available ? html`
          <div id="ResultsDrawTab" ?nudge=${this.show_results} class="peaking-tab bottom">
            <div class="tab-label" @click=${this.handleResultsTabClick}><span>[ ${this.points.length} ] Nodes Found</span></div>
          </div>
        ` : nothing }

        ${this.map_data_available ? html`
        <sl-drawer id="ResultsDraw" no-header ?open=${this.show_results} placement="bottom" style="--size: 35vh;">
          ${this.points.map(p => html`
            <div class="node-list-item">
              <span>${p.subver}</span>
              <span>${p.country}</span>
              <span>${p.city}</span>
            </div>
          `)}
        </sl-drawer>
        ` : nothing }
    `;
  }
}

customElements.define("map-view", MapView);

async function* countUp() {
  let count = 0;
  while (true) {
    yield count++;
    await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait for one second
  }
}
