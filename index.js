const config = require("./config.js");
const token = config.token, apiUrl = config.apiUrl;
const app = require('express')();
const bodyParser = require('body-parser');
const fetch = require('node-fetch');
app.use(bodyParser.json());

process.on('unhandledRejection', err => {
    console.log(err)
});	

app.get('/', function (req, res) {
    res.send("It's work.");
}); 

app.post('/webhook', async function (req, res) {
    const data = req.body;
    for (var i in data.messages) {
        const author = data.messages[i].author;
        const body = data.messages[i].body;
        const chatId = data.messages[i].chatId;
        const senderName = data.messages[i].senderName;
        if(data.messages[i].fromMe)return;
        
        if(/help/.test(body)){
            const text = `${senderName}, это демо-бот для https://chat-api.com/.
            Команды:
            1. chatId - отобразить ID текущего чата
            2. file [pdf/jpg/doc/mp3] - получить файл
            3. ptt - получить голосовое сообщение
            4. geo - получить локацию
            5. group - создать группу с Вами и ботом`;
            await apiChatApi('message', {chatId: chatId, body: text});
        }else if(/chatId/.test(body)){
            await apiChatApi('message', {chatId: chatId, body: chatId});
        }else if(/file (pdf|jpg|doc|mp3)/.test(body)){
            const fileType = body.match(/file (pdf|jpg|doc|mp3)/)[1];
            const files = {
                doc: "http://dl.stk-servers.ru/tra.docx",
                jpg: "http://dl.stk-servers.ru/tra.jpg",
                mp3: "http://dl.stk-servers.ru/tra.mp3",
                pdf: "http://dl.stk-servers.ru/tra.pdf"
            };
            var dataFile = {
                phone: author,
                body: files[fileType],
                filename: `Файл *.${fileType}`            
            };
            if(fileType == "jpg")dataFile['caption'] = "Текст под фото."; 
            await apiChatApi('sendFile', dataFile);
        }else if(/ptt/.test(body)){            
            await apiChatApi('sendAudio', {audio: "http://dl.stk-servers.ru/tra.ogg", chatId: chatId});
        }else if(/geo/.test(body)){
            await apiChatApi('sendLocation', {lat: 51.178843, lng: -1.826210, address: 'Стоунхендж', chatId: chatId});
        }else if(/group/.test(body)){
            let arrayPhones = [ author.replace("@c.us","") ];
            await apiChatApi('group', {groupName: 'Группа с ботом на Node.JS', phones: arrayPhones, messageText: 'Добро пожаловать в новую группу!'});
        }
    }
    res.send('Ok');
});

app.listen(80, function () {
    console.log('Listening on port 80..');
});

async function apiChatApi(method, params){
    const options = {};
    options['method'] = "POST";
    options['body'] = JSON.stringify(params);
    options['headers'] = { 'Content-Type': 'application/json' };
    
    const url = `${apiUrl}/${method}?token=${token}`; 
    
    const apiResponse = await fetch(url, options);
    const jsonResponse = await apiResponse.json();
    return jsonResponse;
}