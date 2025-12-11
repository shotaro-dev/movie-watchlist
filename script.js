const resultsEl = document.getElementById("results-container");
const watchlistEl = document.getElementById("watchlist-container");
const searchInputEl = document.getElementById("search-input");
const formEl = document.getElementById("search-form");
const searchMessageEl = document.getElementById("search-message");
const watchlistMessageEl = document.getElementById("watchlist-message");

const API = "1b1e0652";
// Restore search term from sessionStorage
let title = sessionStorage.getItem("searchTerm") || "";
if (searchInputEl && title) {
  searchInputEl.value = title;
}
const baseUrl = "https://www.omdbapi.com/";
let queryParams = `?apikey=${API}&s=${title}`;
let url = baseUrl + queryParams;

const plusIcon = `<svg class="w-full h-full" viewBox="0 0 100 100" fill="black"  xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd" d="M50 75C63.8071 75 75 63.8071 75 50C75 36.1929 63.8071 25 50 25C36.1929 25 25 36.1929 25 50C25 63.8071 36.1929 75 50 75ZM53.125 40.625C53.125 38.8991 51.7259 37.5 50 37.5C48.2741 37.5 46.875 38.8991 46.875 40.625V46.875H40.625C38.8991 46.875 37.5 48.2741 37.5 50C37.5 51.7259 38.8991 53.125 40.625 53.125H46.875V59.375C46.875 61.1009 48.2741 62.5 50 62.5C51.7259 62.5 53.125 61.1009 53.125 59.375V53.125H59.375C61.1009 53.125 62.5 51.7259 62.5 50C62.5 48.2741 61.1009 46.875 59.375 46.875H53.125V40.625Z" />
</svg>`;
const minusIcon = `
<svg class="w-full h-full"  viewBox="0 0 100 100" fill="black" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd" d="M50 75C63.8071 75 75 63.8071 75 50C75 36.1929 63.8071 25 50 25C36.1929 25 25 36.1929 25 50C25 63.8071 36.1929 75 50 75ZM40.625 46.875C38.8991 46.875 37.5 48.2741 37.5 50C37.5 51.7259 38.8991 53.125 40.625 53.125H59.375C61.1009 53.125 62.5 51.7259 62.5 50C62.5 48.2741 61.1009 46.875 59.375 46.875H40.625Z" />
</svg>`;

// Fallback image for missing posters
const placeholderPoster = "./images/evan-buchholz-z-Hu8pnt23s-unsplash.jpg";

let watchlist = [];

function updateUrl() {
  queryParams = `?apikey=${API}&s=${title}`;
  url = baseUrl + queryParams;
  console.log("Updated URL:", url);
}

if (searchInputEl) {
  searchInputEl.addEventListener("input", (e) => {
    title = e.target.value.trim();
    // Save to sessionStorage so it persists across page navigations
    sessionStorage.setItem("searchTerm", title);
    console.log("Search term:", title);
    // 他の変数も更新しないと変わらない
    updateUrl();
  });
}

if (formEl) {
  formEl.addEventListener("submit", (e) => {
    e.preventDefault();
    if (title) {
      console.log("Form submitted. Searching for:", title);
      updateUrl();
      fetchMovies();
    }
  });
}

async function fetchMovies() {
  console.log("fetchMovies called with title:", title);
  console.log(url);

  const searchResponse = await fetch(url);
  const searchData = await searchResponse.json();

  //   console.log(searchData);
  let movies;
  // promise.allで複数のfetchを全て通るか判定
  try {
    movies = await Promise.all(
      searchData.Search.map(async (movie) => {
        const detailsUrl = `${baseUrl}?apikey=${API}&i=${movie.imdbID}`;
        const detailsResponse = await fetch(detailsUrl);
        if (!detailsResponse.ok) {
          throw new Error(
            `Failed to fetch ${movie.Title}. status: ${detailsResponse.status}`
          );
        }
        return await detailsResponse.json();
      })
    );
  } catch (error) {
    console.error("Error fetching movie details:", error);
    resultsEl.innerHTML = "";
    if (searchMessageEl) {
      searchMessageEl.innerHTML = `<p class="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2  text-2xl font-bold text-slate-600/30">What you are looking for cannot be found. Please try again with a different title.</p>`;
    }
    return;
  }

  //   console.log(movies);
  //   if (!movies) return;
  //   console.log(movies);

  resultsEl.innerHTML = "";
  searchMessageEl.innerHTML = "";

  movies.forEach((movie, index) => {
    const { Title, Genre, Plot, imdbRating, Runtime, imdbID } = movie;
    const Poster = searchData.Search[index].Poster;
    console.log(Poster);
    const posterSrc = Poster && Poster !== "N/A" ? Poster : placeholderPoster;
    // console.log(Title, Genre, Plot, imdbRating, Runtime);
    //数字だけfont-monoにするため分離
    const [num, unit] = Runtime.split(" ");
    const movieObj = {
      Title,
      Genre,
      Plot,
      imdbRating,
      Runtime,
      Poster,
      imdbID,
    };
    // console.log(movieObj);
    // data-属性にはstringしか保存できないため、JSON.stringifyで文字列化して保存
    // Encode JSON string so it stays valid inside the data attribute
    const encodedMovie = encodeURIComponent(JSON.stringify(movieObj));
    const addWatchlistBtn = `<button data-movie='${encodedMovie}' class="addWatchlist-btn flex items-center hover:opacity-75 transition-opacity duration-300 active:opacity-50"><span class="w-10 h-10 inline-block">${plusIcon}</span> Watchlist</button>`;

    resultsEl.innerHTML += `
      <li class="flex justify-start items-center  p-4 rounded mb-4 overflow-hidden ">
        <img src="${posterSrc}" alt="Poster of ${Title}" class=" max-w-40  object-cover aspect-[2/3] rounded " onerror="this.onerror=null;this.src='${placeholderPoster}';" />
        <div class="ml-4 grow">
            <div class="flex justify-start items-center gap-2 mb-2">
                <h2 class="text-xl font-bold ">${Title}</h2>
                <p class=""><span class="text-yellow-500">★</span><span class="font-mono ">${imdbRating}</span></p>
            </div>
            <div class="flex justify-between items-center  mb-2 gap-1">
                <p class=""><span class="font-mono">${num}</span>${
      unit ? " " + unit : ""
    }</p>
                <p class="">${Genre}</p>
                ${addWatchlistBtn}
            </div>
            
            <p class=" line-clamp-5">${Plot}</p>
        </div>
      </li>
    `;
  });

  const addToWatchlistBtns = document.querySelectorAll(".addWatchlist-btn");

  //   console.log(addToWatchlistBtns);
  if (addToWatchlistBtns) {
    addToWatchlistBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        console.log("Button clicked!");
        // const movieObj = {};
        // const movieID = btn.dataset.id;
        const movieData = btn.dataset.movie;
        console.log(movieData);
        const movieObj = JSON.parse(decodeURIComponent(movieData));
        console.log(movieObj);
        saveToWatchlist(movieObj);
      });
    });
  }
}

