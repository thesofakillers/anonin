// Put all the javascript code here, that you want to execute in background.

// profile match patterns for LinkedIn
profileMatchPatterns = ["*://*.linkedin.com/in/*"];
targetURL = "https://www.linkedin.com/psettings/profile-visibility";
// state
longState = {
  desiredProfile: "",
  originalProfileVisibility: "",
};

function redirectToVis() {
  console.log("Redirecting to profile visibility page");
  return { redirectUrl: targetURL };
}

// fucntion docstring below
/**
 Performs the whole process of extension
 **/
function doPipeline(requestDetails) {
  // store the original desired profile
  longState.desiredProfile = requestDetails.url;
  // then redirect
  return redirectToVis();
}

// detect if a linkedin profile page is requested and intercept request
browser.webRequest.onBeforeRequest.addListener(
  doPipeline,
  {
    urls: profileMatchPatterns,
  },
  ["blocking"]
);
