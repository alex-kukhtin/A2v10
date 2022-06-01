module.exports = function (prms, args) {

    let ex = this.require('server.common.js', prms, args);

    return ex.toCall(prms, args);

    let dm = this.executeSql({
        procedure: "a2demo.[GetWeather.Load]",
        parameters: {
            UserId: prms.UserId
        }
    });

    // return this.sendSms('+38000000000', "message from js", "");
    return {};
};