<script>
  import { createEventDispatcher } from "svelte";
  import { Icon, Input, Button, ListGroup, ListGroupItem } from "@sveltestrap/sveltestrap";
  import { getFolder } from "./api.js";
  import { calcPath } from "./path.js";
  import { move } from "./translate.js";

  const dispatch = createEventDispatcher();
  let path = $state(""); // folder path
  let folders = $state([]);
  let selected = $state(); // selected folder name

  const clickFolder = (file) => {
    path = calcPath(file, path);
  };

  const selectFolder = () => {
    if (!selected) {
      return;
    }
    let selectedFolder = calcPath({ name: selected }, path);
    dispatch("moveFile", selectedFolder);
  };

  $effect(() => {
    void getFolder(path).then(
      (v) => (folders = v.filter((f) => f.type === "folder"))
    );
  });
</script>

<div id="file-list">
  <ListGroup flush class="pb-2">
    <ListGroupItem>
      <div class="d-flex">
        <Input type="radio" value="." bind:group={selected} />
        <div>{path}/</div>
      </div>
    </ListGroupItem>
    <ListGroupItem action>
      <div class="d-flex">
        <Icon name="arrow-90deg-up" class="pe-2" />
        <div onclick={() => clickFolder({ name: ".." })}>
          {$move.upperFolder}
        </div>
      </div>
    </ListGroupItem>
    {#each folders as folder}
      <ListGroupItem action>
        <div class="d-flex">
          <Input type="radio" value={folder.name} bind:group={selected} />
          <div onclick={() => clickFolder(folder)}>{folder.name}</div>
        </div>
      </ListGroupItem>
    {/each}
  </ListGroup>
  <Button on:click={selectFolder}>{$move.select}</Button>
</div>

<style>
  #file-list {
    user-select: none;
  }
</style>
