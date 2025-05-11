class SiteFooter extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          padding: 60px 0;
          text-align: center;
          font-size: 15px;
          line-height: 2;
        }
        :host([nobg]) {
          background: none;
        }
        .footer-content {
          margin: 0 auto;
          max-width: 600px;
        }
        .icon-links {
          display: flex;
          justify-content: center;
          gap: 12px;
          margin: 12px 0;
        }
        .icon-links a {
          display: inline-block;
          padding: 6px;
          opacity: 0.5;
          transition: opacity 0.2s;
        }
        .icon-links a:hover {
          opacity: 1;
        }
        .icon-links img {
          display: block;
          width: 16px;
          height: 16px;
        }
      </style>
      <div class="footer-content">
        <div class="icon-links">
          <a href="https://github.com/yagnik-10" target="_blank" rel="noopener">
            <img class="invert pixelated" src="/icons/github.png" alt="GitHub" width="16" height="16" />
          </a>
          <a href="https://www.linkedin.com/in/yagnikpavagadhi/" target="_blank" rel="noopener">
            <img class="invert pixelated" src="/icons/linkedin.png" alt="LinkedIn" width="16" height="16" />
          </a>
        </div>
      </div>
    `;
  }
}

customElements.define("site-footer", SiteFooter); 
