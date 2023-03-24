
const TelegramApi = require('node-telegram-bot-api');
const token = '6000741658:AAFbDipcdGjFyGvSw1sza5UYIfAnPItNekI';
const bot = new TelegramApi(token, {polling: true});

bot.setMyCommands([
    {command: '/start', description: 'Запуск бота'},
    {command: '/register', description: 'Регистрация'},
])

const  start = () => {
    let register = false;
    let first_name = null;
    let second_name = null;

    bot.on('message', async msg => {

        //Вытаскием текст из сообщения
        const text = msg.text;
        const chatId = msg.chat.id;
        const userId = msg.chat.username;
        console.log(userId);

        if(userId == 'ftx3d'){
            await  bot.sendMessage(chatId, 'Админ в здании...');
        }

        if(register==false) {

            if (text === '/start') {
                return bot.sendMessage(chatId, `Добро пожаловать в тестовый бот, выберите /register для процедуры регистрации. Текущий статус регистрации [${register}]`)
            }

            if (text == '/register') {
                register = true;
                await  bot.sendMessage(chatId, 'Начало процедуры регистрации. Следуйте инструкции.')
                return bot.sendMessage(chatId, `Регистрация, введите свое имя : `);
            }

            return bot.sendMessage(chatId, `Добро пожаловать в тестовый бот, выберите /register для процедуры регистрации Текущий статус регистрации [${register}]`)
        }

        if (first_name == null) {

            //Проверка на цифры
            if (containsDigits(msg.text)) {
                return bot.sendMessage(chatId, `В вашем имени цифры? Попробуй еще раз`);
            } else {
                first_name = msg.text;
                return bot.sendMessage(chatId, `Здравствуйте ${first_name}, теперь давай напиши фамилию : `);
            }

        }

        if (register == true && first_name != null && second_name == null) {
            second_name = msg.text;

            return bot.sendMessage(chatId, `${first_name} ${second_name}, вы зарегестрированы! Спасибо.`);
        }
    });
}

function containsDigits(str) {
    const regex = /\d/;
    return regex.test(str);
}

start()