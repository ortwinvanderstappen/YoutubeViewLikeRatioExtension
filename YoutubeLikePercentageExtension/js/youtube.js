let ratioElement;

let minimumLikeRatio = 10;
let likesText = " Likes per viewer: ";
let percentageCalculationDelayInMs = 3000;

// Where we will expose all the data we retrieve from storage.sync.
storageCache = {};
// Asynchronously retrieve data from storage.sync, then cache it.
const initStorageCache = getAllStorageSyncData().then(items => {
    // Copy the data retrieved from storage into storageCache.
    storageCache = {};
    Object.assign(storageCache, items);
});

window.onload = () => {
    // Handle loading after clicking on new videos after first page load
    handlePageRedirectionsWithoutReload();

    // Load percentage on first page load
    setTimeout(function () {
        createRatioElement();
        calculateViewToLikesRatio();
    }, percentageCalculationDelayInMs);
}

function handlePageRedirectionsWithoutReload() {
    let lastUrl = location.href;

    new MutationObserver(() => {
        const url = location.href;
        if (url !== lastUrl) {
            lastUrl = url;

            ratioElement.innerHTML = likesText + " ...";
            ratioElement.style = "color:white";

            setTimeout(function () {
                calculateViewToLikesRatio();
            }, percentageCalculationDelayInMs);
        }
    }).observe(document, { subtree: true, childList: true });
}

function createRatioElement() {
    let container = document.querySelectorAll("#info-text")[0];
    ratioElement = document.createElement("span");
    ratioElement.classList += "view-count style-scope ytd-video-view-count-renderer";
    ratioElement.innerHTML = " ratio element";
    container.appendChild(ratioElement);
}

async function calculateViewToLikesRatio() {
    if(typeof ratioElement == "undefined"){
        console.log("Ratio element is undefined...");
        return;
    }

    try {
        await initStorageCache;
        minimumLikeRatio = storageCache.likeRatio;

        if (typeof minimumLikeRatio == "undefined") {
            console.log("Minimum like ratio is undefined!");
            minimumLikeRatio = 3;
        }

    } catch (e) {
        console.log("Failed to load extention storage data.");
    }

    let viewCount = 0;
    let likes = 0;

    try {
        viewCount = parseInt(getVideoViewsFromHtml());
        likes = parseInt(getVideoLikesFromHtml());
    } catch (e) {
        reportDataFoundFailure();
        return;
    }

    if (viewCount == 0 || likes == 0) {
        reportDataFoundFailure();
        return;
    }

    // Calculate the likes percentage
    let likesPerViewerPercentage = Math.round((likes / viewCount) * 10000) / 100;

    updateLikesPercentageText(likesPerViewerPercentage);
    colourPercentageDependingOnValue(likesPerViewerPercentage);
}

function getVideoViewsFromHtml() {
    try {
        // Get viewcount from html element
        let viewCount = document.querySelector(".view-count").innerHTML.split(" ")[0];
        // Use regex to remove comma's
        let replaceRegex = /,/g;
        return viewCount.replace(replaceRegex, "");
    } catch (e) {
        console.log(e);
    }

    // Return an error value if view were not found
    return 0;
}

function getVideoLikesFromHtml() {
    try {
        // Get likes element from html element
        let likes = document.querySelectorAll("ytd-toggle-button-renderer.style-scope.force-icon-button")[0].firstChild.children[1].attributes[2].value.split(" ")[0];
        // Use regex to remove comma's
        let replaceRegex = /,/g;
        return likes.replace(replaceRegex, "");
    } catch (e) {
        console.log(e);
    }

    // Return an error value if likes were not found
    return 0;
}

function updateLikesPercentageText(likesPerViewerPercentage) {
    ratioElement.innerHTML = likesText + " " + likesPerViewerPercentage + "%";
}

function colourPercentageDependingOnValue(likesPerViewerPercentage) {
    if (likesPerViewerPercentage <= minimumLikeRatio) {
        ratioElement.style = "color: red;"
    }
    else {
        ratioElement.style = "color: green;"
    }
}

function getAllStorageSyncData() {
    // Immediately return a promise and start asynchronous work
    return new Promise((resolve, reject) => {
        // Asynchronously fetch all data from storage.sync.
        chrome.storage.sync.get(null, (items) => {
            // Pass any observed errors down the promise chain.
            if (chrome.runtime.lastError) {
                return reject(chrome.runtime.lastError);
            }
            // Pass the data retrieved from storage down the promise chain.
            resolve(items);
        });
    });
}

function reportDataFoundFailure() {
    ratioElement.innerHTML = " Failed to get viewcount / likes";
}