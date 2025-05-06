const generateMessage = function (username ,text) {
    return {
        username ,
        text,
        createdAt: new Date().getTime()
    };
}

module.exports = { generateMessage };