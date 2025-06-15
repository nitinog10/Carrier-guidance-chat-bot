const express = require('express');
const app = express();
const path = require('path');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const axios = require('axios');
const messages = []

// Initialize GoogleGenerativeAI client
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'YOUR_GEMINI_API_KEY';
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// Age categories configuration
const ageCategories = {
  child: { min: 5, max: 12, level: 'Beginner' },
  teen: { min: 13, max: 19, level: 'Intermediate' },
  youngAdult: { min: 20, max: 29, level: 'Advanced' },
  adult: { min: 30, max: 100, level: 'Professional' }
};
const educationLevels = {
  class12: { label: 'Class 12th', focus: 'Foundation and entrance prep' },
  college1: { label: 'College 1st Year', focus: 'Fundamentals of major subjects' },
  college2: { label: 'College 2nd Year', focus: 'Intermediate and internships' },
  college3: { label: 'College 3rd Year', focus: 'Advanced and career preparation' },
  college4: { label: 'College Final Year', focus: 'Job readiness and specialization' }
};
//YouTube API configuration
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY || 'YOUR_YOUTUBE_API_KEY';
//Function to fetch YouTube tutorials
async function getYouTubeTutorials(query, maxResults = 3) {
  try {
    const response = await axios.get(`https://www.googleapis.com/youtube/v3/search`, {
      params: {
        part: 'snippet',
        q: query,
        type: 'video',
        maxResults: maxResults,
        key: YOUTUBE_API_KEY
      }
    });
    return response.data.items.map(item => ({
      title: item.snippet.title,
      description: item.snippet.description,
      thumbnailUrl: item.snippet.thumbnails.medium.url,
      videoId: item.id.videoId,
      url: `https://www.youtube.com/watch?v=${item.id.videoId}`
    }));
  } catch (error) {
    console.error('YouTube API Error:', error);
    return [];
  }
}

async function main(input, userAge, educationLevel = 'college1') { // Added educationLevel back
  // Determine age category
  const ageCategory = Object.entries(ageCategories).find(([_, range]) => 
    userAge >= range.min && userAge <= range.max
  )?.[0] || 'adult';

  // Check if input starts with "What if" (case-insensitive) for prompt formulation
  if (input.toLowerCase().startsWith('what if')) {
    messages.push({
      role: 'user',
      content: `For the scenario "${input}", generate 2-3 alternate timelines. Each timeline should explore the consequences of the changed event, presenting a branched storyline with clear logic and engaging storytelling. Consider counterfactual modeling principles.`
    });
  } else {
    // Add age-specific context to the message for other inputs
    messages.push({
      role: 'user',
      content: `As a ${ageCategory} learner (age ${userAge}), focused on ${educationLevels[educationLevel]?.label || educationLevels['college1'].label} level studies, seeking guidance on "${input}". Please provide age-appropriate and education-level specific guidance.`
    });
  }

  // For text-only input, use the gemini-pro model
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });
  const prompt = messages[0].content; // Use the first (and only) message content as the prompt
  messages.length = 0; // Clear the array for the next call

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();

  let youtubeQuery;
  const isWhatIfScenario = input.toLowerCase().startsWith('what if');

  if (isWhatIfScenario) {
    let extractedSubject = input.substring(8).trim(); // Remove "What if " and trim
    if (extractedSubject.endsWith('?')) {
      extractedSubject = extractedSubject.slice(0, -1); // Remove trailing question mark
    }
    youtubeQuery = extractedSubject;
  } else {
    youtubeQuery = input;
  }

  const tutorials = await getYouTubeTutorials(youtubeQuery);

  if (isWhatIfScenario) {
    return {
      scenarioType: 'whatIf',
      originalQuery: input,
      storylines: text, // This is the response from Gemini
      relatedVideos: tutorials
    };
  } else {
    return {
      message: text, // This is the response from Gemini
      ageCategory,
      difficultyLevel: ageCategories[ageCategory].level,
      educationLevel: educationLevels[educationLevel]?.label || educationLevels['college1'].label,
      focusArea: educationLevels[educationLevel]?.focus || educationLevels['college1'].focus,
      tutorials
    };
  }
}

app.use(express.static('templates'));
app.use(express.json()) 
app.use(express.urlencoded({ extended: true }))

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'templates/index.html'));
});

app.post('/api', async function (req, res, next) {
  try {
    // Pass educationLevel from request body, default to 'college1'
    const result = await main(req.body.input, req.body.age || 25, req.body.educationLevel || 'college1');
    res.json({
      success: true, 
      data: result
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
})

const port = 3000;
app.listen(port, '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${port}`);
});