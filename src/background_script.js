// Put all the javascript code here, that you want to execute in background.

// variables {{{

// profile match patterns for LinkedIn
var profileMatchPatterns = ["*://*.linkedin.com/in/*"];
var targetURL = "https://www.linkedin.com/psettings/profile-visibility";
// state
var longState = {
  desiredProfile: "",
  originalProfileVisibility: "",
};
// }}}

// functions {{{

/* redirects to profile visbility page */
function redirectToVis() {
  console.log("Redirecting to profile visibility page");
  return { redirectUrl: targetURL };
}

/* Performs the whole process of the extension */
function handleProfileRequest(requestDetails) {
  // store the original desired profile
  longState.desiredProfile = requestDetails.url;
  // then redirect
  return redirectToVis();
}

// when the linkedin profile visibility page is loaded, handle
function handleProfileVisibility() {
  // inject content script only if request was made by the extension
  if (longState.desiredProfile != "") {
    browser.tabs.executeScript({ file: "browser-polyfill.min.js" });
    browser.tabs.executeScript({
      file: "content_script.js",
    });
  }
}
// }}}

// listeners {{{

// detect if a linkedin profile page is requested and intercept request
browser.webRequest.onBeforeRequest.addListener(
  handleProfileRequest,
  {
    urls: profileMatchPatterns,
  },
  ["blocking"]
);
// detect that we're visiting the profile visibility page
browser.webRequest.onCompleted.addListener(handleProfileVisibility, {
  urls: [targetURL],
});
// listen to messages from content script
// }}}
