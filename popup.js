document.addEventListener('DOMContentLoaded', () => {
  // Tab switching functionality
  const tabButtons = document.querySelectorAll('.tab-button');
  const tabContents = document.querySelectorAll('.tab-content');

  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      const tabName = button.dataset.tab;
      
      tabButtons.forEach(btn => btn.classList.remove('active'));
      tabContents.forEach(content => content.classList.remove('active'));
      
      button.classList.add('active');
      document.getElementById(`${tabName}-tab`).classList.add('active');
    });
  });

  // Refresh functionality
  const startRefreshButton = document.getElementById('start-refresh');
  startRefreshButton.addEventListener('click', async () => {
    const interval = document.getElementById('refresh-interval').value;
    const tab = await getCurrentTab();
    
    browser.runtime.sendMessage({
      action: 'startRefresh',
      tabId: tab.id,
      interval: parseInt(interval) * 1000
    });
    
    updateJobsList();
  });

  // Navigation steps functionality
  const addStepButton = document.getElementById('add-step');
  const stepsContainer = document.getElementById('steps-container');
  let stepCount = 0;

  addStepButton.addEventListener('click', () => {
    const stepItem = document.createElement('div');
    stepItem.className = 'step-item';
    stepItem.innerHTML = `
      <div class="input-group">
        <label>Step ${stepCount + 1}</label>
        <input type="text" class="selector-input" placeholder="CSS Selector or XPath">
        <input type="number" class="delay-input" placeholder="Delay (ms)" value="1000">
      </div>
    `;
    stepsContainer.appendChild(stepItem);
    stepCount++;
  });

  const saveStepsButton = document.getElementById('save-steps');
  saveStepsButton.addEventListener('click', async () => {
    const steps = [];
    const stepItems = document.querySelectorAll('.step-item');
    
    stepItems.forEach((item, index) => {
      steps.push({
        selector: item.querySelector('.selector-input').value,
        delay: parseInt(item.querySelector('.delay-input').value),
        order: index
      });
    });

    const tab = await getCurrentTab();
    browser.runtime.sendMessage({
      action: 'saveNavigationSteps',
      tabId: tab.id,
      steps
    });
  });

  // Element scanning and display functionality
  console.log('Setting up scan-elements button listener');
  const scanButton = document.getElementById('scan-elements');
  if (scanButton) {
    scanButton.addEventListener('click', () => {
      console.log('Scan elements button clicked');
      scanPageElements();
    });
  } else {
    console.error('scan-elements button not found in DOM');
  }

  // Initialize jobs list
  updateJobsList();
});

// Helper functions
async function getCurrentTab() {
  const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
  return tab;
}

async function updateJobsList() {
  const jobs = await browser.runtime.sendMessage({ action: 'getJobs' });
  const jobsList = document.getElementById('active-jobs');
  jobsList.innerHTML = '';

  Object.entries(jobs).forEach(([tabId, job]) => {
    const jobItem = document.createElement('div');
    jobItem.className = 'job-item';
    jobItem.innerHTML = `
      <div>
        <strong>${job.title}</strong>
        <div>Interval: ${job.interval / 1000}s</div>
      </div>
      <button class="secondary-button stop-job" data-tab-id="${tabId}">Stop</button>
    `;
    jobsList.appendChild(jobItem);
  });

  // Add stop functionality
  document.querySelectorAll('.stop-job').forEach(button => {
    button.addEventListener('click', () => {
      const tabId = parseInt(button.dataset.tabId);
      browser.runtime.sendMessage({
        action: 'stopRefresh',
        tabId
      });
      updateJobsList();
    });
  });
}

// Function to scan elements in the active tab
async function scanPageElements() {
  console.log('Starting scanPageElements in popup.js');
  try {
    const tab = await getCurrentTab();
    console.log('Current tab:', tab);
    
    console.log('Sending scanElements message to content script');
    const elements = await browser.tabs.sendMessage(tab.id, { action: 'scanElements' });
    console.log('Received elements from content script:', elements);
    
    displayElements(elements);
  } catch (error) {
    console.error('Error in scanPageElements:', error);
  }
}

// Function to display scanned elements
function displayElements(elements) {
  console.log('Starting displayElements with:', elements);
  const container = document.getElementById('elements-list');
  if (!container) {
    console.error('elements-list container not found in DOM');
    return;
  }

  container.innerHTML = '';
  
  // Create sections for each element type
  const sections = {
    icons: createSection('Icons', elements.icons),
    buttons: createSection('Buttons', elements.buttons),
    links: createSection('Links', elements.links)
  };
  console.log('Created sections:', Object.keys(sections));

  Object.values(sections).forEach(section => {
    if (section.querySelector('.elements-group').children.length > 0) {
      container.appendChild(section);
    }
  });
  console.log('Finished displaying elements');
}

// Create a section for element type
function createSection(title, elements) {
  const section = document.createElement('div');
  section.className = 'elements-section';
  
  const header = document.createElement('h3');
  header.textContent = title;
  section.appendChild(header);
  
  const group = document.createElement('div');
  group.className = 'elements-group';
  
  elements.forEach(el => {
    const item = document.createElement('div');
    item.className = 'element-item';
    item.textContent = el.text || '(No text)';
    
    item.addEventListener('mouseover', async () => {
      const tab = await getCurrentTab();
      browser.tabs.sendMessage(tab.id, {
        action: 'highlightElement',
        xpath: el.xpath
      });
    });
    
    item.addEventListener('mouseout', async () => {
      const tab = await getCurrentTab();
      browser.tabs.sendMessage(tab.id, {
        action: 'removeHighlight'
      });
    });
    
    item.addEventListener('click', () => {
      const stepsContainer = document.getElementById('steps-container');
      if (stepsContainer) {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.value = el.xpath;
        input.dataset.elementType = el.type;
        stepsContainer.appendChild(input);
        // Update UI to show selected element
        updateSelectedElements();
      }
    });
    
    group.appendChild(item);
  });
  
  section.appendChild(group);
  return section;
}

// Update UI to show selected elements
function updateSelectedElements() {
  // TO DO: implement this function
}