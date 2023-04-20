const User = require('./user.js');
const TelegramApi = require('node-telegram-bot-api');

const token = '6204085451:AAEriDvTAjHmxHQcjt66Q3xgEvsVFQmqE3c';
const bot = new TelegramApi(token, {polling: true});

const sequelize = require('./database');

const UserModel = require('./models');
const XLSX = require('xlsx');
const Console = require("console");
const { Sequelize } = require('sequelize');

let users = [];
const adminId = 'anastasiazems';
const adminId2 = 'tati_barabanova';
const adminId3 = 'Korepusik';
const adminId4 = 'olgalinn';
const adminId5 = 'ftx3d';

bot.setMyCommands([
    {command: '/start', description: 'Запуск бота'},
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

        try {

            if (msg.text === undefined) {
                return;
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
            if (msg.text.toLowerCase() === '/report') {
                if (userId === adminId) {
                    await bot.sendMessage(chatId, 'Подготавливаю отчет в формате excel файла, подождите.');
                    await exportToExcel();
                    const fileId = './users.xlsx'; // Путь к файлу
                    await bot.sendDocument(chatId, fileId);
                    return;
                }

                if (userId === adminId2) {
                    await bot.sendMessage(chatId, 'Подготавливаю отчет в формате excel файла, подождите.');
                    await exportToExcel();
                    const fileId = './users.xlsx'; // Путь к файлу
                    await bot.sendDocument(chatId, fileId);
                    return;
                }

                if (userId === adminId3) {
                    await bot.sendMessage(chatId, 'Подготавливаю отчет в формате excel файла, подождите.');
                    await exportToExcel();
                    const fileId = './users.xlsx'; // Путь к файлу
                    await bot.sendDocument(chatId, fileId);
                    return;
                }

                if (userId === adminId4) {
                    await bot.sendMessage(chatId, 'Подготавливаю отчет в формате excel файла, подождите.');
                    await exportToExcel();
                    const fileId = './users.xlsx'; // Путь к файлу
                    await bot.sendDocument(chatId, fileId);
                    return;
                }

                if (userId === adminId5) {
                    await bot.sendMessage(chatId, 'Подготавливаю отчет в формате excel файла, подождите.');
                    await exportToExcel();
                    const fileId = './users.xlsx'; // Путь к файлу
                    await  bot.sendDocument(chatId, fileId);
                    return;
                }
            }

            // Intro msg
            if (msg.text.toLowerCase() === '/start') {

                if (userId === adminId) {
                    await bot.sendMessage(chatId, 'Администратор. Вам доступны дополнительные команды. Используйте /report для получения списка заявок и /invite для отправки приглашения');
                }

                if (userId === adminId2) {
                    await bot.sendMessage(chatId, 'Администратор. Вам доступны дополнительные команды. Используйте /report для получения списка заявок и /invite для отправки приглашения');
                }

                if (userId === adminId3) {
                    await bot.sendMessage(chatId, 'Администратор. Вам доступны дополнительные команды. Используйте /report для получения списка заявок и /invite для отправки приглашения');
                }

                if (userId === adminId4) {
                    await bot.sendMessage(chatId, 'Администратор. Вам доступны дополнительные команды. Используйте /report для получения списка заявок и /invite для отправки приглашения');
                }

                if (userId === adminId5) {
                    await bot.sendMessage(chatId, 'Администратор. Вам доступны дополнительные команды. Используйте /report для получения списка заявок и /invite для отправки приглашения');
                }


                // check else create db record
                const userExist = await UserModel.findOne({
                    where: {chatId: `${chatId}`}
                });

                if (userExist) {
                    Console.log(`запись с таким chatId уже существует`);
                } else {
                    Console.log(`запись с таким chatId не существует`);
                    await UserModel.findOrCreate({where: {chatId: `${chatId}`}});
                }

                await bot.sendMessage(chatId, 'Привет! Я чат-бот сообщества бренда Solpro для профессионалов HoReCa. Заполни форму регистрации и получи доступ к закрытой группе с полезной и ценной информацией!' +
                    '\n' +
                    '\n' +
                    '12 мая у тебя есть шанс выиграть главный приз — поездку на фестиваль GASTREET! Для вступления в сообщество нам нужно убедиться, что ты тоже из гастрокомьюнити 🙂');

                // Проверка пред. реги
                const checkUserReg = await UserModel.findOne({
                    where: {chatId: `${chatId}`}
                });

                users[chatId].state = 'lastName';

                //await bot.sendMessage(chatId, 'Для вступления в сообщество нам нужно убедиться, что ты тоже шеф :)');
                return bot.sendMessage(chatId, 'Введите Фамилию:');
            }

            // Register
            if (msg.text.toLowerCase() === '/register') {

                // check registration complete before.
                const userExist = await UserModel.findOne({
                    where: {chatId: `${chatId}`}
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

                users[chatId].state = 'lastName';

                await bot.sendMessage(chatId, 'Для вступления в сообщество нам нужно убедиться, что ты тоже шеф :)');
                return bot.sendMessage(chatId, 'Введите Фамилию:');
            }

            if (msg.text.toLowerCase() === '/invite') {
                if (userId === adminId) {
                    users[chatId].state = 'invite';
                    return bot.sendMessage(chatId, 'Введите id:');
                }

                if (userId === adminId2) {
                    users[chatId].state = 'invite';
                    return bot.sendMessage(chatId, 'Введите id:');
                }

                if (userId === adminId3) {
                    users[chatId].state = 'invite';
                    return bot.sendMessage(chatId, 'Введите id:');
                }

                if (userId === adminId4) {
                    users[chatId].state = 'invite';
                    return bot.sendMessage(chatId, 'Введите id:');
                }

                if (userId === adminId5) {
                    users[chatId].state = 'invite';
                    return bot.sendMessage(chatId, 'Введите id:');
                }
            }

            // Global user state
            switch (users[chatId].state) {

                // ADMIN ONLY
                case 'invite':
                    const inviteUser = await UserModel.findOne({
                        where: {chatId: `${msg.text}`}
                    });

                    if (inviteUser) {
                        await bot.sendMessage(msg.text, 'Ваша заявка одобрена. Добро пожаловать в чат! Ссылка : https://t.me/+mGI7zFqTLNQyYjZi');
                        await bot.sendMessage(chatId, 'Приглашение отправлено.');
                        return bot.sendMessage(chatId, 'Введите id:');
                    } else {

                        await bot.sendMessage(chatId, `Пользователь ${msg.text} не найден`);
                        return bot.sendMessage(chatId, 'Введите id:');
                    }


                // 1- Second name (Фамилия)
                case 'lastName':
                    if (!containsDigits(msg.text)) {
                        return bot.sendMessage(chatId, 'Введите Фамилию:');
                    }

                    users[chatId].lastName = msg.text;
                    users[chatId].state = 'firstName';
                    return bot.sendMessage(chatId, 'Введите Имя:');

                case 'firstName':
                    if (!containsDigits(msg.text)) {
                        return bot.sendMessage(chatId, 'Введите Имя:');
                    }

                    users[chatId].firstName = msg.text;
                    users[chatId].state = 'middleName';
                    return bot.sendMessage(chatId, 'Введите Отчество:');

                case 'middleName':
                    if (!containsDigits(msg.text)) {
                        return bot.sendMessage(chatId, 'Введите Отчество:');
                    }

                    users[chatId].middleName = msg.text;
                    users[chatId].state = 'companyInfo';
                    return bot.sendMessage(chatId, 'Введите компанию, в которой работаете (наименование юридического лица):');

                case 'companyInfo':
                    if (msg.text.length < 2) {
                        return bot.sendMessage(chatId, 'Введите компанию, в которой работаете (наименование юридического лица):');
                    }

                    users[chatId].companyInfo = msg.text;
                    users[chatId].state = 'companyAdres';
                    return bot.sendMessage(chatId, 'Введите адрес компании:');

                case 'companyAdres':
                    if (msg.text.length < 2) {
                        return bot.sendMessage(chatId, 'Введите адрес компании:');
                    }
                    users[chatId].companyAdres = msg.text;
                    users[chatId].state = 'companyLabel';
                    return bot.sendMessage(chatId, 'Введите название (именно вывеска):');

                case 'companyLabel':
                    users[chatId].companyLabel = msg.text;
                    users[chatId].state = 'companyInn';
                    return bot.sendMessage(chatId, 'ИНН компании:');

                case 'companyInn':
                    if (!containsOnlyDigits(msg.text)) {
                        return bot.sendMessage(chatId, 'ИНН компании:');
                    }

                    if(msg.text.length < 7){
                        return bot.sendMessage(chatId, 'ИНН компании:');
                    }

                    users[chatId].companyInn = msg.text;
                    users[chatId].state = 'workInfo';
                    return bot.sendMessage(chatId, 'Должность:');

                case 'workInfo':
                    if (msg.text.length < 3) {
                        return bot.sendMessage(chatId, 'Должность:');
                    }

                    users[chatId].workInfo = msg.text;
                    users[chatId].state = 'city';
                    return bot.sendMessage(chatId, 'Город:');

                case 'city':
                    if (msg.text.length < 3) {
                        return bot.sendMessage(chatId, 'Город:');
                    }

                    users[chatId].city = msg.text;
                    users[chatId].state = 'telephone';
                    return bot.sendMessage(chatId, 'Телефон:');

                // telephone
                // >>>>>>>>>
                // telephone
                case 'telephone':
                    if(!containsOnlyDigits(msg.text)){
                        return bot.sendMessage(chatId, 'Телефон:');
                    }

                    users[chatId].telephone = msg.text;
                    users[chatId].state = 'aboutChannel';

                    return bot.sendMessage(chatId, 'Откуда узнал о нашем канале:', {
                        reply_markup: {
                            inline_keyboard: [
                                [{ text: 'От представителя дистрибьютора', callback_data: 'dist'}],
                                [{ text: 'От сотрудника Русагро', callback_data: 'rusagro' }],
                                [{ text: 'Интернет', callback_data: 'internet' }],
                                [{ text: 'Другое', callback_data: 'other' }]
                            ]
                        }
                    });

                case 'aboutChannel':
                    switch (msg.text) {
                        case 'От представителя дистрибьютора':
                            users[chatId].aboutChannel = msg.text;
                            users[chatId].state = 'distributeName';
                            return bot.sendMessage(chatId, 'Какое название у дистрибьютера?');
                    }

                    users[chatId].aboutChannel = msg.text;
                    users[chatId].registerComplete = true;
                    users[chatId].state = 'start';

                    // record to db
                    await SaveToDB(chatId);
                    return bot.sendMessage(chatId, 'Благодарим за регистрацию:) Твоя заявка на рассмотрении.');

                case 'distributeName':

                    users[chatId].distributeName = msg.text;
                    users[chatId].registerComplete = true;
                    users[chatId].state = 'start';

                    // record to db
                    await SaveToDB(chatId);
                    return bot.sendMessage(chatId, 'Благодарим за регистрацию:) Твоя заявка на рассмотрении.');


                default :
                    users[chatId].state = 'start';
                    users[chatId].Clear();
                    return bot.sendMessage(chatId, 'Что-то пошло не так..');


            }
        } catch (e) {
            Console.log(`ОШИБКА ${e}`);
            return bot.sendMessage(chatId, `Что-то пошло не так ${e.toString()}`);
        }
    });

}

bot.on('callback_query', async  (query) => {
    const chatId = query.message.chat.id;
    const data = query.data;

    // обрабатываем callback_data, который был отправлен боту
    switch (data) {
        case 'dist':
            // обрабатываем выбор "От представителя дистрибьютора"
            users[chatId].aboutChannel = 'От представителя дистрибьютора';
            users[chatId].state = 'distributeName';
            return bot.sendMessage(chatId, 'Какое название у дистрибьютера?');
        case 'rusagro':
            // обрабатываем выбор "От сотрудника Русагро"
            users[chatId].aboutChannel = 'От сотрудника Русагро';
            users[chatId].registerComplete = true;
            users[chatId].state = 'start';
            await SaveToDB(chatId);
            return bot.sendMessage(chatId, 'Благодарим за регистрацию:) Твоя заявка на рассмотрении.');

        case 'internet':
            // обрабатываем выбор "Интернет"
            users[chatId].aboutChannel = 'Интернет';
            users[chatId].registerComplete = true;
            users[chatId].state = 'start';
            await SaveToDB(chatId);
            return bot.sendMessage(chatId, 'Благодарим за регистрацию:) Твоя заявка на рассмотрении.');

        case 'other':
            // обрабатываем выбор "Другое"
            users[chatId].aboutChannel = 'Другое';
            users[chatId].registerComplete = true;
            users[chatId].state = 'start';
            await SaveToDB(chatId);
            return bot.sendMessage(chatId, 'Благодарим за регистрацию:) Твоя заявка на рассмотрении.');
    }

    // удаляем inline клавиатуру после обработки выбора
    bot.answerCallbackQuery(query.id);
    bot.editMessageReplyMarkup({
        inline_keyboard: []
    }, {
        chat_id: chatId,
        message_id: query.message.message_id
    });
});

async function SaveToDB(chatId){
// record to db
    let user = await UserModel.findOne({
        where: {chatId: `${chatId}`}
    });

    if(!users[chatId].userName){
        user.userName = `${chatId}`;
    }
    else{
        user.userName = users[chatId].userName;
    }

    user.firstName = users[chatId].firstName;
    user.lastName = users[chatId].lastName;
    user.middleName = users[chatId].middleName;
    user.workInfo = users[chatId].workInfo;
    user.companyInfo = users[chatId].companyInfo;
    user.companyAdres = users[chatId].companyAdres;
    user.companyLabel = users[chatId].companyLabel;
    user.companyInn = users[chatId].companyInn;
    user.telephone = users[chatId].telephone;
    user.city = users[chatId].city;
    user.aboutChannel = users[chatId].aboutChannel;
    user.distributeName = users[chatId].distributeName;
    user.state = users[chatId].state;
    user.registerComplete = users[chatId].registerComplete;

    //await user.save();

    try {
        await user.save();
    } catch (error) {
        if (error instanceof Sequelize.UniqueConstraintError) {
            console.log('Ошибка уникальности:', error);
            console.log('Запись, вызвавшая ошибку:', user.get());
            return bot.sendMessage(chatId, 'Такой ИНН уже есть в базе, заявка отклонена.');
        } else {
            console.log('Произошла другая ошибка:', error);
        }
    }
}

start();

function containsOnlyDigits(str) {
    return /^[0-9+]+$/.test(str);
}

function containsDigits(str) {
    const regex = /^[a-zA-Zа-яА-Я]+$/;
    return regex.test(str);
}

function containsInn(str){
    const regex =/^(\d{10})$/;
    return regex.test(str);
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
            UserID : user.chatId,
            ФИО: `${user.lastName} ${user.firstName} ${user.middleName}`,
            Город : user.city,
            Должность: user.workInfo,
            Компания: user.companyInfo,
            Адрес: user.companyAdres,
            Вывеска: user.companyLabel,
            ИНН_компании: user.companyInn,
            Телефон: user.telephone,
            Откуда_узнал : user.aboutChannel,
            Дистрибьютор: user.distributeName,
        }));

        //console.log(data);

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

function checkFullName(fullName) {
    const nameRegex = /^[\u0400-\u04FF\s]+$/;
    const words = fullName.trim().split(/\s+/);

    if (words.length !== 3) {
        return false;
    }

    return words.every((word) => nameRegex.test(word));
}

function checkTelephone(str){
    const regex =/^\+7\d{10}$/;
    return regex.test(str);
}

