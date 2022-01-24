const MILLIS_PER_DAY = 24 * 60 * 60 * 1000;

const firstDay = new Date(2021, 5, 19);
firstDay.setMinutes(firstDay.getMinutes() - firstDay.getTimezoneOffset());

const today = new Date();
today.setMinutes(today.getMinutes() - today.getTimezoneOffset());

export const TODAYS_WORDLE = Math.floor((today.getTime() - firstDay.getTime()) / MILLIS_PER_DAY);
export const SHAKE_DURATION = 250;
export const FLIP_IN_DURATION = 150;
export const FLIP_OUT_DURATION = 300;
export const FLIP_OUT_DELAY = 75;
export const SPAM_CLICK_TIMEOUT = 225;  // 175-200 is minimum, 225 is a little bit on the safe side
