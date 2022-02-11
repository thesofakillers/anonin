// Put all the javascript code here, that you want to execute in background.

// profile match patterns for LinkedIn
profileMatchPatterns = ["*://*.linkedin.com/in/*"];

// to check whether the correct URL was intercepted
function logURL(requestDetails) {
  console.log("Loading: " + requestDetails.url);
}

// detect if a linkedin profile page is requested and intercept request
browser.webRequest.onBeforeRequest.addListener(
  logURL,
  {
    urls: profileMatchPatterns,
  },
  ["blocking"]
);
