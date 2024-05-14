import { css } from '/vendor/@lit/all@3.1.2/lit-all.min.js';

export const mainStyles = css`
  *, *::before, *::after {
    box-sizing: border-box;
  }
  :host {
    display: block;
    height: 100vh;
    overflow: hidden;
  }
  @font-face {
    font-family: 'Comic Neue';
    src: url('../../vendor/@gfont/Comic_Neue/ComicNeue-Regular.ttf') format('truetype');
    font-weight: normal;
    font-style: normal;
  }

  #App {
    display: flex;
    flex-direction: column;

    height: 100vh;
    width: 100vw;
    overflow: hidden;

    @media (min-width: 576px) {
      flex-direction: row;
    }

    @media (min-width: 1024px) {
      flex-direction: row;
    }
  }

  #Main {
    flex-grow: 1;
    
    height: calc(100% - 50px);
    width: 100%;
    overflow: hidden;

    background: #0000008f;
    
    @media (min-width: 576px) {
      height: 100%;
      width: 100%;
    }
  }

  #Outlet {
    height: 100%;
    width: 100%;
    overflow: hidden;
  }
`