(() => {
  customElements.define(
    "right-now",
    class RightNow extends HTMLElement {
      constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.innerHTML = `
          <style>
            :host {
              display: block;
              font-family: var(--display-font);
              text-align: center;
            }
            .emoji {
              font-size: 48px;
              min-height: 48px;
              margin-bottom: 12px;
            }
            .status, .time {
              margin-top: 12px;
              min-height: 18px;
            }
            .time {
              font-size: 1.1em;
            }
          </style>
          <div class="emoji"></div>
          <div class="status"></div>
          <div class="time"></div>
        `;
        
        this.emojiElement = this.shadowRoot.querySelector('.emoji');
        this.statusElement = this.shadowRoot.querySelector('.status');
        this.timeElement = this.shadowRoot.querySelector('.time');
        
        this.updateDisplay();
        setInterval(() => this.updateDisplay(), 60000);
      }

      getStatus(hour) {
        // Status messages for Boston timezone
        if (hour < 6) return { emoji: '💤', text: 'sleeping' };
        if (hour < 9) return { emoji: '🌅', text: 'starting the day' };
        if (hour < 12) return { emoji: '💻', text: 'coding' };
        if (hour < 13) return { emoji: '🍜', text: 'lunch break' };
        if (hour < 17) return { emoji: '🎓', text: 'studying at NEU' };
        if (hour < 19) return { emoji: '⚽', text: 'playing soccer' };
        if (hour < 20) return { emoji: '🍽️', text: 'dinner time' };
        if (hour < 23) return { emoji: '🎮', text: 'gaming' };
        return { emoji: '📚', text: 'winding down' };
      }

      updateDisplay() {
        // Use Boston timezone (Eastern Time)
        const now = new Date();
        // No need to adjust for Boston time as the local browser time should reflect the user's location
        const hour = now.getHours();
        const status = this.getStatus(hour);
        
        this.emojiElement.textContent = status.emoji;
        this.statusElement.textContent = status.text;
        this.timeElement.textContent = `my local time is ${now.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        })}`;
      }

      #isDST(date) {
        // DST in the US starts on the second Sunday in March and ends on the first Sunday in November
        const year = date.getUTCFullYear();
        const dstStart = new Date(year, 2, 14 - (new Date(year, 2, 14).getDay())); // Second Sunday in March
        const dstEnd = new Date(year, 10, 7 - (new Date(year, 10, 7).getDay())); // First Sunday in November
        return date >= dstStart && date < dstEnd;
      }
    }
  );

  function getRightNowText() {
    if (Math.random() < 0.9) return "right now, i'm ";
    if (Math.random() < 0.3) return "at this very moment, i am ";
    return "currently ";
  }

  function getEatingText() {
    if (Math.random() < 0.9) return "eating.";
    if (Math.random() < 0.4) return "ingesting sustenance.";
    if (Math.random() < 0.2) return "consuming food.";
    return "fooding.";
  }

  function getCodingText() {
    if (Math.random() < 0.7) return "coding on personal projects.";
    const list = [
      "working on my portfolio.",
      "learning new technologies.",
      "building something cool.",
      "practicing my coding skills.",
      "exploring new frameworks.",
      "debugging my projects.",
    ];
    return list[Math.floor(Math.random() * list.length)];
  }

  function getJobSearchText() {
    if (Math.random() < 0.7) return "looking for exciting opportunities.";
    const list = [
      "exploring job opportunities.",
      "polishing my resume.",
      "preparing for interviews.",
      "networking with professionals.",
      "researching companies.",
      "applying to dream jobs.",
    ];
    return list[Math.floor(Math.random() * list.length)];
  }

  function getSleepingText() {
    if (Math.random() < 0.8) return "sleeping...";
    if (Math.random() < 0.4) return "slumbering...";
    if (Math.random() < 0.2) return "having a good sleep...";
    return "not awake...";
  }

  function getLeisureText() {
    if (Math.random() < 0.9) return "relaxing and gaming.";
    const list = [
      "playing FIFA.",
      "watching tech videos.",
      "reading tech blogs.",
      "chatting with friends.",
      "planning new projects.",
      "browsing Reddit.",
    ];
    return list[Math.floor(Math.random() * list.length)];
  }

  function getGrassText() {
    if (Math.random() < 0.8) return "touching some grass...";
    if (Math.random() < 0.6) return "taking in some fresh air.";
    return "probably outside.";
  }

  function getWhateverText() {
    if (Math.random() < 0.6) return "doing whatever.";
    if (Math.random() < 0.5) return "doing whatever I want.";
    return "either doing or not doing anything.";
  }
})();
