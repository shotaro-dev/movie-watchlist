const resultsEl = document.getElementById("results-container");
const watchlistEl = document.getElementById("watchlist-container");
const searchInputEl = document.getElementById("search-input");
const formEl = document.getElementById("search-form");
const searchMessageEl = document.getElementById("search-message");
const watchlistMessageEl = document.getElementById("watchlist-message");
const loadingEl = document.getElementById("loading-indicator");
const toastEl = document.getElementById("toast");

const API = "1b1e0652"; // Free plan, up to 1000 requests per day
// Restore search term from sessionStorage
let title = sessionStorage.getItem("searchTerm") || "";
if (searchInputEl && title) {
  searchInputEl.value = title;
}
const baseUrl = "https://www.omdbapi.com/";
let queryParams = `?apikey=${API}&s=${title}`;
let url = baseUrl + queryParams;

const plusIcon = `<svg aria-hidden="true" class="w-full h-full fill-black  dark:fill-white" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd" d="M50 75C63.8071 75 75 63.8071 75 50C75 36.1929 63.8071 25 50 25C36.1929 25 25 36.1929 25 50C25 63.8071 36.1929 75 50 75ZM53.125 40.625C53.125 38.8991 51.7259 37.5 50 37.5C48.2741 37.5 46.875 38.8991 46.875 40.625V46.875H40.625C38.8991 46.875 37.5 48.2741 37.5 50C37.5 51.7259 38.8991 53.125 40.625 53.125H46.875V59.375C46.875 61.1009 48.2741 62.5 50 62.5C51.7259 62.5 53.125 61.1009 53.125 59.375V53.125H59.375C61.1009 53.125 62.5 51.7259 62.5 50C62.5 48.2741 61.1009 46.875 59.375 46.875H53.125V40.625Z" />
</svg>`;
const minusIcon = `
<svg aria-hidden="true" class="w-full h-full fill-black dark:fill-white" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd" d="M50 75C63.8071 75 75 63.8071 75 50C75 36.1929 63.8071 25 50 25C36.1929 25 25 36.1929 25 50C25 63.8071 36.1929 75 50 75ZM40.625 46.875C38.8991 46.875 37.5 48.2741 37.5 50C37.5 51.7259 38.8991 53.125 40.625 53.125H59.375C61.1009 53.125 62.5 51.7259 62.5 50C62.5 48.2741 61.1009 46.875 59.375 46.875H40.625Z" />
</svg>`;

// Fallback image for missing posters
const placeholderPoster = "./images/evan-buchholz-z-Hu8pnt23s-unsplash.webp";

const CONFIG = {
  TOAST_DURATION: 1200,
  FADE_DURATION: 300,
};

let watchlist = [];

function updateUrl() {
  queryParams = `?apikey=${API}&s=${title}`;
  url = baseUrl + queryParams;
}

function renderMovie(movie, isWatchlist = false) {
  const { Title, Genre, Plot, imdbRating, Runtime, Poster, imdbID } = movie;
  const posterSrc = Poster && Poster !== "N/A" ? Poster : placeholderPoster;
  // Separate to make only numbers font-mono
  const [num, unit] = Runtime.split(" ");

  const buttonCommonClass =
    "pr-2 flex items-center hover:opacity-75 transition-opacity duration-300 active:opacity-50 dark:text-white";
  const spanCommonClass = "w-10 h-10 inline-block";
  const buttonHtml = isWatchlist
    ? `<button data-id='${imdbID}' aria-label="Remove ${Title} from watchlist" class="removeWatchlist-btn ${buttonCommonClass}"><span class="${spanCommonClass}">${minusIcon}</span> Remove</button>`
    : `<button data-id='${imdbID}' aria-label="Add ${Title} to watchlist" class="addWatchlist-btn ${buttonCommonClass}"><span class="${spanCommonClass}">${plusIcon}</span> Watchlist</button>`;

  return `
    <li>
      <article class="flex justify-start items-center p-4 rounded mb-4 overflow-hidden bg-white dark:bg-slate-800 shadow-sm">
        <img src="${posterSrc}" alt="Poster of ${Title}" class=" max-w-40  object-cover aspect-[2/3] rounded " onerror="this.onerror=null;this.src='${placeholderPoster}';" />
        <div class="ml-4 grow">
            <div class="flex justify-start items-baseline gap-2 mb-2">
                <h3 class="text-xl line-clamp-2 font-bold dark:text-white">${Title}</h3>
                <p class="dark:text-slate-300"><span class="text-yellow-500">★</span><span class="font-mono ">${imdbRating}</span></p>
            </div>
            <div class="flex justify-between items-center  mb-2 gap-3">
                <p class="dark:text-slate-300"><span class="font-mono">${num}</span>${
    unit ? " " + unit : ""
  }</p>
                <p class="dark:text-slate-300">${Genre}</p>
                ${buttonHtml}
            </div>
            
            <p class="line-clamp-4 dark:text-slate-400">${Plot}</p>
        </div>
      </article>
    </li>
  `;
}

