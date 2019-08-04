require("dotenv").config();
const keys = require("./keys");
const Spotify = require('node-spotify-api');
const spotify = new Spotify(keys.spotify);
const inquirer = require('inquirer');
const axios = require('axios');
const fs = require('fs');


const action = process.argv[2];
let object = process.argv[3];
let argArray = [];

for (var i = 3; i < process.argv.length; i++) {
    argArray.push(process.argv[i]);
}
object = argArray.join(" ");

var confirm = [{
    type: 'confirm',
    name: 'name',
    message: "Do you understand how to use LIRI bot?",
}]

function introduction() {
    console.log("=========================\nWelcome to LIRI bot! You need to enter one of the following commands + an object:\n1. `concert-this [some band name]` will tell LIRI to search the bands-in-town API for the band you pass in and return band information, concert dates, etc.\n2. `spotify-this-song [some song name]` will tell LIRI to search the spotify API and return information about the song you pass in.\n3. `movie-this [some movie name]` will tell LIRI to search the OMDB API for the movie you pass in and return movie information.\n4. `do-what-it-says [path to .txt file with instructions for LIRI]` will tell LIRI to execute whatever is in the .txt file you specify. The instructions in the text file must contain one of the commands above and a comma separated object. For example, `concert-this, Fantasy Guys`\n\n=========================\nTry this: type `node liri.js concert-this deerhunter`");
}

function searchBandsInTown(object) {
    queryURL = "https://rest.bandsintown.com/artists/" + object + "?app_id=1";
    axios.get(queryURL)
        .then(function(response) {
            console.log(`Band Name: ${response.data.name}\n Number of Fans: ${response.data.tracker_count}\n Number of upcoming events: ${response.data.upcoming_event_count}\n Link to see events: ${response.data.url}`);
        })
        .catch(function(error) {
            console.log(error);
        });
}

function spotifyThis(object) {
    spotify
        .search({ type: 'track', query: `${object.trim()}`, limit: 3 })
        .then(function(response) {
            console.log(`searching spotify for track: ${object}`);
            var data = response.tracks.items[1].artists;
            console.log(data);
        })
        .catch(function(err) {
            console.log(err);
        });
}

function movieThis(object) {
    queryURL = "https://www.omdbapi.com/?t=" + object + "&apikey=trilogy";
    axios.get(queryURL)
        .then(function(response) {
            if (response.Response === "False") {
                return console.log("movie not found!");
            } else {
                var data = response.data;
                console.log(`Movie Name: ${data.Title}\nCast: ${data.Actors}\nYear: ${data.Year}\nPlot: ${data.Plot}`);
            }
        })
        .catch(function(error) {
            console.log(error);
        });
}

function doWhatever(object) {
    fs.readFile(object, 'utf8', function(err, contents) {
        contents = contents.split(",");
        console.log(contents);
        switch (contents[0]) {
            case 'concert-this':
                searchBandsInTown(contents[1].trim());
                break;
            case 'spotify-this-song':
                spotifyThis(contents[1].trim());
                break;
            case `movie-this`:
                movieThis(contents[1].trim());
                break;
            case `do-what-it-says`:
                console.log("are you trying crash the console with a runaway recursion? Nice try, buddy...");
                break;
            default:
                console.log("I don't understand " + contents[0] + ", please replace with one of the following commands: 'concert-this' , 'spotify-this-song' , 'movie-this' ");
                break;
        }

    });

    console.log('after calling readFile');
}

if (action && object) {
    switch (`${action} ${object}`) {
        case `concert-this ${object}`:
            console.log(`run bands in town for ${object}\n`);
            searchBandsInTown(object);
            break;
        case `spotify-this-song ${object}`:
            console.log(`run spotify for ${object} \n`);
            spotifyThis(object);
            break;
        case `movie-this ${object}`:
            console.log("run movies");
            movieThis(object);
            break;
        case `do-what-it-says ${object}`:
            console.log("run dwis");
            doWhatever(object);
            break;
        default:
            console.log(`sorry, I dont understand ${action} ${object}`);
            inquirer.prompt(confirm).then(answer => {
                if (answer.name === true) {
                    console.log("well if you know how to use LIRI why don't you use it correctly this time...")
                } else {
                    console.log('\n');
                    console.log("Read the introduction below and get learnt.")
                    console.log('\n');
                    introduction();
                }
            });
    }
} else {
    introduction();
}