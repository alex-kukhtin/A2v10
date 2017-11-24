
/* identity/user template (create) */

const CONFIRM_MSG = "Пароль и подтверждение не совпадают";

const template = {
    properties: {
        "TUser.Password": String,
        "TUser.Confirm" : String
    },
    validators: {
        "User.Password": [
            "Не указан пароль",
            { valid: validLen, msg: "Длина пароля не менее 6 символов" },
            { valid: passwordEq, msg: CONFIRM_MSG}
        ],
        "User.Confirm": [
            "Не указано подтверждение пароля",
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


module.exports = template;