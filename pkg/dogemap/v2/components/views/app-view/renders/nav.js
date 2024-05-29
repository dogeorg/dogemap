import { html, css } from "/vendor/@lit/all@3.1.2/lit-all.min.js";

export function renderNav() {
  const topNavStyles = css`
    nav.top {
      position: absolute;
      top: 0px;
      right: 0px;
      z-index: 100;

      padding: 1em;

      font-family: 'Comic Neue';
    }
  `;

  return html`
    <nav class="top">
      I'm a nav
    </nav>
    <style>${topNavStyles}</style>
  `;
}
