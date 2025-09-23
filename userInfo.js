



export async function getUserInfo(user, format, pages) {
    let userRecentIds = await getMaxMatchIDs(user, format, pages)
    return userRecentIds;
}


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


export function getIDSFromPage(page, format) {
    let ids = [];
    for (let i = 0; i < page.length; i++) {
        if (getFormatOutOfID(page[i].id) === format.toLowerCase() || format === "all") {
            ids.push(page[i].id);
        }
    }
    return ids;
}

export function getIDSFromPageRestricted(page, format, cancelStamp) {
    let ids = [];
    for (let i = 0; i < page.length; i++) {
        let timestamp = page[page.length - 1].uploadtime;
        console.log(timestamp);
        console.log(cancelStamp);
        if ((timestamp <= cancelStamp)) {
            break;
        }
        if (getFormatOutOfID(page[i].id) === format.toLowerCase() || format === "all") {
            ids.push(page[i].id);
        }
    }
    return ids;
}

function getFormatOutOfID(id) {
    for (let i = 0; i < id.length; i++) {
        if (id[i] == '-') {
            return id.substring(0, i);
        }
    }

    return "Gen9OU";
}