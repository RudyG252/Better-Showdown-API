


// get a user's match IDs given their name and the format you want the matches in
export async function getUserInfo(user, format, pages) {
    let userRecentIds = await getMaxMatchIDs(user, format, pages)
    return userRecentIds;
}

// get match IDs until the user runs out of match IDs or pages runs out
async function getMaxMatchIDs(user, format, pages) {
    let ids = [];
    let currentPage = await fetch ("https://replay.pokemonshowdown.com/search.json?user=" + user);
    let currentPageData = await currentPage.json();
    for (let i = 0; i < pages; i++) {
        if (currentPageData.length === 0) {
            break;
        }
        let lastTimestamp = currentPageData[currentPageData.length - 1].uploadTime;
        ids = [...ids, ...getIDSFromPage(currentPageData, format)];
        currentPage = await fetch ("https://replay.pokemonshowdown.com/search.json?user=" + user + "&before=" + lastTimestamp);
        currentPage = await currentPage.json()
    }
    return ids;
}

// get all match IDs from a page
export function getIDSFromPage(page, format) {
    let ids = [];
    for (let i = 0; i < page.length; i++) {
        if (getFormatOutOfID(page[i].id) === format.toLowerCase() || format === "all") {
            ids.push(page[i].id);
        }
    }
    return ids;
}

// Get all match ids from a match but end if the timestamp of the map passes cancelstamp
export function getIDSFromPageRestricted(page, format, cancelStamp) {
    let ids = [];
    for (let i = 0; i < page.length; i++) {
        let timestamp = page[page.length - 1].uploadtime;
        if ((timestamp <= cancelStamp)) {
            console.log("cancel in submethod")
            console.log("Stamps: " + timestamp + " and " + cancelStamp)
            break;
        }
        if (getFormatOutOfID(page[i].id) === format.toLowerCase() || format === "all") {
            ids.push(page[i].id);
        }
    }
    return ids;
}

// given a match id, get what format the match was played in
function getFormatOutOfID(id) {
    for (let i = 0; i < id.length; i++) {
        if (id[i] == '-') {
            return id.substring(0, i);
        }
    }

    return "Gen9OU";
}