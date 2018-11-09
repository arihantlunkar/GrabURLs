chrome.extension.onMessage.addListener(function(request, sender) {
    if (request.action == "getSource") {
        var text = String(request.source);
        var expression = /<a href="(.*?)"/gi;
        var regex = new RegExp(expression);
        var array = text.match(regex);
        array = array.filter(function(item) {
            return !(item.length <= 11);
        });
        array = array.map(function(x) {
            return /<a href="/g.test(x) ? x.replace(/<a href="/g, "") : x
        });
        array = array.map(function(x) {
            return /"/g.test(x) ? x.replace(/"/g, "") : x
        });
        array = array.map(function(x) {
            return /www./g.test(x) ? x.replace(/www./g, "") : x
        });
        array = array.map(function(x) {
            return /\/\//g.test(x) ? x.replace(/\/\//g, "www.") : x
        });
        array = array.map(function(x) {
            return /http:/g.test(x) ? x.replace(/http:/g, "") : x
        });
        array = array.map(function(x) {
            return /https:/g.test(x) ? x.replace(/https:/g, "") : x
        });
        array = array.filter(function(word) {
            return word[0] == 'w' && word[1] == 'w' && word[2] == 'w' && word[3] == '.';
        });
        array = array.sort().filter(function(item, pos, ary) {
            return !pos || item != ary[pos - 1];
        });
        message.innerText = array.join("\n");
        chrome.downloads.download({
            url: "data:text/plain," + message.innerText,
            filename: "data.txt",
            conflictAction: "uniquify", // or "overwrite" / "prompt"
            saveAs: false, // true gives save-as dialogue
        }, function(downloadId) {
            console.log("Downloaded item with ID", downloadId);
        });
    }

});

function onWindowLoad() {

    var message = document.querySelector('#message');

    chrome.tabs.executeScript(null, {
        file: "content.js"
    }, function() {
        // If you try and inject into an extensions page or the webstore/NTP you'll get an error
        if (chrome.extension.lastError) {
            message.innerText = 'There was an error injecting script : \n' + chrome.extension.lastError.message;
        }
    });

}


// Add to RegExp prototype
RegExp.prototype.execAll = function(string) {
    var matches = [];
    var match = null;
    while ((match = this.exec(string)) != null) {
        var matchArray = [];
        for (var i in match) {
            if (parseInt(i) == i) {
                matchArray.push(match[i]);
            }
        }
        matches.push(matchArray);
    }
    return matches;
}


window.onload = onWindowLoad;