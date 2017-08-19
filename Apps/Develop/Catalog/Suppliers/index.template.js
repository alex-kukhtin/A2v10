
/* customers template */

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
        "Customers[].Name": "Обязательное поле"
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
        testThen(vm) {
            // todo: vm
            var vm = this.$host.$viewModel;
            vm.$confirm({
                message: "confirm message text", title: "from template", buttons: [
                    { text: "Save", result: "save" },
                    { text: "Don't save", result: "close" },
                    { text: "Cancel", result: false }
                ]
            }).then(function (result) {
                alert('template:' + result);
            });
        },
        inc(elem, inc) {
            elem.Amount += inc;
            elem.Name += "*";
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