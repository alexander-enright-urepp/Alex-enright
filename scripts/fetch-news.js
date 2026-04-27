#!/usr/bin/env node
/**
 * fetch-news.js
 * Fetches latest news from NewsAPI, GNews, and NYTimes
 * Stores in Supabase, keeps most recent 100 stories
 */

// Load environment from .env.news file if it exists
const fs = require('fs');
const path = require('path');

const envFile = path.join(__dirname, '..', '.env.news');
if (fs.existsSync(envFile)) {
  const envContent = fs.readFileSync(envFile, 'utf8');
  envContent.split('\n').forEach(line => {
    line = line.trim();
    if (line && !line.startsWith('#') && line.includes('=')) {
      const [key, ...valueParts] = line.split('=');
      const value = valueParts.join('=').trim();
      if (key && value && !process.env[key]) {
        process.env[key] = value;
      }
    }
  });
}

// Configuration - set these via environment variables
const CONFIG = {
  // NewsAPI: https://newsapi.org
  NEWSAPI_KEY: process.env.NEWSAPI_KEY || '',
  // GNews: https://gnews.io
  GNEWS_KEY: process.env.GNEWS_KEY || '',
  // NYTimes: https://developer.nytimes.com
  NYTIMES_KEY: process.env.NYTIMES_KEY || '',
  // Supabase: https://supabase.com
  SUPABASE_URL: process.env.SUPABASE_URL || '',
  SUPABASE_KEY: process.env.SUPABASE_KEY || '',
  // Settings
  MAX_STORIES: 100,
  STATE_FILE: path.join(__dirname, '.news-state.json'),
  LOG_FILE: path.join(__dirname, '.news-fetch.log')
};

// Helper: Log with timestamp
function log(message, level = 'INFO') {
  const timestamp = new Date().toISOString();
  const entry = `[${timestamp}] [${level}] ${message}\n`;
  process.stdout.write(entry);
  fs.appendFileSync(CONFIG.LOG_FILE, entry);
}

