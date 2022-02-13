<script>
  import { onMount } from "svelte";
  import { Container, Spinner } from "sveltestrap";
  import FileList from "./lib/FileList.svelte";
  import NavBar from "./lib/NavBar.svelte";
  import { getShareFolder, getShareFile } from "./lib/api.js";
  import { calcPath, getPathByIndex } from "./lib/path.js";
  export let query = ""; // Get url and password
  let url = "";
  let filePath = ""; // Relative to share folder's root
  let password = "";
  let files = [];
  let loading = false;

  const getFolder = async ({ detail: file }) => {
    filePath = calcPath(file, filePath);
  };

  const getFile = async ({ detail: file }) => {
    await getShareFile(url, file.name, calcPath(file, filePath), password);
  };

  const getShareFolderHandler = async (url, filePath, password) => {
    if (url.length === 0) {
      return;
    }
    let data = await getShareFolder(url, filePath, password);
    if (Array.isArray(data)) {
      files = data;
    } else {
      files = [data];
    }
  };

  const gotoIndexHandler = (event) => {
    filePath = getPathByIndex(filePath, event.detail);
  };

  onMount(async () => {
    let queryMap = new URLSearchParams(query);
    url = queryMap.get("url");
    filePath = queryMap.get("file_path") || "";
    password = queryMap.get("password");
  });

  $: {
    loading = true;
    getShareFolderHandler(url, filePath, password).then(
      () => (loading = false)
    );
  }
</script>

<NavBar path={filePath} on:gotoIndex={gotoIndexHandler} />
<Container>
  {#if loading}
    <div class="d-flex justify-content-center">
      <Spinner />
    </div>
  {:else}
    <FileList {files} on:clickFolder={getFolder} on:clickFile={getFile} />
  {/if}
</Container>
