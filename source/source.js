//Variáveis Globais
let messages,userName,messageInterval,userInterval,activeUsers,recipient,
    visibility,activeUser,textUnderPlaceholder;

// Funções
const filterPrivateMessages = (message) => {

    const isNormalMessage = message.type === "message";
    const isStatus = message.type === "status";
    const isPrivateMessage = message.type === "private_message";
    const isToUserName = message.to === userName;
    return (isPrivateMessage && isToUserName) 
           || isNormalMessage 
           || isStatus;
}

const addMessage = (message) => {
    
    const factory = {
        "status":`<li data-identifier="message" class="status"><span class="time">(${message.time})</span> <b>${message.from}</b> ${message.text}</li>`,
        "message":`<li data-identifier="message" class="normal_message"><span class="time">(${message.time})</span> <b>${message.from}</b> para <b>${message.to}</b>: ${message.text}</li>`,
        "private_message":`<li data-identifier="message" class="private_message"><span class="time">(${message.time})</span> <b>${message.from}</b> reservadamente para <b>${message.to}</b>: ${message.text}</li>`
    };
    messages.innerHTML += factory[message.type];
    return null;
}

const resetMessages = () => messages.innerHTML = "";

const automaticScroll = () => {

    const lastMessage = messages.querySelector("li:last-of-type");
    lastMessage.scrollIntoView();
    return null;
}

const writeNewMessages = ({data}) => {

    resetMessages();
    data.filter(filterPrivateMessages).forEach(addMessage);
    automaticScroll();
    return null;
}

const getMessages = () => {
    
    axios.get("https://mock-api.driven.com.br/api/v4/uol/messages")
         .then(writeNewMessages);
    return null;
};

const askName = (question) => prompt(question);

//Olha que legal! Eu estou com referência circular! 
//No Python eu estaria ferrado! E aí, Gabriel? Devo deixar isso assim?
const postName = (question) => {

    userName = askName(question);
    axios.post(
        "https://mock-api.driven.com.br/api/v4/uol/participants",
        {name:userName, validateStatus:(status) => status !== 200}
        ).catch(handlingError);
    return null
}

const handlingError = (error) => {

    const statusCode = error.response.status;
    if (statusCode === 400) {
        // postName("O nome de usuário já foi pego. Insira um outro nome.")
        alert("O nome de usuário já foi pego. Insira um outro nome.");
    } else if (statusCode !== 200){
        // postName("Insira um novo nome.");
        alert("Insira um novo nome.");
    }
    return null;
}

const userStillLogged = () => axios.post(
    "https://mock-api.driven.com.br/api/v4/uol/status",
    {name:userName}
);

const resetInputValue = (input) => input.value = "";

const updateMessages = () => {

    getMessages();
    clearInterval(messageInterval);
    messageInterval = setInterval(getMessages,3000);
    return null;
}

const reloadPage = () => {

    clear(messageInterval);
    clear(userInterval);
    clear(activeUsersInterval);
    window.location.reload(true);
    return null;
}

const sendMessage = () => {

    const messageInput = document.querySelector("input[name='textbox']");
    const message = messageInput.value;
    axios.post(
        "https://mock-api.driven.com.br/api/v4/uol/messages",
        {
            from: `${userName}`,
            to: `${recipient}`,
            text: `${message}`,
            type: `${visibility}`
        }
        ).then(updateMessages)
         .catch(reloadPage);
    resetInputValue(messageInput);
    return null;
}

const sendUserName = () => {

    const loginInput = document.querySelector("input[name='login']");
    userName = loginInput.value;
    showLoading();
    axios.post(
        "https://mock-api.driven.com.br/api/v4/uol/participants",
        {name:userName, validateStatus:(status) => status !== 200}
        ).then(initChat)
         .catch(handlingError)
         .then(showLoading);
         
    return null;
}

const sendWithEnter = (input, action) => input.addEventListener(
    'keyup',
    (e) => e.keyCode === 13 && action());

