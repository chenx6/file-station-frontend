import { createI18n, localeFrom, browser } from "@nanostores/i18n";

export const locate = localeFrom(
    browser({ available: ['en', 'zh'], fallback: 'en' })
);

export const i18n = createI18n(locate, {
    async get(code) {
        const v = await fetch(`/${code}.json`);
        return await v.json();
    }
});

export const main = i18n("main", {
    "preview": "Preview",
    "areYouSure": "Are you sure you want to delete",
    "areYouSureAll": "Are you sure you want to delete all of these file?"
});

export const setting = i18n("setting", {
    "settings": "Settings",
    "password": "Password",
    "resetPassword": "Reset password",
    "oldPassword": "Old password",
    "newPassword": "New password",
    "reset": "Reset",
    "shareFolder": "Share folder",
    "path": "Path",
    "URL": "URL"
})

export const share = i18n("share", {
    "wrongPassword": "Wrong password",
    "passwordRequired": "Require password",
    "confirm": "Confirm"
})

export const fileList = i18n("fileList", {
    "uploading": "Uploading",
    "startUpload": "Start upload",
    "uploadFile": "Upload file",
    "createFolder": "Create folder",
    "save": "Save",
    "renameFile": "Rename file",
    "shareFile": "Share file",
    "moveTo": "Move To",
    "passwordOptional": "Password(Optional)",
    "fileName": "File name",
    "lastModifiedTime": "Last modified time",
    "size": "Size",
    "operation": "Operation",
    "upperFolder": "Upper folder",
    "rename": "Rename",
    "delete": "Delete",
    "share": "Share",
    "move": "Move",
    "deleteSelectedFile": "Delete selected file",
    "moveSelectedFile": "Move selected file",
    "downloadSelectedFile": "Download selected file"
})

export const footer = i18n("footer", {
    "poweredBy": "Powered by",
    "andLove": "and 💖"
})

export const navbar = i18n("navbar", {
    "home": "Home",
    "search": "Search",
    "settings": "Settings",
    "logout": "Logout",
});

export const move = i18n("move", {
    "select": "Select",
    "upperFolder": "Upper folder"
})

export const login = i18n("login", {
    "username": "Username",
    "password": "Password",
    "login": "Login",
    "register": "Register",
    "justANetDist": "Just a netdisk"
})