<script>
  import {
    Collapse,
    Container,
    Navbar,
    NavbarToggler,
    NavbarBrand,
    Nav,
    NavItem,
    Input,
    InputGroup,
    Button,
  } from "sveltestrap";
  import { createEventDispatcher } from "svelte";
  import page from "page";
  export let path = ""; // Show path breadcrumb
  const dispatch = createEventDispatcher();
  let isOpen = false; // Indicate the menu
  let searchContent = "";

  function handleUpdate(event) {
    isOpen = event.detail.isOpen;
  }

  function search() {
    dispatch("search", searchContent);
  }

  function gotoFolderIndex(idx) {
    dispatch("gotoIndex", idx);
  }

  $: folders = path.split("/");
</script>

<!--
  @component
  Global NavBar component
  Show path breadcrumb and options
-->
<Navbar container={false} color="light" light expand="md">
  <Container>
    <NavbarBrand href="/">
      <div class="d-flex align-items-center">
        <img
          width="20"
          src="/streamline-icon-interface-folder-check@48x48.png"
          alt="logo"
          class="mx-2"
        />
        File Station
      </div>
    </NavbarBrand>
    <NavbarToggler on:click={() => (isOpen = !isOpen)} />
    <Collapse {isOpen} navbar expand="md" on:update={handleUpdate}>
      <!-- Nav's left side -->
      <Nav class="me-auto" navbar>
        <NavItem>
          <!-- Use hand-written div to remove breadcrumb's margin -->
          <div class="breadcrumb align-items-center">
            <div class="breadcrumb-item">
              <span class="link-primary" on:click={() => gotoFolderIndex(0)}>
                Home
              </span>
            </div>
            {#each folders as folder, i}
              {@const last = i === folders.length - 1}
              <div
                class="breadcrumb-item {last && 'active'}"
                aria-current={last ? "page" : "false"}
              >
                <span
                  class="link-primary"
                  on:click={() => gotoFolderIndex(i + 1)}
                >
                  {folder}
                </span>
              </div>
            {/each}
          </div>
        </NavItem>
      </Nav>
      <!-- Nav's right side -->
      <div class="d-flex">
        <InputGroup>
          <Input type="text" bind:value={searchContent} />
          <Button on:click={search}>Search</Button>
        </InputGroup>
        <Button class="ms-2" on:click={() => page("/setting")}>Settings</Button>
      </div>
    </Collapse>
  </Container>
</Navbar>

<style>
  .breadcrumb {
    margin-bottom: 0;
  }
</style>
