if (document.readyState !== 'loading') {
  console.log('Custom Script đã được load!!!');
  initExtensionContext();
} else {
  document.addEventListener('DOMContentLoaded', function () {
    console.log('Custom Script đã được load!!!');
    initExtensionContext();
  });
}

function initExtensionContext() {
  let $body = document.getElementsByTagName("BODY")[0];
  let html = `<button id="ext-log-time" class="custom-log-time">Log Time</button>`;
  console.log($body);
  $body.insertAdjacentHTML("beforeend", html);
  
  let button = document.getElementById("ext-log-time");
  button.addEventListener('click', () => {
    document.querySelector('.log-time-popup').style.display = 'block';
			
    document.getElementsByTagName("BODY")[0].insertAdjacentHTML('beforeend', '<div id="wrapperfull" style="display: block"></div>');
    ocument.querySelector('#wrapperfull').style.display = 'block';
    return false;
  });
}