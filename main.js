// PAGE LOADS, ONCE READY INITIALIZE MAIN FUNCTION

document.addEventListener("readystatechange", (e) => {
  if (e.target.readyState === "complete") {
    initApp();
  }
});

// FUNCTIONS

const setSearchFocus = () => {
  document.getElementById("search").focus();
};

const clearSearchText = (e) => {
  e.preventDefault();
  document.getElementById("search").value = "";
  const clear = document.getElementById("clear");
  clear.classList.add("none");
  clear.classList.remove("flex");
  setSearchFocus();
};

const clearKeyListener = (e) => {
  if (e.key === "Enter" || e.key === " ") {
    e.preventDefault();
    document.getElementById("clear").click();
  }
};

const createResultItem = (result) => {
  const resultItem = document.createElement("div");
  resultItem.classList.add("resultItem");

  const resultTitle = document.createElement("div");
  resultTitle.classList.add("resultTitle");

  const link = document.createElement("a");
  link.href = `https://en.wikipedia.org/?curid=${result.id}`;
  link.textContent = result.title;
  link.target = "_blank";
  resultTitle.append(link);
  resultItem.append(resultTitle);
  return resultItem;
};

const createResultImage = (result) => {
  const resultImage = document.createElement("div");
  resultImage.classList.add("resultImage");

  const img = document.createElement("img");
  img.src = result.img;
  img.alt = result.title;
  resultImage.append(img);
  return resultImage;
};

const createResultText = (result) => {
  const resultText = document.createElement("div");
  resultText.classList.add("resultText");

  const resultDescription = document.createElement("p");
  resultDescription.classList.add("resultDescription");
  resultDescription.textContent = result.text;
  resultText.append(resultDescription);
  return resultText;
};

const clearStatsLine = () => {
  document.getElementById("stats").textContent = "";
};

const setStatsLine = (numberOfResults) => {
  const statsLine = document.getElementById("stats");
  if (numberOfResults) {
    statsLine.textContent = `Displaying ${numberOfResults} results.`;
  } else {
    statsLine.textContent = "Sorry, no results, try again.";
  }
};

const buildSearchResults = (resultArray) => {
  resultArray.forEach((result) => {
    const resultItem = createResultItem(result);
    const resultContent = document.createElement("div");
    resultContent.classList.add("resultContents");
    if (result.img) {
      const resultImage = createResultImage(result);
      resultContent.append(resultImage);
    }
    const resultText = createResultText(result);
    resultContent.append(resultText);
    resultItem.append(resultContent);
    const searchResults = document.getElementById("searchResults");
    searchResults.append(resultItem);
  });
};

const showClearTextButton = () => {
  const search = document.getElementById("search");
  const clear = document.getElementById("clear");
  if (search.value.length) {
    clear.classList.remove("none");
    clear.classList.add("flex");
  } else {
    clear.classList.add("none");
    clear.classList.remove("flex");
  }
};

const initApp = () => {
  setSearchFocus();

  const search = document.getElementById("search");
  search.addEventListener("input", showClearTextButton);

  const clear = document.getElementById("clear");
  clear.addEventListener("click", clearSearchText);
  clear.addEventListener("keydown", clearKeyListener);

  const form = document.getElementById("searchBar");
  form.addEventListener("submit", submitSearch);
};

const deleteSearchResults = () => {
  const parentElement = document.getElementById("searchResults");
  let child = parentElement.lastElementChild;

  while (child) {
    parentElement.removeChild(child);
    child = parentElement.lastElementChild;
  }
};

const submitSearch = (event) => {
  event.preventDefault();

  deleteSearchResults();

  searchProcess();

  setSearchFocus();
};

const getMaxChars = () => {
  const width = window.innerWidth || document.body.clientWidth;
  let maxChars;
  if (width < 414) maxChars = 65;
  if (width >= 414 && width < 1400) maxChars = 100;
  if (width >= 1400) maxChars = 130;
  return maxChars;
};

const getWikiSearchString = (searchTerm) => {
  const maxChars = getMaxChars();
  const rawSearchString = `https://en.wikipedia.org/w/api.php?action=query&generator=search&gsrsearch=${searchTerm}&gsrlimit=20&prop=pageimages|extracts&exchars=${maxChars}&exintro&explaintext&exlimit=max&format=json&origin=*`;
  const searchString = encodeURI(rawSearchString);
  return searchString;
};

const processWikiResults = (searchResults) => {
  const resultArray = [];
  Object.keys(searchResults).forEach((key) => {
    const id = key;
    const title = searchResults[key].title;
    const text = searchResults[key].extract;
    const img = searchResults[key].hasOwnProperty("thumbnail")
      ? searchResults[key].thumbnail.source
      : null;
    const item = {
      id,
      title,
      img,
      text,
    };
    resultArray.push(item);
  });
  return resultArray;
};

const retrieveSearchResults = async (searchTerm) => {
  const wikiSearchString = getWikiSearchString(searchTerm);
  const wikiSearchResults = await requestData(wikiSearchString);
  let resultsArray = [];
  if (wikiSearchResults.hasOwnProperty("query")) {
    resultsArray = processWikiResults(wikiSearchResults.query.pages);
  }
  return resultsArray;
};

const requestData = async (searchString) => {
  try {
    const resp = await fetch(searchString);
    const data = await resp.json();
    return data;
  } catch (e) {
    console.error(e);
  }
};

const getSearchTerm = () => {
  const rawSearchTerm = document.getElementById("search").value.trim();
  const regEx = /[ ]{2,}/gi;
  const searchTerm = rawSearchTerm.replaceAll(regEx, " ");
  return searchTerm;
};

const searchProcess = async () => {
  clearStatsLine();
  const searchTerm = getSearchTerm();
  if (searchTerm === "") return;
  const resultsArray = await retrieveSearchResults(searchTerm);
  if (resultsArray.length) buildSearchResults(resultsArray);
  setStatsLine(resultsArray.length);
};
