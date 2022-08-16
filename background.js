chrome.runtime.onInstalled.addListener( () => {
  console.log("hello world")
} );

chrome.runtime.onMessage.addListener(async function (rq, sender, sendResponse) {
  // console.log(rq);
  // console.log(sender);
  if (rq.hasOwnProperty('save-config')) {
    await saveConfig(rq['save-config']);
    sendResponse({type: 'success', message: "Lưu config thành công!!!"});
  }

  if (rq.hasOwnProperty('fetch-config')) {
    let logTimeData = await loadLogTimeData();
    sendResponse({config: logTimeData.configs});
  }
});

async function saveConfig (configs) {
  let currentData = await loadLogTimeData();
  currentData.configs = configs;
  await chrome.storage.sync.set({'logTimeData': currentData});
}

async function loadLogTimeData() {
  const logTimeData = await chrome.storage.sync.get(['logTimeData']);
  return logTimeData.logTimeData || {};
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