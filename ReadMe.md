###Welcome to LIRI bot!

 LIRI bot (Language Interpretation and Recognition Interface) is a language-detecting, semi-intelligent CLI application for satisfying your entertainment needs. Simply run `node liri.js` and answer the prompts.
  
  The first option searches the Spotify database for information about the song you input; the second option searches the OMDB for information about a movie; the third option searches the Bands in Town API for upcoming events for whatever band you pass into it; and the fourth and final option does whatever you tell it to do in the random.txt file. 
  
  You must use one of the following commands in the random.txt file: \n\r1. `movie-this`\n2. `spotify-this-song` \n3. `concert-this` \n\r Each command runs one of the options above. Be sure to comma-separate the song, movie, or band. Examples: `movie-this, the dark knight`, `spotify-this-song, hey ya`, `concert-this, deerhunter`

  ##Set up

  ### Required NPM Packages 

  1) Axios
  2) Dotenv
  3) Inquirer
  4) Moment
  5) Node-spotify-api


  ### Required API Keys or App ID's

  1) Spotify API
  2) Bands in Town API
  3) OMDB API

  ### Setting up API keys using dotenv

Create a file named `.env`, add the following to it, replacing the values with your API keys (no quotes) once you have them:

```js
# Spotify API keys

SPOTIFY_ID=your-spotify-id
SPOTIFY_SECRET=your-spotify-secret

```

Make a JavaScript file named `keys.js`.

* Inside keys.js your file will look like this:

```js
console.log('this is loaded');

exports.spotify = {
  id: process.env.SPOTIFY_ID,
  secret: process.env.SPOTIFY_SECRET
};
```

To import your keys, call 
```js
require("dotenv").config();
const keys = require("./keys");
```
at the top of your liri.js file. 
