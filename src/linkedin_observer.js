console.log("observing linkedin");

var profileURLRegex = "^[^:]*:(?://)?(?:[^/]*\\.)?linkedin\\.com/in/.*$";
var visibilityURL = "https://www.linkedin.com/psettings/profile-visibility";

document.addEventListener("click", (event) => {
  let closestAnchorLink = event.target.closest("a").href;
  if (closestAnchorLink.match(profileURLRegex)) {
    // redirect to google
    event.preventDefault();
    browser.runtime.sendMessage({
      type: "profile-navigation",
      content: closestAnchorLink,
    });
  }
});
