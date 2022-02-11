// Put all the javascript code here, that you want to execute in background.

// profile match patterns for LinkedIn
profileMatchPatterns = ["*://*.linkedin.com/in/*"];
targetURL = "https://www.linkedin.com/psettings/profile-visibility";

// to check whether the correct URL was intercepted
function logURL(requestDetails) {
  console.log("Loading: " + requestDetails.url);
}

function redirectToVis(requestDetails) {
  console.log("Redirecting to profile visibility page");
  if (requestDetails.url === targetURL) {
    // if we were already headed there for some reason
    console.log("FUCK");
    return;
  }
  return { redirectUrl: targetURL };
}

// detect if a linkedin profile page is requested and intercept request
browser.webRequest.onBeforeRequest.addListener(
  redirectToVis,
  {
    urls: profileMatchPatterns,
  },
  ["blocking"]
);
