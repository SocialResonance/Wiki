const tailwind = require("tailwindcss");
const postCss = require("postcss");
const autoprefixer = require("autoprefixer");
const cssnano = require("cssnano");
const fs = require('fs');
const path = require('path');
const markdownIt = require("markdown-it");
const uslug = require("uslug");

const postcssFilter = (cssCode, done) => {
  postCss([
    tailwind(require("./tailwind.config")),
    autoprefixer(),
    cssnano({ preset: "default" }),
  ])
    .process(cssCode, {
      from: "./src/_includes/styles/tailwind.css",
    })
    .then(
      (r) => done(null, r.css),
      (e) => done(e, null)
    );
};


module.exports = function (config) {
  config.addWatchTarget("./src/_includes/styles/tailwind.css");
  config.addNunjucksAsyncFilter("postcss", postcssFilter);
  config.addCollection("articleCategories", function (collectionApi) {
    const articlesPath = path.join(__dirname, 'src', 'articles');
    const dirs = fs.readdirSync(articlesPath, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => {
        const name = dirent.name;
        return name.charAt(0).toUpperCase() + name.slice(1);
      });

    return dirs;
  });

  let markdown = markdownIt({
    html: true,
    linkify: true,
    typographer: true,
  })
    .use(require("markdown-it-anchor"), {
      slugify: uslug,
    })
    .use(require("markdown-it-toc-done-right"), {
      slugify: uslug,
      listClass: "list-aligned",
      listType: "ul",
      containerClass: "toc",
      containerId: "toc",
      itemClass: "toc-item",
      linkClass: "toc-link",
    })
    .use(require("markdown-it-footnote"));
  markdown.renderer.rules.footnote_block_open = () => `<hr/>\n<ol>\n`;
  markdown.renderer.rules.footnote_block_close = () => `</ol>\n`;
  config.setLibrary("md", markdown);
  config.addFilter("markdown", (value) => markdown.render(value));

  return {
    passthroughFileCopy: true,
    dir: {
      input: "src",
      includes: "_includes",
      data: "_data",
      output: "_site",
    },
  };
};
