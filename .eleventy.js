const { DateTime } = require("luxon");
const fs = require("fs");
const SVGO = require("svgo");


function dateToISO(str) {
  return DateTime.fromJSDate(str).toISO({ includeOffset: true, suppressMilliseconds: true });
}

module.exports = function(config) {

  // Opt out of ignoring everything in .gitignore (we want the 'bundles' directory to be processed by eleventy, but don't want it in git)
  config.setUseGitIgnore(false);

  // Add some shortcodes for dates and to construct URLs
  config.addShortcode("isoDate", dateObj => { return dateToISO(dateObj) } );
  config.addShortcode("stripTrailingSlash", string => {
    return string.charAt(string.length - 1) == '/' ? string.slice(0, -1) : string;
  });

  config.addShortcode("svg", svg => {
    return fs.readFileSync("_includes/_svg/" + svg).toString("utf8");
  });
  

	return {
    // We process everything we know how to handle, plus css/js/json/png, which will be passed through (i.e. copied to output directory)
		templateFormats: [
      "png",
      "md",
      "hbs",
      "html",
      "css",
      "js",
      "json"
    ],
    markdownTemplateEngine: "hbs",
    htmlTemplateEngine: "hbs",
    dataTemplateEngine: "hbs",
    passthroughFileCopy: true,
    dir: {
      input: ".",
      includes: "_includes",
      data: "_data",
      output: "_site"
    }
	};
};