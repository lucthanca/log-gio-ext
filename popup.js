document.addEventListener("DOMContentLoaded", function () {

});


// $(document).ready(function () {
//   var songs =  JSON.parse(localStorage.songs || '[]');
//   var songHTML = null;

//   songs.forEach(song => {
//       songHTML = $(`<a href="${song.link}" target="_blank">${song.name}</a>`);
//       $('.wrapper').append(songHTML);
//   })
// });

/**
 *  Xử lý bật tắt cho container và label for
 *
 * @param {Event} e 
 */
const handleToggle = function (e) {
  let target = e.currentTarget;
  let checkInput, noNeedSetChecked = false;
  if (target.classList.contains('indicator')) {
    target = target.closest('.toggle');
    noNeedSetChecked = true;
  }
  checkInput = target.querySelector('.toggle-switch .checkbox-toggle');
  if (checkInput.checked === false) {
    target.classList.add('active');
    if (!noNeedSetChecked) checkInput.checked = true;
  } else {
    target.classList.remove('active');
    if (!noNeedSetChecked) checkInput.checked = false;
  }
}

// ADd listener when click to text label
let toggles = document.querySelectorAll('.toggle');
Array.from(toggles).forEach(element => {
  element.addEventListener('click', handleToggle.bind(event));
});

// Add listener when click to toggle indicator
let indicators = document.querySelectorAll('.indicator');
Array.from(indicators).forEach(element => {
  element.addEventListener('click', handleToggle.bind(event));
});

let messageWrapper = document.querySelector('.messages-wrapper');
let saveConfBtn = document.querySelector('.-save-config');
saveConfBtn.addEventListener('click', function (e) {
  e.preventDefault();
  let el = e.currentTarget, form = el.closest('#config-form'), saveData = {};
  const formData = new FormData(form);
  saveData['log-sang'] = parseInt(formData.get('log-sang')) === 1;
  saveData['stop-sang'] = parseInt(formData.get('stop-sang')) === 1;
  saveData['log-chieu'] = parseInt(formData.get('log-chieu')) === 1;
  saveData['stop-chieu'] = parseInt(formData.get('stop-chieu')) === 1;
  // console.log(123);
  // chrome.storage.sync.get(['logTimeData'], function (r) {
  //   console.log(r);
  // });
  // chrome.storage.sync.clear();
  // return false;
  chrome.runtime.sendMessage({'save-config': saveData}, function (response) {
    messageWrapper.dispatchEvent('dispatch-messages', {detail: {messages: [{type: response.type, message: response.message}]}});
  });
});

// Listen new message was dispatched
messageWrapper.addEventListener('dispatch-messages', function (e, f) {
  const messageItemTmpl = '<p class="message %type%">%message%</p>';
  let messages = e.detail.messages, html = '';
  messages.forEach(message => {
    html += messageItemTmpl.replace('%message%', message.message).replace('%type%', message.type);
  });

  // clear messages
  setTimeout(() => {
    e.target.innerHTML = '';
  }, e.detail.timeout || 3000);

  e.target.innerHTML = html;
});

window.onload = function (e) {
  chrome.runtime.sendMessage({'fetch-config': {}}, function (response) {
    let config = response.config;
    console.log(config);
  });
}