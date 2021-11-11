window.onload = (event) => {
    let likeRatioElement = document.getElementById("likeRatio");

    chrome.storage.sync.get(['likeRatio'], function (result) {
        likeRatioElement.value = result.likeRatio;
    });

};

document.getElementById("saveButton").addEventListener("click", function () {

    let ratio = document.getElementById("likeRatio").value;
    chrome.storage.sync.set({ likeRatio: ratio }, function () {
        console.log('likeRatio is set to ' + ratio);
    });

    chrome.storage.sync.get(['likeRatio'], function (result) {
        console.log('likeRatio is ' + ratio);
    });
});