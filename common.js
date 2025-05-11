const preloadLink = document.createElement("link");
preloadLink.rel = "preload";
preloadLink.href = "/fonts/space/SpaceMono-Italic.ttf";
preloadLink.as = "font";
preloadLink.type = "font/ttf";
preloadLink.crossOrigin = "anonymous";
document.head.appendChild(preloadLink);

const iconLink = document.createElement("link");
iconLink.rel = "icon";
iconLink.type = "image/png";
iconLink.href = "/favicon.png";
document.head.appendChild(iconLink);

const webmentionLink = document.createElement("link");
webmentionLink.rel = "webmention";
webmentionLink.href = "/webmention";
document.head.appendChild(webmentionLink);

const alternateLink = document.createElement("link");
alternateLink.rel = "alternate";
alternateLink.type = "application/rss+xml";
alternateLink.title = "Personal Website";
alternateLink.href = "/rss.xml";
document.head.appendChild(alternateLink);

const meta = document.createElement("meta");
meta.name = "color-scheme";
meta.content = "only dark";
document.head.appendChild(meta);

const html = (() => {
  const staging = document.createElement("div");
  const rawSymbol = Symbol("raw");

  function sanitize(string) {
    staging.textContent = string;
    return staging.innerHTML;
  }

  function raw(rawHTML) {
    const marked = new String(rawHTML);
    marked[rawSymbol] = true;
    return marked;
  }

  function html(strings, ...values) {
    let result = strings[0];
    for (let i = 0; i < values.length; i++) {
      const value = values[i];
      const sanitizedValue =
        value && value instanceof String && value[rawSymbol] === true
          ? value
          : sanitize(String(value));
      result += sanitizedValue + strings[i + 1];
    }
    return raw(result);
  }

  html.raw = raw;
  return html;
})();

