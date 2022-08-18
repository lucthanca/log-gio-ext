const TIME_LOG_SANG_BREAK_POINT = (11 * 3600) + (45 * 60);
const TIME_LOG_SANG = (8 * 3600) + (29 * 60);
const TIME_LOG_SANG_STR = '08:29:00';

/**
 * Break at 2h chieu
 */
const TIME_LOG_CHIEU_BREAK_POINT = (14 * 3600);
const TIME_LOG_CHIEU = (13 * 3600);
const TIME_LOG_CHIEU_STR = '13:00:00';

const TIME_STOP_CHIEU_BREAK_POINT = (19 * 3600);
const TIME_STOP_CHIEU = (18 * 3600) + (55 * 60);
const TIME_STOP_CHIEU_STR = '18:55:00';


let runningTask;
chrome.alarms.create('running_task', { periodInMinutes: 1 });

chrome.runtime.onInstalled.addListener( () => {
  console.log("Khởi tạo Service Worker...");

  chrome.notifications.create('', {
    title: 'Mỗi ngày một xiên bẩn =))',
    message: 'Mặc định log sáng: 08:29. chiều: 13:00, stop chiều: 18:55',
    iconUrl: './images/meo-cuoi-nham-hiem_medium.jpg',
    type: 'basic',
    requireInteraction: true
  });
} );

const configProcessorMappers = {
  "log-sang": (loggedData, logTime = TIME_LOG_SANG_STR) => {
    let currentDate = new Date().toLocaleDateString("vi-VN");
    if (loggedData && loggedData[currentDate] && loggedData[currentDate]['log-sang']) {
      throw "Đã log sáng";
    }

    if (!logTime) {
      logTime = TIME_LOG_SANG_STR;
    }
    
    let breakTime = TIME_LOG_SANG_BREAK_POINT;
    
    let currentTime = new Date().toLocaleTimeString('vi-VN')
        currentTimeArr =  currentTime.split(':'),
        totalSecondCurrentTime = parseInt(currentTimeArr[0]) * 3600 + parseInt(currentTimeArr[1]) * 60 + parseInt(currentTimeArr[0]),
        logTimeSecond = 0;

    logTimeArr = logTime.split(':');
    logTimeSecond = parseInt(logTimeArr[0]) * 3600 + parseInt(logTimeArr[1]) * 60 + parseInt(logTimeArr[0]);
    
    if (totalSecondCurrentTime >= logTimeSecond && totalSecondCurrentTime <= breakTime) {
      return true;
    } else {
      throw "Chưa tới lúc log giờ sáng";
    }
  },
  "log-chieu": (loggedData, logTime = TIME_LOG_CHIEU_STR) => {
    let currentDate = new Date().toLocaleDateString("vi-VN");
    if (loggedData && loggedData[currentDate] && loggedData[currentDate]['log-chieu']) {
      throw "Đã log chiều";
    }
    if (!logTime) {
      logTime = TIME_LOG_CHIEU_STR;
    }
    let breakTime = TIME_LOG_CHIEU_BREAK_POINT;

    let currentTime = new Date().toLocaleTimeString('vi-VN')
        currentTimeArr =  currentTime.split(':'),
        totalSecondCurrentTime = parseInt(currentTimeArr[0]) * 3600 + parseInt(currentTimeArr[1]) * 60 + parseInt(currentTimeArr[0]),
        logTimeSecond = 0;

    logTimeArr = logTime.split(':');
    logTimeSecond = parseInt(logTimeArr[0]) * 3600 + parseInt(logTimeArr[1]) * 60 + parseInt(logTimeArr[0]);
    if (totalSecondCurrentTime >= logTimeSecond && totalSecondCurrentTime <= breakTime) {
      return true;
    } else {
      throw "Chưa tới lúc log giờ chiều";
    }
  },
  "stop-chieu": (loggedData, logTime = TIME_STOP_CHIEU_STR) => {
    let currentDate = new Date().toLocaleDateString("vi-VN");
    if (loggedData && loggedData[currentDate] && loggedData[currentDate]['stop-chieu']) {
      throw "Đã stop log chiều";
    }
    if (!logTime) {
      logTime = TIME_STOP_CHIEU_STR;
    }
    let breakTime = TIME_STOP_CHIEU_BREAK_POINT;
    let currentTime = new Date().toLocaleTimeString('vi-VN')
        currentTimeArr =  currentTime.split(':'),
        totalSecondCurrentTime = parseInt(currentTimeArr[0]) * 3600 + parseInt(currentTimeArr[1]) * 60 + parseInt(currentTimeArr[0]),
        logTimeSecond = 0;

    logTimeArr = logTime.split(':');
    logTimeSecond = parseInt(logTimeArr[0]) * 3600 + parseInt(logTimeArr[1]) * 60 + parseInt(logTimeArr[0]);
    if (totalSecondCurrentTime > breakTime) {
      throw "Đã miss thời gian stop log giờ!";
    }
    if (totalSecondCurrentTime >= logTimeSecond) {
      return true;
    } else {
      throw "Chưa tới lúc stop log giờ";
    }
  }
};
chrome.alarms.onAlarm.addListener(alarm => createRunningTaskInterval(alarm));

