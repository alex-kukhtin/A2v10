module.exports = function (prms, args) {


    let ex = this.require('server.common.js', prms, args);

    let dm = this.loadModel({
        procedure: "a2demo.[GetWeather.Load2]",
        parameters: {
            UserId: prms.UserId
        }
    });
    return {
        url: dm.Weather.Url
    };

    // return this.sendSms('+38000000000', "message from js", "");
    return {};
};