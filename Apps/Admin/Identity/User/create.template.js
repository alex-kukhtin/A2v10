
/* identity/user template (create) */

const CONFIRM_MSG = "Пароль та підтверждення не співпадають";

const template = {
    properties: {
        "TUser.Password": String,
        "TUser.Confirm" : String
    },
    events: {
    },
    validators: {
        "User.Name": [
            "Не вказано логін",
            {valid: duplicateLogin, async:true, msg: "Користувач за таким логіном вже існує"}
        ],
        "User.Email": { valid:'email', msg: 'Помилкова адреса электронної пошти'},
        "User.Password": [
            "Не вказано пароль",
            { valid: validLen, msg: "Пароль має містити принаймні шість символів" },
            { valid: passwordEq, msg: CONFIRM_MSG}
        ],
        "User.Confirm": [
            "Не вказано підтвердження паролю",
            { valid: passwordEq, msg: CONFIRM_MSG }
        ]
    },
    commands: {

    }
};

function passwordEq(user) {
    return user.Password === user.Confirm;
}

function validLen(user) {
    return user.Password.length >= 6;
}

function duplicateLogin(user, value) {
    // this === rule ???
    var vm = user.$vm;
    if (!user.Name)
        return true;
    return vm.$asyncValid('duplicateLogin', { Login: user.Name, Id: user.Id });
}

module.exports = template;