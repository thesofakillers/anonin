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

// main content script process
function main() {
  // parse page
  var fullProfileOpt = document.getElementById("option-full");
  var anonProfileOpt = document.getElementById("option-anonymous");
  var hideProfileOpt = document.getElementById("option-hide");
  var visibilityOptions = [fullProfileOpt, anonProfileOpt, hideProfileOpt];

  // determine current profile visibility
  originalOption = determineWhichChecked(visibilityOptions);

  // browser.runtime.sendMessage({
  //   type: "original-visibility",
  //   content: originalOption.id,
  // });

  // click on hide profile option
  if (originalOption.id != hideProfileOpt.id) {
    hideProfileOpt.click();
  }

  // // we are now done
  // browser.runtime.sendMessage({
  //   type: "complete-anonymous",
  // });
}

setTimeout(main, 500);