if (searchInputEl) {
  searchInputEl.addEventListener("input", (e) => {
    title = sanitizeInput(e.target.value.trim());
    // Save to sessionStorage so it persists across page navigations
    sessionStorage.setItem("searchTerm", title);
    // console.log("Search term:", title);
    // Other variables must also be updated or the search URL won't change
    updateUrl();
  });
}

if (formEl) {
  formEl.addEventListener("submit", (e) => {
    e.preventDefault();
    if (title) {
      updateUrl();
      fetchMovies();
    }
  });
}

async function fetchMovies() {
  if (loadingEl) loadingEl.classList.remove("hidden");

  try {
    const searchResponse = await fetch(url);
    if (!searchResponse.ok) {
      throw new Error(
        `Search API failed: ${searchResponse.status} ${searchResponse.statusText}`
      );
    }
    const searchData = await searchResponse.json();

    if (searchData.Response === "False") {
      throw new Error(searchData.Error || "No results found");
    }

    // Use Promise.all to fetch multiple movie details in parallel
    const movies = await Promise.all(
      searchData.Search.map(async (movie) => {
        const detailsUrl = `${baseUrl}?apikey=${API}&i=${movie.imdbID}`;
        const detailsResponse = await fetch(detailsUrl);
        if (!detailsResponse.ok) {
          throw new Error(
            `Details API failed for ${movie.Title}: ${detailsResponse.status} ${detailsResponse.statusText}`
          );
        }
        const detailsData = await detailsResponse.json();
        if (detailsData.Response === "False") {
          throw new Error(
            `Details not found for ${movie.Title}: ${detailsData.Error}`
          );
        }
        return detailsData;
      })
    );

    resultsEl.innerHTML = "";
    searchMessageEl.innerHTML = "";

    movies.forEach((movie) => {
      resultsEl.innerHTML += renderMovie(movie, false);
    });

    const addToWatchlistBtns = document.querySelectorAll(".addWatchlist-btn");

    //   console.log(addToWatchlistBtns);
    if (addToWatchlistBtns) {
      addToWatchlistBtns.forEach((btn) => {
        btn.addEventListener("click", async () => {
          const imdbID = btn.dataset.id;
          try {
            const detailsUrl = `${baseUrl}?apikey=${API}&i=${imdbID}`;
            const response = await fetch(detailsUrl);
            if (!response.ok) throw new Error(`API error: ${response.status}`);
            const movieObj = await response.json();
            saveToWatchlist(movieObj);
          } catch (error) {
            console.error("Error fetching movie details:", error);
            showToast("Failed to add movie. Try again.");
          }
        });
      });
    }

    if (loadingEl) loadingEl.classList.add("hidden");
  } catch (error) {
    console.error("Error fetching movie details:", error);
    if (loadingEl) loadingEl.classList.add("hidden");
    resultsEl.innerHTML = "";
    let errorMessage = "An error occurred while fetching movies.";
    if (error.message.includes("429")) {
      errorMessage = "Rate limit exceeded. Please try again later.";
    } else if (error.message.includes("No results")) {
      errorMessage =
        "What you are looking for cannot be found. Please try again with a different title.";
    }
    if (searchMessageEl) {
      searchMessageEl.innerHTML = `<p class="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2  text-2xl font-bold text-slate-700/60 dark:text-slate-200/60">${errorMessage}</p>`;
    }
  }
}

