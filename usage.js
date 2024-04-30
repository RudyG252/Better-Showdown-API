import { getIDSFromPage } from "./userInfo.js";

let logArr;
let formatIDs
let totalTeams;

export async function getUsage(format, pokemon) {
    formatIDs = await configureFormatIDs(format);
    logArr = await Promise.all(formatIDs.map(id => fetchReplayData(id)));
    totalTeams = [...logArr.map(log => getTeamsFromLog(log))];
    let usage = checkUsage(pokemon);
    return usage;
}   


async function configureFormatIDs(format) {
    let currentPageData = await fetch("https://replay.pokemonshowdown.com/search.json?format=" + format);
    currentPageData = await currentPageData.json();
    let ids = [];
    for (let i = 0; i < 10; i++) {
        if (currentPageData.length === 0) {
            break;
        }
        let lastTimestamp = currentPageData[currentPageData.length - 1].uploadTime;
        ids = [...ids, ...getIDSFromPage(currentPageData, format)];
        currentPageData = await fetch ("https://replay.pokemonshowdown.com/search.json?format=" + format + "&before=" + lastTimestamp);
        currentPageData = await currentPageData.json()
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
        teams[line[7] == 1 ? 0 : 1].push(line.substring(9, line.length - 1));
    }
    return teams;
}

function checkUsage(pokemon) {
    let monCount = 0;
    let totalCount = 0;
    pokemon = pokemon[0].toUpperCase() + pokemon.substring(1, pokemon.length).toLowerCase();
    for (let i = 0; i < totalTeams.length; i++) {
        for (let j = 0; j < totalTeams[i].length; j++) {
            if (totalTeams[i][j].includes(pokemon)
                 || totalTeams[i][j].includes(pokemon + ", M")
                 || totalTeams[i][j].includes(pokemon + ", F"))
            {
                monCount++;
            }
            
        }
        totalCount++;
    }
    return  ((monCount/totalCount) * 100).toFixed(2);
}