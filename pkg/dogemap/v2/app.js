import {
  LitElement,
  html,
  nothing,
} from "/vendor/@lit/all@3.1.2/lit-all.min.js";

// Add shoelace once. Use components anywhere.
import { setBasePath } from "/vendor/@shoelace/cdn@2.14.0/utilities/base-path.js";
import "/vendor/@shoelace/cdn@2.14.0/shoelace.js";

// Import stylesheets
import { mainStyles } from "/styles/app.index.styles.js";

// App state (singleton)
import { store } from "/state/store.js";
import { StoreSubscriber } from "/state/subscribe.js";

// Views
import "/components/views/index.js";
import "/components/views/welcome-dialog/index.js";

// Render chunks
import * as renderMethods from "/components/views/app-view/renders/index.js";

// Router (singleton)
import { getRouter } from "/router/router.js";

// Utils
import debounce from "/utils/debounce.js";
import { bindToClass } from "/utils/class-bind.js";

// Do this once to set the location of shoelace assets (icons etc..)
setBasePath("/vendor/@shoelace/cdn@2.14.0/");

class DogemapApp extends LitElement {
  static properties = {};

  constructor() {
    super();
  }

  connectedCallback() {
    super.connectedCallback();
    this.context = new StoreSubscriber(this, store);
    
    // Add the resize event listener
    // window.addEventListener("resize", this._debouncedHandleResize);
    
    // Initial check to set orientation on load
    this._handleResize();

    bindToClass(renderMethods, this);
  }

  disconnectedCallback() {

    // window.removeEventListener("resize", this._debouncedHandleResize);
    super.disconnectedCallback();
  }

  firstUpdated() {
    // Initialise our router singleton and provide it a target elemenet.
    getRouter(this.shadowRoot.querySelector("#Outlet"));
  }

  _handleResize() {
    // Determine the orientation based on the window width
    const orientation = window.innerWidth > 920 ? "landscape" : "portrait";
    // Update the appContext.orientation state
    store.updateState({ appContext: { orientation } });
  }

  openDrawer() {
    const drawer = this.shadowRoot.querySelector("sl-drawer");
    drawer.show();
  }

  handleMenuClick() {
    this.menuVisible = !this.menuVisible;
  }

  render() {
    const CURPATH = this.context.store.appContext.pathname || "";
    const showChrome = !CURPATH.startsWith("/login");

    return html`
      <div id="App">
        ${showChrome ? this.renderNav() : nothing}
        <main id="Main">
          <div id="Outlet"></div>
        </main>
        ${showChrome ? this.renderFooter() : nothing}
      </div>

      <aside>
        <welcome-dialog></welcome-dialog>
      </aside>

      <style>
        ${mainStyles}
      </style>
    `;
  }
}

customElements.define("dogemap-app", DogemapApp);
