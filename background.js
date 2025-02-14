// Store active jobs
const activeJobs = new Map();

// Handle messages from popup and content scripts
browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.action) {
    case 'startRefresh':
      startTabRefresh(message.tabId, message.interval);
      break;
    case 'stopRefresh':
      stopTabRefresh(message.tabId);
      break;
    case 'saveNavigationSteps':
      saveNavigationSteps(message.tabId, message.steps);
      break;
    case 'getJobs':
      return Promise.resolve(getActiveJobs());
  }
});

// Start refreshing a tab
async function startTabRefresh(tabId, interval) {
  if (activeJobs.has(tabId)) {
    clearInterval(activeJobs.get(tabId).intervalId);
  }

  try {
    const tab = await browser.tabs.get(tabId);
    const intervalId = setInterval(() => {
      browser.tabs.reload(tabId);
    }, interval);

    activeJobs.set(tabId, {
      intervalId,
      interval,
      title: tab.title || 'Unknown Tab',
      url: tab.url
    });
  } catch (error) {
    console.error('Error starting tab refresh:', error);
  }
}

// Stop refreshing a tab
function stopTabRefresh(tabId) {
  if (activeJobs.has(tabId)) {
    clearInterval(activeJobs.get(tabId).intervalId);
    activeJobs.delete(tabId);
  }
}

// Save navigation steps for a tab
async function saveNavigationSteps(tabId, steps) {
  await browser.storage.local.set({ [`navigation_steps_${tabId}`]: steps });
  await browser.scripting.executeScript({
    target: { tabId },
    func: executeNavigationSteps,
    args: [steps]
  });
}

// Get all active jobs
function getActiveJobs() {
  const jobs = {};
  activeJobs.forEach((value, key) => {
    jobs[key] = {
      interval: value.interval,
      title: value.title,
      url: value.url
    };
  });
  return jobs;
}

// Clean up when a tab is closed
browser.tabs.onRemoved.addListener((tabId) => {
  stopTabRefresh(tabId);
});
