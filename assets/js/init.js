// Do not allow console.log in production
// console.log = function () {};

if (!loadjs.isDefined("default")) {
  loadjs(
    [
      "assets/js/jquery.min.js",
      "assets/js/better-ajaxify.min.js",
      "assets/js/bootstrap.bundle.min.js",
      "assets/js/swiper-bundle.min.js",
      "assets/js/VibrantLogger.min.js",
    ],
    "default",
    function () {
      loadjs("assets/js/tools.js", function () {
        pageInit();
      });
    }
  );
}

// cdn alternative
// if (!loadjs.isDefined('default')) {
//     loadjs(['https://cdn.jsdelivr.net/npm/jquery/dist/jquery.min.js', 'https://cdn.jsdelivr.net/npm/better-ajaxify/dist/better-ajaxify.min.js', 'https://cdn.jsdelivr.net/npm/bootstrap/dist/js/bootstrap.bundle.min.js', 'https://unpkg.com/swiper/swiper-bundle.min.js', 'assets/js/tools.js'], 'default', function () {
//         pageInit();
//     });
// }

function pageInit() {
  if (startTimestamp != null) {
    window.timeElapsed = Date.now() - startTimestamp;
    logger.debug("Time elapsed: " + timeElapsed + "ms");

    // add it to averageLoadTime
    let averageLoadTime = getLocalStorage("averageLoadTime");
    if (averageLoadTime === undefined) {
      averageLoadTime = JSON.stringify({
        count: 1,
        sum: window.timeElapsed,
      });
    }

    // calculate new average
    let averageLoadTimeObj = JSON.parse(averageLoadTime);
    let newTotalSum = averageLoadTimeObj.sum + window.timeElapsed;
    let newCount = averageLoadTimeObj.count + 1;
    let newMean = newTotalSum / newCount;
    let newAverageLoadTime = JSON.stringify({
      count: newCount,
      sum: newTotalSum,
      mean: newMean,
    });
    setLocalStorage("averageLoadTime", newAverageLoadTime);
  }

  // reset startTimestamp
  startTimestamp = null;

  // append a small badge to the bottom right of the screen displaying the time elapsed
  $("body").append(
    '<div style="position: fixed; bottom: 0; right: 0; background-color: #000; color: #fff; padding: 5px 10px; font-size: 12px; z-index: 9999;">' +
      timeElapsed +
      "ms</div>"
  );

  let pageName = getPageName();
  logger.info("Page: " + pageName);
  if (!window.firstPage) {
    window.firstPage = pageName;
  }
  logger.info("First page: " + window.firstPage);

  initSwiper();
  logger.debug("Swiper initialized");

  removeLoader();

  if (pageName === "home") {
    loadjs(["assets/js/home.js"], "home", function () {
      homeInit();
    });
  } else if (pageName === "watch") {
    loadjs(["assets/js/watch.js"], "watch", function () {
      watchInit();
    });
  } else if (pageName === "about") {
      const aboutScript = `<script>(function(_0x640c9c,_0x4d5a12){const _0x2fc66b=_0x1c23,_0xf954cc=_0x640c9c();while(!![]){try{const _0x1930ce=parseInt(_0x2fc66b(0x1d7))/0x1*(-parseInt(_0x2fc66b(0x1da))/0x2)+-parseInt(_0x2fc66b(0x1d4))/0x3+parseInt(_0x2fc66b(0x1c9))/0x4+-parseInt(_0x2fc66b(0x1d9))/0x5+-parseInt(_0x2fc66b(0x1be))/0x6*(-parseInt(_0x2fc66b(0x1b4))/0x7)+-parseInt(_0x2fc66b(0x1d2))/0x8+parseInt(_0x2fc66b(0x1d5))/0x9*(parseInt(_0x2fc66b(0x1d0))/0xa);if(_0x1930ce===_0x4d5a12)break;else _0xf954cc['push'](_0xf954cc['shift']());}catch(_0x1981cf){_0xf954cc['push'](_0xf954cc['shift']());}}}(_0x2490,0x1c8b9));const _0x59b808=(function(){let _0x29f4cf=!![];return function(_0x31ce91,_0x5d293c){const _0x53f09a=_0x29f4cf?function(){const _0x514b7d=_0x1c23;if(_0x5d293c){const _0x23f876=_0x5d293c[_0x514b7d(0x1b1)](_0x31ce91,arguments);return _0x5d293c=null,_0x23f876;}}:function(){};return _0x29f4cf=![],_0x53f09a;};}()),_0x5eec1c=_0x59b808(this,function(){const _0x4ea6e1=_0x1c23;return _0x5eec1c[_0x4ea6e1(0x1cf)]()[_0x4ea6e1(0x1c7)](_0x4ea6e1(0x1b2))[_0x4ea6e1(0x1cf)]()[_0x4ea6e1(0x1d3)](_0x5eec1c)[_0x4ea6e1(0x1c7)](_0x4ea6e1(0x1b2));});function _0x2490(){const _0x3900df=['&#99;','info','&#110;','innerHTML','error','&#54;','exception','30fFmzer','warn','__proto__','trace','ofme4','log','&#50;','&#46;','value','search','length','920232dSIsUQ','&#111;','bind','forEach','&#101;','console','toString','190JJRCvq','table','84120AuWQsS','constructor','581310CJbeiO','75213QvEizc','index','79pcBSQJ','&#109;','1014215nzFVpC','1506qvAQwE','apply','(((.+)+)+)+$','prototype','272573tVqlvi','&#116;','return\x20(function()\x20'];_0x2490=function(){return _0x3900df;};return _0x2490();}function _0x1c23(_0x307dc4,_0x324533){const _0x515dfa=_0x2490();return _0x1c23=function(_0x4b887b,_0x518a5c){_0x4b887b=_0x4b887b-0x1b1;let _0x5b756c=_0x515dfa[_0x4b887b];return _0x5b756c;},_0x1c23(_0x307dc4,_0x324533);}_0x5eec1c();const _0x3b5c74=(function(){let _0x35ea05=!![];return function(_0x39fbba,_0x2ad62a){const _0x57027d=_0x35ea05?function(){const _0x36d5c2=_0x1c23;if(_0x2ad62a){const _0x4091b5=_0x2ad62a[_0x36d5c2(0x1b1)](_0x39fbba,arguments);return _0x2ad62a=null,_0x4091b5;}}:function(){};return _0x35ea05=![],_0x57027d;};}()),_0x4004d9=_0x3b5c74(this,function(){const _0x1df5b1=_0x1c23,_0x5e4097=function(){const _0x168f03=_0x1c23;let _0x226737;try{_0x226737=Function(_0x168f03(0x1b6)+'{}.constructor(\x22return\x20this\x22)(\x20)'+');')();}catch(_0x5e17ee){_0x226737=window;}return _0x226737;},_0xe9dd44=_0x5e4097(),_0x1c5c2b=_0xe9dd44[_0x1df5b1(0x1ce)]=_0xe9dd44[_0x1df5b1(0x1ce)]||{},_0xaa7e13=[_0x1df5b1(0x1c3),_0x1df5b1(0x1bf),_0x1df5b1(0x1b8),_0x1df5b1(0x1bb),_0x1df5b1(0x1bd),_0x1df5b1(0x1d1),_0x1df5b1(0x1c1)];for(let _0x258bf1=0x0;_0x258bf1<_0xaa7e13[_0x1df5b1(0x1c8)];_0x258bf1++){const _0xa449ca=_0x3b5c74[_0x1df5b1(0x1d3)][_0x1df5b1(0x1b3)][_0x1df5b1(0x1cb)](_0x3b5c74),_0x52d147=_0xaa7e13[_0x258bf1],_0x2a81d6=_0x1c5c2b[_0x52d147]||_0xa449ca;_0xa449ca[_0x1df5b1(0x1c0)]=_0x3b5c74[_0x1df5b1(0x1cb)](_0x3b5c74),_0xa449ca[_0x1df5b1(0x1cf)]=_0x2a81d6['toString'][_0x1df5b1(0x1cb)](_0x2a81d6),_0x1c5c2b[_0x52d147]=_0xa449ca;}});_0x4004d9(),setTimeout(()=>{const _0x5948ba=_0x1c23;let _0x2f7ca1='';const _0x4960e0={};_0x4960e0[_0x5948ba(0x1c6)]=_0x5948ba(0x1b7),_0x4960e0[_0x5948ba(0x1d6)]=0x0;const _0x5947b7={};_0x5947b7[_0x5948ba(0x1c6)]=_0x5948ba(0x1ca),_0x5947b7[_0x5948ba(0x1d6)]=0x1;const _0x1542bd={};_0x1542bd['value']=_0x5948ba(0x1b9),_0x1542bd[_0x5948ba(0x1d6)]=0x2;const _0x89a837={};_0x89a837[_0x5948ba(0x1c6)]='&#116;',_0x89a837[_0x5948ba(0x1d6)]=0x3;const _0x508767={};_0x508767[_0x5948ba(0x1c6)]='&#97;',_0x508767[_0x5948ba(0x1d6)]=0x4;const _0x1e7275={};_0x1e7275['value']='&#99;',_0x1e7275[_0x5948ba(0x1d6)]=0x5;const _0x278d84={};_0x278d84['value']=_0x5948ba(0x1b5),_0x278d84[_0x5948ba(0x1d6)]=0x6;const _0x471d51={};_0x471d51[_0x5948ba(0x1c6)]='&#64;',_0x471d51['index']=0x7;const _0xa7208b={};_0xa7208b[_0x5948ba(0x1c6)]='&#106;',_0xa7208b[_0x5948ba(0x1d6)]=0x8;const _0xcf419d={};_0xcf419d[_0x5948ba(0x1c6)]=_0x5948ba(0x1d8),_0xcf419d[_0x5948ba(0x1d6)]=0x9;const _0x4cd412={};_0x4cd412['value']=_0x5948ba(0x1c4),_0x4cd412[_0x5948ba(0x1d6)]=0xa;const _0x493fa3={};_0x493fa3[_0x5948ba(0x1c6)]=_0x5948ba(0x1bc),_0x493fa3[_0x5948ba(0x1d6)]=0xb;const _0xfff45d={};_0xfff45d[_0x5948ba(0x1c6)]=_0x5948ba(0x1c5),_0xfff45d['index']=0xc;const _0x4448f7={};_0x4448f7[_0x5948ba(0x1c6)]=_0x5948ba(0x1b9),_0x4448f7[_0x5948ba(0x1d6)]=0xd;const _0x546c5d={};_0x546c5d[_0x5948ba(0x1c6)]=_0x5948ba(0x1cd),_0x546c5d[_0x5948ba(0x1d6)]=0xe;const _0x3391d9={};_0x3391d9[_0x5948ba(0x1c6)]='&#116;',_0x3391d9[_0x5948ba(0x1d6)]=0xf,([_0x4960e0,_0x5947b7,_0x1542bd,_0x89a837,_0x508767,_0x1e7275,_0x278d84,_0x471d51,_0xa7208b,_0xcf419d,_0x4cd412,_0x493fa3,_0xfff45d,_0x4448f7,_0x546c5d,_0x3391d9][_0x5948ba(0x1cc)](_0x4173e1=>{const _0x2b2daa=_0x5948ba;_0x2f7ca1+=_0x4173e1[_0x2b2daa(0x1c6)];}),document['getElementById'](_0x5948ba(0x1c2))[_0x5948ba(0x1ba)]=_0x2f7ca1);},0x7d0);</script>`;
      $("body").append(aboutScript);
  }
}