async function createRunningTaskInterval(alarm) {
  if (alarm.name !== 'running_task') {
    return false;
  }
  
  console.log('Checking time...');
  let logTimeData = await loadLogTimeData();
  // DEBUG 
  console.log({logTimeData});
  if (!logTimeData?.configs || logTimeData?.running !== true) {
    return false
  }
  
  let currentLogTime = null;
  try {
    Object.entries(configProcessorMappers).forEach(([cnfKey, callback]) => {
      let checkTime = false;
      try {
        if (logTimeData.configs[cnfKey] === true) {
          checkTime = callback(logTimeData.logged, logTimeData.configs[cnfKey + '-time']); 
        }
      } catch (e) {
        // DEBUG
        console.log(e);
      }
      if (checkTime === true) {
        currentLogTime = cnfKey;
        throw "Break forEach";
      }
    });
  } catch (e) {
    if (e !== "Break forEach") {
      return false;
    }
  }

  if (currentLogTime === null) {
    return false;
  }

  let listChromeWindows = await getTabsList(),
  count = 0;
  listChromeWindows.forEach(cWindow => {
  cWindow.tabs.every((tab) => {
    let onBssHr = tab.url.match(/(https:\/\/hr\.bssgroup\.vn\/log-gio-lam-viec\.html){1}.*/g);
    if (onBssHr && onBssHr.length > 0) {
      if (count >= 1) {
        chrome.tabs.remove(tab.id, () => {});
      }
      /// DEBUG: console.log('run '+ tab.id);
      count++;
      activeTab = tab;
    }
    return true;
  });

    // DEBUG: console.log('count: ' + count);
    if (count === 0) {
      chrome.tabs.create({'url': `https://hr.bssgroup.vn/log-gio-lam-viec.html?autolog=1&logtime=${currentLogTime}`}, function(tab) {
        chrome.tabs.update(tab.id, { active: true });
        activeTab = tab;
      });
      count++;
    } else if (count > 0 && activeTab?.active === false) {
      chrome.tabs.update(activeTab.id, { active: true });
    }
    loadLogTimeData().then(currentData => {
      currentData.targetTabId = activeTab.id;
      chrome.storage.sync.set({'logTimeData': currentData})
      .then(res => {});
    });
  });
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

  if (rq.hasOwnProperty('log-time')) {
    let currentDate = new Date().toLocaleDateString("vi-VN");
    let currentTime = new Date().toLocaleTimeString('vi-VN');
    let sangBreakPoint = TIME_LOG_SANG_BREAK_POINT; // 11:45 trưa quy ra giây
    let chieuBreakPoint = TIME_LOG_CHIEU_BREAK_POINT; // 14:00 chieu
    let toiBreakPoint = TIME_STOP_CHIEU_BREAK_POINT // 19h toi
    let currentTimeArr =  currentTime.split(':');
    let time,
        totalSecondCurrentTime = parseInt(currentTimeArr[0]) * 3600 + parseInt(currentTimeArr[1]) * 60 + parseInt(currentTimeArr[0]);
    if (!rq['log-time']?.logTimePoint) {
      if (totalSecondCurrentTime <= sangBreakPoint) {
        time = 'log-sang';
      } else if (totalSecondCurrentTime <= chieuBreakPoint) {
        time = 'log-chieu';
      } else if (totalSecondCurrentTime <= toiBreakPoint) {
        time = 'stop-chieu';
      }
    } else {
      time = rq['log-time'].logTimePoint;
    }
    
    if (time) {
      loadLogTimeData().then(data => {
        if (!data.logged) data.logged = {};
        if (!data.logged[currentDate]) data.logged[currentDate] = {};
        data.logged[currentDate][time] = totalSecondCurrentTime;
        if (data.targetTabId) {
          chrome.tabs.remove(data.targetTabId, () => {});
          data.targetTabId = null;
        }
        chrome.storage.sync.set({'logTimeData': data}).then(resp => {
          chrome.notifications.create('', {
            title: `Đã ${time}.`,
            message: 'Mỗi ngày 1 xiên bẩn',
            iconUrl: './images/meo-cuoi-nham-hiem_medium.jpg',
            type: 'basic',
            requireInteraction: true
          });
          sendResponse({type: 'success', message: "Done!"});
        });
      })
    }
    return true;
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
