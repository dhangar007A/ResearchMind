const axios = require('axios');
const ResearchJob = require('../models/ResearchJob');
const { scrapeUrl } = require('./scraperService');

// API configurations
const TAVILY_API_KEY = process.env.TAVILY_API_KEY || process.env.TAVILY_AP_KEY;
const MISTRAL_API_KEY = process.env.MISTRAL_API_KEY;
const MISTRAL_MODEL = 'mistral-small-latest'; // equivalent to mistral-small in API

/**
 * Call Mistral AI chat completion API.
 */
async function callMistral(systemPrompt, userPrompt) {
  if (!MISTRAL_API_KEY) {
    throw new Error('MISTRAL_API_KEY is not defined in the environment.');
  }

  try {
    const response = await axios.post(
      'https://api.mistral.ai/v1/chat/completions',
      {
        model: MISTRAL_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0
      },
      {
        headers: {
          'Authorization': `Bearer ${MISTRAL_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data.choices[0].message.content.trim();
  } catch (error) {
    const errorMsg = error.response && error.response.data 
      ? JSON.stringify(error.response.data) 
      : error.message;
    throw new Error(`Mistral API error: ${errorMsg}`);
  }
}

/**
 * Run Tavily Search API.
 */
async function runTavilySearch(query) {
  if (!TAVILY_API_KEY) {
    throw new Error('TAVILY_API_KEY is not defined in the environment.');
  }

  try {
    const response = await axios.post('https://api.tavily.com/search', {
      api_key: TAVILY_API_KEY,
      query: query,
      max_results: 5
    });

    const results = response.data.results || [];
    const out = [];

    for (const r of results) {
      out.push(`Title: ${r.title}\nURL: ${r.url}\nSnippet: ${r.content ? r.content.substring(0, 300) : ''}\n`);
    }

    return {
      text: out.join('\n----\n'),
      rawResults: results
    };
  } catch (error) {
    const errorMsg = error.response && error.response.data 
      ? JSON.stringify(error.response.data) 
      : error.message;
    throw new Error(`Tavily search failed: ${errorMsg}`);
  }
}

/**
 * Run the research pipeline from end to end.
 * Updates the DB document progressively.
 */
async function runResearchPipeline(jobId) {
  console.log(`Starting research pipeline for job: ${jobId}`);
  const job = await ResearchJob.findById(jobId);
  if (!job) {
    console.error(`Job ${jobId} not found in DB`);
    return;
  }

  try {
    // ----------------------------------------------------
    // Step 1: Search Agent
    // ----------------------------------------------------
    console.log(`[Job ${jobId}] Step 1: Searching for topic: "${job.topic}"`);
    job.status = 'searching';
    await job.save();

    const searchQuery = `Find recent, reliable and detailed information about: ${job.topic}`;
    const searchData = await runTavilySearch(searchQuery);

    job.searchResults = searchData.text;
    job.status = 'reading';
    await job.save();

    // ----------------------------------------------------
    // Step 2: Reader Agent - Pick a URL and scrape it
    // ----------------------------------------------------
    console.log(`[Job ${jobId}] Step 2: Reader selecting URL to scrape`);
    
    // Prompt Mistral to pick the single best URL
    const readerSystemPrompt = "You are a precise reader agent. Your task is to pick the single most relevant and promising URL from the search results to scrape for deeper reading.";
    const readerUserPrompt = `Based on the following search results about '${job.topic}', pick the single most relevant URL to scrape for deeper content.
Respond with ONLY the raw URL, and absolutely nothing else. Do not write explanations, introduction, markdown quotes, or formatting.

Search Results:
${searchData.text}`;

    let selectedUrl = '';
    try {
      const llmResponse = await callMistral(readerSystemPrompt, readerUserPrompt);
      // Clean LLM response (sometimes it puts markdown links or ticks)
      const urlRegex = /(https?:\/\/[^\s`"]+)/g;
      const match = llmResponse.match(urlRegex);
      if (match && match.length > 0) {
        selectedUrl = match[0];
      } else {
        selectedUrl = llmResponse.trim();
      }
    } catch (llmErr) {
      console.warn(`[Job ${jobId}] Mistral URL selection failed: ${llmErr.message}. Falling back to first search result.`);
    }

    // Fallback if no URL extracted, pick the first search result URL
    if (!selectedUrl || !selectedUrl.startsWith('http')) {
      if (searchData.rawResults && searchData.rawResults.length > 0) {
        selectedUrl = searchData.rawResults[0].url;
      }
    }

    if (!selectedUrl) {
      throw new Error("No valid search result URL found to scrape.");
    }

    job.selectedUrl = selectedUrl;
    await job.save();

    console.log(`[Job ${jobId}] Selected URL: "${selectedUrl}". Scraping content...`);
    let scrapedContent = '';
    try {
      scrapedContent = await scrapeUrl(selectedUrl);
    } catch (scrapeErr) {
      scrapedContent = `Could not scrape URL: ${scrapeErr.message}`;
    }

    job.scrapedContent = scrapedContent;
    job.status = 'writing';
    await job.save();

    // ----------------------------------------------------
    // Step 3: Writer Chain - Write report
    // ----------------------------------------------------
    console.log(`[Job ${jobId}] Step 3: Writer drafting report`);
    const writerSystemPrompt = "You are an expert research writer. Write clear, structured and insightful reports.";
    const researchCombined = `SEARCH RESULTS:\n${job.searchResults}\n\nDETAILED SCRAPED CONTENT:\n${job.scrapedContent}`;
    const writerUserPrompt = `Write a detailed research report on the topic below.

Topic: ${job.topic}

Research Gathered:
${researchCombined}

Structure the report as:
- Introduction
- Key Findings (minimum 3 well-explained points)
- Conclusion
- Sources (list all URLs found in the research)

Be detailed, factual and professional.`;

    const reportContent = await callMistral(writerSystemPrompt, writerUserPrompt);
    job.report = reportContent;
    job.status = 'critiquing';
    await job.save();

    // ----------------------------------------------------
    // Step 4: Critic Chain - Review and score
    // ----------------------------------------------------
    console.log(`[Job ${jobId}] Step 4: Critic reviewing report`);
    const criticSystemPrompt = "You are a sharp and constructive research critic. Be honest and specific.";
    const criticUserPrompt = `Review the research report below and evaluate it strictly.

Report:
${job.report}

Respond in this exact format:

Score: X/10

Strengths:
- ...
- ...

Areas to Improve:
- ...
- ...

One line verdict:
...`;

    const feedbackContent = await callMistral(criticSystemPrompt, criticUserPrompt);
    job.feedback = feedbackContent;

    // Parse score from feedback (e.g. "Score: 8/10", "Score: 8.5/10", "8/10")
    let score = 0;
    const scoreMatch = feedbackContent.match(/Score:\s*([\d.]+)\s*\/10/i);
    if (scoreMatch && scoreMatch[1]) {
      score = parseFloat(scoreMatch[1]);
    } else {
      // Fallback parse
      const altMatch = feedbackContent.match(/([\d.]+)\/10/);
      if (altMatch && altMatch[1]) {
        score = parseFloat(altMatch[1]);
      }
    }

    job.score = isNaN(score) ? 0 : score;
    job.status = 'completed';
    await job.save();

    console.log(`[Job ${jobId}] Research pipeline completed successfully! Score: ${job.score}`);

  } catch (error) {
    console.error(`[Job ${jobId}] Pipeline failed: ${error.message}`);
    job.status = 'failed';
    job.error = error.message;
    await job.save();
  }
}

module.exports = {
  runResearchPipeline
};
