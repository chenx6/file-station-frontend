<script>
  import {
    Container,
    Table,
    Button,
    Icon,
    Input,
    Row,
    Col,
    Alert,
    TabContent,
    TabPane,
  } from "sveltestrap";
  import NavBar from "./lib/NavBar.svelte";
  import { deleteShareFile, getShareIndex, resetPassword } from "./lib/api.js";
  import { formatShareUrl } from "./lib/path.js";
  import { onMount } from "svelte";
  import { setting } from "./lib/translate.js";
  let shares = [];
  let oldPassword, newPassword;
  let message = "";

  const resetPasswordHandler = async () => {
    let response = await resetPassword(oldPassword, newPassword);
    if (response.status === 200) {
      message = "Reset success";
    }
  };

  const deleteShareFileHandler = async (path) => {
    let response = await deleteShareFile(path);
    if (response.status === 200) {
      shares = [...shares.filter((v) => v.path !== path)];
    }
  };

  onMount(async () => {
    shares = await getShareIndex();
  });
</script>

<NavBar />
<Container>
  <Row>
    <Col><h1>{$setting.settings}</h1></Col>
  </Row>
  <TabContent>
    <TabPane tabId="password" tab={$setting.password} active>
      <!-- Reset password field -->
      <Row class="py-2">
        <Col><h3>{$setting.resetPassword}</h3></Col>
      </Row>
      <Row>
        <Col>
          {#if message.length !== 0}
            <Alert color="info">
              {message}
            </Alert>
          {/if}
        </Col>
      </Row>
      <Row class="py-2">
        <Col>
          <Input placeholder={$setting.oldPassword} bind:value={oldPassword} />
        </Col>
      </Row>
      <Row class="py-2">
        <Col>
          <Input placeholder={$setting.newPassword} bind:value={newPassword} />
        </Col>
      </Row>
      <Row class="py-2">
        <Col>
          <Button on:click={resetPasswordHandler}>{$setting.reset}</Button>
        </Col>
      </Row>
    </TabPane>
    <TabPane tabId="shareFolder" tab={$setting.shareFolder}>
      <!-- Manage share folder field -->
      <h3 class="py-2">{$setting.shareFolder}</h3>
      <Table>
        <thead>
          <tr>
            <th>{$setting.path}</th>
            <th>{$setting.URL}</th>
            <th>{$setting.password}</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {#each shares as share (share.url)}
            <tr>
              <td>{share.path}</td>
              <td>{formatShareUrl(share.url)}</td>
              <td>
                {#if share.password}
                  {share.password}
                {/if}
              </td>
              <td>
                <Button
                  size="sm"
                  color="light"
                  on:click={() => deleteShareFileHandler(share.path)}
                >
                  <Icon name="x" />
                </Button>
              </td>
            </tr>
          {/each}
        </tbody>
      </Table>
    </TabPane>
  </TabContent>
</Container>
