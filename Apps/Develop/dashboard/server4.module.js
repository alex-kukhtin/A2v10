module.exports = function (prms, args) {

    let dm = this.executeSql({
        procedure: "a2demo.[GetWeather.Load]",
        parameters: {
            UserId: prms.UserId
        }
    });

    return this.sendSms('+38000000000', "message from js", "");
};