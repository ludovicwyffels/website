function switchTab(tabGroup, tabId) {
  allTabItems = document.querySelectorAll('[data-tab-group="' + tabGroup + '"]')
  targetTabItems = document.querySelectorAll('[data-tab-group="' + tabGroup + '"][data-tab-item="' + tabId + '"]');

  // Display only active content
  const activeTabNav = document.querySelectorAll('button[data-tab-group="' + tabGroup + '"][data-tab-item="' + tabId + '"]');
  const activeTabDiv = document.querySelectorAll('div[data-tab-group="' + tabGroup + '"][data-tab-item="' + tabId + '"]');

  const allTabNav = document.querySelectorAll('button[data-tab-group="' + tabGroup + '"]');
  const allTabDiv = document.querySelectorAll('div[data-tab-group="' + tabGroup + '"]');

  allTabDiv.forEach(function (tabDiv) {
    tabDiv.classList.add('hidden')
  });
  activeTabDiv.forEach(function(activeTabDiv) {
    activeTabDiv.classList.remove('hidden')
  });

  allTabNav.forEach(function (tabNav) {
    tabNav.classList.remove('active', 'focus')
  });
  activeTabNav.forEach(function(activeTabNav) {
    activeTabNav.classList.add('active', 'focus')
    // activeTabNav.style.cssText = 'background-color: '
  });

  const activeTabElements = [
    // active tab title
    ...document.querySelectorAll('div.tabs > ul.tab-buttons > li[data-tab-group="' + tabGroup + '"][data-tab-item="' + tabId + '"]'),
    // active tab content
    ...document.querySelectorAll('div.tabs > div.tab-content > div[data-tab-group="' + tabGroup + '"][data-tab-item="' + tabId + '"]')
  ];

  const allTabElements = [
    // all tab title
    ...document.querySelectorAll('div.tabs > ul.tab-buttons > li[data-tab-group="' + tabGroup + '"]'),
    // all tab content
    ...document.querySelectorAll('div.tabs > div.tab-content > div[data-tab-group="' + tabGroup + '"]')
  ];

  allTabElements.forEach(function (el) {
    el.classList.remove('is-active');
  });

  activeTabElements.forEach(function (el) {
    el.classList.add('is-active');
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const allTabPanel = [
    // ...document.querySelectorAll('.tab-panel'),
    ...document.querySelectorAll('div.tabs')
  ];
  allTabPanel.forEach(tabPanel => {
    const allTabTitle = [
      // ...tabPanel.querySelectorAll('.tab-nav > div[role="presentation"] > button[role="tab"]'),
      ...tabPanel.querySelectorAll('div.tabs > ul.tab-buttons > li.tab-button')
    ];
    
    console.log('allTabTitle', allTabTitle)
    const tabId = allTabTitle[0].attributes['data-tab-item'].value
    const tabGroup = allTabTitle[0].attributes['data-tab-group'].value
    switchTab(tabGroup, tabId)
  })
});
