// Put all the javascript code here, that you want to execute in background.

// variables {{{

// profile match patterns for LinkedIn
var profileURL = "*://*.linkedin.com/in/*";
var profileURLRegex = "^[^:]*:(?://)?(?:[^/]*\\.)?linkedin\\.com/in/.*$";
var profileVisURL = "https://www.linkedin.com/psettings/profile-visibility";
// state
var longState = {
  desiredProfile: "",
  originalProfileVisibility: "",
};
// }}}

// functions {{{

/* redirects to profile visbility page */
function redirectToVis() {
  console.log("redirecting to profile visibility page");
  return { redirectUrl: profileVisURL };
}

function redirectToUser(url) {
  console.log("redirecting back to user");
  var updating = browser.tabs.update({
    url: url,
  });
}

/* handles profile visits */
function handleProfileVisit(requestDetails) {
  console.log("HEEEEY");
  console.log(longState);
  if (longState.desiredProfile == "") {
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
  } else if (message.type == "complete-anonymous") {
    redirectToUser(longState.desiredProfile);
  }
}
// }}}

// listeners {{{

// detect if a linkedin profile page is requested and intercept request
browser.webRequest.onBeforeRequest.addListener(
  handleProfileVisit,
  {
    urls: [profileURL],
  },
  ["blocking"]
);
// TODO: add listener for navigation, with working filtering
// // similarly, detect if profile is navigated to and intercept
// browser.webNavigation.onBeforeNavigate.addListener(
//   () => console.log("navigation intercepted"),
//   { url: [{ urlEquals: "www.linkedin.com/in/giuliostarace" }] }
// );
// detect that we're visiting the profile visibility page
browser.webRequest.onCompleted.addListener(handleProfileVisibility, {
  urls: [profileVisURL],
});
// listen to messages from content script
browser.runtime.onMessage.addListener(handleMessage);
// }}}
