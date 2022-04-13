<script>
  // @ts-nocheck
  import { Input, Label, Container, Button, Alert } from "sveltestrap";
  import { register, login } from "./lib/api.js";
  import page from "page";
  import { login as loginTr } from "./lib/translate.js";

  let alert = { message: "", color: "" };
  let username, password;
  const loginHandler = async () => {
    let response = await login(username, password);
    if (response.status !== 200) {
      alert = { message: "Login fail!", color: "warning" };
      return;
    }
    let data = await response.json();
    localStorage.setItem("token", data.token);
    page("/files/");
  };

  const registerHandler = async () => {
    let response = await register(username, password);
    if (response.status !== 200) {
      alert = { message: "Register fail!", color: "warning" };
    } else {
      alert = { message: "Register success", color: "success" };
    }
  };
</script>

<Container>
  <main class="form-signin">
    {#if alert.message.length !== 0}
      <Alert color={alert.color}>
        {alert.message}
      </Alert>
    {/if}
    <h3>File station</h3>
    <p>{$loginTr.justANetDist}</p>
    <Label for="username">{$loginTr.username}</Label>
    <Input type="text" bind:value={username} />
    <Label for="password">{$loginTr.password}</Label>
    <Input type="password" class="mb-3" bind:value={password} />
    <Button on:click={loginHandler}>{$loginTr.login}</Button>
    <Button on:click={registerHandler}>{$loginTr.register}</Button>
  </main>
</Container>

<style>
  .form-signin {
    width: 100%;
    max-width: 330px;
    padding: 15px;
    margin: auto;
  }
</style>
