import { fileWithRowIndex } from "../extension";
import * as vscode from 'vscode';

export default function getWebviewContent(files: fileWithRowIndex[]): string {
    
    let fileList = files.map(file => createListItemElement(file)).join('');
    return `
        <!DOCTYPE html>
        <html lang="it">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>File Contenenti Blasfemie</title>
            <link rel= "stylesheet" href= "https://maxst.icons8.com/vue-static/landings/line-awesome/line-awesome/1.3.0/css/line-awesome.min.css" >
            <style>
                body { font-family: Arial, sans-serif; padding: 20px; }
                h2 { font-size:30px;width:100%;text-align:center}
                ul { list-style-type: square; padding: 0; }
                a { text-decoration:wavy ; font-size:22px ; color:white}
                a:active,a:focus {
                    border:none;
                }
                .icon {font-size:50px;}
                .rowContainer { margin: 10px 0; padding: 5px; border-radius: 5px;  display:flex; flex-direction:row;align-items:start }
            </style>
        </head>
        <body>
            <h2><i class="las la-praying-hands icon"></i>File che contengono le parole "Brutte"<i class="las la-praying-hands icon"></i></h2>
            <ul>${fileList.length> 0 ? fileList : "non sono stati trovati Brutte parole!"}</ul>
            <script>
                const vscode = acquireVsCodeApi();
                function openFile(filePath, lineNumber) {
                    vscode.postMessage({ command: 'openFile', filePath, lineNumber });
                }
            </script>
        </body>
        </html>
    `;
}

function createListItemElement(file:fileWithRowIndex):string{
    let fullPath = (vscode.workspace.workspaceFolders![0]).uri.fsPath+"/"+file.file;
	return (
		`<li class="rowContainer">
            <a onclick="openFile('${fullPath}','${file.rowIndex}')">${file.whatToSay}</a>
        </li>
        <br />`
	);
}