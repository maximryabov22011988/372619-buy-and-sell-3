'use strict';

const express = require(`express`);
const request = require(`supertest`);
const {Sequelize} = require(`sequelize`);

const initDb = require(`../lib/init-db`);
const searchApi = require(`./search`);
const SearchService = require(`../data-service/search`);
const {HttpCode} = require(`../../constants`);

const mockCategories = [
  `Животные`,
  `Журналы`,
  `Игры`
];

const mockUsers = [
  {
    email: `ivanov@example.com`,
    passwordHash: `5f4dcc3b5aa765d61d8327deb882cf99`,
    firstName: `Иван`,
    lastName: `Иванов`,
    avatar: `avatar1.jpg`
  },
  {
    email: `petrov@example.com`,
    passwordHash: `5f4dcc3b5aa765d61d8327deb882cf99`,
    firstName: `Пётр`,
    lastName: `Петров`,
    avatar: `avatar2.jpg`
  }
];

const mockOffers = [
  {
    "title": `Куплю детские санки.`,
    "picture": `item14.jpg`,
    "description": `Кому нужен этот новый телефон, если тут такое... Это настоящая находка для коллекционера! Продаю с болью в сердце... Если найдёте дешевле — сброшу цену.`,
    "type": `OFFER`,
    "price": 96004,
    "categories": [
      `Животные`
    ],
    "comments": [
      {
        "text": `С чем связана продажа? Почему так дешёво? А сколько игр в комплекте?`
      }
    ]
  },
  {
    "title": `Куплю породистого кота.`,
    "picture": `item16.jpg`,
    "description": `Мой дед не мог её сломать. Кажется, что это хрупкая вещь. Две страницы заляпаны свежим кофе. Товар в отличном состоянии.`,
    "type": `OFFER`,
    "price": 50937,
    "categories": [
      `Животные`
    ],
    "comments": [
      {
        "text": `Почему в таком ужасном состоянии?`
      },
      {
        "text": `А сколько игр в комплекте? Оплата наличными или перевод на карту? Почему в таком ужасном состоянии?`
      },
      {
        "text": `С чем связана продажа? Почему так дешёво? Почему в таком ужасном состоянии? Вы что?! В магазине дешевле.`
      }
    ]
  },
  {
    "title": `Куплю детские санки.`,
    "picture": `item12.jpg`,
    "description": `Не пытайтесь торговаться. Цену вещам я знаю. Пользовались бережно и только по большим праздникам. Если найдёте дешевле — сброшу цену. Даю недельную гарантию.`,
    "type": `OFFER`,
    "price": 5005,
    "categories": [
      `Журналы`
    ],
    "comments": [
      {
        "text": `Оплата наличными или перевод на карту? С чем связана продажа? Почему так дешёво?`
      }
    ]
  },
  {
    "title": `Продам советскую посуду. Почти не разбита.`,
    "picture": `item08.jpg`,
    "description": `Даю недельную гарантию. Таких предложений больше нет! Это настоящая находка для коллекционера! Две страницы заляпаны свежим кофе.`,
    "type": `OFFER`,
    "price": 24537,
    "categories": [
      `Журналы`
    ],
    "comments": [
      {
        "text": `С чем связана продажа? Почему так дешёво?`
      }
    ]
  },
  {
    "title": `Продам коллекцию журналов «Огонёк».`,
    "picture": `item02.jpg`,
    "description": `Если найдёте дешевле — сброшу цену. Продаю с болью в сердце... Бонусом отдам все аксессуары. Даю недельную гарантию.`,
    "type": `OFFER`,
    "price": 81996,
    "categories": [
      `Игры`
    ],
    "comments": [
      {
        "text": `Совсем немного...`
      }
    ]
  }
];

const mockDb = new Sequelize(`sqlite::memory:`, {logging: false});

const app = express();
app.use(express.json());

beforeAll(async () => {
  await initDb(mockDb, {categories: mockCategories, offers: mockOffers, users: mockUsers});
  searchApi(app, new SearchService(mockDb));
});

describe(`API returns offer based on search query`, () => {
  let response;
  beforeAll(async () => {
    response = await request(app).get(`/search`).query({query: `породистого кота`});
  });

  test(`Status code 200`, () => expect(response.statusCode).toBe(HttpCode.OK));
  test(`1 offer found`, () => expect(response.body.length).toBe(1));
  test(`Offer has correct title`, () => expect(response.body[0].title).toBe(`Куплю породистого кота.`));
});

test(`API returns code 404 if nothing is found`, () => request(app).get(`/search`).query({query: `Неизвестный заголовок`}).expect(HttpCode.NOT_FOUND));

test(`API returns 400 when query string is absent`, () => request(app).get(`/search`).expect(HttpCode.BAD_REQUEST));
