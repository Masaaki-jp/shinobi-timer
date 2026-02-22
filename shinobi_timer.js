/**
 * 忍の日の出・日の入り同期スクリプト (Shinobi Sun Sync)
 * 座標: あなたの住所
 */
function registerSunTimes() {
  const CONFIG = {
    LAT: '', /*ここにあなたの住所を入力*/
    LNG: '', /*ここにあなたの住所を入力*/
    CALENDAR_ID: 'primary',
    TIMEZONE: 'Asia/Tokyo',
    TITLES: {
      SUNRISE: '☀Sunrise',
      SUNSET: 'ーSunset'
    }
  };

  // 1. 日本時間での「今日」を取得
  const now = new Date();
  const dateStr = Utilities.formatDate(now, CONFIG.TIMEZONE, 'yyyy-MM-dd');
  
  // 2. APIからデータを取得
  const url = `https://api.sunrise-sunset.org/json?lat=${CONFIG.LAT}&lng=${CONFIG.LNG}&date=${dateStr}&formatted=0`;
  
  try {
    const response = UrlFetchApp.fetch(url);
    const json = JSON.parse(response.getContentText());
    
    if (json.status !== 'OK') throw new Error('APIのレスポンスが異常です');

    // APIのUTC時刻をJSのDateオブジェクトに変換（自動でローカル時刻になる）
    const sunrise = new Date(json.results.sunrise);
    const sunset = new Date(json.results.sunset);
    
    const calendar = CalendarApp.getCalendarById(CONFIG.CALENDAR_ID);
    
    // 3. 重複防止：その日の既存イベントを検索して削除（掃除）
    const existingEvents = calendar.getEventsForDay(now);
    existingEvents.forEach(event => {
      const title = event.getTitle();
      if (title === CONFIG.TITLES.SUNRISE || title === CONFIG.TITLES.SUNSET) {
        event.deleteEvent();
      }
    });

    // 4. 新規登録
    const sunriseEnd = new Date(sunrise.getTime() + 60 * 1000); // 1分間のイベント
    const sunsetEnd = new Date(sunset.getTime() + 60 * 1000);
    
    calendar.createEvent(CONFIG.TITLES.SUNRISE, sunrise, sunriseEnd);
    calendar.createEvent(CONFIG.TITLES.SUNSET, sunset, sunsetEnd);
    
    console.log(`[${dateStr}] 登録完了: 日の出 ${formatTime(sunrise)} / 日の入り ${formatTime(sunset)}`);

  } catch (e) {
    console.error('エラーが発生しました: ' + e.message);
  }
}

/**
 * 日本時間の HH:mm 形式に変換
 */
function formatTime(date) {
  return Utilities.formatDate(date, 'Asia/Tokyo', 'HH:mm');
}
