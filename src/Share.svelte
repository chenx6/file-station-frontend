<script>
  import { onMount } from "svelte";
  import { Container, Spinner, Modal, Input, Button, Alert } from "sveltestrap";
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
  let inputPassword = ""; // Password input
  let requirePassword = false;
  let errorMessage = "";

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
    } else if (!data) {
      // Return data is undefined means authentication failed
      requirePassword = true;
    } else {
      files = [data];
    }
  };

  const checkPassword = async () => {
    let result = await getShareFolder(url, filePath, inputPassword);
    // If result is not undefined means authentication success
    if (Array.isArray(result) || result) {
      requirePassword = false;
      password = inputPassword;
      return;
    }
    errorMessage = "Wrong password";
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
  <Modal header="Password required" body isOpen={requirePassword}>
    {#if errorMessage.length !== 0}
      <Alert color="warning" class="mb-2">{errorMessage}</Alert>
    {/if}
    <Input class="mb-2" bind:value={inputPassword} />
    <Button on:click={checkPassword}>Confirm</Button>
  </Modal>
  {#if loading}
    <div class="d-flex justify-content-center">
      <Spinner />
    </div>
  {:else}
    <FileList {files} on:clickFolder={getFolder} on:clickFile={getFile} />
  {/if}
</Container>
