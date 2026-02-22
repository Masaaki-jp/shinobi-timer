/**
 * 住所の日の出・日の入り時刻をGoogleカレンダーに登録します。
 */
function registerSunTimes() { 
  // --- 設定項目 ---
  // あなたの住所付近の座標（緯度・経度）を入力してください
  const LAT = '';  // 例: '35.5812'
  const LNG = '';  // 例: '139.6598'
  const CALENDAR_ID = 'primary';
  // ----------------

  const today = new Date();
  const dateStr = Utilities.formatDate(today, 'GMT', 'yyyy-MM-dd');
  
  // APIからデータを取得（formatted=0 でISO 8601形式を指定）
  const url = `https://api.sunrise-sunset.org/json?lat=${LAT}&lng=${LNG}&date=${dateStr}&formatted=0`;
  
  try {
    const response = UrlFetchApp.fetch(url);
    const json = JSON.parse(response.getContentText());
    
    if (json.status === 'OK') {
      const sunrise = new Date(json.results.sunrise);
      const sunset = new Date(json.results.sunset);
      
      const calendar = CalendarApp.getCalendarById(CALENDAR_ID);
      
      // 重複登録を避けるため、作成するタイトルと同じ言葉で検索します
      const existingEvents = calendar.getEventsForDay(today, {search: '☀Sunrise'});
      
      if (existingEvents.length === 0) {
        const sunriseEnd = new Date(sunrise.getTime() + 60 * 1000);
        const sunsetEnd = new Date(sunset.getTime() + 60 * 1000);
        
        calendar.createEvent('☀Sunrise', sunrise, sunriseEnd);
        calendar.createEvent('ーSunset', sunset, sunsetEnd);
        
        console.log(`登録完了: 日の出 ${formatTime(sunrise)} / 日の入り ${formatTime(sunset)}`);
      } else {
        console.log('本日の時刻は既に登録されています。');
      }
    }
  } catch (e) {
    console.error('エラーが発生しました: ' + e.message);
  }
}

/**
 * 時刻を HH:mm 形式にフォーマットする補助関数
 */
function formatTime(date) {
  return Utilities.formatDate(date, Session.getScriptTimeZone(), 'HH:mm');
}
