<script>
  import * as pathlib from "path-browserify";
  export let file;
  let result = "";

  const fetchAndRender = async () => {
    let response = await fetch(file.src, { credentials: "include" });
    let text = await response.text();
    if (pathlib.extname(file.name) === ".md") {
      let { default: MarkdownIt } = await import("markdown-it");
      let md = new MarkdownIt();
      result = md.render(text);
    } else {
      result = text;
    }
  };

  fetchAndRender();
</script>

<div>
  {@html result}
</div>
