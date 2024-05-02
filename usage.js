import { getIDSFromPage } from "./userInfo.js";

let logArr;
let formatIDs
let totalTeams;
let bothMonNameID = "2938238&38#93$29#3&23928392839832"

export async function getUsage(format, pokemon) {
    formatIDs = await configureFormatIDs(format);
    logArr = await Promise.all(formatIDs.map(id => fetchReplayData(id)));
    totalTeams = [...logArr.map(log => getTeamsFromLog(log))];
    let usage = checkUsage(pokemon, bothMonNameID);
    return usage;
}   

export async function getPlayerUsage(ids, pokemon, name) {
    logArr = await Promise.all(ids.map(id => fetchReplayData(id)));
    totalTeams = [...logArr.map(log => getTeamsFromLog(log))];
    let usage = checkUsage(pokemon, name);
    return usage
}


async function configureFormatIDs(format) {
    let currentPageData = await fetch("https://replay.pokemonshowdown.com/search.json?format=" + format);
    currentPageData = await currentPageData.json();
    let lastTimestamp = currentPageData[currentPageData.length - 1].uploadtime;
    let ids = [];
    for (let i = 0; i < 10; i++) {
        if (currentPageData.length === 0) {
            break;
        }
        if (i > 0) {
            currentPageData = await fetch ("https://replay.pokemonshowdown.com/search.json?format=" + format + "&before=" + lastTimestamp);
            currentPageData = await currentPageData.json()
            lastTimestamp = currentPageData[currentPageData.length - 1].uploadtime;
        }
        console.log(lastTimestamp)
        ids = [...ids, ...getIDSFromPage(currentPageData, format)];
    }
    return ids;
    
}

async function fetchReplayData(id) {
    const response = await fetch("https://replay.pokemonshowdown.com/" + id + ".json");
    const data = await response.json();
    return data.log;
}


function getTeamsFromLog(log) 
{
    let teams = [[],[]];
    let lines = log.split("\n");
    for (let i = 0; i < lines.length; i++) {
        let line = lines[i]
        if (!line.startsWith("|poke|")) {
            continue;
        }
        if (teams[0].length === 6 && teams[1].length === 6) {
            return teams;
        }
        teams[line[7] == 1 ? 0 : 1].push(line.substring(9, line.length - 1));
    }
    return teams;
}

function checkUsage(pokemon, name) {
    
    let monCount = 0;
    let totalCount = 0;
    let playerIndex = !(name == bothMonNameID) ? getPlayerIndex(logArr[0], name) : -1;
    pokemon = pokemon[0].toUpperCase() + pokemon.substring(1, pokemon.length).toLowerCase();
    console.log(pokemon)
    for (let i = 0; i < totalTeams.length; i++) {
        if (teamIncludesPokemon(totalTeams[i][0], pokemon) && playerIndex <= 0) {
            monCount++;
        }
        if (teamIncludesPokemon(totalTeams[i][1], pokemon) && (playerIndex == 1 || playerIndex == -1)) {
            monCount++;
        }
        totalCount++;
        if (playerIndex == -1) {
            totalCount++;
        }
    }
    return  ((monCount/totalCount) * 100).toFixed(2);
}

function getPlayerIndex(log, name) {
    let lines = log.split("\n");
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].startsWith("|player|p1|" + name)) {
            return 0;
        }
        if (lines[i].startsWith("|player|p2|" + name)) {
            return 1;
        }
    }
}

function teamIncludesPokemon(team, pokemon) {
    return (team.includes(pokemon)
        || team.includes(pokemon + ", M")
        || team.includes(pokemon + ", F"))
}

    
