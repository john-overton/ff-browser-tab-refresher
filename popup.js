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