
/* customers template */

//TODO: не определяются модули на сервере!!!
//const cmn = require('../common.catalog');

// TODO

let template = {
    properties: {
        "TCustomer.$Sum": function () {
            return this.Amount * 2;
        },
        "TCustomer.$cellMark"() {
            //return this.Amount >= 500 ? 'danger' : '';
            return !this.$valid ? 'danger' : '';
        },
        "TCustomer.$rowMark"() {
            return this.Amount === 400.0 ? 'warning' : '';
        },
        "TCustomer.$isValid"() {
            //this._root_._validate_(this, "Customers[].Name", this.Name);
            return this.$valid ? 'ПРАВИЛЬНО' : 'ОШИБКА';
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
            //alert('test command executed');
            // !!!promises
            this.$vm.$confirm("Are you sure to execute ?")
                .then(function (result) {
                    alert('answer is ' + result);
                });
            //host.$viewModel.$save();
            //alert(this.$save);
            //console.dir(this);
            //alert(this.$root.Customers[2].$vm === this.$vm);
        },
        alert() {
            this.$vm.$alert('Здесь произошла какая-то большая ошибка с длинным текстом с возможными переносами');
        },
        testThen() {
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