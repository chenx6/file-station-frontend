<script>
  import { Spinner, Modal } from "sveltestrap";
  import page from "page";
  import * as pathlib from "path-browserify";
  import FileList from "./lib/FileList.svelte";
  import NavBar from "./lib/NavBar.svelte";
  import {
    createFolder,
    deleteFile,
    fetchFolderContent,
    renameFile,
    uploadFile,
    downloadFile,
    searchFile,
    addShareFile,
  } from "./lib/api.js";
  import { calcPath, formatShareUrl, getPathByIndex } from "./lib/path.js";
  export let path;

  let files = [];
  let loading = false; // Showing loading spinner

  const gotoFolder = (event) => {
    let newPath = calcPath(event.detail, path);
    page("/files/" + newPath);
  };

  const refresh = async () => await getFolder(path);

  const searchFileHandler = async (event) => {
    files = await searchFile(event.detail);
  };

  const getFolder = async (path) => {
    if (path.startsWith("/")) {
      path = path.replace("/", "");
    }
    loading = true;
    let fetched = await fetchFolderContent(path);
    if (!fetched) {
      return;
    }
    files = fetched;
    loading = false;
  };

  const downloadFileHandler = (event) => {
    downloadFile(calcPath(event.detail, path));
  };

  const deleteFileHandler = async (event) => {
    let fullPath = calcPath(event.detail, path);
    if (window.confirm(`Are you sure you want to delete "${fullPath}"`)) {
      await deleteFile(fullPath);
    }
    await refresh();
  };

  const renameFileHandler = async ({ detail: { file, newName } }) => {
    let oldPath = calcPath(file, path);
    let newPath = pathlib.format({
      ...pathlib.parse(oldPath),
      ext: "",
      name: "",
      base: newName,
    });
    await renameFile(oldPath, newPath);
    await refresh();
  };

  const uploadFileHandler = async ({ detail: { files, callback } }) => {
    if (!files || files.length === 0) {
      return;
    }
    await uploadFile(path, files[0]);
    callback();
    await refresh();
  };

  const createFolderHandler = async (event) => {
    await createFolder(calcPath(event.detail, path));
    await refresh();
  };

  const shareHandler = async ({ detail: { file, callback } }) => {
    let data = await addShareFile(calcPath(file, path));
    let url = formatShareUrl(data.url);
    callback(url);
  };

  const moveFileHandler = async ({ detail: { file, newFolder } }) => {
    let oldPath = calcPath(file, path);
    let newPath = pathlib.join(newFolder, file.name);
    await renameFile(oldPath, newPath);
    await refresh();
  };

  const gotoIndexHandler = async (event) => {
    path = getPathByIndex(path, event.detail);
    page("/files/" + path);
  };

  $: getFolder(path);
  // $: sibilingFolders = files.filter((v) => v.type === "folder");
</script>

<NavBar {path} on:search={searchFileHandler} on:gotoIndex={gotoIndexHandler} />
<div class="container">
  {#if loading}
    <div class="d-flex justify-content-center">
      <Spinner />
    </div>
  {:else}
    <FileList
      {files}
      on:clickFile={downloadFileHandler}
      on:deleteFile={deleteFileHandler}
      on:renameFile={renameFileHandler}
      on:uploadFile={uploadFileHandler}
      on:clickFolder={gotoFolder}
      on:createFolder={createFolderHandler}
      on:share={shareHandler}
      on:moveFile={moveFileHandler}
    />
  {/if}
</div>
