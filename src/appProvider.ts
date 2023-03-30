import * as vscode from 'vscode'
export class AppProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = 'Yalper.app'
  constructor(private readonly _context:vscode.ExtensionContext) {
  }
  public resolveWebviewView(
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
      // const appPath = vscode.Uri.joinPath(this._context.extensionUri, 'out', 'app.js')
      // const app = webviewView.webview.asWebviewUri(appPath)
      
      webviewView.webview.html = `
        <!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Yalper WebView</title>
          </head>
          <body>
            <div id="root">XXXXX</div>
          </body>
        </html>
      `

      // <script src="${app}"></script>
  }
}