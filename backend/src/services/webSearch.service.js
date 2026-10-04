const axios = require("axios");
const cheerio = require("cheerio");

// ======================================
// LYVO WEB SEARCH SERVICE
// ======================================

async function searchWeb(query, limit = 5) {
  if (!query || !query.trim()) {
    throw new Error("Search query is required.");
  }

  const searchQuery = query.trim();

  const url = "https://html.duckduckgo.com/html/";

  const response = await axios.get(url, {
    params: {
      q: searchQuery,
    },
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/154.0.0.0 Safari/537.36",
    },
    timeout: 15000,
  });

  const $ = cheerio.load(response.data);

  const results = [];

  $(".result").each((index, element) => {
    if (results.length >= limit) {
      return;
    }

    const title = $(element)
      .find(".result__title")
      .text()
      .trim();

    const snippet = $(element)
      .find(".result__snippet")
      .text()
      .trim();

    const link = $(element)
      .find(".result__a")
      .attr("href");

    if (!title || !link) {
      return;
    }

    results.push({
      title,
      snippet,
      url: link,
    });
  });

  return {
    query: searchQuery,
    results,
  };
}

module.exports = {
  searchWeb,
};