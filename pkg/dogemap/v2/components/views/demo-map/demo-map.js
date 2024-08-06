import { LitElement, html, css, repeat, nothing } from "/vendor/@lit/all@3.1.2/lit-all.min.js";
import { asyncTimeout } from "/utils/timeout.js";

import "./map-marker.js";

class DemoMap extends LitElement {
  static get properties() {
    return {
      loading: { type: Boolean },
      
      card_x: { type: Number },
      card_y: { type: Number },
      card_pid: { type: String },
      card_closing_pid: { type: String },
    };
  }

  constructor() {
    super();
    // this.dance = [
    //   { pin: { pid: 1, c: 1, x: 50, y: 100, i: 'coffee.png' }, t: 500 },
    //   { pin: { pid: 2, c: 3, x: 120, y: 195, i: 'pizza.png' }, t: 1000 },
    //   { pin: { pid: 3, c: 1, x: 72, y: 284, i: 'bag.png' }, t: 1000 },
    //   { pin: { pid: 4, c: 1, x: 347, y: 50, i: 'hat.png' }, t: 300 },
    //   { pin: { pid: 5, c: 5, x: 438, y: 100, i: 'blog.png' }, t: 300 },
    //   { pin: { pid: 6, c: 6, x: 308, y: 217, i: 'burger.png' }, t: 300 }
    // ];

    this.dance = [
      { pin: { pid: 1, c: 1, x: 50, y: 100, i: 'coffee.png' }, t: 500 },
      { pin: { pid: 2, c: 3, x: 124, y: 195, i: 'pizza.png' }, t: 1000 },
      { pin: { pid: 3, c: 1, x: 74, y: 282, i: 'bag.png', p: 'dogeweave.png' }, t: 800 },
      { pin: { pid: 4, c: 1, x: 347, y: 50, i: 'hat.png' }, t: 300 },
      { pin: { pid: 5, c: 5, x: 438, y: 100, i: 'blog.png' }, t: 200 },
      { pin: { pid: 6, c: 6, x: 313, y: 217, i: 'burger.png' }, t: 200 }
    ];

    this.pins = [];
  }

  async firstUpdated() {

    await asyncTimeout(3000);

    for (const item of this.dance) {
      await asyncTimeout(item.t);
      this.pins.push(item.pin);
      this.requestUpdate();
    }
  }

  connectedCallback() {
    super.connectedCallback();
    this.addEventListener('pin-click', this.handlePinClick)
  }

  disconnectedCallback() {
    this.removeEventListener('pin-click', this.handlePinClick)
    super.disconnectedCallback();
  }

  handlePinClick(e) {
    console.log(e.detail);
    this.showCard(e.detail.pid, e.detail);
  }

  handleMapClick(event) {
    const path = event.composedPath();
    const isCardClicked = path.some(element => element.classList && element.classList.contains('card'));
    const isPinClicked = path.some(element => element.classList && element.classList.contains('pin'));
    console.log({ isCardClicked, isPinClicked });

    if (this.card_pid && !isCardClicked && !isPinClicked) {
      const pin = this.shadowRoot.querySelector(`map-marker[pid="${this.card_pid}"]`);
      pin.close()
      setTimeout(() => {
        this.card_pid = null;
      }, 250);
    }
  }

  showCard(pid, options) {
    this.card_x = options.x;
    this.card_y = options.y;
    this.card_c1 = options.c1;
    this.card_c2 = options.c2;
    this.card_pid = pid;
  }

  calcCardColor(c1, c2) {
    return `rgba(${c1}, 0.95)`;
  }

  render() {

    return html`

      <div class="shop-loader">
        <span class="title">Fetching Shibe Shops</span>
        <sl-spinner></sl-spinner>
      </div>


      <div class="pin-wrap" @click=${this.handleMapClick}>
        ${repeat(this.pins, (pin) => pin.pid, (pin, index) => html`
          <map-marker
            pid=${pin.pid}
            c=${pin.c}
            x=${pin.x}
            y=${pin.y}
            i=${pin.i}
            p=${pin.p}
            ?active=${pin.pid == this.card_pid}
          ></map-marker>
        `)}

        ${this.card_pid ? html `
          <div
            class="card"
            data-pid="${this.card_pid}"
            style="
              --card-x:${this.card_x}px;
              --card-y:${this.card_y}px;
              --card-color:${this.calcCardColor(this.card_c1, this.card_c2)}
            ">

            <div class="title">
              @DogeWeave
            </div>
            <div class="desc">
              Knitted by hand, with love.
            </div>
            <div class="btn">View Store</div>
            <div class="btn">Send Tip</div>
          </div>
        `: nothing } 
      </div>
    `;
  }

  static styles = css`
    :host {
      z-index: 999999;
      position: absolute;
      top: 30px;
      left: 150px;
    }
    .pin-wrap {
      width: 1000px;
      height: 600px;
    }

    .shop-loader {
      position: absolute;
      top: 0px;
      left: -120px;
      background: rgba(0,0,0,0.7);
      display: flex;
      flex-direction: row;
      color: white;
      gap: 0.7em;
      align-items: center;
      padding: 0.5em 1em;
      font-family: 'Comic Neue';
    }

    .pin {
      width: 60px;
      .circle {
        width: 60px;
        height: 60px;
        background-color: #fcf509;
        border-radius: 50%;
        margin-bottom: -25px;
        position: relative;
        z-index: 10;
      }
      .triangle {
        margin-left: auto;
        margin-right: auto;
        width: 60px;  /* This sets the base width of the triangle */
        height: 60px; /* This sets the height of the triangle */
        background: linear-gradient(to right, yellow, orange); /* Gradient from yellow to orange */
        clip-path: polygon(50% 100%, 0% 0%, 100% 0%);
        position: relative;
        z-index: 9;
      }
    }

    .card {
      position: absolute;
      top: 0px;
      left: 0px;
      z-index: 99;
      transform: translate(calc(var(--card-x) - 70px), calc(var(--card-y) + 30px));
      display: block;
      width: 200px;
      background: var(--card-color);
      border-radius: 8px;
      padding: 8px 8px;
      padding-top: 35px;
      box-sizing: border-box;

      .btn {
        background: #222;
        color: white;
        text-align: center;
        margin-top: 8px;
        font-family: 'Comic Neue';
        border-radius: 2px;
        box-shadow: 2px 2px 1px rgba(0,0,0,0.4);
      }

      .btn:hover {
        background: white;
        color: #222;
        cursor: pointer;
      }

      .title {
        text-align: center;
        color: black;
        font-family: 'Comic Neue';
        font-weight: bold;
        text-decoration: underline;
      }

      .desc {
        text-align: center;
        color: #333;
        font-family: 'Comic Neue';
        font-size: 0.9rem;
      }
    }
  `
}

customElements.define("demo-map", DemoMap);
