import axios from 'axios';
import * as cheerio from 'cheerio';

let blogCache = {
  data: null,
  lastFetched: 0
};

const CACHE_DURATION = 1000 * 60 * 30; // 30 minutes

/**
 * Validates if a string is a proper absolute URL
 */
function isValidUrl(string) {
  try {
    const url = new URL(string);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch (_) {
    return false;
  }
}

export async function fetchIplNews() {
  const now = Date.now();
  
  if (blogCache.data && (now - blogCache.lastFetched < CACHE_DURATION)) {
    console.log('Serving IPL news from cache');
    return blogCache.data;
  }

  try {
    console.log('Fetching fresh IPL news from iplt20.com...');
    const response = await axios.get('https://www.iplt20.com/news', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      timeout: 10000
    });

    const $ = cheerio.load(response.data);
    const articles = [];

    $('.ap-video-item, .ap-item-1').each((i, el) => {
      // Limit to 6-9 articles for the homepage
      if (articles.length >= 9) return;

      const title = $(el).find('h3, h2, h4').first().text().trim();
      const dateText = $(el).find('h3, h2, h4').last().text().trim();
      const url = $(el).find('a').attr('href');
      let image = $(el).find('img').attr('src') || $(el).find('img').attr('data-src');
      const summary = $(el).find('.ap-video-desc').text().trim() || "Latest IPL news and updates from the official website.";

      if (title && url) {
        // Normalize URL
        const fullUrl = url.startsWith('http') ? url : `https://www.iplt20.com${url}`;
        
        // Normalize and Validate Image URL
        let finalImage = null;
        if (image) {
          const absoluteImage = image.startsWith('http') ? image : `https://www.iplt20.com${image}`;
          if (isValidUrl(absoluteImage)) {
            finalImage = absoluteImage;
          }
        }

        articles.push({
          id: `news-${i}`,
          title,
          url: fullUrl,
          image: finalImage, // Only send if valid absolute URL, otherwise null
          summary: summary.substring(0, 150),
          source: 'IPLT20',
          publishedAt: dateText || new Date().toISOString()
        });
      }
    });

    if (articles.length === 0) {
      throw new Error('No articles found during parsing');
    }

    blogCache = {
      data: articles,
      lastFetched: now
    };

    return articles;
  } catch (error) {
    console.error('❌ Blog Fetch Error:', error.message);
    
    // Fallback to old cache if available, otherwise return empty
    if (blogCache.data) {
      console.log('Returning stale cache due to fetch error');
      return blogCache.data;
    }
    
    return [];
  }
}
