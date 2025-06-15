Express.js Template
This is a simple Express.js template that can be used as a starting point for creating web applications with Node.js and Express.

Features
Provides a basic Express.js setup with routing and middleware support.
Uses EJS as the template engine.
Includes a simple test suite using Mocha and Chai.

License
This project is licensed under the MIT License. See the LICENSE file for more information.


## Project: Learning Path Advisor & Alternate Timeline Generator

This project serves as an interactive Learning Path Advisor and an Alternate Timeline Generator based on "What If" scenarios.

**Core Functionalities:**

1.  **Personalized Learning Paths:**
    *   Users input their age, current education level (e.g., Class 12th, College 1st Year), and area of interest.
    *   The system provides tailored recommendations for courses and learning resources.
    *   It also fetches and displays relevant YouTube tutorials to supplement the learning journey.

2.  **"What If" Scenario Exploration (Alternate Timelines):**
    *   Users can pose "What If" questions (e.g., "What if a historical event had a different outcome?").
    *   The application uses a generative AI model (Gemini Pro) to create 2-3 alternate timelines based on the scenario.
    *   Each timeline explores the potential consequences of the changed event, presenting a branched storyline with engaging narrative.
    *   Relevant YouTube videos are also fetched to provide context or explore related concepts to the "What If" scenario.

**Technical Stack:**

*   **Backend:** Node.js with Express.js
*   **Generative AI:** Google Gemini Pro
*   **APIs:** YouTube Data API v3
*   **Frontend:** (Implicitly) HTML, CSS, JavaScript for user interaction (though the core logic is backend-focused).

**Setup and Usage:**

1.  **Prerequisites:** Node.js and npm installed.
2.  **Clone the repository.**
3.  **Install dependencies:** `npm install`
4.  **API Keys:**
    *   Create a `.env` file in the root directory or set environment variables for:
        *   `GEMINI_API_KEY`: Your Google Gemini API key.
        *   `YOUTUBE_API_KEY`: Your YouTube Data API v3 key.
    *   Alternatively, you can replace the placeholder keys directly in `server.js` (not recommended for production).
5.  **Run the server:** `npm start`
6.  Access the application via a web browser or API client (e.g., Postman) at `http://localhost:3000`. The primary interaction point is the `/api` endpoint (POST request).

    *   **For Learning Paths:**
        ```json
        {
          "input": "Quantum Physics",
          "age": 20,
          "educationLevel": "college2" // e.g., class12, college1, college2, college3, college4
        }
        ```

    *   **For "What If" Scenarios:**
        ```json
        {
          "input": "What if the Library of Alexandria was never destroyed?",
          "age": 30 // Age is still accepted but not a primary driver for "What If" logic
        }
        ```