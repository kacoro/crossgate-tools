
const { app, BrowserWindow, ipcMain, Notification } = require('electron')

const path = require('path');
const isDev = process.env.ENV === 'development';

function createWindow() {
  const win = new BrowserWindow({
    width: 980,
    height: 820,
    // fullscreen:true,
    webPreferences: { //让渲染进程renderer支持node
      nodeIntegration: true,
      enableRemoteModule: true,
      contextIsolation: false
      //preload: path.join(app.getAppPath(), 'preload.js')
    }
  })
 
  if (isDev) {
    win.loadURL(`http://localhost:3000`);
  } else {
    win.loadFile(path.resolve(__dirname, './dist/index.html'));
  }

  // win.loadFile(path.join(__dirname, 'index.html'))
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {//判断是否是macOs
    app.quit()
  }
})
// 监听渲染程序发来的事件
ipcMain.on('something', (event, data) => {
  console.log('接收到render进程发送的消息', data);
  let myNotification = new Notification({ title: '主进程通知', body: '接收到render进程发送的消息' });
  myNotification.show();
  event.sender.send('something1', '我是主进程返回的值')
})
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {//macos 点击dock中的应用图标的时候重新创建窗口
    createWindow()
  }
})



