<script>
  import { Carousel, CarouselControl, CarouselItem } from "sveltestrap";
  /** @type any[] */
  export let files;
  export let selected;
  let items = files.map((v) => v.src);
  let activeIndex = files.findIndex((v) => v.name === selected.name);
</script>

<Carousel {items} bind:activeIndex interval={false} ride={false}>
  <div class="carousel-inner">
    {#each items as item, index}
      <CarouselItem bind:activeIndex itemIndex={index}>
        <img src={item} alt={`${item} ${index + 1}`} class="d-block w-100" />
      </CarouselItem>
    {/each}
  </div>
  <CarouselControl direction="prev" bind:activeIndex {items} />
  <CarouselControl direction="next" bind:activeIndex {items} />
</Carousel>
