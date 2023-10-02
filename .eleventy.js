
const path = require('path');
const markdownIt = require("markdown-it");
const uslug = require("uslug");
const { postcssFilter, getDirectories, getMarkdownFiles, parseTitleFromMd } = require("./utils.js")
const articlesPath = path.join(__dirname, 'src', 'articles');
const articleCategories = getDirectories(articlesPath);

module.exports = function (config) {
  config.addWatchTarget("./src/_includes/styles/tailwind.css");
  config.addNunjucksAsyncFilter("postcss", postcssFilter);

  config.addCollection("articleCategories", function (collectionApi) {
    return articleCategories
  })


  articleCategories.forEach((category) => {
    let categoryArticles = []
    const categoryPath = path.join(__dirname, 'src', 'articles', category);
    const articleMdFiles = getMarkdownFiles(categoryPath)
    articleMdFiles.forEach(articleMdFile => {
      const title = parseTitleFromMd(categoryPath + "/" + articleMdFile)
      const permalink = "/articles/" + category + "/" + articleMdFile.slice(0, -3)
      categoryArticles.push({ title, permalink })
    })
    console.log('categoryArticles', categoryArticles)
    config.addCollection(category, function (collectionApi) {
      return categoryArticles
    })
  })

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
