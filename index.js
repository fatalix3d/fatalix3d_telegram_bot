const User = require('./user.js');
const sqlite3 = require('sqlite3').verbose();
const TelegramApi = require('node-telegram-bot-api');

const token = '6000741658:AAFbDipcdGjFyGvSw1sza5UYIfAnPItNekI';
const bot = new TelegramApi(token, {polling: true});

// global states =>  1-start, 2-secondName, 3-firstName, 4-thirdName, 5-workInfo, 6- companyInfo, 7-companyInn, 8-complete
let users = [];

bot.setMyCommands([
    {command: '/start', description: 'Запуск бота'},
    {command: '/register', description: 'Регистрация'},
    {command: '/cancel_reg', description: 'Сбросить регистрацию (dev)'},
]);

const start = async () => {

    // создаем базу данных
    let db = new sqlite3.Database('./data.db');

    // создаем таблицу
    await db.run('CREATE TABLE IF NOT EXISTS users (id INT, name TEXT)');

    // добавляем данные в таблицу
    await db.run('INSERT INTO users (id, name) VALUES (?, ?)', [1, 'John']);
    await db.run('INSERT INTO users (id, name) VALUES (?, ?)', [2, 'Mary']);
    await db.run('INSERT INTO users (id, name) VALUES (?, ?)', [3, 'Bob']);

    await db.close();

    bot.on('message', async msg => {

        const text = msg.text;
        const chatId = msg.chat.id;
        const userId = msg.chat.username;

        if(msg.text === undefined){
            console.log(`bad message from ${chatId}`)
            return bot.sendMessage(chatId, 'Только текст пожалуйста!');
        }

        console.log(msg);

        // check client info
        if (!users[chatId]) {
            console.log(`user with id ${chatId} not found im users list`);
            users[chatId] = new User(chatId);
            users[chatId].state = 'start';
            console.log(`user with id ${chatId} added to users list`);
        } else {
            console.log(`user with id ${chatId} found, state [${users[chatId].state}], register [${users[chatId].registerComplete}]`);
        }


        // Global user state
        // global states =>  1-start, 2-secondName, 3-firstName, 4-thirdName, 5-workInfo, 6- companyInfo, 7-companyInn, 8-complete
        switch (users[chatId].state) {

            // 0 - Start (idle)
            case 'start':
                // Intro msg
                if (msg.text.toLowerCase() === '/start') {
                    return  bot.sendMessage(chatId, 'Здравствуйте! Это бот для регистрации в очень секретный чат) \n' +
                        'Выберите /register для подачи заявки на регистрацию. \n' +
                        'Выберите /cancel_reg для удаления вашей заявки (для тестов)');
                }

                // Register
                if (msg.text.toLowerCase() === '/register') {

                    // check registration complete before.
                    if(users[chatId].registerComplete){
                        return bot.sendMessage(chatId, 'Вы уже давали заявку, вы можете выбрать /cancel_reg для удаления текущей заявки.');
                    }

                    users[chatId].state = 'secondName';
                    await bot.sendMessage(chatId, 'Вы подаете заявку на регистрацию, следуйте указаниям бота');
                    return  bot.sendMessage(chatId, 'Введите вашу фамилию :');
                }

                // Cancel reg
                if (msg.text.toLowerCase() === '/cancel_reg') {
                    if (!users[chatId]) {
                        return  bot.sendMessage(chatId, 'Нечего отменять, от вас заявки еще не поступали');
                    }
                    else{
                        users[chatId].Clear();
                        return  bot.sendMessage(chatId, 'Ваша заявка успешно удалена');
                    }
                }
                break;

            // 1- Second name (Фамилия)
            case 'secondName':
                if(containsDigits(msg.text)){
                    await bot.sendMessage(chatId, 'Некорректное значение (цифры не допустимы)');
                    return bot.sendMessage(chatId, 'Введите вашу фамилию :');
                }

                users[chatId].secondName = msg.text;
                users[chatId].state = 'firstName';
                return bot.sendMessage(chatId, 'Введите ваше имя :');
                break;

            // 2- First name (Имя)
            case 'firstName':
                if(containsDigits(msg.text)){
                    await bot.sendMessage(chatId, 'Некорректное значение (цифры не допустимы)');
                    return bot.sendMessage(chatId, 'Введите ваше имя :');
                }

                users[chatId].first_name = msg.text;
                users[chatId].state = 'thirdName';
                return bot.sendMessage(chatId, 'Введите ваше отчество :');
                break;

            // 3- Third name (Отчество)
            case 'thirdName':
                if(containsDigits(msg.text)){
                    await bot.sendMessage(chatId, 'Некорректное значение (цифры не допустимы)');
                    return bot.sendMessage(chatId, 'Введите ваше отчество :');
                }

                users[chatId].thirdName = msg.text;
                users[chatId].state = 'workInfo';
                return bot.sendMessage(chatId, 'Кем вы работаете :');
                //users[userId].registerComplete = true;
                //users[userId].state = 'start';
                //return bot.sendMessage(chatId, `${users[userId].secondName} ${users[userId].first_name} ${users[userId].thirdName} Благодарим за регистрацию. Ваша заявка на расмотрении. Гудбай!`);
                break;

            // 4- about work (Кем работаете)
            case 'workInfo':
                if(msg.text.length < 10){
                    await bot.sendMessage(chatId, 'Некорректное значение (Слишком коротко, напишите подробнее)');
                    return bot.sendMessage(chatId, 'Кем вы работаете :');
                }

                users[chatId].workInfo = msg.text;
                users[chatId].state = 'companyInfo';
                return bot.sendMessage(chatId, 'Компания где вы работаете :');
                break;

            // 5- companyInfo (Компания где вы работаете)
            case 'companyInfo':
                if(msg.text.length < 2){
                    await bot.sendMessage(chatId, 'Некорректное значение (Слишком коротко, напишите подробнее)');
                    return bot.sendMessage(chatId, 'Компания где вы работаете :');
                }

                users[chatId].companyInfo = msg.text;
                users[chatId].state = 'companyInn';
                return  bot.sendMessage(chatId, 'ИНН вашей компании :');
                break;

            // 6- companyInfo (Компания где вы работаете)
            case 'companyInn':
                if(!containsInn(msg.text)){
                    await  bot.sendMessage(chatId, 'Некорректное значение (Такого ИНН несуществует!)');
                    return  bot.sendMessage(chatId, 'ИНН вашей компании :');
                }``

                users[chatId].companyInfo = msg.text;
                users[chatId].registerComplete = true;
                users[chatId].state = 'start';

                return bot.sendMessage(chatId, `${users[chatId].secondName} ${users[chatId].first_name} ${users[chatId].thirdName} Благодарим за регистрацию. Ваша заявка на расмотрении. Гудбай!`);
                break;

            default :
                users[chatId].state = 'start';
                users[chatId].Clear();
                return  bot.sendMessage(chatId, 'Что-то пошло не так (');
                break;
        }
    });


}

start();

function containsDigits(str) {
    const regex = /\d/;
    return regex.test(str);
}

function containsInn(str){
    const regex =/^(\d{12})$/;
    return regex.test(str);
}

