let ul = document.querySelector("#messages");

const getMessages = () => {
    
    resetMessages();
    axios.get("https://mock-api.driven.com.br/api/v4/uol/messages")
         .then(({data}) => data.forEach(addMessage));
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

const resetMessages = () => {

    ul.innerHTML = "";
    return null;
};

getMessages();
// setInterval(getMessages,3000);

const automaticScroll = () => {

    const lastMessage = ul.querySelector("li:last-of-type");
    lastMessage.scrollIntoView();
    return null;
}