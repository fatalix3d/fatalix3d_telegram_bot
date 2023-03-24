
const TelegramApi = require('node-telegram-bot-api');

const token = '6000741658:AAFbDipcdGjFyGvSw1sza5UYIfAnPItNekI';

const bot = new TelegramApi(token, {polling: true});

const chats = {}

bot.setMyCommands([
    {command: '/start', description: 'Начало'},
    {command: '/info', description: 'О боте'},
    {command: '/crack', description: 'Взломать пентагон'},
    {command: '/game', description: 'Сыграть на очко'}
])

const  start = () => {
    bot.on('message', async msg =>{

        //Вытаскием текст из сообщения
        const  text = msg.text;
        const chatId = msg.chat.id;

        //bot.sendMessage(chatId, `Ты написал мне ${text}`)
        console.log(msg);

        if(text === '/start'){
            return   bot.sendMessage(chatId, `${msg.chat.first_name} добро пожаловать в тестовый бот, пока он нечего не умеет, но быстро учится :) `)
        }
        if(text == '/info'){
            return   bot.sendMessage(chatId, `Это тестовый бот, нечего тут больше нет`)
        }
        if(text == '/crack'){
            return   bot.sendMessage(chatId, `Ваше очко взломано!`)
        }
        if(text ==='/game'){
            await bot.sendMessage(chatId, 'Я загадаю цифру от 0 до 9, а ты должен угадать! Иначе твое очко улетает в зал')
            const randomNumber = Math.floor((Math.random() * 10))
            chats[chatId] = randomNumber;
            return bot.sendMessage(chatId, 'Отгадывай сцуко')
        }
        return  bot.sendMessage(chatId, 'Я тебя не понимаю, попробуй еще раз')
    });
}

start()