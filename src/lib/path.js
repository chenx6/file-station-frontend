import * as pathlib from "path-browserify";

/** Calculate path based on current path and file
 * @param file {{name: string, absolutePath?: string?}}
 * @param path {string}
 * @returns {string}
 */
const calcPath = (file, path) => {
  if ((path == "." || path == "") && file.name === "..") {
    return path;
  }
  let newPath;
  if (file.absolutePath) {
    newPath = file.absolutePath;
  } else {
    newPath = pathlib.join(path, file.name);
  }
  return newPath;
}

/**
 * Format share url based on `url` 
 * @param {number | string} url 
 * @returns {string}
 */
const formatShareUrl = (url) => `${location.origin}/share?url=${url}`

/**
 * 
 * @param {string} path 
 * @param {number} index 
 * @returns 
 */
const getPathByIndex = (path, index) => {
  let folders = path.split("/");
  folders = folders.slice(0, index);
  return folders.join("/");
}

export { calcPath, formatShareUrl, getPathByIndex }