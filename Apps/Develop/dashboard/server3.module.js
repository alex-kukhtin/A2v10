module.exports = function (prms, args) {

    let dm = this.executeSql({
        procedure: "a2demo.[GetWeather.Load]",
        parameters: {
            UserId: prms.UserId
        }
    });

    let url = dm.Url + '?q=London&appid=' + this.config.appSettings('openweathermap').appid;
    let resp = this.fetch(url, {
        method: "GET",
        headers: {
            ContentType: 'application/json',
        },
        body: {
            visitId: 500,
            donorId: 50
        }
    });
    if (!resp.ok)
        return JSON.stringify({ status: resp.status, statusText: resp.statusText, contentType: resp.contentType, ok: resp.ok, isJson: resp.isJson });
    else
        return resp.json();
};