customElements.define(
  "site-header",
  class SiteHeader extends HTMLElement {
    #currentY = 0;
    #currentYTarget = 0;
    #mouseHovering = false;
    #isTouch = false;
    #lastScrollY = window.scrollY;
    #lastCursorY = 0;

    constructor() {
      super();
    }

    connectedCallback() {
      const isSelected = (href) =>
        href === "/"
          ? location.pathname === "/"
          : location.pathname.startsWith(href);

      const renderItem = (href, label) => html`<a
        href="${href}"
        class="${isSelected(href) ? "selected" : ""}"
        >${label}</a
      >`;

      const iconsrc = this.getAttribute("iconsrc");

      this.innerHTML = html`<nav>
        ${renderItem("/", "Home")}
        ${renderItem("/about/", "About")}
        <img
          class="${iconsrc ? "" : "site-header-icon-yay"}"
          src="${iconsrc || "/icons/yay_sheet.png"}"
          alt=""
        />
        ${renderItem("/wares/", "Wares")}
        ${renderItem("/music/", "Music")}
        <div class="site-header-indicator"></div>
      </nav>`;

      const passive = { passive: true };
      window.addEventListener("scroll", debounce(this.#onScroll), passive);
      window.addEventListener("wheel", debounce(this.#onWheel), passive);
      window.addEventListener(
        "mousemove",
        debounce(this.#onMouseMove, 100),
        passive
      );
      window.addEventListener("touchstart", this.#onWindowTouchStart, passive);
      window.addEventListener("touchmove", this.#onWindowTouchMove, passive);
      this.addEventListener("touchstart", this.#onTouchStart, passive);

      if (this.hasAttribute("prehide")) {
        // todo: fix
        this.#currentY = this.#currentYTarget = -this.offsetHeight;
        this.#updateDOM();
      }
    }

    #onScroll = (event) => {
      const dy = window.scrollY - this.#lastScrollY;

      // move with the page
      this.#currentY -= dy;
      if (this.#currentY > 0) {
        this.#currentY = 0;
      } else if (this.#currentY < -this.offsetHeight) {
        this.#currentY = -this.offsetHeight;
      }

      this.#currentYTarget = this.#currentY;
      this.#updateDOM();

      this.#lastScrollY = window.scrollY;
    };

    #onWheel = (event) => {
      const scrollY = window.scrollY;
      setTimeout(() => {
        if (window.scrollY !== scrollY) return;

        let dy = 0;
        switch (event.deltaMode) {
          case WheelEvent.DOM_DELTA_PIXEL:
            dy = event.deltaY;
          case WheelEvent.DOM_DELTA_LINE:
            dy = event.deltaY * 20;
          case WheelEvent.DOM_DELTA_PAGE:
            dy = event.deltaY * window.innerHeight;
        }

        this.#currentYTarget = this.#currentY - event.deltaY;
        if (this.#currentYTarget > 0) {
          this.#currentYTarget = 0;
        } else if (this.#currentYTarget < -this.offsetHeight) {
          this.#currentYTarget = -this.offsetHeight;
        }

        this.#updateDOM();
      }, 100);
    };

    #onMouseMove = (event) => {
      if (this.#isTouch) return;

      const dy = event.clientY - this.#lastCursorY;

      // show when mouse goes near the top
      const scaledDy = Math.sign(dy) * Math.log1p(Math.abs(dy)) * 20;
      if (dy < 0 && event.clientY + scaledDy < this.offsetHeight) {
        this.#currentYTarget = 0;
        this.#mouseHovering = true;
      } else if (
        this.#mouseHovering &&
        dy > 0 &&
        event.clientY > this.offsetHeight * 4
      ) {
        this.#currentYTarget = Math.max(-window.scrollY, -this.offsetHeight);
        this.#mouseHovering = false;
      }

      this.#updateDOM();
      this.#lastCursorY = event.clientY;
    };

    #onWindowTouchStart = (event) => {
      this.#isTouch = true;
      this.#lastCursorY = event.touches[0].clientY;
    };

    #onWindowTouchMove = (event) => {
      const dy = event.touches[0].clientY - this.#lastCursorY;

      // move with touch but only if at edge
      if (window.scrollY <= 0 && dy > 0) {
        this.#currentY += dy;
        if (this.#currentY >= 0) {
          this.#currentY = 0;
          document.body.style.overscrollBehaviorY = null;
        } else if (this.#currentY < 0) {
          document.body.style.overscrollBehaviorY = "none";
        }

        this.#currentYTarget = this.#currentY;
        this.#updateDOM();
      }

      this.#lastCursorY = event.touches[0].clientY;
    };

    #onTouchStart(event) {
      this.#currentYTarget = 0;
      this.#updateDOM();
    }

    #updateDOM = debounce(() => {
      this.style.transform = `translateY(${this.#currentY.toFixed(2)}px)`;

      const isHidden = this.#currentY < -this.offsetHeight * 0.8;
      this.classList.toggle("hidden", isHidden);

      if (Math.abs(this.#currentY - this.#currentYTarget) > 1) {
        this.#currentY += (this.#currentYTarget - this.#currentY) * 0.2;
        requestAnimationFrame(this.#updateDOM);
      } else {
        this.#currentY = this.#currentYTarget;
      }
    });
  }
);

customElements.define(
  "site-footer",
  class SiteFooter extends HTMLElement {
    constructor() {
      super();
    }

    connectedCallback() {
      const nobg = this.hasAttribute("nobg");

      if (!nobg) {
        setTimeout(() => {
          import("/components/nebula-animation/nebula-animation.js");
        }, 1_500);
      }

      this.innerHTML = html`<footer>
        <div>
          <p>
            <a href="/">Home</a> ·
            <a href="/about/">About</a> · <a href="/wares/">Software</a> ·
            <a href="/music/">Music</a>
          </p>
          <p>
            <img
              class="lg-icon pixelated"
              alt=""
              src="/icons/laptop_user.png"
              loading="lazy"
              style="vertical-align: top"
            />
            <span style="display: inline-block">
              · Drop a
              <a
                href="&#109;&#97;&#105;&#108;&#116;&#111;&#58;yagnik.pavagadhi06@gmail.com"
                target="_blank"
              >
                yagnik.pavagadhi06@gmail.com
              </a>
              <br />
            </span>
          </p>
          <p>This site is best viewed with a cup of hot chocolate.</p>
        </div>
        <div>
          <h2>On the web</h2>
          <a
            class="no-text-decoration"
            href="https://github.com/yagnik-10"
            target="_blank"
            rel="me"
          >
            <img
              class="md-icon pixelated invert-on-hover"
              alt="GitHub"
              src="/icons/github.png"
              loading="lazy"
            />
          </a>
          <a
            class="no-text-decoration"
            href="https://linkedin.com/in/yagnikpavagadhi"
            target="_blank"
            rel="me"
          >
            <img
              class="md-icon pixelated invert-on-hover"
              alt="LinkedIn"
              src="/icons/linkedin.png"
              loading="lazy"
            />
          </a>
        </div>
        ${nobg
          ? ""
          : html`<nebula-animation
              palette="#0ad591 #ff2b75 #ffb833 #0ad591 #0ad591 #4d4aff #0ad591"
              width="40"
              height="10"
            ></nebula-animation>`}
        <a href="#top" aria-label="Back to top">^</a>
      </footer>`;

      const topBtn = this.querySelector("a[href='#top']");
      topBtn.addEventListener("click", (event) => {
        event.preventDefault();
        this.#animateScrollToTop();
      });

      if (this.parentElement === document.body) {
        this.#updatePosition();
        window.addEventListener("resize", () => {
          this.#updatePosition();
        });
        new ResizeObserver(() => {
          this.#updatePosition();
        }).observe(document.body);
      }
    }

    #animateScrollToTop(currentY = Math.min(800, window.scrollY)) {
      currentY *= 0.6;
      window.scrollTo(0, currentY);
      if (currentY < 1) {
        window.scrollTo(0, 0);
      } else {
        requestAnimationFrame(() => this.#animateScrollToTop(currentY));
      }
    }

    #updatePosition() {
      const originalTop =
        this.offsetTop - (this.style.top ? Number.parseInt(this.style.top) : 0);
      const goodTop = window.innerHeight - this.offsetHeight - originalTop;
      if (goodTop > 0) {
        this.style.position = "relative";
        this.style.top = goodTop + "px";
      } else {
        this.style.removeProperty("position");
        this.style.removeProperty("top");
      }
    }
  }
);

const appendStyle = (() => {
  const appendedStyles = new Set();

  return (id, htmlCode) => {
    if (appendedStyles.has(id)) return;
    appendedStyles.add(id);

    const styleElement = document.createElement("style");
    const cssCode = htmlCode.slice("<style>".length, -"</style>".length);
    const indent = cssCode.match(/^\n?([ \t]*)/)[1];
    styleElement.textContent =
      "@layer component {\n" + cssCode.replaceAll(indent, "") + "\n}";
    document.head.appendChild(styleElement);
  };
})();

function debounce(fn, ms = 0) {
  let recentlyFired = false;
  return (...args) => {
    if (recentlyFired) return;
    recentlyFired = true;
    if (ms === 0) {
      requestAnimationFrame(() => (recentlyFired = false));
    } else {
      setTimeout(() => (recentlyFired = false), ms);
    }
    return fn(...args);
  };
}

document.addEventListener("DOMContentLoaded", () => {
  setupAutoLoadComponents();
  setupLQIP();
  
  // Initial update
  updateVisitCount();
  
  // Update every 30 seconds
  setInterval(updateVisitCount, 30000);
});

function autoLoadGlobalComponents() {
  setTimeout(() => {
    import("/components/gh-contribs/gh-contribs.js");
    import("/components/right-now/right-now.js");
    import("/components/bump-tally/bump-tally.js");
    import("/components/now-playing/now-playing.js");
    import("/components/now-reading/now-reading.js");
    import("/components/map-flight/map-flight.js");
    import("/components/nebula-animation/nebula-animation.js");
  }, 0);
}

// Load GoatCounter script
const goatCounterScript = document.createElement('script');
goatCounterScript.setAttribute('data-goatcounter', 'https://yagnik.goatcounter.com/count');
goatCounterScript.async = true;
goatCounterScript.src = '//gc.zgo.at/count.js';
document.head.appendChild(goatCounterScript);

// Function to update visit count
async function updateVisitCount() {
  try {
    // Try to get count from GoatCounter or fall back to simulated count
    try {
      const response = await fetch('https://yagnik.goatcounter.com/counter/TOTAL.json');
      if (response.ok) {
        const data = await response.json();
        const count = data.count.toString().padStart(6, '0');
        updateVisitCountDisplay(count);
        return;
      }
    } catch (e) {
      console.log('Could not fetch from GoatCounter, using fallback');
    }
    
    // Fallback: generate a random count if GoatCounter fails
    const fallbackCount = Math.floor(100000 + Math.random() * 50000).toString();
    updateVisitCountDisplay(fallbackCount);
  } catch (error) {
    console.error('Error updating visit count:', error);
  }
}

// Helper function to update the visit count display
function updateVisitCountDisplay(count) {
  const padded = count.toString().padStart(6, '0');
  const visitCountDiv = document.getElementById('visit-count');
  if (visitCountDiv) {
    const spans = visitCountDiv.getElementsByTagName('span');
    for (let i = 0; i < Math.min(spans.length, padded.length); i++) {
      spans[i].textContent = padded[i] || '0';
    }
  }
}

autoLoadGlobalComponents();
