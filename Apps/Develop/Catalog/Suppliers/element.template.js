
/* customer template */

//TODO: не определяются модули на сервере!!!
//const cmn = require('../common.catalog');

// TODO

let template = {
    properties: {
        "TCustomer.$Sum": function () {
            return this.Amount * 2;
        }
    },
    events: {
    },
    validators: {
        "Customer.Name": "Обязательное поле"
    },
    commands: {
        test(args) {
            // this === root;
            let host = this.$host;
            alert('test command executed');
            // !!!promises
            this.$host.$viewModel.$save();
            //alert(this.$save);
            //console.dir(this);
        },
        objcmd: {
            saveRequired: true,
            validOnly: true,
            canExec: true,
            confirm: {
                msg: "Are you sure?",
                okText: "Sure",
                cancelText: "No"
            },
            exec: function () {
                alert(this.$save);
            }
        }
    }
};

module.exports = template;