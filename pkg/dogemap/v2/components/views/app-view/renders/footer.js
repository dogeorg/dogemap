import { html, css } from "/vendor/@lit/all@3.1.2/lit-all.min.js";

export function renderFooter() {
  const footerStyles = css`
    footer {
      font-family: 'Comic Neue';
      position: absolute;
      bottom: 0px;
      padding: 1em;
    }
  `;

  return html`
    <footer>
      I'm a footer
    </footer>
    <style>${footerStyles}</style>
  `;
}
