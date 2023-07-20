import * as vscode from 'vscode'
import axios from 'axios';
// const fs = require('fs')
import * as fs from 'fs'
import * as path from 'path'
const isProduction = process.env.NODE_ENV === 'production'

interface BuildRes {
  jsName: string;
  cssName: string;
}
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
      let appJSPath: vscode.Uri | string = ''
      let appCSSPath: vscode.Uri | string = ''
      if (isProduction) {
        const buildPath = 'src/app/dist/assets'
        const filePath = path.resolve(__dirname, `../${buildPath}`)
        const files = fs.readdirSync(filePath);
        console.log('files', files);
        const jsName = files.find(file => file.endsWith('.js')) || ''
        const cssName = files.find(file => file.endsWith('.css')) || ''
        const JSPath = vscode.Uri.joinPath(this._context.extensionUri, buildPath, jsName)
        appJSPath = webviewView.webview.asWebviewUri(JSPath)
        const CSSPath = vscode.Uri.joinPath(this._context.extensionUri, buildPath, cssName)
        appCSSPath = webviewView.webview.asWebviewUri(CSSPath)
      } else {
        appJSPath = 'http://localhost:5173/src/main.ts'
      }
      
      webviewView.webview.html = `
        <!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Yalper WebView</title>
            <link rel="stylesheet" href="${appCSSPath}">
          </head>
          <body>
            <div id="app">XXXXX</div>
            <script type="module" src="${appJSPath}"></script>
          </body>
        </html>
      `
      webviewView.webview.onDidReceiveMessage(
        async msg => {
          console.log('++++MSG From Webview', msg)
          if (msg.command === 'fetch') {
            handleFetch(msg.data, msg.msgId, webviewView.webview, this._context)
          } else if (msg.command === 'openEditor') {
            const doc = await vscode.workspace.openTextDocument({
              language: 'javascript',
              content: msg.data
            });
            vscode.window.showTextDocument(doc);
          }
        }
      )
  }
}
const handleFetch = async (data: any, msgId: number, webview: vscode.WebviewView['webview'], context: vscode.ExtensionContext) => {
  const token = context.globalState.get('token')
  let headers = {} as {Cookie?: object}
  // console.log('++++token', token)
  if (token) {
    headers.Cookie = token;
  }
  let url = data.url
  if (!url.startsWith('https')) {
    url = `https://kapi.sre.gotokeep.com${data.url}`
  }
  const res = await axios({
    ...data,
    url,
    headers,
  })
  console.log('++++AXIOS', res)
  if (res?.headers?.['set-cookie']) {
    context.globalState.update('token', res.headers['set-cookie'])
  }
  webview.postMessage({
    command: 'fetchRes',
    data: {
      data: res.data
    },
    msgId,
  })
  
}