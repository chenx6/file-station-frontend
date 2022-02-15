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
  } from "sveltestrap";
  import { createEventDispatcher } from "svelte";
  import OrderIndicator from "./OrderIndicator.svelte";
  import Move from "./Move.svelte";
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
  let uploadFiles;
  // New folder
  let creatingFolder = false;
  let newFolderName = "";
  // Share
  let sharing = false;
  let shareUrl = "";
  // Move file
  let moving = false;
  let movingFile;

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

  const deleteFile = (file) => dispatch("deleteFile", file);

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
      callback: () => (uploading = false),
    });
  };

  const shareFile = async (file) => {
    dispatch("share", {
      file,
      callback: (url) => {
        sharing = true;
        shareUrl = url;
      },
    });
  };

  const createNewFolder = () => {
    dispatch("createFolder", { name: newFolderName });
    creatingFolder = false;
  };

  // Pop up a select window, call `moveFile` to finish move file
  const startMovingFile = (file) => {
    moving = true;
    movingFile = file;
  };

  const moveFile = (event) => {
    moving = false;
    dispatch("moveFile", { file: movingFile, newFolder: event.detail });
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
  <Modal
    body
    header="Upload file"
    isOpen={uploading}
    toggle={() => (uploading = false)}
  >
    <Input type="file" bind:files={uploadFiles} />
    <ModalFooter>
      <Button on:click={uploadFile}>Start upload</Button>
    </ModalFooter>
  </Modal>
  <Modal
    body
    header="Create folder"
    isOpen={creatingFolder}
    toggle={() => (creatingFolder = false)}
  >
    <Input type="text" bind:value={newFolderName} />
    <ModalFooter>
      <Button on:click={createNewFolder}>Save</Button>
    </ModalFooter>
  </Modal>
  <Modal
    body
    header="Rename file"
    isOpen={renaming}
    toggle={() => (renaming = false)}
  >
    <Input type="text" bind:value={newName} />
    <ModalFooter>
      <Button on:click={renameFile}>Rename</Button>
    </ModalFooter>
  </Modal>
  <Modal
    body
    header="Share file"
    isOpen={sharing}
    toggle={() => (sharing = false)}
  >
    <p>{shareUrl}</p>
  </Modal>
  <Modal header="Move to" body isOpen={moving} toggle={() => (moving = false)}>
    <Move on:moveFile={moveFile} />
  </Modal>
  <!-- File list header -->
  <Row class="p-2">
    <Col xs="6">
      <div class="list-header" on:click={() => sortFiles("name")}>
        File Name<OrderIndicator key="name" {sortMethod} />
      </div>
    </Col>
    <!-- In mobile, hide time and size -->
    <Col xs="2" class="invisible-sm">
      <div class="list-header" on:click={() => sortFiles("lastModifiedTime")}>
        Last modified time<OrderIndicator key="lastModifiedTime" {sortMethod} />
      </div>
    </Col>
    <Col class="invisible-sm">
      <div class="list-header" on:click={() => sortFiles("size")}>
        Size<OrderIndicator key="size" {sortMethod} />
      </div>
    </Col>
    <Col>Operation</Col>
  </Row>
  <!-- Upper folder -->
  <div class="file" on:click={() => clickItem({ name: "..", type: "folder" })}>
    <Row class="align-items-center p-2">
      <Col xs="6"><Icon name="arrow-90deg-up" /> Upper folder</Col>
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
                Upload file
              </DropdownItem>
              <DropdownItem on:click={() => (creatingFolder = true)}>
                Create folder
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </div>
      </Col>
    </Row>
  </div>
  <!-- File list -->
  {#each files as file}
    <div class="file" on:click={() => clickItem(file)}>
      <Row class="align-items-center p-2">
        <Col xs="6" class="text-truncate">
          <Icon name={file.type} />
          {file.name}
        </Col>
        <Col xs="2" class="invisible-sm text-truncate">
          {convertTimestamp(file.lastModifiedTime)}
        </Col>
        <Col class="invisible-sm text-truncate">{file.size}</Col>
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
                  Rename
                </DropdownItem>
                <DropdownItem on:click={() => deleteFile(file)}>
                  Delete
                </DropdownItem>
                <DropdownItem on:click={() => shareFile(file)}>
                  Share
                </DropdownItem>
                <DropdownItem on:click={() => startMovingFile(file)}>
                  Move
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
