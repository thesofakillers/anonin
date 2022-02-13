// Put all the javascript code here, that you want to execute in background.

// variables {{{

// profile match patterns for LinkedIn
var profileURL = "*://*.linkedin.com/in/*";
var profileURLRegex = "^[^:]*:(?://)?(?:[^/]*\\.)?linkedin\\.com/in/.*$";
var URLRegex = /.*\:\/\/.*\.*\.*(\/.*)?/;
var linkedinURLRegex =
  /https?:\/\/(www\.)?linkedin\.com\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/;
var visibilityURL = "https://www.linkedin.com/psettings/profile-visibility";
// state
var longState = {
  // whether we've set the visibility to private
  setVisibility: false,
  // the profile we want to navigate to after setting visibility to private
  desiredProfile: "",
  // the original visibility of the profile
  originalProfileVisibility: "",
  // whether we're on linkedin
  linkedinDetected: false,
  // whether we're resetting
  resetting: false,
  // specified if we're continuing
  exitURL: undefined,
};
// }}}

// functions {{{

/* redirects to profile visbility page */
function redirectToVis() {
  return { redirectUrl: visibilityURL };
}

async function redirectToUser(url) {
  await browser.tabs.update({
    url: url,
  });
}

/* handles profile visits */
function handleProfileRequest(requestDetails) {
  // only if we haven't already set visibility to private
  if (!longState.setVisibility) {
    // store the original desired profile
    longState.desiredProfile = requestDetails.url;
    // then redirect
    return redirectToVis();
  }
}

/* when the linkedin profile visibility page is loaded, handle */
async function handleVisibility(requestDetails) {
  if (requestDetails.method == "GET") {
    if (longState.resetting) {
      currentTab = await browser.tabs.query({ active: true });
      currentTab = currentTab[0];
      await browser.tabs.sendMessage(currentTab.id, {
        type: "desired-visibility",
        content: longState.originalProfileVisibility,
      });
    } else if (longState.desiredProfile != "") {
      await browser.tabs.executeScript({ file: "browser-polyfill.min.js" });
      await browser.tabs.executeScript({
        file: "content_script.js",
      });
    }
  } else if (requestDetails.method == "POST") {
    // this signals a succesfull profile visibility change
    if (longState.resetting) {
      if (longState.exitURL) {
        browser.tabs.update({
          url: longState.exitURL,
        });
      } else {
        currentTab = await browser.tabs.query({ active: true });
        currentTab = currentTab[0];
        browser.tabs.remove(currentTab.id);
      }
      // reset longState
      longState = {
        // whether we've set the visibility to private
        setVisibility: false,
        // the profile we want to navigate to after setting visibility to private
        desiredProfile: "",
        // the original visibility of the profile
        originalProfileVisibility: "",
        // whether we're on linkedin
        linkedinDetected: false,
        // whether we're resetting
        resetting: false,
        // specified if we're continuing
        exitURL: undefined,
      };
    } else if (!longState.setVisibility) {
      longState.setVisibility = true;
      currentTab = await browser.tabs.query({ active: true });
      currentTab = currentTab[0];
      browser.tabs.sendMessage(currentTab.id, {
        type: "set-visibility",
      });
      redirectToUser(longState.desiredProfile);
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
  } else if (message.type == "profile-navigation") {
    if (!longState.setVisibility) {
      longState.desiredProfile = message.content;
      browser.tabs.update({
        url: visibilityURL,
      });
    }
  } else if (message.type == "linkedin-detected") {
    if (!longState.linkedinDetected && !longState.resetting) {
      // listen for navigations away from linkedin within the tab
      browser.webNavigation.onBeforeNavigate.addListener(handleNavigation);
      longState.linkedinDetected = true;
    }
  }
}

async function handleNavigation(details) {
  if (
    !details.url.match(linkedinURLRegex) &&
    details.url.match(URLRegex) &&
    details.parentFrameId == -1 &&
    longState.setVisibility
  ) {
    browser.webNavigation.onBeforeNavigate.removeListener(handleNavigation);
    cleanUp(details.url);
  }
}

async function cleanUp(target_url = undefined) {
  longState.resetting = true;
  longState.exitURL = target_url;
  // navigate to profile visibility page if original visibility wasnt private
  if (longState.originalProfileVisibility !== "option-hide") {
    await browser.tabs.update({
      url: visibilityURL,
      // other stuff is handled by handleVisibility
    });
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
browser.webRequest.onCompleted.addListener(handleVisibility, {
  urls: [visibilityURL],
});

// listen to messages from content script
browser.runtime.onMessage.addListener(handleMessage);
