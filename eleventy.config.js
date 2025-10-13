const { DateTime } = require("luxon");

module.exports = function(eleventyConfig) {
    // Statik dosyaları kopyalama komutları
    eleventyConfig.addPassthroughCopy("css");
    eleventyConfig.addPassthroughCopy("images");
    eleventyConfig.addPassthroughCopy("./favicon/");

    // Tarih formatı için filtre
    eleventyConfig.addFilter("postDate", (dateObj) => {
        return DateTime.fromJSDate(dateObj).setLocale('tr').toLocaleString(DateTime.DATE_FULL);
    });

    // "posts" koleksiyonu
    eleventyConfig.addCollection("posts", function(collectionApi) {
        return collectionApi.getFilteredByTag("posts").reverse();
    });

    return {
        dir: {
            input: ".",
            output: "_site",
            includes: "_includes"
        }
    };
};