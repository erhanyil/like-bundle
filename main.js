const {
    app,
    BrowserWindow,
    ipcMain,
    Tray,
    nativeImage,
    nativeTheme
} = require('electron');
const path = require('path');
const axios = require('axios');
const apiUrl = "https://www.haberler.com/son-dakika/";
let tray = undefined;
let window = undefined;

app.dock.hide()

app.on('ready', () => {
    createTray()
    createWindow()
    setInterval(retrieveNews, 2000);
})

app.setName("Bundle");

const createTray = () => {
    tray = new Tray(getTrayIcon(false))
    tray.on('click', function () {
        toggleWindow()
    });
}

const getWindowPosition = () => {
    const windowBounds = window.getBounds();
    const trayBounds = tray.getBounds();
    const x = Math.round(trayBounds.x + (trayBounds.width / 2) - (windowBounds.width / 2));
    const y = Math.round(trayBounds.y + trayBounds.height + 4);

    return {
        x: x,
        y: y
    };
}

const createWindow = () => {
    window = new BrowserWindow({
        width: 400,
        height: 450,
        show: false,
        frame: false,
        fullscreenable: false,
        resizable: false,
        transparent: false,
        webPreferences: {
            backgroundThrottling: false,
            nodeIntegration: true,
            contextIsolation: false,
        }
    })
    window.loadURL(`file://${path.join(__dirname, 'index.html')}`)

    window.on('blur', () => {
        if (!window.webContents.isDevToolsOpened()) {
            window.hide()
        }
    })
}

const toggleWindow = () => {
    if (window.isVisible()) {
        window.hide();
    } else {
        showWindow();
        app.setBadgeCount(0);
    }
}

const showWindow = () => {
    const position = getWindowPosition();
    window.setPosition(position.x, position.y, false);
    window.show();
    //window.openDevTools();
}

const retrieveNews = () => {
    axios.get(apiUrl).then(res => {
        window.webContents.send('news-message', res.data);
    })
}

ipcMain.on('show-window', () => {
    showWindow()
})

ipcMain.on("quitApp-event", () => {
    app.quit();
})

ipcMain.on("badge-count-event", () => {
    app.setBadgeCount(app.getBadgeCount() === 0 ? 1 : app.getBadgeCount() + 1)
})

nativeTheme.on("updated", () => tray.setImage(getTrayIcon()));

function getTrayIcon(isDark = nativeTheme.shouldUseDarkColors) {
    return nativeImage.createFromPath(`${path.join(__dirname, `/assets/icon/icon${isDark ? '_dark' : ''}.png`)}`).resize({
        width: 16,
        height: 16
    });
  }
  