// Helper: Load state
function loadState() {
  try {
    if (fs.existsSync(CONFIG.STATE_FILE)) {
      const data = fs.readFileSync(CONFIG.STATE_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (err) {
    log(`Failed to load state: ${err.message}`, 'ERROR');
  }
  return { stories: [], lastFetch: null };
}

// Helper: Save state
function saveState(state) {
  try {
    fs.writeFileSync(CONFIG.STATE_FILE, JSON.stringify(state, null, 2));
  } catch (err) {
    log(`Failed to save state: ${err.message}`, 'ERROR');
  }
}

// Helper: Generate unique story ID
function storyId(story) {
  return `${story.source}-${Buffer.from(story.url || story.title).toString('base64').slice(0, 20)}`;
}

// Fetch from NewsAPI
async function fetchNewsAPI() {
  if (!CONFIG.NEWSAPI_KEY) {
    log('NewsAPI key not configured, skipping', 'WARN');
    return [];
  }

  try {
    const url = `https://newsapi.org/v2/top-headlines?country=us&pageSize=30&apiKey=${CONFIG.NEWSAPI_KEY}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== 'ok') {
      throw new Error(data.message || 'Unknown NewsAPI error');
    }

    const stories = data.articles.map(a => ({
      id: storyId({ source: 'newsapi', url: a.url }),
      title: a.title,
      description: a.description || '',
      url: a.url,
      source: 'newsapi',
      sourceName: a.source?.name || 'NewsAPI',
      publishedAt: a.publishedAt,
      fetchedAt: new Date().toISOString(),
      imageUrl: a.urlToImage || null,
      author: a.author || null
    }));

    log(`Fetched ${stories.length} stories from NewsAPI`);
    return stories;
  } catch (err) {
    log(`NewsAPI fetch failed: ${err.message}`, 'ERROR');
    return [];
  }
}

// Fetch from GNews
async function fetchGNews() {
  if (!CONFIG.GNEWS_KEY) {
    log('GNews key not configured, skipping', 'WARN');
    return [];
  }

  try {
    const url = `https://gnews.io/api/v4/top-headlines?country=us&max=30&apikey=${CONFIG.GNEWS_KEY}`;
    const response = await fetch(url);
    const data = await response.json();

    if (!data.articles) {
      throw new Error(data.errors ? data.errors[0] : 'Unknown GNews error');
    }

    const stories = data.articles.map(a => ({
      id: storyId({ source: 'gnews', url: a.url }),
      title: a.title,
      description: a.description || '',
      url: a.url,
      source: 'gnews',
      sourceName: a.source?.name || 'GNews',
      publishedAt: a.publishedAt,
      fetchedAt: new Date().toISOString(),
      imageUrl: a.image || null,
      author: a.source?.name || null
    }));

    log(`Fetched ${stories.length} stories from GNews`);
    return stories;
  } catch (err) {
    log(`GNews fetch failed: ${err.message}`, 'ERROR');
    return [];
  }
}

// Fetch from NYTimes
async function fetchNYTimes() {
  if (!CONFIG.NYTIMES_KEY) {
    log('NYTimes key not configured, skipping', 'WARN');
    return [];
  }

  try {
    const url = `https://api.nytimes.com/svc/topstories/v2/home.json?api-key=${CONFIG.NYTIMES_KEY}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== 'OK') {
      throw new Error('Unknown NYTimes error');
    }

    const stories = data.results.slice(0, 30).map(a => ({
      id: storyId({ source: 'nytimes', url: a.url }),
      title: a.title,
      description: a.abstract || '',
      url: a.url,
      source: 'nytimes',
      sourceName: 'The New York Times',
      publishedAt: a.published_date,
      fetchedAt: new Date().toISOString(),
      imageUrl: a.multimedia?.[0]?.url || null,
      author: a.byline || null
    }));

    log(`Fetched ${stories.length} stories from NYTimes`);
    return stories;
  } catch (err) {
    log(`NYTimes fetch failed: ${err.message}`, 'ERROR');
    return [];
  }
}

// Store stories in Supabase
async function storeInSupabase(stories) {
  if (!CONFIG.SUPABASE_URL || !CONFIG.SUPABASE_KEY) {
    log('Supabase not configured, skipping storage', 'WARN');
    return false;
  }

  try {
    // Upsert stories to Supabase
    const response = await fetch(`${CONFIG.SUPABASE_URL}/rest/v1/news_stories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': CONFIG.SUPABASE_KEY,
        'Authorization': `Bearer ${CONFIG.SUPABASE_KEY}`,
        'Prefer': 'resolution=merge-duplicates'
      },
      body: JSON.stringify(stories)
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Supabase error: ${error}`);
    }

    log(`Stored ${stories.length} stories in Supabase`);

    // Delete old stories (keep only MAX_STORIES most recent)
    const deleteResponse = await fetch(
      `${CONFIG.SUPABASE_URL}/rest/v1/news_stories?order=fetched_at.desc&offset=${CONFIG.MAX_STORIES}`,
      {
        method: 'DELETE',
        headers: {
          'apikey': CONFIG.SUPABASE_KEY,
          'Authorization': `Bearer ${CONFIG.SUPABASE_KEY}`
        }
      }
    );

    if (!deleteResponse.ok) {
      log('Failed to trim old stories', 'WARN');
    } else {
      log('Trimmed old stories to keep most recent 100');
    }

    return true;
  } catch (err) {
    log(`Supabase storage failed: ${err.message}`, 'ERROR');
    return false;
  }
}

// Main function
async function main() {
  log('=== News Fetch Started ===');

  const state = loadState();
  const allStories = [];

  // Fetch from all sources concurrently
  const [newsapiStories, gnewsStories, nytimesStories] = await Promise.all([
    fetchNewsAPI(),
    fetchGNews(),
    fetchNYTimes()
  ]);

  // Combine all stories
  const newStories = [...newsapiStories, ...gnewsStories, ...nytimesStories];

  // Deduplicate by ID
  const existingIds = new Set(state.stories.map(s => s.id));
  const uniqueNewStories = newStories.filter(s => !existingIds.has(s.id));

  log(`Found ${uniqueNewStories.length} new unique stories`);

  // Add to state
  state.stories = [...uniqueNewStories, ...state.stories];
  state.lastFetch = new Date().toISOString();

  // Trim to MAX_STORIES
  if (state.stories.length > CONFIG.MAX_STORIES) {
    state.stories = state.stories.slice(0, CONFIG.MAX_STORIES);
    log(`Trimmed state to ${CONFIG.MAX_STORIES} stories`);
  }

  // Store in Supabase if configured
  if (CONFIG.SUPABASE_URL && CONFIG.SUPABASE_KEY && uniqueNewStories.length > 0) {
    await storeInSupabase(uniqueNewStories);
  }

  // Save local state
  saveState(state);

  log(`Total stories in state: ${state.stories.length}`);
  log('=== News Fetch Complete ===');

  return {
    fetched: newStories.length,
    newUnique: uniqueNewStories.length,
    total: state.stories.length,
    sources: {
      newsapi: newsapiStories.length,
      gnews: gnewsStories.length,
      nytimes: nytimesStories.length
    }
  };
}

// Run if called directly
if (require.main === module) {
  main()
    .then(result => {
      console.log('\nResult:', JSON.stringify(result, null, 2));
      process.exit(0);
    })
    .catch(err => {
      log(`Fatal error: ${err.message}`, 'ERROR');
      process.exit(1);
    });
}

module.exports = { main, fetchNewsAPI, fetchGNews, fetchNYTimes };
