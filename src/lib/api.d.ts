interface IFile {
    name: string,
    size: number,
    type: string,
    lastModifiedTime: number,
    absolutePath: string | undefined
}

interface IShareIndex {
    path: string,
    url: string,
    password: string,
}

function genDownloadUrl(path: string): string;
async function fetchWithJwt(input: string, init: any = {});
async function login(username: string, password: string): Promise<Response>;
async function register(username: string, password: string): Promise<Response>;
async function createFolder(path: string): Promise<Response>;
async function deleteFile(path: string): Promise<Response>;
async function getFolder(path: string): Promise<Array<IFile> | undefined>;
async function renameFile(from: string, to: string): Promise<Response>;
async function uploadFile(path: string, file: File): Promise<Response>;
async function downloadFile(path: string);
async function searchFile(path: string): Promise<Array<IFile>>;
async function addShareFile(path: string, password?: string?): Promise<any>;
async function getShareFolder(url: string, file_path: string, password?: string?): Promise<Array<IFile> | IFile>;
async function getShareFile(url: string, file_name: string, file_path: string, password?: string?);
async function deleteShareFile(path: string): Promise<Response>;
async function getShareIndex(): Promise<Array<IShareIndex>>;
async function resetPassword(oldPassword: string, newPassword: string): Promise<Response>;

export {
    IFile,
    login,
    register,
    genDownloadUrl,
    fetchWithJwt,
    createFolder,
    deleteFile,
    getFolder,
    renameFile,
    uploadFile,
    downloadFile,
    searchFile,
    addShareFile,
    getShareFile,
    getShareFolder,
    deleteShareFile,
    getShareIndex,
    resetPassword
}