import * as vscode from 'vscode';
import { AppProvider } from './appProvider';

export function activate(context: vscode.ExtensionContext) {
	// 引入自定义 WebView 组件
	const app = new AppProvider(context)
	const appSubscription = vscode.window.registerWebviewViewProvider(AppProvider.viewType, app)
	context.subscriptions.push(appSubscription)
}

export function deactivate() {}
