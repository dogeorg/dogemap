import { html, css } from "/vendor/@lit/all@3.1.2/lit-all.min.js";

export function renderNav() {
  const topNavStyles = css`
    nav.top {
      font-family: 'Comic Neue';
      position: absolute;
      top: 0px;
      right: 0px;
      padding: 1em;
    }
  `;

  return html`
    <nav class="top">
      I'm a nav
    </nav>
    <style>${topNavStyles}</style>
  `;
}
