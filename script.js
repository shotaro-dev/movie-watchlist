const resultsEl = document.getElementById("results-container");
const watchlistEl = document.getElementById("watchlist-container");

const API = "1b1e0652";
const TITLE = "terminator";
const baseUrl = "https://www.omdbapi.com/";
const queryParams = `?apikey=${API}&s=${TITLE}`;
const url = baseUrl + queryParams;

const plusIcon = `<svg class="w-full h-full" viewBox="0 0 100 100" fill="black"  xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd" d="M50 75C63.8071 75 75 63.8071 75 50C75 36.1929 63.8071 25 50 25C36.1929 25 25 36.1929 25 50C25 63.8071 36.1929 75 50 75ZM53.125 40.625C53.125 38.8991 51.7259 37.5 50 37.5C48.2741 37.5 46.875 38.8991 46.875 40.625V46.875H40.625C38.8991 46.875 37.5 48.2741 37.5 50C37.5 51.7259 38.8991 53.125 40.625 53.125H46.875V59.375C46.875 61.1009 48.2741 62.5 50 62.5C51.7259 62.5 53.125 61.1009 53.125 59.375V53.125H59.375C61.1009 53.125 62.5 51.7259 62.5 50C62.5 48.2741 61.1009 46.875 59.375 46.875H53.125V40.625Z" />
</svg>`;
const minusIcon = `
<svg class="w-full h-full"  viewBox="0 0 100 100" fill="black" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd" d="M50 75C63.8071 75 75 63.8071 75 50C75 36.1929 63.8071 25 50 25C36.1929 25 25 36.1929 25 50C25 63.8071 36.1929 75 50 75ZM40.625 46.875C38.8991 46.875 37.5 48.2741 37.5 50C37.5 51.7259 38.8991 53.125 40.625 53.125H59.375C61.1009 53.125 62.5 51.7259 62.5 50C62.5 48.2741 61.1009 46.875 59.375 46.875H40.625Z" />
</svg>`;
const searchIcon = `    
<svg class="w-full h-full" viewBox="0 0 100 100" fill="black" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd" d="M43.75 31.25C36.8464 31.25 31.25 36.8464 31.25 43.75C31.25 50.6536 36.8464 56.25 43.75 56.25C50.6536 56.25 56.25 50.6536 56.25 43.75C56.25 36.8464 50.6536 31.25 43.75 31.25ZM25 43.75C25 33.3947 33.3947 25 43.75 25C54.1053 25 62.5 33.3947 62.5 43.75C62.5 47.7995 61.2163 51.5491 59.0336 54.6142L74.0847 69.6653C75.3051 70.8857 75.3051 72.8643 74.0847 74.0847C72.8643 75.3051 70.8857 75.3051 69.6653 74.0847L54.6142 59.0336C51.5491 61.2163 47.7995 62.5 43.75 62.5C33.3947 62.5 25 54.1053 25 43.75Z" />
</svg>`;

let watchlist = [];

async function fetchMovies() {
  const searchResponse = await fetch(url);
  const searchData = await searchResponse.json();

  console.log(searchData);
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
    return;
  }

  //   console.log(movies);
  //   if (!movies) return;
  console.log(movies);
  movies.forEach((movie, index) => {
    const { Title, Genre, Plot, imdbRating, Runtime, imdbID } = movie;
    const Poster = searchData.Search[index].Poster;
    console.log(Title, Genre, Plot, imdbRating, Runtime);
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
    const addWatchlistBtn = `<button data-movie='${encodedMovie}' class="addWatchlist-btn flex items-center "><span class="w-10 h-10 inline-block">${plusIcon}</span> Watchlist</button>`;

    resultsEl.innerHTML += `
      <li class="flex justify-center items-center  p-4 rounded mb-4 overflow-hidden ">
        <img src="${Poster}" alt="Poster of ${Title}" class=" min-w-40 h-auto object-contain aspect-[2/3] rounded lg:w-full" />
        <div class="ml-4 ">
            <div class="flex justify-start items-center gap-2 mb-2">
                <h2 class="text-xl font-bold ">${Title}</h2>
                <p class=""><span class="text-yellow-500">★</span><span class="font-mono ">${imdbRating}</span></p>
            </div>
            <div class="flex justify-between items-center mb-2 gap-1">
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

  const addToWatchlistBtns = 
    document.querySelectorAll(".addWatchlist-btn")
  
  console.log(addToWatchlistBtns);
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

if(resultsEl){
    fetchMovies();
} else {
    // watchlist.htmlの場合
    displayWatchlist();
}

function displayWatchlist(){
    watchlist = JSON.parse(localStorage.getItem("watchlist")) || [];
    console.log(watchlist);
    if(watchlist.length ===0){
        watchlistEl.innerHTML = `<p class="text-center">Your watchlist is empty. <a href="index.html" class="text-blue-500 underline">Go add some movies!</a></p>`;
        return;
    } 

    watchlistEl.innerHTML = "";
    watchlist.forEach((movie) => {
        const { Title, Genre, Plot, imdbRating, Runtime, Poster, imdbID } = movie;
        //数字だけfont-monoにするため分離
        const [num, unit] = Runtime.split(" ");
        const removeWatchlistBtn = `<button data-id='${imdbID}' class="removeWatchlist-btn flex items-center "><span class="w-10 h-10 inline-block">${minusIcon}</span> Remove</button>`;
    
        watchlistEl.innerHTML += `
          <li class="flex justify-center items-center  p-4 rounded mb-4 overflow-hidden ">
            <img src="${Poster}" alt="Poster of ${Title}" class=" min-w-40 h-auto object-contain aspect-[2/3] rounded lg:w-full" />
            <div class="ml-4 ">
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


        const removeFromWatchlistBtns = 
        document.querySelectorAll(".removeWatchlist-btn")
      
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
};

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
    if (!watchlist.some(movie => movie.imdbID === movieObj.imdbID)) {
      watchlist.push(movieObj); 
      // Persist a JSON string; localStorage only stores strings
      localStorage.setItem("watchlist", JSON.stringify(watchlist));
    }
}

function removeFromWatchlist(movieID) {
    watchlist = JSON.parse(localStorage.getItem("watchlist")) || [];
    watchlist = watchlist.filter(movie => movie.imdbID !== movieID);
    localStorage.setItem("watchlist", JSON.stringify(watchlist));
    // 再表示
    displayWatchlist();
}

//for  debug
// localStorage.clear();

