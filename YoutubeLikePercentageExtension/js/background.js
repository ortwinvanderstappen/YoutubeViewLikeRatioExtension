
let defaultMinLikeRatio = 3;

chrome.runtime.onInstalled.addListener(() => {

    chrome.storage.sync.set({ likeRatio: defaultMinLikeRatio }, function () {
        console.log('likeRatio defaulted to ' + defaultMinLikeRatio);
    });
    
});



