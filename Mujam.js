"use strict";
/**
 * 
 * The code version.
 * 
 */
const VERSION = "V1.6";
/**
 * Global array to hold the places of Sajda.
 * @global 
 * 
 */
var sajda; //global array
/**
 * used in selected roots... check it again.
 * 
 */
const MAX_REF = 100;
/**
 * A map holds the letters and its roots.
 * set at report2 @see report2
 */
const letterToRoots = new Map();
/**
 * A map holds the roots and its words.
 * 
 * set at report2 @see report2
 */
const rootToWords = new Map();
/**
 * A map holds the words and its references.
 * set at report2 @see report2
 */
const wordToRefs = new Map();
/**
 * 
 * Used to parse indexes from a string encoded by encode36 and add it to index array (indA)
 * 
 * @param {string} str The chapter number.
 * @param {Array} indA index. 
 * 
 */
function addIndexes(str, indA) {
    for (let j = 0; j < str.length; j += 3) {
        let code = str.substring(j, j + 3);
        indA.push(decode36(code));
    }
}
/**
 * 
 * Get the page of index and add it to page array and the holded verses of the page to refA array.
 * note that: Page array are equal to refA array.
 * 
 * @param {array} indA index array which parsed from add indexes.
 * @returns {array} The index(page number,refA string). 
 * 
 */
function indexToArray(indA) {
    let page = [],
        refA = [],
        prev = -1;
    for (let i of indA) {
        let [c, v] = toCV(i);
        let cv = c + ":" + v;
        let p = pageOf(c, v);
        // if the page are same as before.
        if (prev == p)
        // get pop() gets the last element of an array, then add CV and add it at the ned 
            cv = refA.pop() + " " + cv;
        else {
            page.push(p);
            prev = p
        }

        refA.push(cv);
    }
    // only used in tests.
    page.push(999); //999 is sentinel
    return [page, refA];
}
/**
 * Add indexes to array, then parse this array with its pages.
 * @see addIndexes
 * @see indexToArray. 
 * @param {str} str index array which parsed from add indexes.
 * @returns {array} array holds pages number and references number 
 * 
 */
function parseRefs(str) {
    let indA = [];
    addIndexes(str, indA);
    return indexToArray(indA)
}

/**
 * Initialize the first table from local string to show elements offline. 
 * 
 * string structure: suraName+" "+Base 36 reference string.
 * 
 * 
 * @see makeMenu
 * @see selectWord
 * 
 * @param {string} t string contains specific words and it's encoded reference string.
 * 
 */
function report1(t) {
    // get each word's line by itself.
    let line = t.split("\n"),
        m = line.length;
    console.log(t.length + " chars " + m + " lines");

    for (let i = 0; i < m; i++) {
        let s = line[i];
        let k = s.indexOf("\t");
        if (k < 0) throw Error("TAB missing " + s);
        // get the word and its reference.
        wordToRefs.set(s.substring(0, k), s.substring(k + 1));
    }
    // destructure for sajda -- check MDN docs --> sajda= [];
    let str = "1w82bu2i62ne2s430l38z3gg3pq42y4a74qm5k15q5";
    [sajda, ] = parseRefs(str);
    /*
      let h = window.location.hash.substring(1);
      if (h.length > 0) menu3.value = h;
      console.log("Hash: "+h);
    */
    makeMenu(menu3, [...wordToRefs.keys()]);
    selectWord();
}
/**
 * Parsing and using remote data. 
 * @see makeMenu
 * @see selectRoot
 * @see selectLetter
 * 
 * @param {string} t text from remote data.
 */
