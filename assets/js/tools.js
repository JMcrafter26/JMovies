// tools.js

const logger = new Logger({
  // name: "My App", // The name of your app
  // theme: "light", // The theme of the logger (auto, light, dark)
  // style: "maxi" // The style of the logger (auto, maxi)
});

function getBackendUrl() {
  return window.backendUrl;
}


function setLocalStorage(key, value) {
  // check if localStorage jmovies key exists
  if (localStorage.getItem("jmovies") === null) {
    // if not, create it
    localStorage.setItem("jmovies", JSON.stringify({}));
  }
  // get the current localStorage object
  let jm26 = JSON.parse(localStorage.getItem("jmovies"));

  // set the new key value pair
  jm26[key] = value;

  // save the new object to localStorage
  localStorage.setItem("jmovies", JSON.stringify(jm26));
}

function getLocalStorage(key) {
  // check if localStorage jmovies key exists
  if (localStorage.getItem("jmovies") === null) {
    // if not, create it
    localStorage.setItem("jmovies", JSON.stringify({}));
  }
  // get the current localStorage object
  let jm26 = JSON.parse(localStorage.getItem("jmovies"));

  // return the value of the key
  return jm26[key];
}

function getPageName() {
  return $('#pageName').val();
}

function hash(str, seed = 0) {
  let h1 = 0xdeadbeef ^ seed, h2 = 0x41c6ce57 ^ seed;
  for(let i = 0, ch; i < str.length; i++) {
      ch = str.charCodeAt(i);
      h1 = Math.imul(h1 ^ ch, 2654435761);
      h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1  = Math.imul(h1 ^ (h1 >>> 16), 2246822507);
  h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2  = Math.imul(h2 ^ (h2 >>> 16), 2246822507);
  h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909);

  return 4294967296 * (2097151 & h2) + (h1 >>> 0);
};

function getUrlParams() {
  let params = {};
  window.location.search.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m, key, value) {
      params[key] = value;
  });
  return params;
}

function getParamByName(name) {
  return new URLSearchParams(window.location.search).get(name);
}