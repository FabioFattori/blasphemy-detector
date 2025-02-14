const bannedDirs = ["node_modules"];
const notSupportedFiles = ["*.jpg","*.png"];

function isBanned(dir:string):boolean{
    return bannedDirs.includes(dir);
}

function isNotSupported(path:string):boolean{
    notSupportedFiles.forEach(notSupported => {
        if(path.includes(notSupported)){return true;}
    });

    return false;
}

export {
    bannedDirs,
    notSupportedFiles,
    isBanned,
    isNotSupported
}