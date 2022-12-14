const logTime = (logTimePoint) => {
  return new Promise((resolve, reject) => {
    try {
      chrome.runtime.sendMessage({'log-time': {logTimePoint}}, function (response) {
        resolve(response);
      });
    } catch (e) {
      reject(e);
    }
  });
}

if (document.readyState !== 'loading') {
  console.log('Auto Log Giờ Script đã được load!!!');
  initExtensionContext();
} else {
  document.addEventListener('DOMContentLoaded', function () {
    console.log('Auto Log Giờ Script đã được load!!!');
    initExtensionContext();
  });
}
function initExtensionContext() {
  var injectTimestampInput = document.createElement('input');
  injectTimestampInput.setAttribute('type', 'hidden');
  injectTimestampInput.setAttribute('name', 'open_time');
  injectTimestampInput.value = Date.now();
  
  document.body.append(injectTimestampInput);

  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  const isAutolog = urlParams.get('autolog');
  const logTimePoint = urlParams.get('logtime');
  if (isAutolog === '1') {
    // Execute click log button
    let logBtn = document.querySelector('.time-counter button.btn-log');
    if (logBtn) {
      if (!logBtn.classList.contains('btn-danger') && ['log-sang', 'log-chieu'].includes(logTimePoint)) {
        // Chưa log
        logBtn.click();
      } else if (logTimePoint === 'stop-chieu' && logBtn.classList.contains('btn-danger')) {
        logBtn.click();
      }
      setTimeout(() => {logTime(logTimePoint).then(resp => {})}, 3000);
    }
  }
}