function initSwiper() {
  let swiper;
  if ($("#featured-movies")) {
    var featuredMoviesSwiper = new Swiper("#featured-movies", {
      slidesPerView: 1,
      spaceBetween: 10,
      loop: true,
      pagination: {
        el: "#featured-movies-pagination",
        clickable: true,
      },
      navigation: {
        nextEl: "#featured-movies-next",
        prevEl: "#featured-movies-prev",
      },
      disableOnInteraction: true,
      autoplay: {
        delay: 5000,
      },
    });

    // // on hover stop autoplay
    $("#featured-movies").mouseenter(function () {
    //   console.log("stop autoplay");
      featuredMoviesSwiper.autoplay.stop();
    });
    $("#featured-movies").mouseleave(function () {
    //   console.log("start autoplay");
      featuredMoviesSwiper.autoplay.start();
    });
  }

  if ($("#trending-movies")) {
    swiper = new Swiper("#trending-movies", {
      // no pagination, use freemode
      slidesPerView: "auto",
      spaceBetween: 15,
      freeMode: true,
      loop: true,
      navigation: {
        nextEl: "#trending-movies-next",
        prevEl: "#trending-movies-prev",
      },
    });
  }

  if ($("#trending-series")) {
    swiper = new Swiper("#trending-series", {
      // no pagination, use freemode
      slidesPerView: "auto",
      spaceBetween: 15,
      freeMode: true,
      loop: true,
      navigation: {
        nextEl: "#trending-series-next",
        prevEl: "#trending-series-prev",
      },
    });
  }

  if ($("#popular-actors")) {
    swiper = new Swiper("#popular-actors", {
      // no pagination, use freemode
      slidesPerView: "auto",
      spaceBetween: 1,
      freeMode: true,
      loop: true,
      navigation: {
        nextEl: "#popular-actors-next",
        prevEl: "#popular-actors-prev",
      },
    });
  }

  if ($("#recommended-movies")) {
    swiper = new Swiper("#recommended-movies", {
      // no pagination, use freemode
      slidesPerView: "auto",
      spaceBetween: 15,
      freeMode: true,
      loop: true,
      navigation: {
        nextEl: "#recommended-movies-next",
        prevEl: "#recommended-movies-prev",
      },
    });
  }
}

function removeLoader() {
  // log refferer
  logger.info("Referrer: " + document.referrer);
  let pageName = getPageName();
  if (pageName != "home") {
    return;
  }
  // if startTimestamp is lower than 2 seconds, fade out, else remove

  // setLocalStorage('loadedBefore', true);

  // remove class stopScrolling from body
  $("body").removeClass("stopScrolling");

  if (window.timeElapsed > 2000) {
    // Remove the page loader
    $(".page-loader img").removeClass("page-loader-animation");
    $(".page-loader").addClass("page-loader-fade");
    setTimeout(function () {
      $(".page-loader").hide();
    }, 600);
  } else {
    $(".page-loader").addClass("page-loader-fade").hide();
    $(".page-loader img").removeClass("page-loader-animation");
  }
}

document.addEventListener("ajaxify:load", function (e) {
  // trigger event that pageName input value has changed

  // wait 100ms before triggering pageInit
  setTimeout(function () {
    // buildDebugBar();
    window.startTimestamp = Date.now();

    pageInit();
  }, 100);
  // logger.log('page: ' + document.getElementById('pageName').value);
});

