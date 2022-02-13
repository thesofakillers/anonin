desired_visibility = "";

function setVisibility() {
  var visOpt = document.getElementById(desired_visibility);
  visOpt.click();
}

function handleMessage(message, _sender, _sendResponse) {
  if (message.type == "desired-visibility") {
    desired_visibility = message.content;
    setTimeout(setVisibility, 1000);
  }
}

browser.runtime.onMessage.addListener(handleMessage);
