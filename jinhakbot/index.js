const { google } = require('googleapis');

exports.handler = async (event) => {
  const body = JSON.parse(event.body);
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

  // Google Sheets API 연결
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  });

  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = process.env.SPREADSHEET_ID;
  const range = 'Sheet1!A:B'; // date, menu

  const res = await sheets.spreadsheets.values.get({ spreadsheetId, range });
  const rows = res.data.values;

  let menu = '오늘 메뉴 정보가 없습니다.';
  rows.forEach((row) => {
    if (row[0] === today) {
      menu = row[1];
    }
  });

  // 카카오톡 챗봇 응답 포맷
  const responseBody = {
    version: '2.0',
    template: {
      outputs: [
        {
          simpleText: {
            text: `오늘(${today}) 조식 메뉴는 ${menu}입니다.`,
          },
        },
      ],
    },
  };

  return {
    statusCode: 200,
    body: JSON.stringify(responseBody),
  };
};
