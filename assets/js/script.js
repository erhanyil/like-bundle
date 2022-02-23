const {
  ipcRenderer,
  nativeImage,
  shell
} = require('electron');

const path = require('path');
const moment = require('moment');
let muteToggle = false;
let notifyToggle = true;
let history = {href: null, title:null, image: null, detail: null, time: null, id:null};
const icon = nativeImage.createFromPath(`${path.join(__dirname, `/assets/icon/icon.png`)}`);
function render(history) {
  const content = `
  <div class="col" id="${"news-"+history.id}">
  <div class="card" style="border:none">
    <img id="${"img-"+history.id}" onclick="openUrl('${history.href}')" src="${history.image}" class="card-img-top" alt="${history.title}" onerror="changeDefaultUrl(${"'"+history.id+"'"})">
    <div class="card-body" onclick="openUrl('${history.href}')">
    <h5 class="card-title small">${history.title}</h5>
    <p class="card-text small text-truncate">${history.detail}</p>
    </div>
    <div class="card-footer" style="background-color: transparent;border: none;">
      <div class="d-flex align-items-center justify-content-between">
        <button onclick="deleteNew('${history.id}')" title="Delete" type="button" class="delete-btn btn btn-sm text-danger p-0"><i class="fa fa-trash" aria-hidden="true"></i></button>
        <small class="text-muted small" style="font-size: x-small">${history.time}</small>
      </div>
    </div>
    </div>
  </div>
  `;

  document.getElementById('news-content').prepend(createElementFromHTML(content));
}

ipcRenderer.on('news-message', function (evt, newsHtml) {
  const newsHtmlObj = createElementFromHTML(newsHtml);
  console.clear();
  const renderedData = findNewsContentOnHtml(newsHtmlObj);
  if (renderedData && history.title !== renderedData.title) {
    history = renderedData;
    render(renderedData);
    ipcRenderer.send("badge-count-event");
    if(notifyToggle) {
      showNotification(history);
    }
  }
});

function findNewsContentOnHtml(newsHtmlObj) {
   const ele = newsHtmlObj.parentNode.getElementsByClassName("hbLastNews");
   
   return {
     id:      Math.random().toString(16).slice(2),
     time:    getAgoStr(ele[0].children[0].children[0].innerText),
     image:   ele[0].children[0].children[1].children[0].children[0].dataset.src,
     title:   ele[0].children[0].children[1].children[1].children[0].innerText,
     detail:  ele[0].children[0].children[1].children[1].children[1].innerText,
     href:    "https://www.haberler.com" + ele[0].children[0].children[1].pathname,
   }
}

function createElementFromHTML(htmlString) {
  var div = document.createElement('div');
  div.innerHTML = htmlString.trim();
  return div.firstChild;
}

document.getElementById("muteNotifications").onclick = function(){
  muteToggle = !muteToggle;
  document.getElementById("muteNotifications").innerText = (muteToggle ? "Unmute" : "Mute") + " Notifications";
}
document.getElementById("toggleNotifications").onclick = function(){
  notifyToggle = !notifyToggle;
  iconStr = `<i class="fa fa-bell${notifyToggle === false ? '-slash' : ''}" aria-hidden="true"></i>`;
  document.getElementById("toggleNotifications").innerHTML = iconStr;
}

document.getElementById("clearFeeds").onclick = function(){
  document.getElementById('news-content').innerHTML = iconStr;
}

document.getElementById("quitApp").onclick = function(){
  ipcRenderer.send("quitApp-event");
}

function showNotification(history) {
  new Notification(history.title, { body: history.detail, silent: muteToggle, image: history.image, icon:icon  }).onclick = () => {
    openUrl(history.href);
  };
}

function changeDefaultUrl(id) {
  document.getElementById("img-"+id).parentNode.removeChild(document.getElementById("img-"+id));
}
function deleteNew(id) {
  document.getElementById("news-"+id).parentNode.removeChild(document.getElementById("news-"+id));
}

function getAgoStr(timeStr) {
  const dateObj = new Date();
  const dateStr = dateObj.toISOString().split('T').shift();
  return moment(dateStr + ' ' + timeStr).fromNow();
}

function openUrl(url) {
  shell.openExternal(url);
}