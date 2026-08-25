<script>
  import Icon from "./Icon.svelte";
  let { key, sortMethod } = $props();
</script>

{#if key == sortMethod.key}
  {#if sortMethod.order == "asc"}
    <Icon name="sort-up" class="px-2" />
  {:else}
    <Icon name="sort-down" class="px-2" />
  {/if}
{/if}
