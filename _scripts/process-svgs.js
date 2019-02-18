const fs = require('fs');
const path = require('path');
const SVGO = require('svgo');
const { promisify } = require('util');

const readFile = promisify(fs.readFile);

async function findSVGs(ignorelist, cwd = '.') {
  let svgs = [];
  let dirEntries = fs.readdirSync(cwd, {withFileTypes: true});

  for (let dirEntry of dirEntries) {
    // ignore stuff in the ignorelist
    let ignore = false;
    for (let ignoreentry of ignorelist) {
      if (path.resolve(ignoreentry) === path.resolve(cwd, dirEntry.name)) {
        ignore = true;
        break;
      }
    }
    if (!ignore) {
      if (dirEntry.isDirectory()) {
        svgs.push(...await findSVGs(ignorelist, path.join(cwd, dirEntry.name)));
      } else if (dirEntry.name.match(/\.svg$/i)) {
        svgs.push(path.join(cwd, dirEntry.name))
      }
    }
  }

  return svgs;
}

async function processSVGs(svgs = []) {
  
  const svgo = new SVGO({
    plugins: [{
      cleanupAttrs: true,
    }, {
      removeDoctype: true,
    },{
      removeXMLProcInst: true,
    },{
      removeComments: true,
    },{
      removeMetadata: true,
    },{
      removeTitle: true,
    },{
      removeDesc: true,
    },{
      removeUselessDefs: true,
    },{
      removeEditorsNSData: true,
    },{
      removeEmptyAttrs: true,
    },{
      removeHiddenElems: true,
    },{
      removeEmptyText: true,
    },{
      removeEmptyContainers: true,
    },{
      removeViewBox: false,
    },{
      cleanupEnableBackground: true,
    },{
      convertStyleToAttrs: true,
    },{
      convertColors: true,
    },{
      convertPathData: true,
    },{
      convertTransform: true,
    },{
      removeUnknownsAndDefaults: true,
    },{
      removeNonInheritableGroupAttrs: true,
    },{
      removeUselessStrokeAndFill: true,
    },{
      removeUnusedNS: true,
    },{
      cleanupIDs: true,
    },{
      cleanupNumericValues: true,
    },{
      moveElemsAttrsToGroup: true,
    },{
      moveGroupAttrsToElems: true,
    },{
      collapseGroups: true,
    },{
      removeRasterImages: false,
    },{
      mergePaths: true,
    },{
      convertShapeToPath: true,
    },{
      sortAttrs: true,
    },{
      removeDimensions: true,
    }/*,{
      removeAttrs: {attrs: '(stroke|fill)'},
    }*/]
  });

  for (let svg of svgs) {
    console.log("Optimizing svg file " + svg);
    readFile(svg)
    .then(buffer => svgo.optimize(buffer.toString('utf8')))
    .then(optimizedSVG => {
      fs.writeFile(path.join('_includes', '_svg', path.parse(svg).base), optimizedSVG.data, (err) => {});
    });
  }
}

console.log("Processing SVGs...")
var ignore = fs.readFileSync('.eleventyignore');
var ignorelist = ignore.toString('utf8').split('\n');
for (let i = 0; i < ignorelist.length; i++) {
  ignorelist[i] = ignorelist[i].trim();
}

fs.mkdirSync('_includes/_svg');
findSVGs(ignorelist).then(processSVGs);