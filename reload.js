// Local time updater
window.addEventListener('load', function() {
  // Update the static local time display
  const updateLocalTime = () => {
    const now = new Date();
    const hour = now.getHours();
    
    // Update time text
    const timeString = now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
    
    // Find the local time element in the bento section
    const timeElement = document.querySelector('.bento-section [style*="local time"]');
    if (timeElement) {
      timeElement.textContent = `my local time is ${timeString}`;
    }
    
    // Update status based on time - using Boston time schedule
    const statusElement = document.querySelector('.bento-section [style*="right now"]');
    const emojiElement = statusElement?.parentElement.querySelector('div[style*="font-size: 48px"]');
    
    if (statusElement && emojiElement) {
      let statusText;
      let emoji;
      
      if (hour < 6) {
        statusText = "right now, i'm sleeping";
        emoji = "💤";
      } else if (hour < 9) {
        statusText = "right now, i'm starting the day";
        emoji = "🌅";
      } else if (hour < 12) {
        statusText = "right now, i'm coding";
        emoji = "💻";
      } else if (hour < 13) {
        statusText = "right now, i'm having lunch";
        emoji = "🍜";
      } else if (hour < 17) {
        statusText = "right now, i'm studying at NEU";
        emoji = "🎓";
      } else if (hour < 19) {
        statusText = "right now, i'm playing soccer";
        emoji = "⚽";
      } else if (hour < 20) {
        statusText = "right now, i'm having dinner";
        emoji = "🍽️";
      } else if (hour < 23) {
        statusText = "right now, i'm gaming";
        emoji = "🎮";
      } else {
        statusText = "right now, i'm winding down";
        emoji = "📚";
      }
      
      statusElement.textContent = statusText;
      emojiElement.textContent = emoji;
    }
  };
  
  // Update time immediately and then every minute
  updateLocalTime();
  setInterval(updateLocalTime, 60000);
}); 