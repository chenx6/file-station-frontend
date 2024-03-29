<script>
  import {
    Col,
    Row,
    Dropdown,
    DropdownItem,
    DropdownMenu,
    DropdownToggle,
    Modal,
    Input,
    Button,
    ModalFooter,
    Icon,
    Alert,
  } from "sveltestrap";
  import { createEventDispatcher } from "svelte";
  import OrderIndicator from "./OrderIndicator.svelte";
  import Move from "./Move.svelte";
  import { fileList } from "./translate.js";
  export let files = [];
  const dispatch = createEventDispatcher();
  // Sorting
  let sortMethod = { key: "name", order: "asc" };
  // Renaming
  let newName = "";
  let renamingFile;
  let renaming = false;
  // Uploading
  let uploading = false;
  let uploadingProgess = -1;
  let uploadFiles;
  // New folder
  let creatingFolder = false;
  let newFolderName = "";
  // Share
  let sharing = false;
  let sharingFile;
  let sharingPassword = "";
  let shareUrl = "";
  // Move file
  let moving = false;
  let movingFile = [];
  // Selected
  let selected = [];

  const clickItem = (file) => {
    switch (file.type) {
      case "file":
        dispatch("clickFile", file);
        break;
      case "folder":
        dispatch("clickFolder", file);
      default:
        break;
    }
  };

  const downloadFile = (file) => {
    dispatch("downloadFile", file);
  };

  const deleteFile = (file) => dispatch("deleteFile", [file]);

  const deleteFiles = () => dispatch("deleteFile", selected);

  // Pop up rename window, use `renameFile` to finish rename
  const startRenaming = (file) => {
    renaming = true;
    newName = file.name;
    renamingFile = file;
  };

  const renameFile = () => {
    dispatch("renameFile", { file: renamingFile, newName });
    renaming = false;
  };

  const uploadFile = () => {
    dispatch("uploadFile", {
      files: uploadFiles,
      monitor: (progress) => (uploadingProgess = progress),
    });
  };

  const uploadFinish = () => {
    uploadingProgess = -1;
    uploading = false;
    dispatch("closeModal");
  };

  // Pop up sharing window, wait for password input
  // call `shareFile` to continue sharing
  const startSharing = (file) => {
    sharing = true;
    sharingFile = file;
  };

  const shareFile = async () => {
    dispatch("share", {
      file: sharingFile,
      password: sharingPassword,
      callback: (url) => {
        shareUrl = url;
      },
    });
  };

  const cleanShareModal = () => {
    sharing = false;
    shareUrl = "";
  };

  const createNewFolder = () => {
    dispatch("createFolder", { name: newFolderName });
    creatingFolder = false;
  };

  // Pop up a select window, call `moveFile` to finish move file
  const startMovingFile = (file) => {
    moving = true;
    movingFile = [file];
  };

  const startMovingFiles = () => {
    moving = true;
    movingFile = selected;
  };

  const moveFile = (event) => {
    moving = false;
    dispatch("moveFile", { file: movingFile, newFolder: event.detail });
  };

  const bytesToSize = (bytes) => {
    if (bytes === 0) return "0B";
    let k = 1024;
    let sizes = ["B", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
    let weight = Math.floor(Math.log(bytes) / Math.log(k));
    return (bytes / Math.pow(k, weight)).toPrecision(3) + sizes[weight];
  };

  const sortFiles = (key) => {
    // Click `key` again means change order
    if (key === sortMethod.key) {
      if (sortMethod.order === "asc") {
        sortMethod.order = "desc";
      } else {
        sortMethod.order = "asc";
      }
    }
    sortMethod.key = key;
  };

  const convertTimestamp = (timestamp) =>
    new Date(timestamp * 1000).toISOString();

  const selectAll = () => {
    // If has selected all file, unselect it
    if (selected.length === files.length) {
      selected = [];
    } else {
      selected = files;
    }
  };

  // Sort file order
  $: {
    let cmpFn;
    if (sortMethod.order === "asc") {
      cmpFn = (a, b) =>
        a[sortMethod.key]
          .toString()
          .localeCompare(b[sortMethod.key].toString());
    } else {
      cmpFn = (a, b) =>
        b[sortMethod.key]
          .toString()
          .localeCompare(a[sortMethod.key].toString());
    }
    files = files.sort(cmpFn);
  }
</script>

<!--
  @component
  File list component, Modify custom event to support different workaround.

  Most of the custom event's `detail` member is `IFile`, but `renameFile` `uploadFile` `shareFile` is different
-->
<div id="file-list">
  <!-- Modal windows -->
  <!-- Wrap {#if} to fix when `uploading = false`
    modal background doesn't disappear -->
  {#if uploading}
    <Modal
      body
      header={$fileList.uploadFile}
      isOpen={uploading}
      toggle={uploadFinish}
    >
      {#if uploadingProgess !== -1}
        <Alert>{$fileList.uploading} {uploadingProgess}%</Alert>
      {/if}
      <Input type="file" bind:files={uploadFiles} />
      <ModalFooter>
        <Button on:click={uploadFile}>{$fileList.startUpload}</Button>
      </ModalFooter>
    </Modal>
  {/if}
  <Modal
    body
    header={$fileList.createFolder}
    isOpen={creatingFolder}
    toggle={() => (creatingFolder = false)}
  >
    <Input type="text" bind:value={newFolderName} />
    <ModalFooter>
      <Button on:click={createNewFolder}>{$fileList.save}</Button>
    </ModalFooter>
  </Modal>
  <Modal
    body
    header={$fileList.renameFile}
    isOpen={renaming}
    toggle={() => (renaming = false)}
  >
    <Input type="text" bind:value={newName} />
    <ModalFooter>
      <Button on:click={renameFile}>{$fileList.rename}</Button>
    </ModalFooter>
  </Modal>
  <Modal
    body
    header={$fileList.shareFile}
    isOpen={sharing}
    toggle={cleanShareModal}
  >
    {#if shareUrl.length !== 0}
      <Alert class="mb-2">{shareUrl}</Alert>
    {/if}
    <Input
      class="mb-2"
      bind:value={sharingPassword}
      placeholder={$fileList.passwordOptional}
    />
    <Button on:click={shareFile}>{$fileList.share}</Button>
  </Modal>
  <Modal
    header={$fileList.moveTo}
    body
    isOpen={moving}
    toggle={() => (moving = false)}
  >
    <Move on:moveFile={moveFile} />
  </Modal>
  <!-- File list header -->
  <Row class="p-2">
    <Col xs="auto">
      <Input type="checkbox" class="invisible" />
    </Col>
    <Col xs="6">
      <div class="list-header" on:click={() => sortFiles("name")}>
        {$fileList.fileName}<OrderIndicator key="name" {sortMethod} />
      </div>
    </Col>
    <!-- In mobile, hide time and size -->
    <Col xs="2" class="invisible-sm">
      <div class="list-header" on:click={() => sortFiles("lastModifiedTime")}>
        {$fileList.lastModifiedTime}<OrderIndicator
          key="lastModifiedTime"
          {sortMethod}
        />
      </div>
    </Col>
    <Col class="invisible-sm">
      <div class="list-header" on:click={() => sortFiles("size")}>
        {$fileList.lastModifiedTime}<OrderIndicator key="size" {sortMethod} />
      </div>
    </Col>
    <Col>{$fileList.operation}</Col>
  </Row>
  <!-- Upper folder -->
  <div class="file" on:click={() => clickItem({ name: "..", type: "folder" })}>
    <Row class="align-items-center p-2">
      <Col xs="auto">
        <input class="form-check-input" type="checkbox" on:click={selectAll} />
      </Col>
      <Col xs="6"><Icon name="arrow-90deg-up" /> {$fileList.upperFolder}</Col>
      <Col xs="2" class="invisible-sm" />
      <Col class="invisible-sm" />
      <Col>
        <div class="d-flex" on:click|stopPropagation>
          <Button class="invisible" color="light">
            <Icon name="download" />
          </Button>
          <div class="px-1" />
          <Dropdown>
            <DropdownToggle class="btn btn-light">
              <Icon name="three-dots" />
            </DropdownToggle>
            <DropdownMenu>
              <DropdownItem on:click={() => (uploading = true)}>
                {$fileList.uploadFile}
              </DropdownItem>
              <DropdownItem on:click={() => (creatingFolder = true)}>
                {$fileList.createFolder}
              </DropdownItem>
              {#if selected.length !== 0}
                <DropdownItem on:click={deleteFiles}>
                  {$fileList.deleteSelectedFile}
                </DropdownItem>
                <DropdownItem on:click={startMovingFiles}>
                  {$fileList.moveSelectedFile}
                </DropdownItem>
                <DropdownItem>{$fileList.downloadSelectedFile}</DropdownItem>
              {/if}
            </DropdownMenu>
          </Dropdown>
        </div>
      </Col>
    </Row>
  </div>
  <!-- File list -->
  {#each files as file (file.name)}
    <div class="file" on:click={() => clickItem(file)}>
      <Row class="align-items-center p-2">
        <Col xs="auto">
          <div on:click|stopPropagation>
            <!-- Use raw input element because of the bug in sveltestrap -->
            <input
              class="form-check-input"
              type="checkbox"
              bind:group={selected}
              value={file}
            />
          </div>
        </Col>
        <Col xs="6" class="text-truncate">
          <Icon name={file.type} />
          {file.name}
        </Col>
        <Col xs="2" class="invisible-sm text-truncate">
          {convertTimestamp(file.lastModifiedTime)}
        </Col>
        <Col class="invisible-sm text-truncate">{bytesToSize(file.size)}</Col>
        <Col>
          <div class="d-flex" on:click|stopPropagation>
            <Button color="light" on:click={() => downloadFile(file)}>
              <Icon name="download" />
            </Button>
            <div class="px-1" />
            <Dropdown>
              <DropdownToggle class="btn btn-light">
                <Icon name="three-dots" />
              </DropdownToggle>
              <DropdownMenu>
                <DropdownItem on:click={() => startRenaming(file)}>
                  {$fileList.rename}
                </DropdownItem>
                <DropdownItem on:click={() => deleteFile(file)}>
                  {$fileList.delete}
                </DropdownItem>
                <DropdownItem on:click={() => startSharing(file)}>
                  {$fileList.share}
                </DropdownItem>
                <DropdownItem on:click={() => startMovingFile(file)}>
                  {$fileList.move}
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>
        </Col>
      </Row>
    </div>
  {/each}
</div>

<style>
  @import "../../style/utils.css";

  .file:hover {
    box-shadow: 0 1px 3px var(--bs-gray);
  }

  #file-list {
    user-select: none;
  }

  .list-header:hover {
    border-color: black;
  }
</style>
