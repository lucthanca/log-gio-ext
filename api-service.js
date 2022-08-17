const isRunning = async () => {
  let response = await chrome.runtime.sendMessage({'fetch-app-data': {}});
  return response?.data?.running === true;
}

const fetchExtData = async () => {
  let response = await chrome.runtime.sendMessage({'fetch-app-data': {}});
  return response?.data;
}

const toggleState = (state = true) => {
  return new Promise((resolve, reject) => {
    try {
      chrome.runtime.sendMessage({'running': state}, function (response) {
        resolve(response);
      });
    } catch (e) {
      reject(e);
    }
  })
}

const saveConfig = (config) => {
  return new Promise((resolve, reject) => {
    try {
      chrome.runtime.sendMessage({'save-config': config}, function (response) {
        resolve(response);
      });
    } catch (e) {
      reject(e);
    }
  });
}

const logTime = () => {
  return new Promise((resolve, reject) => {
    try {
      chrome.runtime.sendMessage({'log-time': {}}, function (response) {
        resolve(response);
      });
    } catch (e) {
      reject(e);
    }
  });
}

export {
  isRunning,
  toggleState,
  saveConfig,
  fetchExtData,
  logTime
}