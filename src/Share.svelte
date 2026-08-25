<script>
  import { run } from 'svelte/legacy';

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
    errorMessage = $share.wrongPassword;
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

  run(() => {
    loading = true;
    getShareFolderHandler(url, filePath, password).then(
      () => (loading = false)
    );
  });
</script>

<NavBar path={filePath} on:gotoIndex={gotoIndexHandler} />
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
    <FileList {files} on:clickFolder={getFolder} on:downloadFile={getFile} />
  {/if}
</Container>
