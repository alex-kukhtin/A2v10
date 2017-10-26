
/* identity/user template */

const template = {
    properties: {
    },
    events: {
    },
    validators: {
        "User.Name": "Не вказано логін",
        "User.Email": { valid:'email', msg: 'Помилкова адреса электронної пошти'}
    },
    commands: {

    }
};

module.exports = template;