import {
  LitElement,
  html,
  css,
  nothing,
  asyncReplace,
} from "/vendor/@lit/all@3.1.2/lit-all.min.js";
import { store } from "/state/store.js";
import { StoreSubscriber } from "/state/subscribe.js";

// Components
import "/components/views/node-inspector/index.js";
import "/components/views/hex-map/hex-map.js";

// APIs
import { getWorld } from "/api/world/world.js";
import { getNodes } from "/api/nodes/nodes.js";

class MapView extends LitElement {
  // Declare properties you want the UI to react to changes for.
  static get properties() {
    return {
      map_data_available: { type: Boolean },
      show_inspector: { type: Boolean },
    };
  }

  static styles = css`
    :host {
      display: block;
      width: 100%;
      height: 100%;
      background: radial-gradient(circle, #2B4B65, #000000)
    }

    .floating {
      position: absolute;
      z-index: 199;

      &.topleft { top: 1em; left: 1em; }
      &.topright { top: 1em; right: 1em; }
      &.bottomleft { bottom: 1em; left: 1em; }
      &.bottomright { bottom: 1em; right: 1em; }
      &.middleright { top: 50%; right: 1em; transform: translate(0, -50%); }
    }

    .padded {
      padding: 2em;
    }

    h1 {
      font-family: "Comic Neue";
    }

    .initial-loader {
      position: absolute;
      top: calc(50%  - 10px);
      left: calc(50% - 100px);
      display: block;
      width: 200px;
      height: 100px;
    }

    #minimap {
      width: 340px;
      height: 340px;
      background: rgba(0,0,0,0.5);
    }
  `;

  constructor() {
    super();
    // Good place to set defaults.
    this.show_inspector = false;
    this.counter = countUp();

    this.world = false;
    this.points = false;
  }

  connectedCallback() {
    super.connectedCallback();
    this.context = new StoreSubscriber(this, store);
    this.fetchData();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
  }

  async fetchData() {
    if (!this.map_data_available) {
      const [world, points] = await Promise.all([getWorld(), getNodes()]);
      this.world = world;
      this.points = points;
      this.map_data_available = true;
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
          <sl-button @click=${this.toggleList}>Show Top Nodes List</sl-button>
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
          ></hex-map>
        ` : nothing}

        <div id="minimap" class="floating middleright">
        ${this.map_data_available ? html`
          <hex-map
            .world=${this.world}
            .points=${this.points}
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
