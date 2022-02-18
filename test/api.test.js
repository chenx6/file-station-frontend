import { assert, beforeAll, expect, test } from "vitest";
import { LocalStorage } from "node-localstorage";
import fetch, { File, FormData } from 'node-fetch';

import { login, register, getFolder, uploadFile, renameFile, deleteFile, createFolder, addShareFile, deleteShareFile } from "../src/lib/api.js";

const exist = async (path, fileName) => {
  let data = await getFolder(path);
  return data.findIndex((f) => f.name === fileName) !== -1;
}

beforeAll(async () => {
  // Polyfill, FUCK STUPID NODEJS
  globalThis.localStorage = new LocalStorage("./test-ls");
  globalThis.fetch = async (url, init) => await fetch(`http://localhost:5000${url}`, init);
  globalThis.FormData = FormData;

  let user = { username: "test_user", password: "123456" };
  let response = await register(user.username, user.password);
  response = await login(user.username, user.password);
  let data = await response.json();
  localStorage.setItem("token", data.token);
})

test("register and login", async () => {
  let user = { username: "test_user233", password: "123456" };
  let response = await register(user.username, user.password);
  assert(response.status === 200);
  response = await login(user.username, user.password);
  assert(response.status === 200);
})

test("get file", async () => {
  let data = await getFolder("");
  assert(Array.isArray(data));
})

test("try to input wrong url", async () => {
  let data = await getFolder("../..");
  assert(!data);
})

test("upload file", async () => {
  let file = new File(["wow"], "awesome.txt");
  let response = await uploadFile("", file);
  assert(response.status === 200);
})

test("rename file", async () => {
  let from = "awesome.txt";
  let to = "aaawesome.txt";
  let response = await renameFile(from, to);
  assert(response.status === 200);
  assert(!await exist("", from));
})

test("delete file", async () => {
  let fileName = "aaawesome.txt";
  let response = await deleteFile(fileName);
  assert(response.status === 200);
  assert(!await exist("", fileName));
})

test("create folder", async () => {
  let folderName = "a_folder";
  let response = await createFolder(folderName);
  assert(response.status === 200);
  assert(await exist("", folderName));
})

test("delete folder", async () => {
  let folderName = "a_folder";
  let response = await deleteFile(folderName);
  assert(response.status === 200);
  assert(!await exist("", folderName));
})

test("add share file", async () => {
  let folderName = "share_folder";
  await createFolder(folderName);
  let data = await addShareFile(folderName);
  assert(data.url.length !== 0);
})

test("delete share file", async () => {
  let folderName = "share_folder";
  let response = await deleteShareFile(folderName);
  assert(response.status === 200);
})