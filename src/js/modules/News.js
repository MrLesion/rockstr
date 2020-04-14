import Settings from '../Settings.js';
import Utils from './Utils.js';
import Store from './Store.js';
import Time from './Time.js';

/* Vendor */
import * as moment from 'moment';

/* Templates */
import * as newsTmp from '../../templates/news.hbs';

const News = {
    fetchedMonth: null,
    fetchedJSON: [],
    xhr: null,
    store: {
        date: '',
        nyt: []
    },
    set: () => {
        let daysNews = [];
        let date = moment(Time.get().date);
        News.fetchedJSON.forEach((element, index) => {
            var elementDate = moment(element.pub_date);
            if (elementDate.date() === date.date() && element.document_type === Settings.NYTTYPE) {
                if (element.lead_paragraph !== null && element.lead_paragraph.length > 40) {
                    daysNews.push(element);
                }

            }
        });
        //console.log(News.fetchedJSON);
        News.store.nyt = Utils.sortByInt(daysNews, 'print_page');
        News.store.nyt.length = 15;
        News.store.date = Time.get().date;
        News.build();
    },
    get: () => {
        let date = moment(Time.get().date);
        if (News.fetchedMonth !== (date.month() + 1)) {
            if(News.xhr !== null){
                console.log(News.xhr.readyState, News.xhr.status);
            }
            
            News.xhr = new XMLHttpRequest();
            News.xhr.open('GET', Settings.NYTURL.replace('{year}', date.year()).replace('{month}', (date.month() + 1)).replace('{key}', Settings.NYTAPIKEY));
            News.xhr.onload = function() {
                if (News.xhr.status === 200) {
                    let json = JSON.parse(News.xhr.responseText);
                    News.fetchedJSON = json.response.docs;
                    News.fetchedMonth = (date.month() + 1);
                    News.set();

                } else {
                    console.log('Request failed.  Returned status of ' + News.xhr.status);
                }
            };
            News.xhr.send();
        } else {
            News.set();
        }

    },
    build: () => {
        const container = document.querySelector('.hbs-container-news');
        container.innerHTML = newsTmp(News.store);
    }
}

export default News;