const Settings = {
    ACTIVE_MODULES_SPEECH: false,
    ACTIVE_MODULES_NEWS: false,

    START_DATE: '1989-01-01T00:00:00.000Z',
    DATE_FORMAT: 'MMM. Do YYYY',
    SCHEDULE_DATE_FORMAT: 'YYYY-MM-DD',
    TIME_TICK: 500,

    ADDICTION_LEVEL_LOW: [ 1, 3 ],
    ADDICTION_LEVEL_MEDIUM: [ 3, 6 ],
    ADDICTION_LEVEL_HIGH: [ 6, Infinity ],

    INITIAL_VALUE_MONEY: 100,
    INITIAL_VALUE_FAME: 0,
    INITIAL_VALUE_HEALTH: 50,
    INITIAL_VALUE_MENTALITY: 50,
    INITIAL_VALUE_CREATIVITY: 50,
    INITIAL_VALUE_HAPPINESS: 50,

    NYT_APIKEY: 'fzaabG4vh7uH8fXZJmr8LponOO2eiyWI',
    NYT_ENDPOINT: 'https://api.nytimes.com/svc/archive/v1/{year}/{month}.json?api-key={key}',
    NYT_TYPE: 'article',

    RENT_AMOUNT: 6,
    RENT_DUE_INTERVAL: 10,
    AMOUNT_PER_SALE: 2,

    FAME_PROGRESS_FACTOR: 20,
    MAX_SONG_FACTOR: 100,

    BATTLE_MAX_POWER: 100,
    BATTLE_PRIZE_MONEY: 150,
    BATTLE_PRIZE_FAME: 50,
    BATTLE_END_TIMEOUT: 8000,
    BATTLE_ATTACK_0: 'Killer Lyrics',
    BATTLE_ATTACK_1: 'Power Solo',
    BATTLE_ATTACK_2: 'Dirty Dance',

    CHARTS_UPDATE_INTERVAL: 7,
    CHARTS_LENGTH: 30,
    CHARTS_SALES_GOLD_LIMIT: 100000,
    CHARTS_SALES_PLATINIUM_LIMIT: 180000,
    CHARTS_SALES_DOUBLE_PLATINIUM_LIMIT: 225000,
    CHARTS_ICON_NEW: 'chart-icon-new',
    CHARTS_ICON_MYENTRY: 'chart-icon-myEntry',
    CHARTS_ICON_WEEKSASONE: 'chart-icon-week-at-one weeksAsOne-count-',
    CHARTS_ICON_GOLD: 'chart-icon-sales-gold',
    CHARTS_ICON_PLATINIUM: 'chart-icon-sales-platinium',
    CHARTS_ICON_DOUBLEPLATINIUM: 'chart-icon-sales-double-platinum',

    EVENTS_STUDIO_DAYS_INTERVAL: 14


};

export default Settings;