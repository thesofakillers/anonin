// Put all the javascript code here, that you want to execute in background.

// variables {{{

// profile match patterns for LinkedIn
var profileURL = "*://*.linkedin.com/in/*";
var profileURLRegex = "^[^:]*:(?://)?(?:[^/]*\\.)?linkedin\\.com/in/.*$";
var visibilityURL = "https://www.linkedin.com/psettings/profile-visibility";
// state
var longState = {
  // whether we've set the visibility to private
  setVisibility: false,
  // the profile we want to navigate to after setting visibility to private
  desiredProfile: "",
  // the original visibility of the profile
  originalProfileVisibility: "",
};
// }}}

// functions {{{

/* redirects to profile visbility page */
function redirectToVis() {
  console.log("redirecting to profile visibility page");
  return { redirectUrl: visibilityURL };
}

function redirectToUser(url) {
  console.log("redirecting back to user");
  var updating = browser.tabs.update({
    url: url,
  });
}

/* handles profile visits */
function handleProfileRequest(requestDetails) {
  console.log("profile requested");
  // only if we haven't already set visibility to private
  if (!longState.setVisibility) {
    // store the original desired profile
    longState.desiredProfile = requestDetails.url;
    // then redirect
    return redirectToVis();
  }
}

/* when the linkedin profile visibility page is loaded, handle */
function handleProfileVisibility(requestDetails) {
  if (requestDetails.method == "GET") {
    // inject content script only if request was made by the extension
    if (longState.desiredProfile != "") {
      browser.tabs.executeScript({ file: "browser-polyfill.min.js" });
      browser.tabs.executeScript({
        file: "content_script.js",
      });
    }
  }
}

/* handle messages from content script */
function handleMessage(message, _sender, _sendResponse) {
  if (message.type == "original-visibility") {
    longState.originalProfileVisibility = message.content;
    if (longState.originalProfileVisibility == "option-hide") {
      longState.setVisibility = true;
      redirectToUser(longState.desiredProfile);
    }
  } else if (message.type == "complete-anonymous") {
    longState.setVisibility = true;
    redirectToUser(longState.desiredProfile);
  } else if (message.type == "profile-navigation") {
    if (!longState.setVisibility) {
      longState.desiredProfile = message.content;
      browser.tabs.update({
        url: visibilityURL,
      });
    }
  }
}
// }}}

// listeners {{{

// detect if a linkedin profile page is requested and intercept request
browser.webRequest.onBeforeRequest.addListener(
  handleProfileRequest,
  {
    urls: [profileURL],
  },
  ["blocking"]
);
// detect that we're visiting the profile visibility page
browser.webRequest.onCompleted.addListener(handleProfileVisibility, {
  urls: [visibilityURL],
});
// listen to messages from content script
browser.runtime.onMessage.addListener(handleMessage);
// }}}
