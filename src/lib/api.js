import * as pathlib from "path-browserify";

const base = "/api/v1";
const jsonContent = { "Content-Type": "application/json" };

/**
 * Fetch data with jwt token
 * @param {RequestInfo} input 
 * @param {RequestInit?} init 
 */
const fetchWithJwt = async (input, init = {}) => {
  let token = localStorage.getItem("token");
  let headers = { "Authorization": `Bearer ${token}` };
  if (init) {
    if (init.headers) {
      init.headers = { "Authorization": `Bearer ${token}`, ...init.headers };
    } else {
      init.headers = headers;
    }
  } else {
    init = { headers }
  }
  return await fetch(input, init);
}

/**
 * Fetch data with jwt token, decode response in json format
 * @param {RequestInfo} input 
 * @param {RequestInit?} init 
 */
const fetchJsonJwt = async (input, init = {}) => {
  let response = await fetchWithJwt(input, init);
  if (!response.ok ||
    !response
      .headers
      .get("Content-Type")
      .includes("application/json")) {
    return;
  }
  return await response.json();
}

/**
 * Simulate <a> tag to download file
 * @param {string} url download url
 * @param {string} fileName download file name
 */
const simDownload = (url, fileName) => {
  let a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  a.click();
  window.URL.revokeObjectURL(url);
}

const login = async (username, password) => {
  return await fetch(`${base}/auth`, {
    headers: jsonContent,
    body: JSON.stringify({ username, password }),
    method: "POST",
  });
}

const register = async (username, password) => {
  return await fetch(`${base}/users`, {
    headers: jsonContent,
    body: JSON.stringify({ username, password }),
    method: "POST",
  });
}

const deleteFile = async (path) => {
  return await fetchWithJwt(`${base}/file/${path}`, { method: "DELETE" });
}

const renameFile = async (from, to) => {
  return await fetchWithJwt(`${base}/file/${from}?to=${to}`, { method: "PATCH" });
}

const uploadFile = async (path, file) => {
  let form = new FormData();
  form.append("file", file);
  return await fetchWithJwt(`${base}/file/${path}`, { body: form, method: "POST" });
}

/**
 * Upload file via XMLHttpRequest
 * @param {string} path 
 * @param {File} file 
 * @param {(progress: number) => {}} monitor 
 * @returns 
 */
const uploadFileXHR = (path, file, monitor) => {
  let form = new FormData();
  form.append("file", file);
  let token = localStorage.getItem("token");
  let xhr = new XMLHttpRequest();
  xhr.open("POST", `${base}/file/${path}`);
  xhr.setRequestHeader("Authorization", `Bearer ${token}`);
  // Calculate and upload upload status
  xhr.upload.onprogress = (event) => (monitor(Math.round(event.loaded / event.total * 100)))
  // Avoid XML Parsing error
  if (xhr.overrideMimeType) {
    xhr.overrideMimeType("application/json");
  }
  xhr.send(form);
  return xhr;
}

/**
 * Generate download url based on relative path
 * @param {string} path 
 * @returns {string}
 */
const genDownloadUrl = (path) => `${base}/file/${path}`

const downloadFile = (path) => {
  let fileName = pathlib.basename(path)
  simDownload(genDownloadUrl(path), fileName);
}

const getFolder = async (path) => {
  return await fetchJsonJwt(`${base}/files/${path}`);
}

const createFolder = async (path) => {
  return await fetchWithJwt(`${base}/files/${path}`, { method: "POST" });
}

const searchFile = async (path) => {
  return await fetchJsonJwt(`${base}/search?name=${path}`);
}

const addShareFile = async (path, password) => {
  let url = `${base}/share?path=${path}`;
  if (password) {
    url += `&password=${password}`
  }
  return await fetchJsonJwt(url, { method: "POST" });
}

const getShareFolder = async (url, file_path, password) => {
  let query = `${base}/share?url=${url}&file_path=${file_path}`;
  if (password && password.length !== 0) {
    query += `&password=${password}`;
  }
  return await fetchJsonJwt(query);
}

const getShareFile = async (url, file_name, file_path, password) => {
  let query = `${base}/share?url=${url}&file_path=${file_path}&download=true`;
  if (password && password.length !== 0) {
    query += `&password=${password}`;
  }
  simDownload(query, file_name);
}

const deleteShareFile = async (path) => {
  return await fetchWithJwt(`${base}/share?path=${path}`, { method: "DELETE" });
}

const getShareIndex = async () => {
  return await fetchJsonJwt(`${base}/shares`);
}

const resetPassword = async (oldPassword, newPassword) => {
  return await fetchWithJwt(`${base}/user`, {
    method: "PATCH",
    headers: jsonContent,
    body: JSON.stringify({ oldPassword, newPassword })
  });
}

export {
  fetchJsonJwt, fetchWithJwt, genDownloadUrl,
  deleteFile, renameFile, uploadFile, uploadFileXHR, downloadFile, searchFile,
  createFolder, getFolder,
  addShareFile, getShareFolder, getShareFile, deleteShareFile, getShareIndex,
  login, register, resetPassword
}