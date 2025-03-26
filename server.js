const express = require('express');
const app = express();
const path = require('path');
const OpenAI = require('openai');
const axios = require('axios');
const messages = []
const openai = new OpenAI({
  apiKey: "Your_open_ai api key", 
});
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
async function main(input, userAge, educationLevel = 'college1') {
  const levelInfo = educationLevels[educationLevel] || educationLevels['college1'];
  messages.push({ 
    role: 'user', 
    content: `As a ${levelInfo.label} student, interested in ${input}, please recommend relevant courses and resources focused on: ${levelInfo.focus}` 
  });

  const completion = await openai.chat.completions.create({
    messages: messages,
    model: 'gpt-3.5-turbo',
  });

  const tutorials = await getYouTubeTutorials(input);

  return {
    message: completion.choices[0]?.message?.content,
    educationLevel: levelInfo.label,
    focusArea: levelInfo.focus,
    tutorials
  };
}
async function getYouTubeTutorials(query, maxResults = 3) {
  try {
    const response = await axios.get("https://www.googleapis.com/youtube/v3/search", {
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
      channelTitle: item.snippet.channelTitle,
      thumbnailUrl: item.snippet.thumbnails.medium.url,
      videoId: item.id.videoId,
      url: `https://www.youtube.com/watch?v=${item.id.videoId}`
    }));
  } catch (error) {
    console.error('YouTube API Error:', error);
    return [];
  }
}

async function main(input, userAge) {
  // Determine age category
  const ageCategory = Object.entries(ageCategories).find(([_, range]) => 
    userAge >= range.min && userAge <= range.max
  )?.[0] || 'adult';

  // Add age-specific context to the message
  messages.push({ 
    role: 'user', 
    content: `As a ${ageCategory} learner (age ${userAge}), ${input}. Please provide age-appropriate guidance.` 
  });

  const completion = await openai.chat.completions.create({
    messages: messages,
    model: 'gpt-3.5-turbo',
  });

  // Get related YouTube tutorials
  const tutorials = await getYouTubeTutorials(input);

  return {
    message: completion.choices[0]?.message?.content,
    ageCategory,
    difficultyLevel: ageCategories[ageCategory].level,
    tutorials
  };
}

app.use(express.static('templates'));
app.use(express.json()) 
app.use(express.urlencoded({ extended: true }))

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'templates/index.html'));
});

app.post('/api', async function (req, res, next) {
  try {
    const result = await main(req.body.input, req.body.age || 25)
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
const result = await main(req.body.input, req.body.age || 25, req.body.educationLevel || 'college1');