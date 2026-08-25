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
    Alert,
  } from "@sveltestrap/sveltestrap";
  import Icon from "./Icon.svelte";
  import OrderIndicator from "./OrderIndicator.svelte";
  import Move from "./Move.svelte";
  import { fileList } from "./translate.js";
  let {
    files = $bindable([]),
    onClickFile,
    onDownloadFile,
    onDeleteFile,
    onRenameFile,
    onUploadFile,
    onClickFolder,
    onCreateFolder,
    onShare,
    onMoveFile,
    onCloseModal,
  } = $props();
  // Sorting
  let sortMethod = $state({ key: "name", order: "asc" });
  // Renaming
  let newName = $state("");
  let renamingFile;
  let renaming = $state(false);
  // Uploading
  let uploading = $state(false);
  let uploadingProgess = $state(-1);
  let uploadFiles = $state();
  // New folder
  let creatingFolder = $state(false);
  let newFolderName = $state("");
  // Share
  let sharing = $state(false);
  let sharingFile;
  let sharingPassword = $state("");
  let shareUrl = $state("");
  // Move file
  let moving = $state(false);
  let movingFile = [];
  // Selected
  let selected = $state([]);

  const clickItem = (file) => {
    switch (file.type) {
      case "file":
        onClickFile?.(file);
        break;
      case "folder":
        onClickFolder?.(file);
      default:
        break;
    }
  };

  // Pop up rename window, use `renameFile` to finish rename
  const startRenaming = (file) => {
    renaming = true;
    newName = file.name;
    renamingFile = file;
  };

  const renameFile = () => {
    onRenameFile?.({ file: renamingFile, newName });
    renaming = false;
  };

  const uploadFinish = () => {
    uploadingProgess = -1;
    uploading = false;
    onCloseModal?.();
  };

  // Pop up sharing window, wait for password input
  // call `shareFile` to continue sharing
  const startSharing = (file) => {
    sharing = true;
    sharingFile = file;
  };

  const cleanShareModal = () => {
    sharing = false;
    shareUrl = "";
  };

  const createNewFolder = () => {
    onCreateFolder?.({ name: newFolderName });
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

  const moveFile = (newFolder) => {
    moving = false;
    onMoveFile?.({ file: movingFile, newFolder });
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

  // Sort file order without mutating the files prop.
  let sortedFiles = $derived.by(() => {
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
    return [...files].sort(cmpFn);
  });
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
        <Button
          on:click={() =>
            onUploadFile?.({
              files: uploadFiles,
              monitor: (progress) => (uploadingProgess = progress),
            })}
        >
          {$fileList.startUpload}
        </Button>
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
    <Button
      on:click={() =>
        onShare?.({
          file: sharingFile,
          password: sharingPassword,
          callback: (url) => (shareUrl = url),
        })}
    >
      {$fileList.share}
    </Button>
  </Modal>
  <Modal
    header={$fileList.moveTo}
    body
    isOpen={moving}
    toggle={() => (moving = false)}
  >
    <Move onMoveFile={moveFile} />
  </Modal>
  <!-- File list header -->
  <Row class="p-2">
    <Col xs="auto">
      <Input type="checkbox" class="invisible" />
    </Col>
    <Col xs="6">
      <div class="list-header" onclick={() => sortFiles("name")}>
        {$fileList.fileName}<OrderIndicator key="name" {sortMethod} />
      </div>
    </Col>
    <!-- In mobile, hide time and size -->
    <Col xs="2" class="invisible-sm">
      <div class="list-header" onclick={() => sortFiles("lastModifiedTime")}>
        {$fileList.lastModifiedTime}<OrderIndicator
          key="lastModifiedTime"
          {sortMethod}
        />
      </div>
    </Col>
    <Col class="invisible-sm">
      <div class="list-header" onclick={() => sortFiles("size")}>
        {$fileList.lastModifiedTime}<OrderIndicator key="size" {sortMethod} />
      </div>
    </Col>
    <Col>{$fileList.operation}</Col>
  </Row>
  <!-- Upper folder -->
  <div class="file" onclick={() => clickItem({ name: "..", type: "folder" })}>
    <Row class="align-items-center p-2">
      <Col xs="auto">
        <input class="form-check-input" type="checkbox" onclick={selectAll} />
      </Col>
      <Col xs="6"><Icon name="arrow-90deg-up" /> {$fileList.upperFolder}</Col>
      <Col xs="2" class="invisible-sm" />
      <Col class="invisible-sm" />
      <Col>
        <div class="d-flex" onclick={(event) => event.stopPropagation()}>
          <Button class="invisible" color="light">
            <Icon name="download" />
          </Button>
          <div class="px-1"></div>
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
                <DropdownItem on:click={() => onDeleteFile?.(selected)}>
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
  {#each sortedFiles as file (file.name)}
    <div class="file" onclick={() => clickItem(file)}>
      <Row class="align-items-center p-2">
        <Col xs="auto">
          <div onclick={(event) => event.stopPropagation()}>
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
          <div class="d-flex" onclick={(event) => event.stopPropagation()}>
            <Button color="light" on:click={() => onDownloadFile?.(file)}>
              <Icon name="download" />
            </Button>
            <div class="px-1"></div>
            <Dropdown>
              <DropdownToggle class="btn btn-light">
                <Icon name="three-dots" />
              </DropdownToggle>
              <DropdownMenu>
                <DropdownItem on:click={() => startRenaming(file)}>
                  {$fileList.rename}
                </DropdownItem>
                <DropdownItem on:click={() => onDeleteFile?.([file])}>
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
