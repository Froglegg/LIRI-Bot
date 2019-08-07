require("dotenv").config();
const keys = require("./keys");
const Spotify = require('node-spotify-api');
const spotify = new Spotify(keys.spotify);
const inquirer = require('inquirer');
const axios = require('axios');
const fs = require('fs');
const moment = require('moment');


const action = process.argv[2];
let object = process.argv[3];
let argArray = [];

for (var i = 3; i < process.argv.length; i++) {
    argArray.push(process.argv[i]);
}
object = argArray.join(" ");

function instructions() {
    console.log("=========================\nWelcome to LIRI bot! You need to enter one of the following commands + an object:\n1. `concert-this [some band name]` will tell LIRI to search the bands-in-town API for the band you pass in and return band information, concert dates, etc.\n2. `spotify-this-song [some song name]` will tell LIRI to search the spotify API and return information about the song you pass in.\n3. `movie-this [some movie name]` will tell LIRI to search the OMDB API for the movie you pass in and return movie information.\n4. `do-what-it-says [path to .txt file with instructions for LIRI]` will tell LIRI to execute whatever is in the .txt file you specify. The instructions in the text file must contain one of the commands above and a comma separated object. For example, `concert-this, Deerhunter`\n\n=========================\nTry this: type `node liri.js concert-this deerhunter`");
}

function restart() {
    inquirer.prompt([{
        type: "confirm",
        name: "newSearch",
        message: "Would you like to do another search?"
    }]).then(answer => {
        if (answer.newSearch) {
            introduction();
        } else {
            return;
        }
    });
}

function introduction() {
    console.log("Welcome to LIRI-bot!!!");
    var promptOptions = {
        type: "rawlist",
        name: "options",
        message: "What would you like to do?",
        choices: ["Search the Spotify database for a song", "Search the OMDB database for a movie", "Search the Bands in Town database for upcoming concerts for a favorite band", "Do whatever it says to do in random.txt", "I don't know how to use LIRI Bot, can you show me some instructions?"]
    }
    inquirer.prompt(promptOptions).then(answer => {

        if (answer.options == promptOptions.choices[4]) {
            instructions();
        }
        if (answer.options == promptOptions.choices[0]) {
            inquirer.prompt([{
                name: "song",
                message: "OK, what song do you want to search Spotify for?"
            }]).then(answer => {
                spotifyThis(answer.song);
            });
        }
        if (answer.options == promptOptions.choices[1]) {
            inquirer.prompt([{
                name: "movie",
                message: "OK, what movie do you want to search OMDB for?"
            }]).then(answer => {
                movieThis(answer.movie);
            });
        }
        if (answer.options == promptOptions.choices[2]) {
            inquirer.prompt([{
                name: "band",
                message: "OK, what band do you want to see upcoming events for?"
            }]).then(answer => {
                searchBandsInTown(answer.band);
            });
        }
        if (answer.options == promptOptions.choices[3]) {
            inquirer.prompt([{
                type: "confirm",
                name: "randomConfirm",
                message: "Are you sure you want to run whatever is in random.txt?"
            }]).then(answer => {
                if (answer.randomConfirm) {
                    doWhatever('random.txt');
                } else {
                    introduction();
                }
            });
        }
    });


}

function searchBandsInTown(object) {
    queryURL = "https://rest.bandsintown.com/artists/" + object + "/events?app_id=codingbootcamp";
    axios.get(queryURL)
        .then(function(response) {
            console.log(`\r\nFind next 10 concerts for ${object}\n`);

            for (var i = 0; i < 10; i++) {
                var data = response.data[i];
                var date = moment(data.datetime, "YYYY-MM-DDTHH:mm:ss").toDate();
                date = moment(date).format("YYYY-MM-DD");
                var consoleData = [
                    `\r\n${data.venue.name}`,
                    `\n${data.venue.city}`,
                    `\n${date}\r`
                ]
                console.log(`${consoleData}`);

                fs.appendFile('log.txt', consoleData, function(err) {
                    if (err) throw err;
                });

            }
            console.log('\n\rData saved to log.txt!\r');
            restart();
        })
        .catch(function(error) {
            console.log(error);
        });
}

function spotifyThis(object) {
    spotify
        .search({ type: 'track', query: `${object.trim()}`, limit: 5 })
        .then(function(response) {
            console.log(`Searching spotify for top 5 tracks for: ${object}`);
            for (var i = 0; i < response.tracks.items.length; i++) {
                var data = response.tracks.items[i];

                var consoleData = [
                    `\r\nTrack: ${data.name}`,
                    `\nArtist: ${data.artists[0].name}`,
                    `\nAlbum: ${data.album.name}`,
                    `\nSong URL: ${data.external_urls.spotify}\r`
                ]
                console.log(`${consoleData}`);

                fs.appendFile('log.txt', consoleData, function(err) {
                    if (err) throw err;
                });

            }
            console.log('\n\rData saved to log.txt!\r');
            restart();
        })
        .catch(function(err) {
            console.log(err);
        });

}

function movieThis(object) {
    queryURL = "https://www.omdbapi.com/?t=" + object + "&apikey=trilogy";
    axios.get(queryURL)
        .then(function(response) {
            console.log(`Getting information for ${object} \n`);

            if (response.Response === "False") {
                return console.log("movie not found!");
            } else {
                var data = response.data;
                if (!data.Ratings[0]) {
                    var imdbRating = "No IMDB rating found";
                } else {
                    var imdbRating = data.Ratings[0].Value;
                }
                if (!data.Ratings[1]) {
                    var tomatoRating = "no Rotten Tomatoes rating found";
                } else {
                    var tomatoRating = data.Ratings[1].Value;
                }
                var consoleData = [
                    `\r\nMovie name: ${data.Title}`,
                    `\nCast: ${data.Actors}`,
                    `\nYear: ${data.Year}`,
                    `\nIMDB Rating: ${imdbRating}`,
                    `\nTomato-Meter: ${tomatoRating}`,
                    `\nPlot: ${data.Plot}`,
                    `\nLanguage: ${data.Language}\r`
                ]
                console.log(`${consoleData}`);

                fs.appendFile('log.txt', consoleData, function(err) {
                    if (err) throw err;
                });
                console.log('\n\rData saved to log.txt!\r');
                restart();
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

}

introduction();