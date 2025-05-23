customElements.define(
  "article-reactions",
  class ArticleReactions extends HTMLElement {
    constructor() {
      super();

      this.classList.add("reactions-invisible");

      this.innerHTML = html`
        <h2 class="reaction-title">React to this post</h2>
        <button class="reaction-btn reaction-heart-btn">
          <span class="reaction-icon" aria-label="Heart"></span>
        </button>
        <div class="reaction-count reaction-heart-count"></div>
        <button class="reaction-btn reaction-fire-btn">
          <span class="reaction-icon" aria-label="Fire"></span>
        </button>
        <div class="reaction-count reaction-fire-count"></div>
        <button class="reaction-btn reaction-bubble-btn">
          <span class="reaction-icon" aria-label="Bubble"></span>
        </button>
        <div class="reaction-count reaction-bubble-count"></div>
        <button class="reaction-btn reaction-sun-btn">
          <span class="reaction-icon" aria-label="Sun"></span>
        </button>
        <div class="reaction-count reaction-sun-count"></div>
        <button class="reaction-btn reaction-cloud-btn">
          <span class="reaction-icon" aria-label="Cloud"></span>
        </button>
        <div class="reaction-count reaction-cloud-count"></div>
        <div class="reaction-error"></div>
      `;

      appendStyle(
        this.tagName,
        html`<style>
          article-reactions {
            display: grid;
            margin-inline: auto;
            grid-template-rows: repeat(3, auto);
            grid-auto-flow: column;
            justify-content: center;
            justify-items: center;
            gap: 6px;
            border: solid 1px var(--card-clr);
            border-radius: 6px;
            padding: 18px;
            font-family: var(--default-font);
          }

          .reaction-title {
            grid-column: span 5;
            margin: 0 0 6px;
            font-size: 18px;
          }

          .reaction-title-error {
            color: var(--clr1);
          }

          .reaction-heart-btn,
          .reaction-heart-count {
            --reaction-color: #bf1852;
          }
          .reaction-fire-btn,
          .reaction-fire-count {
            --reaction-color: #c68306;
          }
          .reaction-bubble-btn,
          .reaction-bubble-count {
            --reaction-color: #07bd80;
          }
          .reaction-sun-btn,
          .reaction-sun-count {
            --reaction-color: #a09b00;
          }
          .reaction-cloud-btn,
          .reaction-cloud-count {
            --reaction-color: #8063ff;
          }

          .reaction-count {
            position: relative;
            font-size: 18px;
            width: 100%;
            height: 18px;
            text-align: center;
            overflow: hidden;
          }
          .reaction-count-prev,
          .reaction-count-next {
            position: relative;
            height: 100%;
            animation: reaction-tick 0.3s var(--ease) forwards;
          }

          @keyframes reaction-tick {
            from {
              top: 0;
            }
            to {
              top: -100%;
            }
          }

          .reaction-count.reaction-spark::after {
            position: absolute;
            content: "";
            width: 36px;
            height: 36px;
            left: calc(50% - 18px);
            top: calc(100% - 18px);
            border-radius: 50%;
            animation: reaction-spark 0.1s ease-out;
          }

          @keyframes reaction-spark {
            from {
              box-shadow: inset 0 0 0 18px var(--reaction-color);
            }
            to {
              box-shadow: inset 0 0 0 0px var(--reaction-color);
            }
          }

          .reaction-btn {
            background: none;
            border: none;
            border-radius: 6px;
            width: 32px;
            height: 32px;
            padding: 2px;
            box-sizing: content-box;
            cursor: pointer;
          }
          .reaction-btn:focus-visible,
          .reaction-btn:hover {
            background: var(--reaction-color);
          }
          .reaction-btn:focus-visible .reaction-icon,
          .reaction-btn:hover .reaction-icon {
            animation-duration: 0.5s;
          }
          .reaction-btn:active .reaction-icon {
            position: relative;
            top: 2px;
          }

          .reaction-icon {
            display: block;
            width: 100%;
            height: 100%;
            image-rendering: pixelated;
            background-image: url("/icons/reactions.png");
            background-size: 500% 200%;
            animation: reaction-icon 1.5s steps(2) infinite;
          }
          .reactions-invisible .reaction-icon {
            background-image: none;
          }
          .reaction-heart-btn .reaction-icon {
            --sheet-x: 25%;
          }
          .reaction-bubble-btn .reaction-icon {
            --sheet-x: 0%;
          }
          .reaction-sun-btn .reaction-icon {
            --sheet-x: 100%;
          }
          .reaction-cloud-btn .reaction-icon {
            --sheet-x: 75%;
          }
          .reaction-fire-btn .reaction-icon {
            --sheet-x: 50%;
          }

          @keyframes reaction-icon {
            0% {
              background-position: var(--sheet-x) 0%;
            }
            100% {
              background-position: var(--sheet-x) 200%;
            }
          }
        </style>`
      );

      this.initIntersectionObserver();
    }

    initIntersectionObserver() {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(async (entry) => {
          if (entry.isIntersecting) {
            this.start();
          }
        });
      });

      observer.observe(this);
    }

    start() {
      if (this.hasInit) return;
      this.hasInit = true;

      this.classList.remove("reactions-invisible");

      const loadedData = this.loadData();

      for (const type of reactionTypes) {
        const increment = async () => {
          if (!(await loadedData)) return;

          window.goatcounter.count(eventVars(type));
          reactionData[type]++;

          this.renderCount(type, reactionData[type]);
        };

        for (const button of this.querySelectorAll(`.reaction-${type}-btn`)) {
          button.addEventListener("click", increment);
        }
      }
    }

    renderCount(type, content) {
      const countElements = this.querySelectorAll(`.reaction-${type}-count`);
      for (const countElement of countElements) {
        const prev =
          countElement.querySelector(".reaction-count-next")?.textContent ??
          countElement.textContent;

        countElement.innerHTML =
          `<div class="reaction-count-prev">${prev}</div>` +
          `<div class="reaction-count-next">${content}</div>`;

        countElement.addEventListener(
          "animationend",
          async () => {
            if (
              !countElement
                .getAnimations({ subtree: true })
                .every((animation) => animation.finished)
            ) {
              return;
            }

            countElement.textContent = content;

            if (
              !Number.isNaN(parseInt(prev)) &&
              !Number.isNaN(parseInt(content))
            ) {
              countElement.classList.add("reaction-spark");
              await delay(200);
              countElement.classList.remove("reaction-spark");
            }
          },
          { once: true }
        );
      }
    }

    // todo: prerender counts so they don't depend on the client lib
    async loadData() {
      const timeout = Symbol();
      try {
        await Promise.race([
          waitFor(() => window.goatcounter?.count != null),
          delay(8000).finally(() => {
            throw timeout;
          }),
        ]);
        await Promise.all(
          reactionTypes.map(async (type, i) => {
            this.renderCount(type, "");

            await delay(Math.random() * 2000);

            const eventURL = window.goatcounter.url(eventVars(type));
            const pagePath = new URL(eventURL).searchParams.get("p");
            if (!pagePath) throw new Error("Invalid eventURL!");

            const url = new URL(pagePath, "https://yagnikpavagadhi.com");
            const hits = await getHits(url.toString());
            reactionData[type] = hits;

            this.renderCount(type, hits > 0 ? hits : "");
          })
        );
        return true;
      } catch (error) {
        if (error !== timeout) throw error;

        for (const type of reactionTypes) {
          this.renderCount(type, "-");
        }

        const title = this.querySelector(".reaction-title");
        title.classList.add("reaction-title-error");
        title.textContent = "Couldn't load reactions :(";

        return false;
      }
    }
  }
);

const reactionTypes = ["bubble", "heart", "sun", "cloud", "fire"];
const reactionData = {};

async function getHits(pagePath) {
  try {
    const res = await fetch(
      `https://kalabasa.goatcounter.com/counter/${pagePath}.json`,
      { mode: "cors" }
    );
    const data = await res.json();
    return parseInt(data.count.replaceAll(/\D/g, ""));
  } catch (err) {
    return 0;
  }
}

// returns goatcounter vars object
function eventVars(reactionType) {
  return {
    path: (p) => eventName(p, reactionType),
    referrer: (p) => p,
    event: true,
  };
}

function eventName(pagePath, reactionType) {
  const url = new URL(pagePath, "https://yagnikpavagadhi.com");
  const id = url.pathname;
  return `reaction-${reactionType}-${id}`;
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function waitFor(condition) {
  return new Promise((resolve) => {
    const interval = setInterval(() => {
      if (condition()) {
        clearInterval(interval);
        resolve(true);
      }
    }, 100);
  });
}
