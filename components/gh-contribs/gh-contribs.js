(() => {
  customElements.define(
    "gh-contribs",
    class GithubContribs extends HTMLElement {
      constructor() {
        super();
        this.#load();
        appendStyle(
          this.tagName,
          html`<style>
            gh-contribs {
              display: grid;
              grid-auto-flow: column;
              grid-template-rows: repeat(7, auto);
              gap: 12px;
            }
            gh-contribs div {
              position: relative;
              width: 18px;
              height: 18px;
              border-radius: 2px;
              box-sizing: border-box;
              background: #222c2c;
              color: transparent;
              overflow: hidden;
              user-select: none;
            }
            gh-contribs div::after {
              content: "";
              position: absolute;
              inset: 0;
              background: var(--clr0-light, #54f8c1);
            }
            gh-contribs div[data-level="0"]::after {
              opacity: 0;
            }
            gh-contribs div[data-level="1"]::after {
              opacity: 0.3;
            }
            gh-contribs div[data-level="2"]::after {
              opacity: 0.6;
            }
            gh-contribs div[data-level="3"]::after {
              opacity: 1;
            }
          </style>`
        );
      }

      async #load() {
        try {
          // Fetch the last 5 weeks of contributions from GitHub API
          const response = await fetch('https://api.github.com/users/yagnik-10/events');
          const events = await response.json();
          
          // Process events into a heatmap
          const weeks = Array(5).fill().map(() => Array(7).fill(0));
          const now = new Date();
          const msPerDay = 24 * 60 * 60 * 1000;
          
          events.forEach(event => {
            if (['PushEvent', 'CreateEvent', 'PullRequestEvent'].includes(event.type)) {
              const date = new Date(event.created_at);
              const daysDiff = Math.floor((now - date) / msPerDay);
              if (daysDiff < 35) { // Last 5 weeks
                const week = Math.floor(daysDiff / 7);
                const day = date.getDay();
                if (week < 5) {
                  weeks[week][day]++;
                  // Cap at level 3
                  if (weeks[week][day] > 3) weeks[week][day] = 3;
                }
              }
            }
          });

          // Generate HTML
          let htmlString = "";
          for (const col of weeks) {
            for (const level of col) {
              htmlString += html`<div data-level="${level}">${level}</div>`;
            }
          }
          this.innerHTML = htmlString;
        } catch (error) {
          console.error('Error fetching GitHub contributions:', error);
          // Fallback to empty grid
          let htmlString = "";
          for (let i = 0; i < 35; i++) {
            htmlString += html`<div data-level="0">0</div>`;
          }
          this.innerHTML = htmlString;
        }
      }
    }
  );
})();
