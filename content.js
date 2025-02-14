// Create and inject the floating timer
const timer = document.createElement('div');
timer.id = 'tab-refresher-timer';
timer.style.cssText = `
  position: fixed;
  top: 20px;
  right: 20px;
  background-color: rgba(87, 175, 235, 0.9);
  color: white;
  padding: 8px 12px;
  border-radius: 4px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-size: 14px;
  z-index: 10000;
  cursor: move;
  user-select: none;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
`;
document.body.appendChild(timer);

// Make timer draggable
let isDragging = false;
let currentX;
let currentY;
let initialX;
let initialY;
let xOffset = 0;
let yOffset = 0;

timer.addEventListener('mousedown', dragStart);
document.addEventListener('mousemove', drag);
document.addEventListener('mouseup', dragEnd);

function dragStart(e) {
  initialX = e.clientX - xOffset;
  initialY = e.clientY - yOffset;
  if (e.target === timer) {
    isDragging = true;
  }
}

function drag(e) {
  if (isDragging) {
    e.preventDefault();
    currentX = e.clientX - initialX;
    currentY = e.clientY - initialY;
    xOffset = currentX;
    yOffset = currentY;
    setTranslate(currentX, currentY, timer);
  }
}

function dragEnd() {
  initialX = currentX;
  initialY = currentY;
  isDragging = false;
}

function setTranslate(xPos, yPos, el) {
  el.style.transform = `translate3d(${xPos}px, ${yPos}px, 0)`;
}

// Handle navigation steps
async function executeNavigationSteps(steps) {
  for (const step of steps) {
    try {
      // Try CSS selector first
      let element = document.querySelector(step.selector);
      
      // If not found, try XPath
      if (!element) {
        const xpathResult = document.evaluate(
          step.selector,
          document,
          null,
          XPathResult.FIRST_ORDERED_NODE_TYPE,
          null
        );
        element = xpathResult.singleNodeValue;
      }

      if (element) {
        // Wait for specified delay
        await new Promise(resolve => setTimeout(resolve, step.delay));
        
        // Scroll element into view
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Click the element
        element.click();
      } else {
        console.warn(`Element not found for selector: ${step.selector}`);
      }
    } catch (error) {
      console.error(`Error executing navigation step: ${error.message}`);
    }
  }
}

// Update timer display
function updateTimer(nextRefresh) {
  if (!nextRefresh) {
    timer.style.display = 'none';
    return;
  }

  timer.style.display = 'block';
  const now = Date.now();
  const timeLeft = Math.max(0, nextRefresh - now);
  const seconds = Math.floor(timeLeft / 1000);
  const minutes = Math.floor(seconds / 60);
  
  timer.textContent = `Next refresh in: ${minutes}m ${seconds % 60}s`;
}

// Listen for messages from background script
browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'updateTimer') {
    updateTimer(message.nextRefresh);
  }
});
