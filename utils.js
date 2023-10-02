const fs = require('fs');
const tailwind = require("tailwindcss");
const postCss = require("postcss");
const autoprefixer = require("autoprefixer");
const cssnano = require("cssnano");
const yaml = require('js-yaml');
const path = require('path');

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

 const getDirectories = (source) =>
    fs.readdirSync(source, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name);

 const getMarkdownFiles = (directoryPath) => {
    try {
        const files = fs.readdirSync(directoryPath);
        const mdFiles = files.filter(file => path.extname(file) === '.md');

        return mdFiles;
    } catch (error) {
        console.error(`An error occurred while reading the directory: ${error}`);
        return null;
    }
};

const parseTitleFromMd = (filePath) => {
    try {
      const fileContents = fs.readFileSync(filePath, 'utf8');
      const yamlStart = fileContents.indexOf('---');
      const yamlEnd = fileContents.indexOf('---', yamlStart + 3);
  
      if (yamlStart === -1 || yamlEnd === -1) {
        throw new Error('Invalid MD file. YAML front matter not found.');
      }
  
      const yamlText = fileContents.slice(yamlStart + 3, yamlEnd);
      const parsedYaml = yaml.load(yamlText);
  
      if (!parsedYaml.title) {
        throw new Error('Title not found in YAML front matter.');
      }
  
      return parsedYaml.title;
    } catch (error) {
      console.error(`An error occurred: ${error}`);
      return null;
    }
  };
  

module.exports = {getMarkdownFiles, getDirectories, postcssFilter, parseTitleFromMd}