<script>
  import page from "page";
  import Main from "./Main.svelte";
  import Login from "./Login.svelte";
  import Share from "./Share.svelte";
  import Setting from "./Setting.svelte";
  import { fetchFolderContent } from "./lib/api.js";
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
    let response = await fetchFolderContent("");
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

<svelte:component this={componment} {path} {query} />
