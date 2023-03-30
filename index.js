const User = require('./user.js');
const TelegramApi = require('node-telegram-bot-api');

const token = '6000741658:AAFbDipcdGjFyGvSw1sza5UYIfAnPItNekI';
const bot = new TelegramApi(token, {polling: true});

// global states =>  1-start, 2-secondName, 3-firstName, 4-thirdName, 5-workInfo, 6- companyInfo, 7-companyInn, 8-complete
const sequelize = require('./database');
const UserModel = require('./models');
const XLSX = require('xlsx');
const Console = require("console");

let users = [];
const adminId = 'anastasiazems';
const adminId2 = 'ftx3d';
const secretChat = 'https://t.me/+haatFMX7YQ0yYTYy';

bot.setMyCommands([
    {command: '/start', description: 'Запуск бота'},
    {command: '/register', description: 'Регистрация'},
    {command: '/cancel_reg', description: 'Сбросить регистрацию (dev)'},
]);

const start = async () => {

    // database logic
    try {
        await sequelize.authenticate();
        await sequelize.sync();
    } catch (e) {
        console.log(e);
    }

    bot.on('message', async msg => {

        const text = msg.text;
        const chatId = msg.chat.id;
        const userId = msg.from.username;

        console.log(msg);
        try {
            //console.log(msg.username);
            //if(userId === undefined){
            //    return bot.sendMessage(chatId, 'Для корректной работы этого бота, пожалуйста заполните поле user id в настройках аккаунта Telegram');
            //}

            if (msg.text === undefined) {
                console.log(`bad message from ${chatId}`)
                return bot.sendMessage(chatId, 'Только текст пожалуйста!');
            }

            // check client info
            if (!users[chatId]) {
                console.log(`user with id ${chatId} not found im users list`);
                users[chatId] = new User(chatId);
                users[chatId].state = 'start';
                users[chatId].userName = userId;
                console.log(`user with id ${chatId} added to users list`);
            } else {
                console.log(`user with id ${chatId} found, state [${users[chatId].state}], register [${users[chatId].registerComplete}]`);
            }

            // ADMIN CMD
            // ----------------------------------------
            if (msg.text.toLowerCase() === '/report') {
                if(userId === adminId){
                    await bot.sendMessage(chatId, 'Подготавливаю отчет в формате excel файла, подождите.');
                    await exportToExcel();
                    const fileId = './users.xlsx'; // Путь к файлу
                    await  bot.sendDocument(chatId, fileId);
                }
                else
                if(userId === adminId2){
                    await bot.sendMessage(chatId, 'Подготавливаю отчет в формате excel файла, подождите.');
                    await exportToExcel();
                    const fileId = './users.xlsx'; // Путь к файлу
                    await  bot.sendDocument(chatId, fileId);

                }
            }

            // ADMIN CMD <SEND INVITE
            // ----------------------------------------
            if (msg.text.toLowerCase() === '/invite') {
                if(userId === adminId){
                    users[chatId].state = 'check_user';
                    return  bot.sendMessage(chatId, 'Введите id пользователя, ему будет отправлена ссылка на чат.');
                }
                else
                if(userId === adminId2){
                    users[chatId].state = 'check_user';
                    return  bot.sendMessage(chatId, 'Введите id пользователя, ему будет отправлена ссылка на чат.');
                }
            }

            // Global user state
            // global states =>  1-start, 2-secondName, 3-firstName, 4-thirdName, 5-workInfo, 6- companyInfo, 7-companyInn, 8-complete, 9-inviteUser
            switch (users[chatId].state) {

                // 0 - Start (idle)
                case 'start':
                    // Intro msg
                    if (msg.text.toLowerCase() === '/start') {

                        if(userId === 'anastasiazems'){
                            await bot.sendMessage(chatId, 'Администратор. Вам доступны дополнительные команды. Используйте /report для получения списка заявок, /invite для отправки пользователю приглашения в чат');
                        }
                        else
                        if(userId === 'ftx3d'){
                            await bot.sendMessage(chatId, 'Администратор. Вам доступны дополнительные команды. Используйте /report для получения списка заявок, /invite для отправки пользователю приглашения в чат');
                        }

                        // check else create db record
                        const userExist = await UserModel.findOne({
                            where: { chatId: `${chatId}` }
                        });

                        if (userExist) {
                            Console.log(`запись с таким chatId уже существует`);
                        } else {
                            Console.log(`запись с таким chatId не существует`);
                            await UserModel.create({chatId});
                        }

                        return bot.sendMessage(chatId, 'Здравствуйте! Это бот для регистрации в очень секретный чат) \n' +
                            'Выберите /register для подачи заявки на регистрацию. \n' +
                            'Выберите /cancel_reg для удаления вашей заявки (для тестов)');
                    }

                    // Register
                    if (msg.text.toLowerCase() === '/register') {

                        // check registration complete before.
                        const userExist = await UserModel.findOne({
                            where: { chatId: `${chatId}` }
                        });

                        // check else create db record
                        if (userExist) {
                            Console.log(`запись с таким chatId уже существует`);
                        } else {
                            Console.log(`запись с таким chatId не существует`);
                            await UserModel.create({chatId});
                        }

                        if (userExist) {
                            Console.log(`запись с таким chatId уже существует`);
                            if (userExist.registerComplete) {
                                return bot.sendMessage(chatId, 'Вы уже давали заявку, вы можете выбрать /cancel_reg для удаления текущей заявки.');
                            }
                        }
                        console.log(userId);
                        console.log(users[chatId].userName);

                        users[chatId].state = 'secondName';
                        await bot.sendMessage(chatId, 'Вы подаете заявку на регистрацию, следуйте указаниям бота');
                        return bot.sendMessage(chatId, 'Введите вашу фамилию :');
                    }

                    // Cancel reg
                    if (msg.text.toLowerCase() === '/cancel_reg') {

                        // удаляем временную запись
                        users[chatId].Clear();

                        // check registration complete before.
                        const userExist = await UserModel.findOne({
                            where: { chatId: `${chatId}` }
                        });

                        // удаление заявки если она есть
                        if (userExist) {
                            if (userExist.registerComplete) {
                                userExist.userName = null;
                                userExist.userId = null;
                                userExist.firstName = null;
                                userExist.secondName = null;
                                userExist.thirdName = null;
                                userExist.workInfo = null;
                                userExist.companyInfo = null;
                                userExist.companyInn = null;
                                userExist.state = 'start';
                                userExist.registerComplete = false;
                                await userExist.save();
                                return bot.sendMessage(chatId, 'Ваша заявка успешно удалена');
                            }
                            else{
                                return bot.sendMessage(chatId, 'Нечего отменять, от вас заявки еще не поступали');
                            }
                        }
                        else{
                            return bot.sendMessage(chatId, 'Нечего отменять, от вас заявки еще не поступали');
                        }
                    }
                    break;

                // 1- Second name (Фамилия)
                case 'secondName':
                    if (!containsDigits(msg.text)) {
                        await bot.sendMessage(chatId, 'Некорректное значение (Не допустимые символы)');
                        return bot.sendMessage(chatId, 'Введите вашу фамилию :');
                    }

                    users[chatId].userName = userId;
                    users[chatId].secondName = msg.text;
                    users[chatId].state = 'firstName';
                    return bot.sendMessage(chatId, 'Введите ваше имя :');

                // 2- First name (Имя)
                case 'firstName':
                    if (!containsDigits(msg.text)) {
                        await bot.sendMessage(chatId, 'Некорректное значение (Не допустимые символы)');
                        return bot.sendMessage(chatId, 'Введите ваше имя :');
                    }

                    users[chatId].firstName = msg.text;
                    users[chatId].state = 'thirdName';
                    return bot.sendMessage(chatId, 'Введите ваше отчество :');

                // 3- Third name (Отчество)
                case 'thirdName':
                    if (!containsDigits(msg.text)) {
                        await bot.sendMessage(chatId, 'Некорректное значение (Не допустимые символы)');
                        return bot.sendMessage(chatId, 'Введите ваше отчество :');
                    }

                    users[chatId].thirdName = msg.text;
                    users[chatId].state = 'workInfo';
                    return bot.sendMessage(chatId, 'Кем вы работаете :');

                // 4- about work (Кем работаете)
                case 'workInfo':
                    if (msg.text.length < 10) {
                        await bot.sendMessage(chatId, 'Некорректное значение (Слишком коротко, напишите подробнее)');
                        return bot.sendMessage(chatId, 'Кем вы работаете :');
                    }

                    users[chatId].workInfo = msg.text;
                    users[chatId].state = 'companyInfo';
                    return bot.sendMessage(chatId, 'Компания где вы работаете :');

                // 5- companyInfo (Компания где вы работаете)
                case 'companyInfo':
                    if (msg.text.length < 2) {
                        await bot.sendMessage(chatId, 'Некорректное значение (Слишком коротко, напишите подробнее)');
                        return bot.sendMessage(chatId, 'Расскажите о компании где вы работаете :');
                    }

                    users[chatId].companyInfo = msg.text;
                    users[chatId].state = 'companyInn';
                    return bot.sendMessage(chatId, 'ИНН вашей компании :');

                // 6- companyInfo (Компания где вы работаете)
                case 'companyInn':

                    if (!containsInn(msg.text)) {
                        await bot.sendMessage(chatId, 'Некорректное значение (Такого ИНН несуществует!)');
                        return bot.sendMessage(chatId, 'ИНН вашей компании :');
                    }

                    users[chatId].userName = userId;
                    users[chatId].userId = msg.from.id;
                    users[chatId].companyInn = msg.text;
                    users[chatId].registerComplete = true;
                    users[chatId].state = 'start';

                    // record to db
                    const user = await UserModel.findOne({
                        where: { chatId: `${chatId}` }
                    });

                    user.userName = users[chatId].userName;
                    user.userId = users[chatId].userId;
                    user.firstName = users[chatId].firstName;
                    user.secondName = users[chatId].secondName;
                    user.thirdName = users[chatId].thirdName;
                    user.workInfo = users[chatId].workInfo;
                    user.companyInfo = users[chatId].companyInfo;
                    user.companyInn = users[chatId].companyInn;
                    user.state = users[chatId].state;
                    user.registerComplete = users[chatId].registerComplete;

                    await user.save();

                    return bot.sendMessage(chatId, `${users[chatId].secondName} ${users[chatId].firstName} ${users[chatId].thirdName} Благодарим за регистрацию. Ваша заявка на расмотрении. Гудбай!`);

                case 'check_user':
                    const inviteUserId = msg.text;

                    // check in db
                    const userExist = await UserModel.findOne({
                        where: { userId: `${inviteUserId}` }
                    });

                    if(!userExist){
                        users[chatId].state = 'start';
                        return  bot.sendMessage(chatId, 'Такого пользователя нет в базе');
                    }
                    else{
                        // check in db
                        await bot.sendMessage(userExist.chatId, `Здравствуйте, вам пришло приглашение в секретный чат. Ссылка для доступа : ${secretChat}`);
                        users[chatId].state = 'start';
                        return bot.sendMessage(chatId, `Уведомление пользователю @${userExist.userName} успешно отправлено`);
                    }
                    break;

                default :
                    users[chatId].state = 'start';
                    users[chatId].Clear();
                    return bot.sendMessage(chatId, 'Что-то пошло не так (');
            }
        } catch (e) {
            Console.log(e);
            return bot.sendMessage(chatId, 'Что-то пошло не так (база данных)');
        }
    });
}

