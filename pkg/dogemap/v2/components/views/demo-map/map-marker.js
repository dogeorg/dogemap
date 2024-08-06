import { LitElement, html, css, nothing } from "/vendor/@lit/all@3.1.2/lit-all.min.js";

class MapMarker extends LitElement {

  static get properties() {
    return {
      c: { type: Number }, // color index 1-7
      color1: { type: String }, // marker primary color "120, 1, 225"
      color2: { type: String }, // marker secondary color "255,0,125"
      x: { type: Number }, // x coord for marker placement
      y: { type: Number }, // y coord for marker placement
      i: { type: String }, // store image "bag.png"
      p: { type: String }, // profile image "profile.png"
      pid: { type: String }, // marker unique id
      active: { type: Boolean },
      flipped: { type: Boolean }
    };
  }

  constructor() {
    super();
    this.color1 = 'yellow';  // Default color1 if not provided
    this.color2 = 'orange';  // Default color2 if not provided
    this.x = 0;
    this.y = 0;
    this.i = '';
    this.p = '';
    this.pid = '';
    this.active = false;
    this.flipped = false;
  }

  static styles = css`
  :host {
    position: absolute;
    top: 0;
    left: 0;
    transform: translate(var(--x), var(--y));
    z-index: 1;
  }

  :host([active]) {
    z-index: 100;
  }

  .pin {
    width: 60px;
    display: flex;
    flex-direction: column;
    align-items: center;
    transform-origin: bottom center; /* Set pivot point at the bottom */
    transition: transform 0.2s ease-in-out; /* Smooth transition for hover out */
    animation: initial-wiggle 700ms ease-in-out forwards;
  }
  .circle {
    position: relative;
    width: 60px;
    height: 60px;
    border-radius: 50%;
    cursor: pointer;
    transform-style: preserve-3d;
    transition: transform 0.3s;
    margin-bottom: -25px;
    background-color: var(--color1);
    z-index: 10;
  }

  .circle img {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    backface-visibility: hidden;
    position: absolute;
    top: 0;
    left: 0;
  }
  .circle img.back {
    transform: rotateY(180deg);
  }
  .circle.flipped {
    transform: rotateY(180deg);
  }

  .triangle {
    width: 59px;
    height: 59px;
    background: linear-gradient(to right, var(--color1), var(--color2));
    clip-path: polygon(50% 100%, 0% 0%, 100% 0%);
    position: relative;
    z-index: 9;
  }

  .triangle[data-hide] {
    display: none;
  }

  @keyframes initial-wiggle {
    0%, 100% { transform: rotate(0deg); }
    10% { transform: rotate(-7deg); }
    20% { transform: rotate(7deg); }
    30% { transform: rotate(-6deg); }
    40% { transform: rotate(6deg); }
    50% { transform: rotate(-5deg); }
    60% { transform: rotate(5deg); }
    70% { transform: rotate(-4deg); }
    80% { transform: rotate(4deg); }
    90% { transform: rotate(-3deg); }
  }

  @keyframes wiggle-animation {
    0%, 100% { transform: rotate(-3deg); }
    50% { transform: rotate(3deg); }
  }

  .pin:hover {
    cursor: pointer;
    animation: wiggle-animation 0.5s ease-in-out infinite;
  }
`;

  set active(newValue) {
    this._active = newValue;
    this.flipped = newValue;
  }

  get active() {
    return this._active;
  }

  close() {
    this.flipped = false;
  }

  updated(changedProperties) {
    if (changedProperties.has('x') || changedProperties.has('y')) {
      this.style.setProperty('--x', `${this.x}px`);
      this.style.setProperty('--y', `${this.y}px`);
    }
    if (changedProperties.has('c')) {
      this.updateColors(this.c);
    }
  }

  updateColors(c) {
    const baseColors = {
      1: '255, 255, 0',
      2: '11, 246, 239',
      3: '253, 155, 197',
      4: '221, 134, 253',
      5: '145, 245, 27',
      6: '249, 118, 100',
    };
    const darkerShades = {
      1: '255, 165, 0', // darker yellow
      2: '10, 127, 180', // darker blue
      3: '192, 5, 122', // darker pink
      4: '79, 12, 74', // darker purple
      5: '50, 158, 59', // darker green
      6: '243, 8, 75', // darker red
    };

    if (baseColors[c] && darkerShades[c]) {
      this.color1 = baseColors[c];
      this.color2 = darkerShades[c];
      this.style.setProperty('--color1', `rgba(${this.color1})`);
      this.style.setProperty('--color2', `rgba(${this.color2})`);
    }
  }

  onPinClick() {
    this.flipped = !this.flipped;
    this.dispatchEvent(
      new CustomEvent('pin-click', { 
        detail: {
          x: this.x,
          y: this.y,
          pid: this.pid,
          c1: this.color1,
          c2: this.color2
        },
        bubbles: true, composed: true
      })
    );
  }

  render() {
    return html`
      <div class="pin" @click=${this.onPinClick}>
        <div class="circle ${this.flipped ? 'flipped' : ''}">
          <img src="/static/img/map-demo/${this.i}" class="front" />
          <img src="/static/img/map-demo/${this.p}" class="back" />
        </div>
        <div class="triangle" ?data-hide=${!!this.active}></div>
      </div>
    `;
  }
}

customElements.define("map-marker", MapMarker);