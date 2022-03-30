const generateMessage = (user ,text) => {
    return ({
        user,
        text,
        createdAt: new Date().getTime()
    });
};

const generateLocationMessage = (user ,{ latitude, longitude }) => {
    return ({
        user,
        url: `https://google.com/maps?q=${latitude},${longitude}`,
        createdAt: new Date().getTime()
    });
};

module.exports = {
    generateMessage,
    generateLocationMessage
}