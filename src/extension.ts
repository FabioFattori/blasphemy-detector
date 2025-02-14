// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import getWebviewContent from './GUI/View';
import { isBanned, isNotSupported } from './config/globalVariables';

let panel = vscode.window.createWebviewPanel(
	'fileScanner',
	'Risultati della scansione',
	vscode.ViewColumn.One,
	{ enableScripts: true }
);

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export async function activate(context: vscode.ExtensionContext) {

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('blasphemy-detector.helloWorld', () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		vscode.window.showInformationMessage('Hello World from Blasphemy Detector!');
	});

	context.subscriptions.push(disposable);

	disposable = vscode.commands.registerCommand('blasphemy-detector.checkDio', () => {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders) {
            vscode.window.showErrorMessage('Nessuna cartella aperta in VS Code');
            return;
        }
        
        const rootPath = workspaceFolders[0].uri.fsPath;
		scanFiles(rootPath,context).then((foundFiles)=>{
			showResults(foundFiles,context);
		});
    });
    
    context.subscriptions.push(disposable);
}

export interface fileWithRowIndex{
	file:string,
	rowIndex:number,
	whatToSay:string
}

async function scanFiles(dir: string,context: vscode.ExtensionContext):Promise<fileWithRowIndex[]> {
	return new Promise((resolve,rejects)=>{
		let foundFiles: fileWithRowIndex[] = [];

		if (isBanned(dir)) {
            rejects();
			return;
        }
		console.log(dir, " ", isBanned(dir));
	
    fs.readdir(dir, (err, files) => {
        if (err) {
            vscode.window.showErrorMessage(`Errore nella lettura della cartella: ${err.message}`);
            rejects();
        }
        
        files.forEach(file => {
            const filePath = path.join(dir, file);
            fs.stat(filePath, (err, stats) => {
                if (err || isNotSupported(filePath) || isBanned(filePath) ) {return;}
                
                if (stats.isDirectory()) {
                    ( scanFiles(filePath,context)).then((founds)=> founds.forEach(el => foundFiles.push(el)));
                } else {
                    fs.readFile(filePath, 'utf8', (err, data) => {
						if (err) {
							console.log("errore")
							return;
						}

						let cleanPath = filePath.split((vscode.workspace.workspaceFolders![0]).uri.fsPath)[1].split("/").slice(1).join("/");
						let rows = data.split("\n");
						rows.forEach((row,rowNumber) => {
							if(isBlasphemy(row)){
								let text = `=> ${cleanPath} , a riga: ${rowNumber+1}`;
								text = isBlasphemy(cleanPath)? text + " e migliorerei il nome del file" : text;
								foundFiles.push({file:cleanPath,rowIndex:rowNumber+1,whatToSay:text} as fileWithRowIndex);
								showResults(foundFiles,context)
							}
						});
                    });
                }
            });
        });
    });
	return resolve(foundFiles);
	})
}

function isBlasphemy(toCheck:string): boolean{
	return (toCheck.toLowerCase().includes('dio') || toCheck.toLowerCase().includes('madonna') || toCheck.toLowerCase().includes('porco') );
}

function showResults(files: fileWithRowIndex[],context: vscode.ExtensionContext) {
    panel.dispose();
	panel= vscode.window.createWebviewPanel(
		'fileScanner',
		'Risultati della scansione',
		vscode.ViewColumn.One,
		{ enableScripts: true }
	);
    panel.webview.html = getWebviewContent(files);
	// Ascolta i messaggi dalla WebView
    panel.webview.onDidReceiveMessage(
        (message) => {
            if (message.command === 'openFile') {
                const fileUri = vscode.Uri.file(message.filePath);
                const lineNumber = message.lineNumber;  // Ottieni il numero della riga
                if (fs.existsSync(message.filePath)) {
					vscode.window.showTextDocument(fileUri, {
						selection: new vscode.Range(lineNumber - 1, 0, lineNumber - 1, 0)
					});
				} else {
					vscode.window.showErrorMessage('File not found: ' + message.filePath);
				}
            }
        },
        undefined,
        context.subscriptions
    );
}



// This method is called when your extension is deactivated
export function deactivate() {}
