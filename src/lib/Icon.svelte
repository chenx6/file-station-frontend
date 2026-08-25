<script>
  import arrow90degUp from "bootstrap-icons/icons/arrow-90deg-up.svg?raw";
  import download from "bootstrap-icons/icons/download.svg?raw";
  import file from "bootstrap-icons/icons/file.svg?raw";
  import folder from "bootstrap-icons/icons/folder.svg?raw";
  import sortDown from "bootstrap-icons/icons/sort-down.svg?raw";
  import sortUp from "bootstrap-icons/icons/sort-up.svg?raw";
  import threeDots from "bootstrap-icons/icons/three-dots.svg?raw";
  import x from "bootstrap-icons/icons/x.svg?raw";

  const icons = {
    "arrow-90deg-up": arrow90degUp,
    download,
    file,
    folder,
    "sort-down": sortDown,
    "sort-up": sortUp,
    "three-dots": threeDots,
    x,
  };

  let { name, class: className = "" } = $props();
  let svg = $derived(icons[name]);
</script>

{#if svg}
  <span class={className} aria-hidden="true">{@html svg}</span>
{/if}

<style>
  span {
    display: inline-flex;
    align-items: center;
    line-height: 1;
    vertical-align: -0.125em;
  }

  span :global(svg) {
    width: 1em;
    height: 1em;
    fill: currentColor;
  }
</style>