// Elements not on the displayed page become null.
if (resultsEl) {
  // Only fetch if there's a search term
  if (title) {
    fetchMovies();
  }
} else {
  // In case of watchlist.html
  displayWatchlist();
}

function displayWatchlist() {
  watchlist = JSON.parse(localStorage.getItem("watchlist")) || [];
  if (watchlist.length === 0) {
    watchlistEl.innerHTML = "";
    if (watchlistMessageEl) {
      watchlistMessageEl.innerHTML = `<p class="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-2xl font-bold text-slate-700/60 dark:text-slate-200/60">Your watchlist is looking a little empty... <a href="index.html" class="text-black dark:text-slate-300 flex items-center mt-4  hover:opacity-75 transition-opacity duration-300 active:opacity-50"><span class=" h-10 w-10 inline-block ">${plusIcon}</span>Let's add some movies!</a></p>`;
    }
    return;
  }

  watchlistEl.innerHTML = "";
  watchlist.forEach((movie) => {
    watchlistEl.innerHTML += renderMovie(movie, true);
  });

  // Attach event listeners after all items are rendered
  const removeFromWatchlistBtns = document.querySelectorAll(
    ".removeWatchlist-btn"
  );

  if (removeFromWatchlistBtns) {
    removeFromWatchlistBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        const movieID = btn.dataset.id;
        removeFromWatchlist(movieID);
      });
    });
  }
}

// Save movie data locally
// Push the object created from the fetched movie to the array and save to localStorage
function saveToWatchlist(movieObj) {
  watchlist = JSON.parse(localStorage.getItem("watchlist")) || [];
  // Add if not duplicated with existing elements in watchlist
  if (!watchlist.some((movie) => movie.imdbID === movieObj.imdbID)) {
    watchlist.push(movieObj);
    // Persist a JSON string; localStorage only stores strings
    localStorage.setItem("watchlist", JSON.stringify(watchlist));
    showToast();
  }
}

function removeFromWatchlist(movieID) {
  watchlist = JSON.parse(localStorage.getItem("watchlist")) || [];
  watchlist = watchlist.filter((movie) => movie.imdbID !== movieID);
  localStorage.setItem("watchlist", JSON.stringify(watchlist));
  // re-render the watchlist
  displayWatchlist();
}

// To be safe, prevent script tags and dangerous tags
function sanitizeInput(input) {
  const div = document.createElement("div");
  div.textContent = input;
  // Additional: Remove script tags and on* attributes (simple version)
  return div.innerHTML
    .replace(/<script[^>]*>.*?<\/script>/gi, "")
    .replace(/on\w+="[^"]*"/gi, "");
}

let toastTimeoutId = null;
let fadeTimeoutId = null;

function showToast(message = "Movie added to watchlist!") {
  if (!toastEl) return;
  // Clear any existing timeouts
  if (toastTimeoutId) clearTimeout(toastTimeoutId);
  if (fadeTimeoutId) clearTimeout(fadeTimeoutId);
  toastEl.textContent = message;
  toastEl.classList.remove("hidden");
  toastEl.style.opacity = "1";
  // Focus to ensure screen readers announce the toast
  const prevFocus = document.activeElement;
  toastEl.setAttribute("tabindex", "-1");
  toastEl.focus();
  toastTimeoutId = setTimeout(() => {
    toastEl.style.opacity = "0";
    fadeTimeoutId = setTimeout(() => {
      toastEl.classList.add("hidden");
      toastEl.style.opacity = "";
      toastEl.removeAttribute("tabindex");
      // Return focus to the previous element if it exists
      if (prevFocus && typeof prevFocus.focus === "function") {
        prevFocus.focus();
      }
    }, CONFIG.FADE_DURATION);
  }, CONFIG.TOAST_DURATION);
}

//for  debug
// localStorage.clear();
