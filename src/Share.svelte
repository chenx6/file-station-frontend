<script>
  import { onMount } from "svelte";
  import { Container, Spinner, Modal, Input, Button, Alert } from "@sveltestrap/sveltestrap";
  import FileList from "./lib/FileList.svelte";
  import NavBar from "./lib/NavBar.svelte";
  import { getShareFolder, getShareFile } from "./lib/api.js";
  import { calcPath, getPathByIndex } from "./lib/path.js";
  import { share } from "./lib/translate.js";
  /**
   * @typedef {Object} Props
   * @property {string} [query] - Get url and password
   */

  /** @type {Props} */
  let { query = "" } = $props();
  let url = $state("");
  let filePath = $state(""); // Relative to share folder's root
  let password = $state("");
  let files = $state([]);
  let loading = $state(false);
  let inputPassword = $state(""); // Password input
  let requirePassword = $state(false);
  let errorMessage = $state("");

  const getFolder = async (file) => {
    filePath = calcPath(file, filePath);
  };

  const getFile = async (file) => {
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
    errorMessage = $share.wrongPassword;
  };

  const gotoIndexHandler = (index) => {
    filePath = getPathByIndex(filePath, index);
  };

  onMount(async () => {
    let queryMap = new URLSearchParams(query);
    url = queryMap.get("url");
    filePath = queryMap.get("file_path") || "";
    password = queryMap.get("password");
  });

  $effect(() => {
    if (!url) {
      return;
    }

    loading = true;
    void getShareFolderHandler(url, filePath, password).then(
      () => (loading = false)
    );
  });
</script>

<NavBar path={filePath} onGotoIndex={gotoIndexHandler} />
<Container>
  <Modal header={$share.passwordRequired} body isOpen={requirePassword}>
    {#if errorMessage.length !== 0}
      <Alert color="warning" class="mb-2">{errorMessage}</Alert>
    {/if}
    <Input class="mb-2" bind:value={inputPassword} />
    <Button on:click={checkPassword}>{$share.confirm}</Button>
  </Modal>
  {#if loading}
    <div class="d-flex justify-content-center">
      <Spinner />
    </div>
  {:else}
    <FileList {files} onClickFolder={getFolder} onDownloadFile={getFile} />
  {/if}
</Container>
