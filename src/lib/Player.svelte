<script>
  import { onMount } from "svelte";
  import { ListGroup, ListGroupItem, Row, Col, Icon } from "@sveltestrap/sveltestrap";
  import * as pathlib from "path-browserify";
  import { supportVideoType, supportAudioType } from "./store.js";
  import "plyr/dist/plyr.css";
  
  
  /**
   * @typedef {Object} Props
   * @property {any} files - file list
   * @property {any} selected - selected file
   * @property {(file: any) => void} [onClickDownload]
   */

  /** @type {Props} */
  let { files, selected, onClickDownload } = $props();
  let player;
  let sources = $state([]); // source list

  const switchMedia = (idx) => {
    player.source = sources[idx];
  };

  // Cover `IFile` type to `Source` type
  const toSource = (file) => {
    let ext = pathlib.extname(file.name);
    let fmt = ext.substring(1);
    let type, detailType;
    // Judge file type
    if (supportVideoType.includes(ext)) {
      type = "video";
      detailType = `video/${fmt}`;
    } else if (supportAudioType.includes(ext)) {
      type = "audio";
      detailType = `audio/${fmt}`;
    }
    if (!type) {
      return;
    }
    return {
      file, // Save origin data
      type,
      title: file.name,
      sources: [
        {
          src: file.src,
          type: detailType,
        },
      ],
    };
  };

  sources = files.map((v) => toSource(v)).filter((v) => v);

  onMount(async () => {
    const { default: Plyr } = await import("plyr");
    player = new Plyr("#player");
    // @ts-ignore
    player.source = toSource(selected);
  });
</script>

<!-- Player -->
<Row>
  <Col>
    <video id="player" playsinline controls>
      <source src={selected.src} type="video/mp4" />
      <track kind="captions" />
    </video>
  </Col>
</Row>
<!-- Playlist -->
<Row class="py-2">
  <Col>
    <ListGroup>
      {#each sources as source, i}
        <ListGroupItem action>
          <div
            class="d-flex justify-content-between"
            onclick={() => switchMedia(i)}
          >
            <div>{source.title}</div>
            <button
              class="btn"
              onclick={(event) => {
                event.stopPropagation();
                onClickDownload?.(source.file);
              }}
            >
              <Icon name="download" />
            </button>
          </div>
        </ListGroupItem>
      {/each}
    </ListGroup>
  </Col>
</Row>
