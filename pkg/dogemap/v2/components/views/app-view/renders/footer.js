import { html, css } from "/vendor/@lit/all@3.1.2/lit-all.min.js";

export function renderFooter() {
  const footerStyles = css`
    footer {
      position: absolute;
      bottom: 0px;
      left: 0px;
      z-index: 100;

      padding: 1em;

      font-family: 'Comic Neue';
    }
  `;

  return html`
    <footer>
      I'm a footer
    </footer>
    <style>${footerStyles}</style>
  `;
}
