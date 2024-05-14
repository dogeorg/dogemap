import { LitElement, html, css, nothing, asyncReplace } from '/vendor/@lit/all@3.1.2/lit-all.min.js';
import { store } from "/state/store.js";
import { StoreSubscriber } from "/state/subscribe.js";

// Components
import "/components/views/node-inspector/index.js";

class MapView extends LitElement {

  // Declare properties you want the UI to react to changes for.
  static get properties () {
    return {
      show_inspector: { type: Boolean }
    }
  }

  static styles = css`
    :host {
      display: flex;
      height: 100%;
      width: 100%;
    }
    .padded {
      padding: 2em;
    }

    h1 {
      font-family: 'Comic Neue';
    }
  `

  constructor() {
    super();
    // Good place to set defaults.
    this.show_inspector = false;
    this.counter = countUp();
  }

  connectedCallback() {
    super.connectedCallback();
    this.context = new StoreSubscriber(this, store);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
  }

  closeNode() {
    store.updateState({
      nodeContext: { inspectedNodeId: null }
    })
  }

  toggleList() {
    this.show_inspector = !this.show_inspector;
  }

  render() {
    const { nodeContext } = this.context.store
    const showProfile = Boolean(nodeContext.inspectedNodeId);
    const nodeId = nodeContext.inspectedNodeId;

    const topNodes = [
      "/node/wow-such-node-guy",
      "/node/best-node-ever",
      "/node/such-node-many-uptime",
    ]

    return html`
      <div class="padded">
        <h1>Map View!</h1>
        <p>I should show a map</p>
        <sl-button @click=${this.toggleList}>Show Top Nodes List</sl-button>
        
        <!-- Imagining this section here is the map, we want its state to persist even as things change around it -->
        <p>Counter: <span>${asyncReplace(this.counter)}</span> (Imagine this is a map, always persists, beep-a-dee-boop)</p>
        
        <node-inspector 
          ?open=${this.show_inspector || showProfile}
          .list=${topNodes}
          .selected=${nodeId}>
        </node-inspector>

      </div>
    `;
  }
}

customElements.define('map-view', MapView);

async function* countUp() {
  let count = 0;
  while (true) {
      yield count++;
      await new Promise(resolve => setTimeout(resolve, 1000));  // Wait for one second
  }
}
