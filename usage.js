import { getIDSFromPage, getIDSFromPageRestricted } from "./userInfo.js";
import  {
    addDoc,
    collection,
    getDocs,
    deleteDoc,
    doc,
    updateDoc,
    onSnapshot,
    setDoc,
    getDoc
} from "firebase/firestore";
import {db} from "./firebase.js";

let logArr;
let formatIDs
let totalTeams;
let bothMonNameID = "2938238&38#93$29#3&23928392839832"
var globalLastTimestamp = 0;
var globalRecentTimestamp = 0;

export async function getUsage(format, pokemon) {
    formatIDs = await configureFormatIDsRestricted(format, '09_25', 3);
    logArr = await Promise.all(formatIDs.map(id => fetchReplayData(id)));
    totalTeams = [...logArr.map(log => getTeamsFromLog(log))];
    let usage = checkUsage(pokemon, bothMonNameID);
    return usage;
}   


export async function getUsageFirebase(format, pokemon) {
    let total = 0;
    const allMons = await getDocs(collection(db, 'Months', '09_25', 'PokeData', 'Formats', format));
    allMons.forEach((doc) => {
        if (doc.data()['Uses'] != undefined) {
            total += (doc.data())['Uses']
            console.log(total)
        }
    })
    let monData = (await getDoc(doc(db, 'Months', '09_25', 'PokeData', 'Formats', format, pokemon))).data()
    if (monData == undefined) {
        return (0).toFixed(2)
    }
    let monUsage = monData['Uses']
    console.log(monUsage);
    return ((monUsage/total) * 100).toFixed(2);
}

export async function getUsageMap(format) {
    formatIDs = await configureFormatIDsRestricted(format, '09_25', 3);
    logArr = await Promise.all(formatIDs.map(id => fetchReplayData(id)));
    totalTeams = [...logArr.map(log => getTeamsFromLog(log))];
    let usage = createUsageMap(bothMonNameID);
    return usage;
}


export async function updateDB(format, pages) {
    formatIDs = await configureFormatIDsRestricted(format, '09_25', pages);
    logArr = await Promise.all(formatIDs.map(id => fetchReplayData(id)));
    totalTeams = [...logArr.map(log => getTeamsFromLog(log))];
    let totalTeamData = getTotalTeamData(format);
    for (const property in totalTeamData) {
        let pokeRef = doc(db, 'Months', '09_25', 'PokeData', 'Formats', format, property);
        let docData = (await getDoc(pokeRef)).data()
        if (docData == undefined) {
            await setDoc(doc(db, 'Months', '09_25', 'PokeData', 'Formats', format, property), {'Uses' : totalTeamData[property]})
        }
        else {
            let prevUses = docData['Uses']
            await updateDoc(pokeRef, {'Uses' : (prevUses + totalTeamData[property])})
        }
    }
    return "";
}



export async function getPlayerUsage(ids, pokemon, name) {
    logArr = await Promise.all(ids.map(id => fetchReplayData(id)));
    totalTeams = [...logArr.map(log => getTeamsFromLog(log))];
    let usage = checkUsage(pokemon, name);
    return usage
}

export async function getPlayerUsageMap(ids, name) {
    logArr = await Promise.all(ids.map(id => fetchReplayData(id)));
    totalTeams = [...logArr.map(log => getTeamsFromLog(log))];
    let usage = createUsageMap(name);
    return usage;
}


export async function testFunction(pokemonName) {


    let pokeRef = doc(db, "Months", "09_25", "PokeData", "Formats", "Gen9OU",  pokemonName);
    let prevData = (await getDoc(pokeRef)).data();
    await setDoc(pokeRef, {"Losses" : 100, "Uses" : 100, "Wins" : 100});
    let returnVal = await getDoc(pokeRef)
    return returnVal.data();
}



async function configureFormatIDs(format, pages) {
    let currentPageData = await fetch("https://replay.pokemonshowdown.com/search.json?format=" + format);
    currentPageData = await currentPageData.json();
    let lastTimestamp = currentPageData[currentPageData.length - 1].uploadtime;
    globalLastTimestamp = lastTimestamp;
    globalRecentTimestamp = currentPageData[0].uploadtime;
    let ids = [];
    for (let i = 0; i < pages; i++) {
        if (currentPageData.length === 0) {
            break;
        }
        if (i > 0) {
            currentPageData = await fetch ("https://replay.pokemonshowdown.com/search.json?format=" + format + "&before=" + lastTimestamp);
            currentPageData = await currentPageData.json()
            lastTimestamp = currentPageData[currentPageData.length - 1].uploadtime;
            globalLastTimestamp = lastTimestamp
        }
        ids = [...ids, ...getIDSFromPage(currentPageData, format)];
    }
    // console.log(globalLastTimestamp);
    // console.log(globalRecentTimestamp);
    return ids;
    
}


