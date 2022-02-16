<script>
  import { Spinner, Modal } from "sveltestrap";
  import page from "page";
  import * as pathlib from "path-browserify";
  import FileList from "./lib/FileList.svelte";
  import NavBar from "./lib/NavBar.svelte";
  import Player from "./lib/Player.svelte";
  import Gallery from "./lib/Gallery.svelte";
  import {
    supportVideoType,
    supportAudioType,
    supportImageType,
  } from "./lib/store";
  import {
    createFolder,
    deleteFile,
    fetchFolderContent,
    renameFile,
    uploadFile,
    downloadFile,
    searchFile,
    addShareFile,
    genDownloadUrl,
  } from "./lib/api.js";
  import { calcPath, formatShareUrl, getPathByIndex } from "./lib/path.js";
  export let path;

  let files = [];
  let loading = false; // Showing loading spinner
  let playing = false, // Video/Audio playing
    playingFile;
  let showingImg = false,
    img;

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

  // Filter file and generate direct url
  const genFileList = (filterFunc) => {
    let filteredList = [...files].filter((file) => filterFunc(file));
    // Add src to support player
    filteredList.forEach(
      (file) => (file.src = genDownloadUrl(pathlib.join(path, file.name)))
    );
    return filteredList;
  };

  const genPlaylist = () =>
    genFileList((file) => {
      let ext = pathlib.extname(file.name);
      return supportAudioType.includes(ext) || supportVideoType.includes(ext);
    });

  const genImagelist = () =>
    genFileList((file) =>
      supportImageType.includes(pathlib.extname(file.name))
    );

  const downloadOrPreview = (event) => {
    let file = event.detail;
    let ext = pathlib.extname(file.name);
    if (supportVideoType.includes(ext) || supportAudioType.includes(ext)) {
      playing = true;
      playingFile = file;
      return;
    } else if (supportImageType.includes(ext)) {
      showingImg = true;
      img = file;
      return;
    }
    downloadFile(calcPath(file, path));
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
      on:clickFile={downloadOrPreview}
      on:downloadFile={downloadFileHandler}
      on:deleteFile={deleteFileHandler}
      on:renameFile={renameFileHandler}
      on:uploadFile={uploadFileHandler}
      on:clickFolder={gotoFolder}
      on:createFolder={createFolderHandler}
      on:share={shareHandler}
      on:moveFile={moveFileHandler}
    />
  {/if}
  <Modal
    header="Preview"
    body
    size="xl"
    isOpen={playing}
    toggle={() => (playing = false)}
  >
    <Player
      files={genPlaylist()}
      selected={playingFile}
      on:clickDownload={downloadFileHandler}
    />
  </Modal>

  <Modal size="xl" isOpen={showingImg} toggle={() => (showingImg = false)}>
    <Gallery files={genImagelist()} selected={img} />
  </Modal>
</div>