function report2(t) {
    // convert the one space to em-space " "
    function convert(s) { //should be done in data.txt
        const EM_SPACE = String.fromCharCode(8195);
        return s.replace(" ", EM_SPACE);
    }
    // clear the the report1 data.
    wordToRefs.clear();

    let line = t.split("\n"),
        m = line.length - 1;
    console.log(t.length + " chars " + m + " lines");
    // number of lines.
    let i = 0;
    while (i < m) {
        let root = convert(line[i]);
        let j = i + 1,
            list = [];
        while (j < m) {
            let s = line[j],
                k = s.indexOf("\t");
            if (k <= 0) break;
            let word = convert(s.substring(0, k));
            wordToRefs.set(word, s.substring(k + 1));
            list.push(word);
            j++;
        } //??
        i = j;
        list.sort();
        let ch = root[0];
        let x = letterToRoots.get(ch);
        if (x) x.push(root);
        else letterToRoots.set(ch, [root]);
        rootToWords.set(root, list);
    }
    let keys = [...letterToRoots.keys()];
    // sort and set menu one (letters)
    makeMenu(menu1, keys.sort());
    selectLetter("س");
    selectRoot(convert("سجد 92"));
}
/**
 * Read data file from link, then parse it.
 * @see report2
 */
function readData() {
    out.innerText = "Reading data";
    const site = "https://maeyler.github.io/Visual-Mujam/";
    const url = site + "data.txt";
    fetch(url)
        .then(r => r.text()) //response
        .then(t => report2(t)); //text
}

/**
 * Make the targeted menu the document has three.(letters, roots, words)
 * The first element  will be selected.
 * 
 * @param {object} m trgeted menu object (html) to create.
 * @param {array} a array elements of the menu.
 */
function makeMenu(m, a) { //first item is selected
    let OPT = "<option selected>";
    m.innerHTML = OPT + a.join("<option>");
}
/**
 * Select the letter from the menu, if no parameter entered the letter will be the menu1 value.
 * Then create menu2 based on the selected character.
 * @see makeMenu
 * @see selectRoot
 * 
 * @param {string} ch letter to be selected (Arabic)
 */
function selectLetter(ch) {
    if (!ch) ch = menu1.value;
    else menu1.value = ch;
    makeMenu(menu2, letterToRoots.get(ch));
    selectRoot();
}
/**
 * select sepcified root, if undefined the menu2 value will be the selected.
 * 
 * @param {String} root root to be seleceted, example: سجد 23
 */
function selectRoot(root) {
    if (!root) root = menu2.value;
    else menu2.value = root;
    let list = rootToWords.get(root);
    let nL = list.length;
    makeMenu(menu3, list);
    if (nL > 1)
        menu3.selectedIndex = -1; //do not select Word
    menu3.disabled = (nL == 1);
    menu3.style.color = (nL == 1 ? "gray" : "");
    //combine refs in list
    combine.hidden = true;
    let indA = [];
    for (let j = 0; j < nL; j++) {
        let str = wordToRefs.get(list[j]);
        let nR = str.length / 3;
        if (nR == 0) //too many refs -- not indexed
            menu3.children[j].disabled = true;
        else if (nL < 3 * MAX_REF || nR < MAX_REF)
            addIndexes(str, indA);
    }
    indA.sort((a, b) => (a - b));
    let [page, refs] = indexToArray(indA);
    displayRef(root, page, refs);
}
/**
 * Select word, if undefined menu3 values will be the selected one.
 * when its used combine will be shown.
 * @see displayRef
 * @see parseRefs
 * @see wordToRefs
 * 
 * get the references from wordsToRefs map.
 * 
 * @param {*} word word to be selected.
 */
function selectWord(word) {
    if (!word) word = menu3.value;
    else menu3.value = word;
    combine.hidden = false;
    let str = wordToRefs.get(word);
    //(pager=array of number, RefA string of Chapter:Verses)
    let [page, refA] = parseRefs(str);
    displayRef(word, page, refA);
}
/**
 * Create and build the HTML table to show the information on it.
 * 
 * @param {String} word: on single word
 * @param {Array} page: Array of pages numbers
 * @param {Array} refA Array of pages references (chapter:verse ..)
 */
