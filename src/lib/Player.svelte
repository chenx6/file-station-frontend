<script>
  import { onMount, createEventDispatcher } from "svelte";
  import { ListGroup, ListGroupItem, Row, Col, Icon } from "sveltestrap";
  import Plyr from "plyr";
  import * as pathlib from "path-browserify";
  import { supportVideoType, supportAudioType } from "./store.js";
  import "plyr/dist/plyr.css";
  /** @type any[] */
  export let files; // file list
  /** @type any */
  export let selected; // selected file
  const dispatch = createEventDispatcher();
  let player;
  let sources = []; // source list

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

  const clickDownload = (file) => {
    dispatch("clickDownload", file);
  };

  sources = files.map((v) => toSource(v)).filter((v) => v);

  onMount(() => {
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
            on:click={() => switchMedia(i)}
          >
            <div>{source.title}</div>
            <button
              class="btn"
              on:click|stopPropagation={() => clickDownload(source.file)}
            >
              <Icon name="download" />
            </button>
          </div>
        </ListGroupItem>
      {/each}
    </ListGroup>
  </Col>
</Row>
