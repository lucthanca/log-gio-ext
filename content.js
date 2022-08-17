if (document.readyState !== 'loading') {
  console.log('Loading Script thành công!!!');
  initExtensionContext();
} else {
  document.addEventListener('DOMContentLoaded', function () {
    console.log('Loading Script thành công!!!');
    initExtensionContext();
  });
}
function initExtensionContext() {
  var button = document.createElement('button');
  var injectTimestampInput = document.createElement('input');
  injectTimestampInput.setAttribute('type', 'hidden');
  injectTimestampInput.setAttribute('name', 'open_time');
  injectTimestampInput.value = Date.now();
  
  document.body.append(injectTimestampInput);

  chrome.runtime.sendMessage({'get-tabs': {}}, (response) => {
    // 3. Got an asynchronous response with the data from the background
    console.log(response);
  });

  button.innerHTML = 'Add to Playlist';
  document.body.prepend(button);

  button.addEventListener('click', function () {
      var link = window.location.href;
      var name = document.querySelector('.list-group.list-menu').innerText;
      chrome.extension.sendMessage({
          type: 'add-song', 
          data: {link, name}
      });
  });
}