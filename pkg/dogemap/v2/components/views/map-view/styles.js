import { css } from "/vendor/@lit/all@3.1.2/lit-all.min.js";

export const mapViewStyles = css`
  :host {
    position: relative;
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

    & div { margin-bottom: var(--sl-spacing-x-small); }
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
    width: 360px;
    height: 360px;
    background: rgba(0,0,0,0.5);
  }

  #ResultsDraw {
    &::part(panel) {
      background-color: rgb(255, 65, 190, 0.7);
    }
  }

  .node-list-item {
    display: flex;
    flex-direction: row;
    gap: 1em;
    margin-bottom: 3px;

    background: rgba(0,0,0,0.2);
    font-family: Courier;
    font-size: 0.9rem;

    & span:first-child {
      width: 60vw; 
      max-width: 60vw;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    &:hover {
      background: rgba(255, 255, 255, 0.2);
      cursor: pointer;
    }
  }

  .peaking-tab {
    position: fixed;
    left: 50%;
    transform: translate(-50%,0);
    width: 90%;
    z-index: 999; /* Above sl-drawer's overlay */
    
    &.bottom { bottom: 0; }
    &.bottom[nudge] {
      bottom: 35vh;

      span {
        color: white;
      }
    }

    .tab-label {
      margin: 0 auto;
      width: 200px;
      background: rgb(255, 65, 190, 0.7);
      text-align: center;
      cursor: pointer;

      border-top-left-radius: 3px;
      border-top-right-radius: 3px;

      font-family: 'Comic Neue';
      font-weight: bold;
      text-transform: uppercase;
      font-size: 0.9rem;

      span { 
        position: relative; top: 1px;
        color: rgba(0,0,0,0.7);
      }

      &:hover {
        background: rgb(255, 65, 190, 0.9);
      }
    }
  }
`;