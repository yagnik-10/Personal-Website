import { AppLogo } from "./app/logo.js";
import { AppPanel } from "./app/panel.js";
import { createCanvas } from "./canvas/canvas.js";
import { html } from "./components/html.js";
import { render } from "./lib/htm-preact.js";
import { createTransliterationForm } from "./transliteration/form.js";
import { when } from "./lib/mobx.js";

const { TransliterationForm, observableBaybayinUnits } =
  createTransliterationForm();

const { Canvas, canvasRef } = createCanvas();

when(
  () => observableBaybayinUnits.get().length > 0,
  async () => {
    const { installCalligraphy } = await import("./calligraphy/calligraphy.js");
    installCalligraphy(observableBaybayinUnits, canvasRef);
  }
);

export function Index() {
  const panelColumnWidth = "minmax(300px, 500px)";
  return html`
    <style id=${Index.name}>
      .app {
        background: var(--color-bg-darker);
      }
      .appDesktopLayout {
        display: grid;
        grid-template-rows: minmax(0, 1fr) min-content;
        grid-template-columns: ${panelColumnWidth} ${panelColumnWidth} 1fr ${panelColumnWidth};
        grid-template-areas:
          "canvas canvas canvas canvas"
          "input style - file";
        grid-gap: var(--size-m);
        padding: var(--size-m) var(--size-m) 0;
        height: 100vh;
        overflow: hidden;
      }
      .appLogo {
        grid-area: canvas;
        position: relative;
        left: calc(var(--size-s) * -1);
        top: calc(var(--size-s) * -1);
        justify-self: start;
        align-self: start;
        z-index: 1;
      }
      .appMenu {
        grid-area: canvas;
        justify-self: end;
        align-self: start;
        z-index: 2;
      }
      .appCanvas {
        grid-area: canvas;
        padding: var(--size-l);
      }
      .appInputPanelArea {
        grid-area: input;
      }
      .appStylePanelArea {
        grid-area: style;
      }
      .appFilePanelArea {
        grid-area: file;
      }
    </style>
    <div class="app appDesktopLayout">
      <div class="appLogo">
        <${AppLogo} />
      </div>
      <nav class="appMenu">menu</nav>
      <main class="appCanvas"><${Canvas} /></main>
      <aside class="appInputPanelArea">
        <${AppPanel} title=${html`<h2>Text</h2>`}>
          <${TransliterationForm} />
        <//>
      </aside>
      <aside class="appStylePanelArea">
        <${AppPanel} title=${html`<h2>Style</h2>`}>style<//>
      </aside>
      <aside class="appFilePanelArea">
        <${AppPanel} title=${html`<h2>File</h2>`}>file<//>
      </aside>
    </div>
  `;
}

render(html`<${Index} />`, document.body);