async function configureFormatIDsRestricted(format, month, maxPages) {
    
    // Month Format = 09_25
    let date = new Date('20' + month.substring(3,5) + '-' + month.substring(0, 2) + '-' + '01T12:30:00Z')
    let epochDate = +date;
    epochDate = epochDate / 1000;
    let timestamps = (await getDoc(doc(db, "Months", month, "PokeData", "Formats", format, "Timestamps"))).data();
    let recentStamp = 0;
    let oldStamp = epochDate
    let ids = [];
    if (timestamps == undefined) {
        let firstIDs = await configureFormatIDs(format, maxPages)
        await setDoc(doc(db, "Months", month, "PokeData", "Formats", format, "Timestamps"), {"Recent" : globalRecentTimestamp, "Oldest" : globalLastTimestamp})
        return firstIDs;
    }
    else {
        recentStamp = timestamps["Recent"]
        oldStamp = timestamps["Oldest"]
    }
    let currentPageData = await fetch ("https://replay.pokemonshowdown.com/search.json?format=" + format);
    currentPageData = await currentPageData.json();
    let lastTimestamp = currentPageData[currentPageData.length - 1].uploadtime;
    let newRecentStamp = currentPageData[0].uploadtime;
    for (let i = 0; i < maxPages; i++) {
        if (currentPageData.length === 0) {
            break;
        }
        if (i > 0) {
            currentPageData = await fetch ("https://replay.pokemonshowdown.com/search.json?format=" + format + "&before=" + lastTimestamp);
            currentPageData = await currentPageData.json()
            lastTimestamp = currentPageData[currentPageData.length - 1].uploadtime;
            if (lastTimestamp < oldStamp) {
                oldStamp = lastTimestamp
            }
        }
        ids = [...ids, ...getIDSFromPageRestricted(currentPageData, format, recentStamp)];
        // console.log(ids);
        if (lastTimestamp <= recentStamp){
            break;
        }
    }
    lastTimestamp = oldStamp;
    for (let i = 0; i < maxPages; i++) {
        if (currentPageData.length === 0) {
            break;
        }
        currentPageData = await fetch ("https://replay.pokemonshowdown.com/search.json?format=" + format + "&before=" + lastTimestamp);
        currentPageData = await currentPageData.json()
        lastTimestamp = currentPageData[currentPageData.length - 1].uploadtime;
        if (lastTimestamp < oldStamp) {
            oldStamp = lastTimestamp
        }
        ids = [...ids, ...getIDSFromPageRestricted(currentPageData, format, epochDate)];
        if (lastTimestamp <= epochDate){
            break;
        }
    }
    updateDoc(doc(db, "Months", month, "PokeData", "Formats", format, "Timestamps"), {"Recent" : newRecentStamp, "Oldest" : oldStamp});
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
    
    pokemon = pokemon[0].toUpperCase() + pokemon.substring(1, pokemon.length).toLowerCase();
    for (let i = 0; i < totalTeams.length; i++) {
        let playerIndex = !(name == bothMonNameID) ? getPlayerIndex(logArr[i], name) : -1;
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

function createUsageMap(name) {
    let usageMap = new Map();
    let total = 0;
    // console.log(totalTeams[2])
    for (let i = 0; i < totalTeams.length; i++) {
        let playerIndex = !(name == bothMonNameID) ? getPlayerIndex(logArr[i], name) : -1;
        if (playerIndex <= 0) {
            for (let j = 0; j < totalTeams[i][0].length; j++) {
                if (mon == undefined) {
                    console.log(totalTeams[i]);
                }
                let mon = simplifyMonName(totalTeams[i][0][j])
                if (!usageMap.has(mon)) {
                    usageMap.set(mon, 1);
                }
                else {
                    usageMap.set(mon, usageMap.get(mon) + 1)
                }
            }
            total++;
        }
        if (playerIndex == -1 || playerIndex > 0) {
            for (let j = 0; j < totalTeams[i][1].length; j++) {
                let mon = simplifyMonName(totalTeams[i][1][j])
                if (!usageMap.has(mon)) {
                    usageMap.set(mon, 1);
                }
                else {
                    usageMap.set(mon, usageMap.get(mon) + 1)
                }

            }
            total++;
        }
        // console.log(usageMap)
    }
    usageMap = new Map([...usageMap.entries()].sort((a, b) => b[1] - a[1]));
    usageMap.forEach((value, key) => {
        usageMap.set(key, ((value / total) * 100).toFixed(2));
      });
    // console.log(Object.fromEntries(usageMap));
    return Object.fromEntries(usageMap);
}


function getTotalTeamData(format) {
    let totalTeamData = new Map();
    for (let i = 0; i < totalTeams.length; i++) {
        for (let j = 0; j < 2; j++) {
            for (let k = 0; k < totalTeams[j].length; k++) {
                if (totalTeams[i][j][k] == undefined) {
                    break;
                }
                let mon = simplifyMonName(totalTeams[i][j][k])
                if (!totalTeamData.has(mon)) {
                    totalTeamData.set(mon, 1);
                }
                else {
                    totalTeamData.set(mon, totalTeamData.get(mon) + 1);
                }
            }
        }
    }
    // console.log(Object.fromEntries(totalTeamData));
    return (Object.fromEntries(totalTeamData));
}

function getPlayerIndex(log, name) {
    let lines = log.split("\n");
    for (let i = 0; i < lines.length; i++) {
        lines[i] = lines[i].toLowerCase();
        if (lines[i].startsWith("|player|p1|" + name.toLowerCase())) {
            return 0;
        }
        if (lines[i].startsWith("|player|p2|" + name.toLowerCase())) {
            return 1;
        }
    }
}

function teamIncludesPokemon(team, pokemon) {
    return (team.includes(pokemon)
        || team.includes(pokemon + ", M")
        || team.includes(pokemon + ", F"))
}

function simplifyMonName(pokemon) {
    for (let i = 0; i < pokemon.length; i++) {
        if (pokemon[i] == ',') {
            return pokemon.substring(0, i);
        }
    }
    return pokemon
}

function getMonth(epochDate) {
    let dateObject = new Date(epochDate * 1000);
    let month = dateObject.getMonth() + 1;
    if (month < 10) {
        month = '0' + month;
    }
    let year = dateObject.getFullYear();
    return month + "_" + (year - 2000);
}

    
