
/* identity/user index template */

const template = {
    properties: {
        "TUser.$Icon"() {
            return this.IsAdmin ? "gear-outline" : null;
        }
    },
    events: {
    },
    validators: {
    },
    commands: {

    }
};

module.exports = template;