const initChat = () => {

    const loginPage = document.querySelector("#initial-screen");
    loginPage.classList.add("hidden");
    getMessages();
    getActiveParticipants();
    changeTextUnderPlaceholder();
    messageInterval = setInterval(getMessages,3000);
    userInterval = setInterval(userStillLogged,5000);
    activeUsersInterval = setInterval(getActiveParticipants,10000);
    return null;       
}

const showLoading = () => {

    const loading = document.querySelector(".loading");
    loading.classList.toggle("hidden");
    const inputUsername = document.querySelector(".input-username");
    inputUsername.classList.toggle("hidden");
    return null;
}

const toggleActiveParticipants = () => {

    const aside = document.querySelector("aside");
    aside.classList.toggle("hidden");
    return null;
}

const getActiveParticipants = () => {

    axios.get("https://mock-api.driven.com.br/api/v4/uol/participants")
         .then(writeNewParticipants);
    return null;
}

const addParticipant = ({name}) => {
    
    activeUsers.innerHTML += `<li data-identifier='participant' class='pointer' onclick='getRecipient(this)'><ion-icon name="person-circle"></ion-icon>${name}<ion-icon class='hidden' name='checkmark-outline'></ion-icon></li>`;
    return null;
}

const writeNewParticipants = ({data}) => {

    resetParticipants();
    data.forEach(addParticipant);
    return null;
}

const resetParticipants = () => activeUsers.innerHTML = "<li data-identifier='participant' class='pointer' onclick='getRecipient(this)'><ion-icon name='people'></ion-icon>Todos<ion-icon class='hidden' name='checkmark-outline'></ion-icon></li>";

const getRecipient = (element) => {

    recipient = element.innerText;
    activeUser = element;
    unselectActiveUsers();
    selectOption(element);
    changeTextUnderPlaceholder();
    return null;
}
const getVisibility = (element) => {
    
    const factory = {
        "Público":"message",
        "Reservadamente":"private_message"
    };
    visibility = factory[element.innerText];
    unselectVisibilities();
    selectOption(element);
    changeTextUnderPlaceholder();
    return null;
}
const changeTextUnderPlaceholder = () => {

    textUnderPlaceholder.innerText = `Enviando para ${recipient} ${visibility === "private_message"?"(reservadamente)":""}`;
    return null;
}

const selectOption = (element) => {
    
    const check = element.querySelector("ion-icon[name='checkmark-outline']");
    check.classList.remove("hidden");
    return null;
}

const unselectActiveUsers = () => {
    
    const checkList = activeUsers.querySelectorAll("ion-icon[name='checkmark-outline']");
    checkList.forEach((element) => {
        if(!element.classList.contains("hidden")){
            element.classList.add("hidden");
        }
    });
}

const unselectVisibilities = () => {
    
    const visibilities = document.querySelector("#visibility");
    const checkList = visibilities.querySelectorAll("ion-icon[name='checkmark-outline']");
    checkList.forEach((element) => {
        if(!element.classList.contains("hidden")){
            element.classList.add("hidden");
        }
    });
}

//Inicialização da página
messages = document.querySelector("#messages");
activeUsers = document.querySelector("#contacts");
resetParticipants();
recipient = "Todos";
visibility = "message";
activeUser = document.querySelector("li[data-identifier='participant']");
textUnderPlaceholder = document.querySelector(".recipient-visibility-message");
sendWithEnter(document.querySelector("input[name='login']"),sendUserName);
sendWithEnter(document.querySelector("input[name='textbox']"),sendMessage);

//Normalmente, eu criaria uma classe para representar esses inputs 
//personalizados e colocaria o método sendWithEnter numa abstrata
//e sobrescreveria. Em JS, o pensamento é como? Algo como: 
//function Input(element){
//   this.element = element;
//   this.value = element.value;
//   this.reset = () => {
//       this.element.value = "";
//       return null;      
//   }
//   this.sendWithEnter = (action) => {
//    this.element.addEventListener('keyup',(e) => {
//        const key = e.keyCode;
//        key === 13 && action();
//        return null;
//    });
//    return null;    
//   } 
//}


