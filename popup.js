if (document.readyState !== 'loading') {
  console.log('Loading Script thành công!!!');
  initPopupContext();
} else {
  document.addEventListener('DOMContentLoaded', function () {
    console.log('Loading Script thành công!!!');
    initPopupContext();
  });
}
import { isRunning, toggleState, saveConfig, fetchExtData } from './api-service.js';

let messageWrapper = document.querySelector('.messages-wrapper');
function getTabsList(showOnlyCurrentWindow = false) {
  return new Promise(resolve => {
    if (showOnlyCurrentWindow) {
      chrome.windows.getCurrent({ populate: true }, window => {

        const queryinfo = {
          currentWindow: true,
        };

        chrome.tabs.query(queryinfo, tabs => {
          resolve(tabs);
        })
      });  
    } else {
      chrome.windows.getAll({ populate: true }, listOfWindows => {
        resolve(listOfWindows);
      });
    }
  });
}

let startScriptBtn = document.querySelector('.-start');
startScriptBtn.addEventListener('click', (e) => {
  e.preventDefault();
  isRunning().then(running => {
    let stateContainer = document.getElementById('script-state-message');
    if (running !== true) {
      toggleState().then(response => {
        messageWrapper.dispatchEvent(
          new CustomEvent(
            'dispatch-messages',
             {detail: {messages: [{type: response.type, message: response.message}]}}
          )
        );
        startScriptBtn.innerText = "Dừng";
        startScriptBtn.classList.add('running');
        stateContainer.classList.add('running');
        stateContainer.classList.remove('stopped');
        stateContainer.innerHTML = `<p>Script is running...</p>`;
      });
    } else {
      toggleState(false).then(response => {
        messageWrapper.dispatchEvent(
          new CustomEvent(
            'dispatch-messages',
             {detail: {messages: [{type: response.type, message: response.message}]}}
          )
        );
        startScriptBtn.innerText = "Bắt Đầu";
        startScriptBtn.classList.remove('running');
        stateContainer.classList.add('stopped');
        stateContainer.classList.remove('running');
        stateContainer.innerHTML = `<p>Script is stopped!!!</p>`;
      });
    }
  });
  
});

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

let saveConfBtn = document.querySelector('.-save-config');
saveConfBtn.addEventListener('click', function (e) {
  e.preventDefault();
  let el = e.currentTarget, form = el.closest('#config-form'), saveData = {};
  const formData = new FormData(form);
  saveData['log-sang'] = parseInt(formData.get('log-sang')) === 1;
  saveData['log-sang-time'] = '08:29:00';
  saveData['log-chieu'] = parseInt(formData.get('log-chieu')) === 1;
  saveData['log-chieu-time'] = '13:00:00';
  saveData['stop-chieu'] = parseInt(formData.get('stop-chieu')) === 1;
  saveData['stop-chieu-time'] = '18:59:00';
  // chrome.storage.sync.clear();
  saveConfig(saveData).then(response => {
    messageWrapper.dispatchEvent(new CustomEvent('dispatch-messages', {detail: {messages: [{type: response.type, message: response.message}]}}));
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

async function initPopupContext () {
  let data = await fetchExtData();
  console.log(data);
  if (data.configs) {
    let eles = ['log-sang', 'log-chieu', 'stop-chieu'];
    eles.forEach(elName => {
      if (data.configs[elName] === true) {
        let $ele = document.getElementById(elName);
        $ele.checked = true;
        $ele.closest('.toggle').classList.add('active');
      }
    })
  }

  let stateContainer = document.getElementById('script-state-message');
  if (data.running) {
    let btnStart = document.querySelector('.action.btn.-start');
    btnStart.innerText = "Dừng";
    stateContainer.classList.add('running');
    stateContainer.classList.remove('stopped');
    stateContainer.innerHTML = `<p>Script is running...</p>`;
  } else {
    stateContainer.classList.add('stopped');
    stateContainer.classList.remove('running');
    stateContainer.innerHTML = `<p>Script is stopped!!!</p>`;
  }
}