function displayRef(word, page, refA) {
    // put three zeros on the first of the number (K)
    function threeDigits(k) { //same as (""+k).padStart(3,"0")
        let s = "" + k;
        while (s.length < 3) s = "0" + s;
        return s;
    }
    // get colour based on the number of verses in a page.
    // why not to use 3 colour heat map? or HSL ??
    function toColor(n) {
        if (n == 0) return "";
        if (n > 15) n = 15;
        let g = 255 - 16 * n,
            b = 160 - 10 * n;
        let col = "rgb(" + g + ", " + g + ", " + b + ")";
        return "background-color: " + col;
    }
    // m number of juzz, 2 number of pages per juzz.
    // create the HTML the same way as how it looks now :3 
    const m = 30,
        n = 20;
    let row = "<th>Page</th>";
    for (let j = 1; j <= n; j++) {
        row += "<th>" + (j % 10) + "</th>"; //use last digit
    }
    let text = "<tr>" + row + "</tr>";
    let pn = 0,
        p = 0,
        q = 0,
        nc = 0;
    for (let i = 1; i <= m + 1; i++) {
        // pn == 20*(i-1);   //s2 is hidden
        let z = i > m ? m : i;
        let s2 = "<span class='t1'>Juzz " + z + "</span>";
        row = "<th>" + threeDigits(pn) + s2 + "</th>";
        let U = i > m ? 4 : n;
        for (let j = 1; j <= U; j++) {
            pn++; //page number
            let c = 0;
            if (pn == page[p]) {
                c = refA[p].split(" ").length;
                let k = refA[p].indexOf(":");
                k = (k < 0 ? 0 : Number(refA[p].substring(0, k)));
                let refs = sName[k] + " " + refA[p];
                if (c > 1) refs += "&emsp;(" + c + ")";
                s2 = "<span class='t2'>" + refs + "</span>";
                p++;
                nc += c;
            } else {
                s2 = "<span class='t1'>" + pLabel[pn] + "</span>";
            }
            let ch = "&nbsp;"
            if (pn == sajda[q]) {
                ch = "۩";
                q++;
            }
            row += "<td style='" + toColor(c) + "'>" + ch + s2 + "</td>";
        }
        if (i > m) row += "<td class=small colspan=16>" +
            "Visual Mujam " + VERSION + " (C) 2019 MAE </td>";
        text += "<tr>" + row + "</tr>";
    }
    // end of creation.
    tablo.innerHTML = text;
    document.title = TITLE + " -- " + word;
    let t1 = "on " + refA.length + " pages";
    if (nc == 0)
        out.innerText = "(too many verses)";
    else out.innerText = t1; //nc+" instances "+t1;
    console.log(word, t1);
    // set the windows hash location to the word
    window.location.hash = "#" + word;
}
/**
 * Open the quran webPage after checking it's event.
 * ??
 * @param {*} evt get the event trigger. 
 */
function doClick1(evt) {
    // check if the targetted event is the needed cell.
    let t = evt.target;
    if (t.tagName.toLowerCase() != "span") return;
    t = t.parentElement;
    if (t.tagName.toLowerCase() != "td") return;
    const REF = "https://maeyler.github.io/Iqra3/#p=";
    //"http://kuranmeali.com/Sayfalar.php?sayfa=";
    let r = t.parentElement.rowIndex;
    let p = 20 * (r - 1) + t.cellIndex;
    if (p == 1) p = 0; //first page is Fatiha
    console.log("click on p" + p);
    window.open(REF + p, "quran", "resizable,scrollbars", true);
}
/**
 * Open Corpus quran link that related to the selected word specific word. 
 *  
 * 
 * @see toBuckwalter
 * 
 */
function doClick2() {
    const REF = "http://corpus.quran.com/qurandictionary.jsp";
    let p = "",
        v = menu2.value;
    if (v) p = "?q=" + toBuckwalter(v);
    console.log("corpus" + p);
    window.open(REF + p, "corpus", "resizable,scrollbars", true);
}