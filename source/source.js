let ul = document.querySelector("#messages");
let userName;

const getMessages = () => {
    
    resetMessages();
    axios.get("https://mock-api.driven.com.br/api/v4/uol/messages")
         .then(({data}) => data.filter(filterPrivateMessages).forEach(addMessage));
    return null;
};

const addMessage = (message) => {
    
    const factory = {
        "status":`<li class="status"><span class="time">(${message.time})</span> <b>${message.from}</b> ${message.text}</li>`,
        "message":`<li class="normal_message"><span class="time">(${message.time})</span> <b>${message.from}</b> para <b>${message.to}</b>: ${message.text}</li>`,
        "private_message":`<li class="private_message"><span class="time">(${message.time})</span> <b>${message.from}</b> reservadamente para <b>${message.to}</b>: ${message.text}</li>`
    };
    ul.innerHTML += factory[message.type];
    automaticScroll();
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

const nameAlreadyTaken = (error) => {

    const statusCode = error.response.status
    statusCode === 400 && postName("O nome de usuário já foi pego. Insira um outro nome.")
    return null;
}

const verifyStatusCode = (response) => {

    const statusCode = response.status;
    statusCode !== 200 && postName("Insira um novo nome.");
    return null;
}

const postName = (question) => {

    userName = askName(question);
    axios.post("https://mock-api.driven.com.br/api/v4/uol/participants",{name:userName})
         .then(verifyStatusCode)
         .catch(nameAlreadyTaken);
    return null
}

const userStillLogged = () => {

    axios.post("https://mock-api.driven.com.br/api/v4/uol/status",{name:userName});
    return null;
}

postName("Qual o seu lindo nome?");
getMessages();
setInterval(getMessages,3000);
setInterval(userStillLogged,5000);

