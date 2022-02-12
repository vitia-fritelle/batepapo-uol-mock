let ul = document.querySelector("#messages");
let userName;

const getMessages = () => {
    
    axios.get("https://mock-api.driven.com.br/api/v4/uol/messages")
         .then(writeNewMessages);
    return null;
};

const writeNewMessages = ({data}) => {

    resetMessages();
    data.filter(filterPrivateMessages).forEach(addMessage);
    automaticScroll();
    return null;
}

const addMessage = (message) => {
    
    const factory = {
        "status":`<li class="status"><span class="time">(${message.time})</span> <b>${message.from}</b> ${message.text}</li>`,
        "message":`<li class="normal_message"><span class="time">(${message.time})</span> <b>${message.from}</b> para <b>${message.to}</b>: ${message.text}</li>`,
        "private_message":`<li class="private_message"><span class="time">(${message.time})</span> <b>${message.from}</b> reservadamente para <b>${message.to}</b>: ${message.text}</li>`
    };
    ul.innerHTML += factory[message.type];
    return null;
}

const filterPrivateMessages = (message) => {

    const isNormalMessage = message.type === "message";
    const isStatus = message.type === "status";
    const isPrivateMessage = message.type === "private_message";
    const isToUserName = message.to === userName;
    return (isPrivateMessage && isToUserName) || isNormalMessage || isStatus;
}

const resetMessages = () => {

    ul.innerHTML = "";
    return null;
};

const automaticScroll = () => {

    const lastMessage = ul.querySelector("li:last-of-type");
    lastMessage.scrollIntoView();
    return null;
}

const askName = (question) => prompt(question);

const handlingError = (error) => {

    const statusCode = error.response.status
    statusCode === 400 && postName("O nome de usuário já foi pego. Insira um outro nome.")
    statusCode !== 200 && postName("Insira um novo nome.");
    return null;
}

const postName = (question) => {

    userName = askName(question);
    axios.post(
        "https://mock-api.driven.com.br/api/v4/uol/participants",
        {name:userName, validateStatus:(status) => status !== 200}
        ).catch(handlingError);
    return null
}

const userStillLogged = () => {

    axios.post("https://mock-api.driven.com.br/api/v4/uol/status",{name:userName});
    return null;
}

const sendMessage = () => {

    const input = document.querySelector("input[name='textbox']");
    const message = input.value;
    axios.post("https://mock-api.driven.com.br/api/v4/uol/messages",{
        from: `${userName}`,
        to: "Todos",
        text: `${message}`,
        type: "message" // ou "private_message" para o bônus
    }).then(updateMessages).catch(reloadPage);
}

const updateMessages = () => {

    getMessages();
    clearInterval(messageInterval);
    messageInterval = setInterval(getMessages,3000);
    return null;
}

const reloadPage = () => {

    clear(messageInterval);
    clear(userInterval);
    window.location.reload(true);
    return null;
}

postName("Qual o seu lindo nome?");
getMessages();
let messageInterval = setInterval(getMessages,3000);
let userInterval = setInterval(userStillLogged,5000);