start();

function containsDigits(str) {
    const regex = /^[a-zA-Zа-яА-Я]+$/;
    if (regex.test(str)) {
        console.log("Ввод корректен");
    } else {
        console.log("Ввод содержит недопустимые символы");
    }
    console.log((regex.test(str)));
    return regex.test(str);
}

function containsInn(str){
    const regex =/^(\d{12})$/;
    return regex.test(str);
}

function checkUserToInvite(input){
    const regex =/^@[A-Za-z0-9_]{5,}$/;
    return regex.test(input)
}

async function exportToExcel() {
    try {
        // Получаем из базы только те записи, где registerComplete = true
        const users = await UserModel.findAll({
            where: {
                registerComplete: true
            }
        });

        // Преобразуем данные в формат, подходящий для записи в файл Excel
        const data = users.map((user) => ({
            id: user.id,
            //chatId: user.chatId,
            UserID : '@'+user.userName,
            InviteID : user.userId,
            ФИО: user.secondName + ' ' + user.firstName + ' ' + user.thirdName,
            //Фамилия: user.secondName,
            //Отчество: user.thirdName,
            Кем_работает: user.workInfo,
            Компания: user.companyInfo,
            ИНН_компании: user.companyInn,
            //state: user.state,
            //registerComplete: user.registerComplete,
        }));

        console.log(data);

        // Создаем новую книгу Excel
        const workbook = XLSX.utils.book_new();

        // Добавляем лист с данными в книгу
        const worksheet = XLSX.utils.json_to_sheet(data);

        XLSX.utils.book_append_sheet(workbook, worksheet, 'Users');

        // Сохраняем книгу в файл
        XLSX.writeFile(workbook, './users.xlsx');

        console.log('Data exported to Excel successfully!');

    } catch (error) {
        console.error('Error exporting data to Excel:', error);
    }
}

