const dotenv = require('dotenv');
const express = require('express');
var fs = require('fs');

dotenv.config({ path: './.env' });

const app = express();

app.use((_req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');

  next();
});

// Добавление данных в БД
function addFlowersBD(arr) {
  var flowers = JSON.stringify(arr);

  fs.writeFile('./db.json', flowers, function (error) {
    if (error) {
      return console.log(error);
    }
    console.log('База данных успешна обновлена');
  });
}

// Проверка работы Express
app.get('/', (req, res) => {
  res.send('Express is work');
});

// Получение данных для фронтенда
app.get('/api/flowers', function (req, res) {
  var content = fs.readFileSync('db.json', 'utf8');
  var users = JSON.parse(content);
  res.json(users);
});

// Возврат промиса с ошибкой
function returnPromiseError() {
  return Promise.reject(new Error('Ошибка. Что-то пошло не так...'));
}

// Функция для вызова API
const getFlowers = async () => {
  const api = process.env.URL_SVA;
  const user = process.env.USER;
  const password = process.env.PASSWORD;

  const token = 'Basic ' + btoa(user + ':' + password);

  try {
    const response = await fetch(api, {
      headers: {
        Authorization: token,
      },
    });

    if (!response.ok) {
      await returnPromiseError();
    }

    const result = await response.json();
    addFlowersBD(result);

    return console.log('Данные из 1С получены');
  } catch (error) {
    console.log(
      `При выполнении кода произошла ошибка ${error.name} c текстом ${error.message}, но мы её обработали`
    );
  }
  console.log('Работа сервера продолжена');
};

//Запрашивать API 1С каждые 30 минут
setInterval(getFlowers, 1800000);

const port = 3456;

app.listen(port, () =>
  console.log(`Server running on http://localhost:${port}`)
);

// app.get('/sva', async (_req, res) => {
//   const api = process.env.URL_SVA;
//   const user = process.env.USER;
//   const password = process.env.PASSWORD;

//   const token = 'Basic ' + btoa(user + ':' + password);

//   try {
//     const response = await fetch(api, {
//       headers: {
//         Authorization: token,
//       },
//     });

//     if (!response.ok) {
//       throw new Error(`Error! status: ${response.status}`);
//     }

//     const result = await response.json();
//     addFlowersBD(result);
//     return res.json(result);
//   } catch (error) {
//     console.log(error);
//     return res.status(500).json({ error: 'An error occurred' });
//   }
// });
