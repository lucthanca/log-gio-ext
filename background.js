let runningTask;
chrome.runtime.onInstalled.addListener( () => {
  console.log("hello world");

  let response = loadLogTimeData();
  return response.then(logTimeData => {
    if (logTimeData?.running === true) {
      console.log('auto create task by store config');
      runningTask = createRunningTaskInterval(3000);
    }
  });
} );

function createRunningTaskInterval(intervalTime = 60000) {
  return setInterval(async () => {
    let listChromeWindows = await getTabsList();
    let count = 0, activeTab;
    console.log('checking time...');
    listChromeWindows.forEach(cWindow => {
      cWindow.tabs.every((tab) => {
        if (tab.url.includes('log-gio-lam-viec.html')) {
          if (count >= 1) {
            chrome.tabs.remove(tab.id, () => {});
          }
          count++;
          activeTab = tab;
        }
        return true;
      });
  
      if (count === 0) {
        chrome.tabs.create({'url': `https://hr.bssgroup.vn/log-gio-lam-viec.html`}, function(tab) {
          chrome.tabs.update(tab.id, { active: true });
        });
        count++;
      } else if (activeTab.active === false) {
        chrome.tabs.update(activeTab.id, { active: true });
      }
    });
    }, intervalTime);
}

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

chrome.runtime.onMessage.addListener((rq, sender, sendResponse) => {
  if (rq.hasOwnProperty('fetch-app-data')) {
    loadLogTimeData().then( resp => sendResponse({data: resp}));
    return true;
  }
  if (rq.hasOwnProperty('save-config')) {
    saveConfig(rq['save-config']).then(res => {
      sendResponse({type: 'success', message: "Lưu config thành công!!!"});
    });
    return true;
  }

  if (rq.hasOwnProperty('running')) {
    loadLogTimeData().then(currentData => {
      currentData.running = rq.running;
      chrome.storage.sync.set({'logTimeData': currentData})
      .then(res => {
        if (rq.running === true) {
          runningTask = createRunningTaskInterval(3000);
        } else {
          clearInterval(runningTask);
        }
        sendResponse({type: 'success', message: rq.running ? "Started Script!!!": "Stop Script!!!"})
      });
    });
    return true;
  }

  if (rq.hasOwnProperty('fetch-config')) {
    loadLogTimeData().then(logTimeData => sendResponse({config: logTimeData.configs}));
    return true;
  }

  if (rq.hasOwnProperty('get-tabs')) {
    sendResponse({tabs: [{id: 123}]});
    return;
  }
});

async function saveConfig (configs) {
  let currentData = await loadLogTimeData();
  currentData.configs = configs;
  await chrome.storage.sync.set({'logTimeData': currentData});
}

async function loadLogTimeData() {
  let result = await chrome.storage.sync.get(['logTimeData']);
  return result.logTimeData || {};
}

function addSong(data) {
  var songs = getSongs();
  songs.push(data);
  localStorage.songs = JSON.stringify(songs)
}

function getSongs() {
  if (!localStorage.songs) {
      localStorage.songs = JSON.stringify([]);
  }

  return JSON.parse(localStorage.songs);
}