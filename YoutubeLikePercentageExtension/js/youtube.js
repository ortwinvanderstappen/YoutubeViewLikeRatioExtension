let ratioElement;

let minimumLikeRatio = 10;
let likesText = " Likes per viewer: ";

// Where we will expose all the data we retrieve from storage.sync.
storageCache = {};
// Asynchronously retrieve data from storage.sync, then cache it.
const initStorageCache = getAllStorageSyncData().then(items => {
    // Copy the data retrieved from storage into storageCache.
    storageCache = {};
    Object.assign(storageCache, items);
});

window.onload = () => {

    var delayInMilliseconds = 4000; //1 second


    let lastUrl = location.href;
    new MutationObserver(() => {
        const url = location.href;
        if (url !== lastUrl) {
            lastUrl = url;

            ratioElement.innerHTML = likesText + " ...";
            ratioElement.style = "color:white";

            setTimeout(function () {
                calculateViewToLikesRatio();
            }, delayInMilliseconds);
        }
    }).observe(document, { subtree: true, childList: true });

    setTimeout(function () {
        createRatioElement();
        calculateViewToLikesRatio();
    }, delayInMilliseconds);
}

function createRatioElement() {
    // Create ratio element
    let container = document.querySelectorAll("#info-text")[0];
    ratioElement = document.createElement("span");
    ratioElement.classList += "view-count style-scope ytd-video-view-count-renderer";
    ratioElement.innerHTML = " ratio element";
    container.appendChild(ratioElement);
}

async function calculateViewToLikesRatio() {

    try {
        await initStorageCache;
        minimumLikeRatio = storageCache.likeRatio;
        console.log(storageCache);
    } catch (e) {
        // Handle error that occurred during storage initialization.
    }

    let container = document.querySelectorAll("#info-text")[0];

    // Get viewcount element
    let countElement = document.querySelectorAll("#count")[1];
    let countElementChild = countElement.firstChild;
    let viewCountElement = countElementChild.childNodes[1];
    let viewCountElementData = viewCountElement.innerHTML;
    // Get the views from viewcount element
    let viewCount = viewCountElementData.split(" ")[0];

    let replaceRegex = /,/g;
    viewCount = viewCount.replace(replaceRegex, "");

    // Get likes element
    let likesElement = document.querySelectorAll(".style-scope .ytd-menu-renderer .force-icon-button");
    let likesElement1 = likesElement.item(0).children[0];
    let likesElement2 = likesElement1.children[1];
    let likesAttribute = likesElement2.attributes[2];
    let likes = likesAttribute.value.split(" ")[0];
    likes = likes.replace(replaceRegex, "");

    let likesPerViewerPercentage = Math.round((likes / viewCount) * 100);
    console.log("viewcount: " + viewCount + " , likes: " + likes + " % " + likesPerViewerPercentage);

    // Set ratio text
    ratioElement.innerHTML = likesText + " " + likesPerViewerPercentage + "%";

    if (likesPerViewerPercentage <= minimumLikeRatio) {
        console.log(likesPerViewerPercentage + " <= " + minimumLikeRatio);
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