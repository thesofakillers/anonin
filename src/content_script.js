// Put all the javascript code here, that you want to execute after page load.

// Determine if the element is checked
function determineIfChecked(element) {
  return element.hasAttribute("checked");
}

// returns which of the elements from a list is checked
function determineWhichChecked(elements) {
  for (var i = 0; i < elements.length; i++) {
    if (determineIfChecked(elements[i])) {
      return elements[i];
    }
  }
}

// parse page
var fullProfileOpt = document.getElementById("option-full");
var anonProfileOpt = document.getElementById("option-anonymous");
var hideProfileOpt = document.getElementById("option-hide");
var visibilityOptions = [fullProfileOpt, anonProfileOpt, hideProfileOpt];

// determine current profile visibility
selectedOption = determineWhichChecked(visibilityOptions);

var sending = browser.runtime.sendMessage({
  type: "original-visibility",
  content: selectedOption.id,
});
