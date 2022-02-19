<script>
  import page from "page";
  import Main from "./Main.svelte";
  import Login from "./Login.svelte";
  import Share from "./Share.svelte";
  import Setting from "./Setting.svelte";
  import Footer from "./lib/Footer.svelte";
  import { getFolder } from "./lib/api.js";
  import "bootstrap/dist/css/bootstrap.min.css";
  import "bootstrap-icons/font/bootstrap-icons.css";
  let componment, path, query;

  const setParams = (ctx, next) => {
    path = ctx.params[0];
    query = ctx.querystring;
    next(ctx);
  };

  /**
   * Based on login status, goes to different path
   */
  const verifyLogin = async () => {
    let response = await getFolder("");
    if (Array.isArray(response)) {
      page("/files/");
    } else {
      page("/login");
    }
  };

  page("/login", () => (componment = Login));
  page("/files/*", setParams, () => (componment = Main));
  page("/share", setParams, () => (componment = Share));
  page("/setting", setParams, () => (componment = Setting));
  page("/", verifyLogin);
  page.start();
</script>

<div class="d-flex flex-column" style:height="100vh">
  <div class="flex-shrink-0">
    <svelte:component this={componment} {path} {query} />
  </div>
  <Footer />
</div>
