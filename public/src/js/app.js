const apiKey = '0a7b41c5aaa14955b1420a15968d0779';
const newsArticle = document.querySelector('main');
const sourceSelector = document.querySelector('.source');
const countrySelector = document.querySelector('.country');
const defaultNewsSource = 'abc-news';

window.addEventListener('load', event => {
  getNews();
  getSources();
  sourceSelector.value = defaultNewsSource;
  $('select').material_select();
});

$('#select1').on('change', function(event) {
  getNews(event.target.value);
})

$('#select2').on('change', function(event) {
  getNewsByCountry(event.target.value);
  $('select').material_select();
});

async function getNewsByCountry(country) {
  const response = await 
  fetch(`https://newsapi.org/v2/top-headlines?country=${country}&apiKey=${apiKey}`)
    .then(function(res){
      return res.json();
    }).then(function(data) {
      newsArticle.innerHTML = data.articles.map(newsArticles).join('\n');
    });
}

function getNews(source = defaultNewsSource) {
  var netWorkDataReceived = false;
  fetch(`https://newsapi.org/v2/top-headlines?sources=${source}&apiKey=${apiKey}`)
  .then(function(res) {
    return res.json();
  })
  .then(function(data) {
    networkDataReceived = true;
    console.log('Data From web', data);
    newsArticle.innerHTML = data.articles.map(newsArticles).join('\n');
  });

  // Check for browser support
  if('indexedDB' in window){
    readAllData('news')
      .then(function(data) {
        if(!netWorkDataReceived) {
          console.log('Data From indexedDB', data);
          newsArticle.innerHTML = data.reverse().map(newsArticles).join('\n');
        }
      })
  }
}

function getSources() {
  fetch(`https://newsapi.org/v2/sources?apiKey=${apiKey}`)
    .then(function(res) {
      return res.json();
    })
    .then(function(data) {
      sourceSelector.innerHTML = data.sources.map(source => `<option value="${source.id}">${source.name}</option>`).join('\n');
      $('select').material_select();
    })
}

function newsArticles(news) {
  return `
    <div class="row">
    <div class="col s12 ">
      <div class="card hoverable">
        <a href="${news.url}" class="new-url" target="_blank">
          <div class="card-image">
            <img src="${news.urlToImage}">
          </div>
          <div class="card-content">
            <h5 class="#1565c0 teal-text lighten-2-text">${news.title}</h5>
            <p class="black-text">${news.description}</p>
          </div>
          <div class="card-action">
            <a href="${news.url}" target="_blank">view</a>
          </div>
        </a>
        </div>
    </div>
  </div>
  `
}

// check for browser support
if('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js')
  .then(() => {
    console.log('Service worker registered');
  })
  .catch(error => {
    console.log('An error occured during srevice worker registration ' + error);
  })
}