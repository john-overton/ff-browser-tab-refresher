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

// Function to scan page elements
function scanPageElements() {
    console.log('Starting scanPageElements in content.js');
    
    const icons = Array.from(document.querySelectorAll('img, svg, [class*="icon"]')).map(el => ({
        type: 'icon',
        text: el.alt || el.title || el.className,
        xpath: getXPath(el)
    }));
    console.log('Found icons:', icons.length);

    const buttons = Array.from(document.querySelectorAll('button, [role="button"], input[type="button"], input[type="submit"]')).map(el => ({
        type: 'button',
        text: el.textContent || el.value || el.title,
        xpath: getXPath(el)
    }));
    console.log('Found buttons:', buttons.length);

    const links = Array.from(document.querySelectorAll('a')).map(el => ({
        type: 'link',
        text: el.textContent || el.title,
        xpath: getXPath(el)
    }));
    console.log('Found links:', links.length);

    const result = { icons, buttons, links };
    console.log('Returning scanned elements:', result);
    return result;
}

// Function to get XPath of an element
function getXPath(element) {
    if (!element) return '';
    if (element.id) return `//*[@id="${element.id}"]`;
    
    const parts = [];
    while (element && element.nodeType === Node.ELEMENT_NODE) {
        let siblings = Array.from(element.parentNode.children).filter(e => e.tagName === element.tagName);
        if (siblings.length > 1) {
            const index = siblings.indexOf(element) + 1;
            parts.unshift(`${element.tagName.toLowerCase()}[${index}]`);
        } else {
            parts.unshift(element.tagName.toLowerCase());
        }
        element = element.parentNode;
    }
    return `/${parts.join('/')}`;
}

// Function to highlight element
function highlightElement(xpath) {
    // Remove any existing highlight
    const existing = document.querySelector('.element-highlight');
    if (existing) existing.remove();

    const element = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
    if (!element) return;

    const highlight = document.createElement('div');
    highlight.className = 'element-highlight';
    const rect = element.getBoundingClientRect();
    
    highlight.style.cssText = `
        position: fixed;
        border: 2px solid #ff4081;
        background-color: rgba(255, 64, 129, 0.2);
        pointer-events: none;
        z-index: 10000;
        transition: all 0.2s ease-in-out;
        top: ${rect.top + window.scrollY}px;
        left: ${rect.left + window.scrollX}px;
        width: ${rect.width}px;
        height: ${rect.height}px;
    `;
    
    document.body.appendChild(highlight);
}

// Listen for messages from background script
browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'updateTimer') {
    updateTimer(message.nextRefresh);
  }
});

// Listen for messages from popup
console.log('Setting up content script message listener');
browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('Received message in content script:', message);
    
    if (message.action === 'scanElements') {
        console.log('Handling scanElements action');
        const elements = scanPageElements();
        console.log('Sending response back to popup');
        sendResponse(elements);
    } else if (message.action === 'highlightElement') {
        console.log('Handling highlightElement action:', message.xpath);
        highlightElement(message.xpath);
        sendResponse(true);
    } else if (message.action === 'removeHighlight') {
        console.log('Handling removeHighlight action');
        const highlight = document.querySelector('.element-highlight');
        if (highlight) highlight.remove();
        sendResponse(true);
    }
    return true; // Required for async response
});
