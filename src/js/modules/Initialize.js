import * as Data from './Data.js';

import Settings from '../Settings.js';
import Utils from './Utils.js';
import Bands from './Bands.js';
import Store from './Store.js';
import Navigation from './Navigation.js';
import Time from './Time.js';
import Protagonist from './Protagonist.js';
import Charts from './Charts.js';
import News from './News.js';
import Schedule from './Schedule.js';

import * as genreSelect from '../../templates/genreSelect.hbs';

const Initialize = {
    construct: () => {
        let savedGamePlayer = Store.get('protagonist');
        let container = document.querySelector('.intro-container');
        if (Utils.isNullOrUndefined(savedGamePlayer) === true) {
            //container.removeChild(loader);
            Bands.construct();
            Initialize.bindings();
            Initialize.build();
            Initialize.showIntro();
        } else {
            Navigation.construct();
            Schedule.construct();
            Time.construct();
            Protagonist.construct();

            Charts.construct();
            Initialize.hideIntro();

        }
        //News.get();
    },
    showIntro: () => {
        Initialize.loader.hide();
    },
    hideIntro: () => {
        let container = document.querySelector('.intro-container');
        container.parentElement.removeChild(container);
        Initialize.loader.hide();
    },
    bindings: () => {
        document.querySelector('.intro-generate-band').addEventListener('click', () => {
            let band = Bands.generateBand();
            document.getElementById('rockstrStageName').value = band.name;
            document.getElementById('rockstrStageGenre').value = band.genre;
        });
        document.querySelector('.initialize-game').addEventListener('click', () => {
            Initialize.run();
        });
    },
    build: () => {
        const container = document.querySelector('.hbs-container-genreSelect');
        container.innerHTML = genreSelect(Data.genres);
    },
    run: () => {
        let name = document.getElementById('rockstrStageName').value;
        let genre = document.getElementById('rockstrStageGenre').value;
        Store.construct();
        Time.construct();
        Protagonist.construct(name, genre);
        Charts.construct();
        let container = document.querySelector('.intro-container');
        container.parentElement.removeChild(container);
    },
    loader: {
        show: () => {
            let loader = document.querySelector('.loading-container');
            if (loader) {
                loader.classList.remove('d-none');
            }
        },
        hide: () => {
            let loader = document.querySelector('.loading-container');
            if (loader) {
                loader.classList.add('d-none');
            }

        }
    }
}

export default Initialize;