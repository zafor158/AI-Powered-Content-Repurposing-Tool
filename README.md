# AI-Powered Content Repurposing Tool

A full-stack web application that transforms long-form blog content into social media posts. Simply paste a blog URL, and the tool will generate a Twitter thread, LinkedIn post, and key takeaways using AI.

## Features

- **Web Scraping**: Extracts content from blog posts using axios and cheerio
- **AI Content Generation**: Uses Groq's Llama 3.1 70B model to repurpose content
- **Multiple Formats**: Generates Twitter threads, LinkedIn posts, and key takeaways
- **Modern UI**: Built with React, Vite, and Tailwind CSS
- **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

### Frontend
- React 18
- Vite
- Tailwind CSS
- Modern JavaScript (ES6+)

### Backend
- Node.js
- Express.js
- Groq API
- Axios (web scraping)
- Cheerio (HTML parsing)
- CORS enabled

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Groq API key

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ai-content-repurposing-tool
   ```

2. **Install frontend dependencies**
   ```bash
   cd client
   npm install
   ```

3. **Install backend dependencies**
   ```bash
   cd ../server
   npm install
   ```

4. **Set up environment variables**
   ```bash
   cd server
   cp env.example .env
   ```
   
   Edit the `.env` file and add your Groq API key:
   ```
   GROQ_API_KEY=your_actual_groq_api_key_here
   PORT=3001
   ```

## Running the Application

### Development Mode

1. **Start the backend server**
   ```bash
   cd server
   npm run dev
   ```
   The server will start on http://localhost:3001

2. **Start the frontend development server**
   ```bash
   cd client
   npm run dev
   ```
   The frontend will start on http://localhost:5173

### Production Mode

1. **Build the frontend**
   ```bash
   cd client
   npm run build
   ```

2. **Start the backend**
   ```bash
   cd server
   npm start
   ```

## Usage

1. Open the application in your browser (http://localhost:5173 in development)
2. Paste a blog post URL into the input field
3. Click "Generate Content"
4. Wait for the AI to process the content
5. View the generated Twitter thread, LinkedIn post, and key takeaways

## API Endpoints

### POST /api/repurpose
Repurposes content from a given URL.

**Request Body:**
```json
{
  "url": "https://example.com/blog-post"
}
```

**Response:**
```json
{
  "twitterThread": "Tweet 1\n\nTweet 2\n\nTweet 3...",
  "linkedinPost": "Professional LinkedIn post content...",
  "keyTakeaways": ["Takeaway 1", "Takeaway 2", "Takeaway 3"]
}
```

### GET /health
Health check endpoint.

**Response:**
```json
{
  "status": "OK",
  "message": "Server is running"
}
```

## Project Structure

```
ai-content-repurposing-tool/
├── client/                 # React frontend
│   ├── src/
│   │   ├── App.jsx        # Main React component
│   │   ├── index.css      # Tailwind CSS imports
│   │   └── main.jsx       # React entry point
│   ├── package.json
│   └── vite.config.js
├── server/                 # Express backend
│   ├── index.js           # Main server file
│   ├── package.json
│   └── env.example        # Environment variables template
└── README.md
```

## Key Learning Concepts

This project demonstrates several important full-stack development concepts:

1. **Backend-for-Frontend (BFF) Pattern**: The frontend only communicates with its own backend, which orchestrates external API calls
2. **CORS Configuration**: Enabling cross-origin requests between frontend and backend
3. **Environment Variable Management**: Securely handling API keys and configuration
4. **Asynchronous Operations**: Handling long-running API requests with proper loading states
5. **Error Handling**: Comprehensive error handling on both frontend and backend
6. **Web Scraping**: Extracting content from external websites
7. **AI Integration**: Using Groq's API for content generation

## Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure the backend is running on port 3001 and CORS is properly configured
2. **Groq API Errors**: Verify your API key is correct and you have sufficient credits
3. **Content Extraction Issues**: Some websites may block scraping - try different URLs
4. **Build Errors**: Ensure all dependencies are installed with `npm install`

### Getting Help

- Check the browser console for frontend errors
- Check the server console for backend errors
- Verify your Groq API key and credits
- Ensure the target URL is accessible and contains substantial text content

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the MIT License.
