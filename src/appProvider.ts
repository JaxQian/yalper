import * as vscode from 'vscode'
import axios from 'axios';
// const fs = require('fs')
import * as fs from 'fs'
import * as path from 'path'
export class AppProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = 'Yalper.app'
  constructor(private readonly _context:vscode.ExtensionContext) {
  }
  public async resolveWebviewView(
    webviewView: vscode.WebviewView,
    context: vscode.WebviewViewResolveContext,
    token: vscode.CancellationToken
  ) {
      webviewView.webview.options = {
        enableScripts: true,
        localResourceRoots: [
          this._context.extensionUri
        ]
      }
      
      // app.js 是 React 组件编译后的产物，作为 Webview 中的引入脚本
      const buildPath = 'src/app/build'
      const { jsName, cssName } = await getBuiltName(buildPath)
      const JSPath = vscode.Uri.joinPath(this._context.extensionUri, buildPath, jsName)
      // const appJSPath = webviewView.webview.asWebviewUri(JSPath)
      const appJSPath = 'http://localhost:3000/static/js/bundle.js'
      const CSSPath = vscode.Uri.joinPath(this._context.extensionUri, buildPath, cssName)
      const appCSSPath = webviewView.webview.asWebviewUri(CSSPath)
      
      webviewView.webview.html = `
        <!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Yalper WebView</title>
            <script defer="defer" src="${appJSPath}"></script>
            <link href="${appCSSPath}" rel="stylesheet">
          </head>
          <body>
            <div id="root">XXXXX</div>
            <script>
              // console.log('AAA', acquireVsCodeApi);
              // window.acquireVsCodeApi = acquireVsCodeApi;
            </script>
          </body>
        </html>
      `
      webviewView.webview.onDidReceiveMessage(
        msg => {
          console.log('++++MSG From Webview', msg)
          if (msg.command === 'fetch') {
            handleFetch(msg.data, msg.msgId, webviewView.webview)
          }
        }
      )
  }
}
const handleFetch = async (data, msgId, webview) => {
  const res = await axios({
    ...data,
    url: `https://kapi.sre.gotokeep.com${data.url}`
  })
  console.log('++++AXIOS', res)
  webview.postMessage({
    command: 'fetchRes',
    data: {
      data: res.data
    },
    msgId,
  })
  
}
const getBuiltName = (buildPath:String) => {
  // const filePath = `/${buildPath}/asset-manifest.json`;
  const filePath = path.resolve(__dirname, `../${buildPath}/asset-manifest.json`)
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, 'utf8', function (err, data) {
      // 处理错误
      if (err) {
        reject(`Error reading file: ${err}`);
        return;
      }
      
      // 打印文件内容
      const obj = JSON.parse(data)
      resolve({
        jsName: obj.files['main.js'],
        cssName: obj.files['main.css']
      })
    });
  });
}