// 表示してるpageにない要素はnullになる。
if (resultsEl && title) {
  fetchMovies();
} else {
  // watchlist.htmlの場合
  displayWatchlist();
}

function displayWatchlist() {
  watchlist = JSON.parse(localStorage.getItem("watchlist")) || [];
  console.log(watchlist);
  console.log(title);
  if (watchlist.length === 0) {
    watchlistEl.innerHTML = "";
    if (watchlistMessageEl) {
      watchlistMessageEl.innerHTML = `<p class="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-2xl font-bold text-slate-600/30">Your watchlist is looking a little empty... <a href="index.html" class="text-black flex items-center hover:opacity-75 transition-opacity duration-300 active:opacity-50"><span class=" h-10 w-10 inline-block ">${plusIcon}</span>Let's add some movies!</a></p>`;
    }
    return;
  }

  watchlistEl.innerHTML = "";
  watchlist.forEach((movie) => {
    const { Title, Genre, Plot, imdbRating, Runtime, Poster, imdbID } = movie;
    const posterSrc = Poster && Poster !== "N/A" ? Poster : placeholderPoster;
    //数字だけfont-monoにするため分離
    const [num, unit] = Runtime.split(" ");
    const removeWatchlistBtn = `<button data-id='${imdbID}' class="removeWatchlist-btn flex items-center hover:opacity-75 transition-opacity duration-300 active:opacity-50"><span class="w-10 h-10 inline-block">${minusIcon}</span> Remove</button>`;

    watchlistEl.innerHTML += `
          <li class="flex justify-start items-center  p-4 rounded mb-4 overflow-hidden ">
            <img src="${posterSrc}" alt="Poster of ${Title}" class=" max-w-40  object-cover aspect-[2/3] rounded " onerror="this.onerror=null;this.src='${placeholderPoster}';" />
            <div class="ml-4 grow">
                <div class="flex justify-start items-center gap-2 mb-2">
                    <h2 class="text-xl font-bold ">${Title}</h2>
                    <p class=""><span class="text-yellow-500">★</span><span class="font-mono ">${imdbRating}</span></p>
                </div>
                <div class="flex justify-between items-center mb-2 gap-1">
                    <p class=""><span class="font-mono">${num}</span>${
      unit ? " " + unit : ""
    }</p>
                    <p class="">${Genre}</p>
                    ${removeWatchlistBtn}
                </div>
                
                <p class=" line-clamp-5">${Plot}</p>
            </div>
          </li>
        `;

    const removeFromWatchlistBtns = document.querySelectorAll(
      ".removeWatchlist-btn"
    );

    console.log(removeFromWatchlistBtns);
    if (removeFromWatchlistBtns) {
      removeFromWatchlistBtns.forEach((btn) => {
        btn.addEventListener("click", () => {
          console.log("Remove Button clicked!");
          const movieID = btn.dataset.id;
          console.log(movieID);
          removeFromWatchlist(movieID);
        });
      });
    }
  });
}

// fetch(url)
//   .then((res) => res.json())
//   .then((data) => {
//     console.log(data);
//     console.log(data.Search);
//   });
// //
// localで指定しmovieデータを保存
// fetchで取得したmovieから作ったobjectをarrayにpushしてlocalStorageに保存する
function saveToWatchlist(movieObj) {
  watchlist = JSON.parse(localStorage.getItem("watchlist")) || [];
  // watchlistの既存の要素と重複がなかったら追加
  if (!watchlist.some((movie) => movie.imdbID === movieObj.imdbID)) {
    watchlist.push(movieObj);
    // Persist a JSON string; localStorage only stores strings
    localStorage.setItem("watchlist", JSON.stringify(watchlist));
  }
}

function removeFromWatchlist(movieID) {
  watchlist = JSON.parse(localStorage.getItem("watchlist")) || [];
  watchlist = watchlist.filter((movie) => movie.imdbID !== movieID);
  localStorage.setItem("watchlist", JSON.stringify(watchlist));
  // 再表示
  displayWatchlist();
}

//for  debug
// localStorage.clear();
