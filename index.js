const User = require('./user.js');
const TelegramApi = require('node-telegram-bot-api');

const token = '6204085451:AAEriDvTAjHmxHQcjt66Q3xgEvsVFQmqE3c';
const bot = new TelegramApi(token, {polling: true});

const sequelize = require('./database');
const UserModel = require('./models');
const XLSX = require('xlsx');
const Console = require("console");

let users = [];
const adminId = 'anastasiazems';
const adminId2 = 'ftx3d';

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

    bot.on('contact', (message) => {
        const chatId = message.chat.id;
        const phoneNumber = message.contact.phone_number;
        switch (users[chatId].state) {
            case 'telephone':
                users[chatId].telephone = phoneNumber;
                users[chatId].state = 'city';
                return bot.sendMessage(chatId, 'Город :');
        }
    });


    bot.on('message', async msg => {

        const text = msg.text;
        const chatId = msg.chat.id;
        const userId = msg.chat.username;

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
                if (userId === adminId || userId === adminId2) {
                    await bot.sendMessage(chatId, 'Подготавливаю отчет в формате excel файла, подождите.');
                    await exportToExcel();
                    const fileId = './users.xlsx'; // Путь к файлу
                    await bot.sendDocument(chatId, fileId);
                }
            }

            // Global user state
            switch (users[chatId].state) {

                // 0 - Start (idle)
                case 'start':

                    // Intro msg
                    if (msg.text.toLowerCase() === '/start') {

                        if (userId === adminId || userId === adminId2) {
                            await bot.sendMessage(chatId, 'Администратор. Вам доступны дополнительные команды. Используйте /report для получения списка заявок');
                        }


                        // check else create db record
                        const userExist = await UserModel.findOne({
                            where: {chatId: `${chatId}`}
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

                        await bot.sendMessage(chatId, 'Вы подаете заявку на регистрацию, следуйте указаниям бота.');
                        return bot.sendMessage(chatId, 'Введите фамилию:');
                    }

                    // Cancel reg
                    if (msg.text.toLowerCase() === '/cancel_reg') {

                        users[chatId].Clear();

                        const userExist = await UserModel.findOne({
                            where: {chatId: `${chatId}`}
                        });

                        if (userExist) {
                            if (userExist.registerComplete) {
                                userExist.userName = null;
                                userExist.firstName = null;
                                userExist.lastName = null;
                                userExist.middleName = null;
                                userExist.workInfo = null;
                                userExist.companyInfo = null;
                                userExist.companyInn = null;
                                userExist.telephone = null;
                                userExist.city = null;
                                userExist.aboutChannel = null;
                                userExist.state = null;
                                userExist.registerComplete = false;
                                await userExist.save();
                                return bot.sendMessage(chatId, 'Ваша заявка успешно удалена');
                            } else {
                                return bot.sendMessage(chatId, 'Нечего отменять, от вас заявка еще не поступала');
                            }
                        } else {
                            return bot.sendMessage(chatId, 'Нечего отменять, от вас заявка еще не поступала');
                        }
                    }
                    break;

                // 1- Second name (Фамилия)
                case 'lastName':
                    if (!containsDigits(msg.text)) {
                        await bot.sendMessage(chatId, 'Некорректное значение');
                        return bot.sendMessage(chatId, 'Введите фамилию:');
                    }

                    users[chatId].lastName = msg.text;
                    users[chatId].state = 'firstName';
                    return bot.sendMessage(chatId, 'Введите имя:');

                case 'firstName':
                    if (!containsDigits(msg.text)) {
                        await bot.sendMessage(chatId, 'Некорректное значение');
                        return bot.sendMessage(chatId, 'Введите имя:');
                    }

                    users[chatId].firstName = msg.text;
                    users[chatId].state = 'middleName';
                    return bot.sendMessage(chatId, 'Введите отчество:');

                case 'middleName':
                    if (!containsDigits(msg.text)) {
                        await bot.sendMessage(chatId, 'Некорректное значение');
                        return bot.sendMessage(chatId, 'Введите отчество:');
                    }

                    users[chatId].middleName = msg.text;
                    users[chatId].state = 'workInfo';
                    return bot.sendMessage(chatId, 'Место работы:');

                // 2 - Кем работает
                case 'workInfo':
                    if (msg.text.length < 3) {
                        return bot.sendMessage(chatId, 'Место работы:');
                    }

                    users[chatId].workInfo = msg.text;
                    users[chatId].state = 'companyInfo';
                    return bot.sendMessage(chatId, 'Юридическое лицо организации:');

                // 3- Юр название компании, в которой работает
                case 'companyInfo':
                    if (msg.text.length < 2) {
                        return bot.sendMessage(chatId, 'Юридическое лицо организации:');
                    }

                    users[chatId].companyInfo = msg.text;
                    users[chatId].state = 'companyInn';
                    return bot.sendMessage(chatId, 'Инн организации в которой вы работаете:');

                // 4 - ИНН: компании в которой работает
                case 'companyInn':
                    if (!containsInn(msg.text)) {
                        await bot.sendMessage(chatId, 'Некорректное значение!');
                        return bot.sendMessage(chatId, 'Инн организации в которой вы работаете:');
                    }

                    users[chatId].companyInn = msg.text;
                    users[chatId].state = 'telephone';

                    return bot.sendMessage(chatId, 'Для продолжения отправьте свой номер телефона', {
                        reply_markup: {
                            keyboard: [
                                [{
                                    text: 'Отправить номер телефона',
                                    request_contact: true
                                }]
                            ],
                            resize_keyboard: true,
                            one_time_keyboard: true
                        }
                    });

                // telephone get

                // telephone get

                case 'city':
                    if (msg.text.length < 3) {
                        return bot.sendMessage(chatId, 'Город :');
                    }

                    users[chatId].city = msg.text;
                    users[chatId].state = 'aboutChannel';
                    return bot.sendMessage(chatId, 'Откуда узнали о боте? Можете выбратль или написать свой вариант :', {
                        reply_markup: {
                            keyboard: [
                                [' Google'],
                                [' Yandex'],
                                [' Друг подсказал'],
                            ],
                            resize_keyboard: true,
                            one_time_keyboard: true
                        }
                    });

                case 'aboutChannel':
                    users[chatId].aboutChannel = msg.text;
                    users[chatId].registerComplete = true;
                    users[chatId].state = 'start';

                    // record to db
                    const user = await UserModel.findOne({
                        where: { chatId: `${chatId}` }
                    });

                    user.userName = users[chatId].userName;
                    user.firstName = users[chatId].firstName;
                    user.lastName = users[chatId].lastName;
                    user.middleName = users[chatId].middleName;
                    user.workInfo = users[chatId].workInfo;
                    user.companyInfo = users[chatId].companyInfo;
                    user.companyInn = users[chatId].companyInn;
                    user.telephone = users[chatId].telephone;
                    user.city = users[chatId].city;
                    user.aboutChannel = users[chatId].aboutChannel;
                    user.state = users[chatId].state;
                    user.registerComplete = users[chatId].registerComplete;

                    await user.save();

                    return bot.sendMessage(chatId, `${users[chatId].firstName} благодарим за регистрацию. Ваша заявка на расмотрении. Гудбай!`);
                    break;


                default :
                    users[chatId].state = 'start';
                    users[chatId].Clear();
                    return bot.sendMessage(chatId, 'Что-то пошло не так..');


            }
            console.log(users[chatId].state);

        } catch (e) {
            Console.log(e);
            return bot.sendMessage(chatId, 'Что-то пошло не так (база данных)');
        }
    });

}

start();

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
            UserID : '@'+user.userName,
            ФИО: `${user.lastName} ${user.firstName} ${user.middleName}`,
            Город : user.city,
            Место_работы: user.workInfo,
            Компания: user.companyInfo,
            ИНН_компании: user.companyInn,
            Телефон: user.telephone,
            Откуда_узнал : user.aboutChannel,
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

