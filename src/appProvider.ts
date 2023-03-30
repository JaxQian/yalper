import * as vscode from 'vscode'
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
      const appJSPath = webviewView.webview.asWebviewUri(JSPath)
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
          </body>
        </html>
      `

      // <link href="${appCSSPath}" rel="stylesheet">
  }
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
      console.log('File content:');
      const obj = JSON.parse(data)
      console.log(obj);
      resolve({
        jsName: obj.files['main.js'],
        cssName: obj.files['main.css']
      })
    });
  });
}