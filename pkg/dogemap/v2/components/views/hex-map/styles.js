import { css } from "/vendor/@lit/all@3.1.2/lit-all.min.js";

export const hexMapStyles = css`
  :host {
    position: absolute;
    top: 0px;
    left: 0px;
    z-index: 0;

    display: flex;
    width: calc(100% - 6px);
    height: calc(100% - 6px);
    box-sizing: border-box;

    align-items: center;
    justify-content: center;
  }

  .floating {
    position: absolute;
    &.center {
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    }
    &.offbottomleft {
      bottom: 25%;
      left: 25%;
    }
  }
`;
