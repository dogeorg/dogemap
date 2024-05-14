import { LitElement, html, css, nothing } from '/vendor/@lit/all@3.1.2/lit-all.min.js';
import { store } from "/state/store.js";

class NodeInspector extends LitElement {

  static get properties() {
    return {
      open: { type: Boolean },
      list: { type: Object },
      selected: { type: String },
    }
  }

  constructor() {
    super();
    // Good place to set defaults.
    this.open = false;
    this.list = []
    this.selected = false;
  }

  static styles = css`
    .wrap {
      display: block;
      position: absolute;
      bottom: 0px;
      right: 0px;
      padding: 0em 1em 0.5em;
      margin: 1em;
      background: rgba(255,255,255,0.1);
    }

    .wrap[hidden="true"] {
      display: none;
    }
    
    ul {
      margin-right: 1em;
    }
  `

  closeNode() {
    store.updateState({
      nodeContext: { inspectedNodeId: null }
    })
  }

  connectedCallback() {
    super.connectedCallback();
  }

  render() {
    return html`
      <div class="wrap" hidden=${!this.open}>
      
        ${!this.selected ? html`
          <h3>Check out the top 3 nodes list</h3>
          <ul>
            ${this.list.map((n) => html`
              <li><a href="${n}">${n}</a></li>
            `)}
          </ul>
      ` : nothing}

        ${this.selected ? html`
          <h3><a href="/" @click=${this.closeNode}>← Back</a></h3>
          <p>Inspecting Node: ${this.selected}</p>
      ` : nothing}

      </div>
    `;
  }
}

customElements.define('node-inspector', NodeInspector);
