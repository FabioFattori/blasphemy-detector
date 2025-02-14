const bannedDirs = ["node_modules",".git"];
const notSupportedFiles = [".jpg",".png"];

function isBanned(dir:string):boolean{
    return bannedDirs.some(notSupported => dir.includes(notSupported));
}

function isNotSupported(path:string):boolean{
    return notSupportedFiles.some(notSupported => path.includes(notSupported));
}

export {
    bannedDirs,
    notSupportedFiles,
    isBanned,
    isNotSupported
}