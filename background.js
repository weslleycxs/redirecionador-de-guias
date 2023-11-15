chrome.browserAction.onClicked.addListener(function(tab) {

    // Adiciona a guia atual à lista de bloqueados com timestamp
    var blockedTime = new Date().getTime();

    var blockedTabInfo = {
        url: tab.url,
        time: blockedTime
    };

    chrome.storage.local.get({
        blockedTabs: []
    }, function(data) {

        var blockedTabs = data.blockedTabs;

        blockedTabs.push(blockedTabInfo);

        chrome.storage.local.set({
            blockedTabs: blockedTabs
        });

    });

    // Fecha a guia atual
    chrome.tabs.remove(tab.id);

    // Abre uma nova guia
    chrome.tabs.create({});

});

let alreadyBlocked = [];

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {

    // Verifica se a guia atual está na lista de bloqueados
    chrome.storage.local.get({blockedTabs: []}, function(data) {

        var blockedTabs = data.blockedTabs;
        var currentTime = new Date().getTime();

        blockedTabs = blockedTabs.filter(function(blockedTab) {

            // Remove guias bloqueadas que expiraram (1 hora)
            return currentTime - blockedTab.time < 3600000;

        });

        var isBlocked = blockedTabs.some(function(blockedTab) {

            return tab.url.includes(blockedTab.url);

        });

        if (isBlocked) {

            if(alreadyBlocked.includes(tabId)) return;

            alreadyBlocked.push(tabId);

            chrome.tabs.get(tabId, function(tab) {

                if (!tab) return;

                chrome.tabs.remove(tabId);

                // Abre uma nova guia
                chrome.tabs.create({});

            });

        }

        // Atualiza a lista de bloqueados
        chrome.storage.local.set({
            blockedTabs: blockedTabs
        });

    });

});
