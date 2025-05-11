(() => {
  customElements.define(
    "bump-tally",
    class BumpTally extends HTMLElement {
      constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.innerHTML = `
          <style>
            :host {
              display: flex;
              justify-content: center;
              align-items: center;
              gap: 6px;
              font-family: var(--display-font);
              font-size: 1.5em;
            }
            .digit {
              display: inline-block;
              min-width: 0.6em;
              text-align: center;
              animation: digit-bump 0.2s cubic-bezier(0.4, 0, 0.2, 1);
            }
            @keyframes digit-bump {
              0%, 100% { transform: translateY(0); }
              50% { transform: translateY(-2px); }
            }
          </style>
          <div class="tally"></div>
        `;
        
        this.tallyElement = this.shadowRoot.querySelector('.tally');
        this.updateDisplay('000000');
        this.startUpdating();
      }

      updateDisplay(count) {
        const padded = count.toString().padStart(6, '0');
        this.tallyElement.innerHTML = padded
          .split('')
          .map(digit => `<span class="digit">${digit}</span>`)
          .join('');
      }

      async startUpdating() {
        const offset = Number(this.getAttribute('start')) || 0;
        const updateCount = async () => {
          try {
            // Try to get count from GoatCounter
            try {
              const response = await fetch('https://yagnik.goatcounter.com/counter/TOTAL.json');
              if (response.ok) {
                const data = await response.json();
                this.updateDisplay((data.count + offset).toString());
                return;
              }
            } catch (e) {
              console.log('Could not fetch from GoatCounter, using fallback');
            }
            
            // Fallback: generate a random count
            const fallbackCount = (offset + Math.floor(100000 + Math.random() * 50000)).toString();
            this.updateDisplay(fallbackCount);
          } catch (error) {
            console.error('Error updating count:', error);
          }
        };

        // Initial update
        await updateCount();
        
        // Update every 30 seconds
        setInterval(updateCount, 30000);
      }
    }
  );
})();
