// ==UserScript==
// @name         DiscrodTop+
// @namespace    http://tampermonkey.net/
// @version      0.2
// @description  Wspomaganie głosowania
// @author       cuberut
// @match        https://docs.google.com/forms/d/e/1FAIpQLSf5XlzMWD_4DtxJ2Ag6pN34ZfoGoKDOpAYVA7Hshjcz4KJhKg/viewform
// @updateURL  https://raw.githubusercontent.com/cuberut/lp357plus/main/discordTop.js
// @grant        GM_addStyle
// ==/UserScript==

GM_addStyle("div#votedList { position: fixed; margin-left: 650px; width: 300px; padding: 0.75em 1em; overflow: auto; max-height: 95vh; }");
GM_addStyle("div#votedList string { font-size: 14px; }");
GM_addStyle("div#votedList ol { font-size: 12px; padding-left: 1em; margin-top: 1em; }");
GM_addStyle("div#votedList ol li:hover { text-decoration: line-through; cursor: pointer; }");

const urlSettingsList = 'https://opensheet.elk.sh/1lAXlMeuXmY-QIbGIMFb6PMx3ya6L-pLbOMNf2NKNzvE/settingsList';

const getList = async (url) => {
    const response = await fetch(url);
    const myJson = await response.json();
    return await myJson;
}

const getVotes = (setList) => {
    const myVotes = {};
    const votes = JSON.parse(localStorage.getItem("myTopVotes"));

    if (votes) {
        votes.forEach(id => { myVotes[id] = true });
        setList.forEach(item => { item.vote = myVotes[item.id] });
    }
}

const checkVotes = (setList, songList) => {
    setList.forEach((item, i) => {
        if (item.vote && !JSON.parse(songList[i].ariaChecked)) {
            songList[i].click();
        }
    });
}

(function() {
    getList(urlSettingsList).then(setList => {
        getVotes(setList);

        const forms = document.querySelector("form");
        const loginSection = forms.children[0];
        const songsSection = forms.children[1];

        forms.insertAdjacentHTML('afterbegin', `<div id="votedList" class="geS5n"><strong>Wybrane utwory [<span>0</span>/57]:</strong><ol></ol></div>`);
        const votedCounter = forms.querySelector('#votedList span')
        const votedList = forms.querySelector('#votedList ol')

        var songList = songsSection.querySelectorAll("div[role='checkbox']");

        checkVotes(setList, songList);

        songsSection.addEventListener("click", (e) => {
            setTimeout(function(){
                const checkedNodes = songsSection.querySelectorAll("div[aria-checked='true']");

                const checkedList = [...checkedNodes].reduce((list, item) => {
                    return `${list}<li>${item.ariaLabel}</li>`
                }, "");

                votedCounter.innerText = checkedNodes.length;

                votedList.textContent = null;
                votedList.insertAdjacentHTML('beforeend', checkedList);

                const votedItems = votedList.querySelectorAll('li');

                votedItems.forEach(li => {
                    li.addEventListener("click", (e) => {
                        const value = e.target.innerText;
                        const input = songsSection.querySelector(`[aria-label='${value}']`);
                        input.click();
                    });
                });
            }, 0);
        });

        setTimeout(function(){
            songsSection.click();
        }, 500);
    });
})();
