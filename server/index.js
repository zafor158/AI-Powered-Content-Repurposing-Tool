const express = require('express');
const cors = require('cors');
const axios = require('axios');
const cheerio = require('cheerio');
const Groq = require('groq-sdk');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize Groq
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// Middleware
app.use(cors());
app.use(express.json());

// Function to extract article content from HTML
async function extractArticleContent(url) {
  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    const $ = cheerio.load(response.data);
    
    // Try to find the main article content
    let content = '';
    
    // Common selectors for article content
    const selectors = [
      'article',
      '.article-content',
      '.post-content',
      '.entry-content',
      '.content',
      'main',
      '[role="main"]'
    ];
    
    for (const selector of selectors) {
      const element = $(selector);
      if (element.length > 0) {
        content = element.text().trim();
        if (content.length > 200) { // Ensure we have substantial content
          break;
        }
      }
    }
    
    // Fallback: get all paragraph text
    if (!content || content.length < 200) {
      content = $('p').text().trim();
    }
    
    // Clean up the content
    content = content.replace(/\s+/g, ' ').trim();
    
    return content;
  } catch (error) {
    throw new Error(`Failed to extract content from URL: ${error.message}`);
  }
}

// Function to generate content using Groq
async function generateContent(articleContent) {
  try {
    // Truncate content to avoid token limit (approximately 3000 characters to stay under 8000 token limit)
    const maxContentLength = 3000;
    const truncatedContent = articleContent.length > maxContentLength 
      ? articleContent.substring(0, maxContentLength) + "..."
      : articleContent;
    
    console.log(`Original content length: ${articleContent.length} characters`);
    console.log(`Truncated content length: ${truncatedContent.length} characters`);

    const prompt = `
Please analyze the following article content and create:

1. A Twitter thread (3-5 tweets) that captures the key points in an engaging way
2. A LinkedIn post (professional tone, 2-3 paragraphs) that summarizes the main insights
3. Three key takeaways as bullet points

Article content:
${truncatedContent}

Please format your response as JSON with the following structure:
{
  "twitterThread": "Tweet 1\\n\\nTweet 2\\n\\nTweet 3...",
  "linkedinPost": "Professional LinkedIn post content...",
  "keyTakeaways": ["Takeaway 1", "Takeaway 2", "Takeaway 3"]
}
`;

    const completion = await groq.chat.completions.create({
      model: "openai/gpt-oss-20b",
      messages: [
        {
          role: "system",
          content: "You are a content marketing expert who specializes in repurposing long-form content for social media. Always respond with valid JSON format."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1500
    });

    const response = completion.choices[0].message.content;
    
    // Try to parse the JSON response
    try {
      return JSON.parse(response);
    } catch (parseError) {
      // If JSON parsing fails, return a structured response
      return {
        twitterThread: response,
        linkedinPost: "Content generation completed. Please check the Twitter thread for the main content.",
        keyTakeaways: ["Content generated successfully", "Review the Twitter thread for key points", "Adapt content for your specific audience"]
      };
    }
  } catch (error) {
    throw new Error(`Groq API error: ${error.message}`);
  }
}

// API endpoint
app.post('/api/repurpose', async (req, res) => {
  try {
    const { url } = req.body;
    
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    console.log(`Processing URL: ${url}`);
    
    // Extract article content
    const articleContent = await extractArticleContent(url);
    
    if (!articleContent || articleContent.length < 100) {
      return res.status(400).json({ error: 'Could not extract sufficient content from the URL' });
    }

    console.log(`Extracted content length: ${articleContent.length} characters`);
    
    // Generate repurposed content
    const repurposedContent = await generateContent(articleContent);
    
    console.log('Content generation completed successfully');
    
    res.json(repurposedContent);
  } catch (error) {
    console.error('Error processing request:', error);
    res.status(500).json({ error: error.message });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});
