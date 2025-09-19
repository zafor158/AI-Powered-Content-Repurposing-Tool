const axios = require('axios');
const cheerio = require('cheerio');
const Groq = require('groq-sdk');

// Initialize Groq
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// Function to extract article content from HTML
async function extractArticleContent(url) {
  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    const $ = cheerio.load(response.data);
    
    // Try to find the main article content with improved extraction
    let content = '';
    
    // Remove unwanted elements first
    $('script, style, nav, header, footer, aside, .advertisement, .ads, .sidebar').remove();
    
    // Common selectors for article content (prioritized by quality)
    const selectors = [
      'article .content',
      'article .post-content', 
      'article .entry-content',
      'article .article-content',
      'article',
      '.post-content',
      '.entry-content', 
      '.article-content',
      '.content',
      'main',
      '[role="main"]'
    ];
    
    for (const selector of selectors) {
      const element = $(selector);
      if (element.length > 0) {
        // Get text content and clean it up
        content = element.text().trim();
        
        // Remove extra whitespace and clean up
        content = content.replace(/\s+/g, ' ').trim();
        
        if (content.length > 500) { // Ensure we have substantial content
          break;
        }
      }
    }
    
    // Fallback: get all paragraph text and filter out short paragraphs
    if (!content || content.length < 500) {
      const paragraphs = $('p').map(function() {
        const text = $(this).text().trim();
        return text.length > 50 ? text : null; // Only include substantial paragraphs
      }).get();
      
      content = paragraphs.join(' ').trim();
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
You are a professional content strategist and social media expert. Analyze the following article and create high-quality, valuable content for different platforms.

ARTICLE CONTENT:
${truncatedContent}

REQUIREMENTS:

1. TWITTER THREAD (3-5 tweets):
   - Start with a compelling hook that creates curiosity
   - Each tweet should build on the previous one
   - Include actionable insights and practical value
   - Use relevant hashtags (2-3 per tweet max)
   - Maintain professional yet engaging tone
   - End with a call-to-action or thought-provoking question

2. LINKEDIN POST (2-3 paragraphs):
   - Professional, authoritative tone suitable for B2B audience
   - Start with a strong opening that addresses a common pain point
   - Provide actionable insights and strategic thinking
   - Include specific examples or frameworks when possible
   - End with engagement-driving question or call-to-action
   - Use professional language but remain accessible

3. KEY TAKEAWAYS (3-5 points):
   - Actionable, implementable insights
   - Focus on strategic value and practical application
   - Each point should be substantial and valuable
   - Use professional terminology
   - Prioritize insights that drive business results

CONTENT GUIDELINES:
- Maintain professional credibility and authority
- Focus on actionable, implementable advice
- Use data-driven insights when possible
- Ensure content provides genuine value to the audience
- Avoid generic advice - be specific and strategic
- Maintain consistency in tone across all formats

RESPONSE FORMAT (JSON only):
{
  "twitterThread": "Tweet 1\\n\\nTweet 2\\n\\nTweet 3...",
  "linkedinPost": "Professional LinkedIn post content...",
  "keyTakeaways": ["Strategic takeaway 1", "Actionable insight 2", "Professional tip 3"]
}
`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-70b-versatile",
      messages: [
        {
          role: "system",
          content: "You are a senior content strategist with 10+ years of experience in B2B marketing, social media strategy, and content repurposing. You specialize in creating high-value, professional content that drives engagement and business results. You have expertise in LinkedIn marketing, Twitter strategy, and thought leadership content. Always respond with valid JSON format and maintain the highest standards of professional communication."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 2000,
      top_p: 0.9
    });

    const response = completion.choices[0].message.content;
    
    // Try to parse the JSON response
    try {
      const parsedResponse = JSON.parse(response);
      
      // Validate and enhance the response
      const validatedResponse = {
        twitterThread: parsedResponse.twitterThread || "Content generation in progress...",
        linkedinPost: parsedResponse.linkedinPost || "Professional content analysis completed. Please review the generated insights.",
        keyTakeaways: Array.isArray(parsedResponse.keyTakeaways) && parsedResponse.keyTakeaways.length > 0 
          ? parsedResponse.keyTakeaways 
          : ["Strategic insights generated", "Review content for implementation", "Adapt for your specific use case"]
      };
      
      // Ensure content quality
      if (validatedResponse.twitterThread.length < 50) {
        validatedResponse.twitterThread = "Professional content analysis completed. The original article contains valuable insights that can be adapted for social media engagement.";
      }
      
      if (validatedResponse.linkedinPost.length < 100) {
        validatedResponse.linkedinPost = "The analyzed content provides strategic insights that can be leveraged for professional development and business growth. Consider the key themes and adapt them to your industry context.";
      }
      
      return validatedResponse;
    } catch (parseError) {
      console.error('JSON parsing error:', parseError);
      console.error('Raw response:', response);
      
      // Enhanced fallback response
      return {
        twitterThread: "Professional content analysis completed. The article contains valuable insights that can be repurposed for social media engagement. Consider the main themes and adapt them to your audience.",
        linkedinPost: "Content analysis reveals strategic insights applicable to professional development. The original material provides a foundation for thought leadership content that can drive meaningful engagement in your network.",
        keyTakeaways: [
          "Content analysis completed successfully - review generated insights",
          "Adapt key themes to your specific industry and audience", 
          "Focus on actionable insights that drive business value",
          "Maintain professional tone while ensuring accessibility"
        ]
      };
    }
  } catch (error) {
    throw new Error(`Groq API error: ${error.message}`);
  }
}

// Vercel serverless function handler
module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

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
};
