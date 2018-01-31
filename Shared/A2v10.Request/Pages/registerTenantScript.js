// Copyright © 2015-2017 Alex Kukhtin. All rights reserved.

(function () {


    const token = '$(Token)';

    $(Utils)

    /* from angular.js !!! */
    const EMAIL_REGEXP = /^(?=.{1,254}$)(?=.{1,64}@)[-!#$%&'*+\/0-9=?A-Z^_`a-z{|}~]+(\.[-!#$%&'*+\/0-9=?A-Z^_`a-z{|}~]+)*@[A-Za-z0-9]([A-Za-z0-9-]{0,61}[A-Za-z0-9])?(\.[A-Za-z0-9]([A-Za-z0-9-]{0,61}[A-Za-z0-9])?)*$/;

    function validateEmail(addr) {
        return addr === '' || EMAIL_REGEXP.test(addr);
    }

    const vm = new Vue({
        el: "#app",
        data: {
            email: '',
            name: '',
            phone: '',
            password: '',
            confirm: '',
            processing: false,
            info: $(RegisterData),
            submitted: false,
            serverError: ''
        },
        computed: {
            valid() {
                if (!this.submitted) return true;
                return this.validName &&
                    this.validPassword &&
                    this.validEmail &&
                    this.validPhone &&
                    this.validConfirm;
            },
            validName() {
                return this.submitted ? !!this.name : true;
            },
            validEmail() {
                if (this.submitted && !this.email)
                    return false;
                if (!validateEmail(this.email))
                    return false;
                return true;
            },
            validPassword() {
                return this.submitted ? !!this.password : true;
            },
            validConfirm() {
                return this.submitted ? !!this.confirm && (this.password == this.confirm) : true;
            },
            validPhone() {
                return this.submitted ? !!this.phone : true;
            },
        },
        methods: {
            submit() {
                this.submitted = true;
                this.serverError = '';
                if (!this.valid)
                    return;
                this.processing = true;
                let dataToSend = {
                    Name: this.email, // !!!!
                    PersonName: this.name,
                    Email: this.email,
                    Phone: this.phone,
                    Password: this.password
                };
                const that = this;
                post('/account/register', dataToSend)
                    .then(function (response) {
                        that.processing = false;
                        let result = response.Status;
                        if (result === 'Success')
                            that.navigate();
                        else if (result == 'ConfirmSent')
                            that.navigate();
                        else if (result === 'Failure') 
                            that.failure('Неправильный логин или пароль');
                        else if (result === 'LockedOut')
                            that.failure('Пользователь заблокирован.\nПопробуйте еще через несколько минут');
                        else
                            alert(result);
                    })
                    .catch(function (error) {
                        that.processing = false;
                        alert(error);
                    });
            },
            navigate() {
                let qs = parseQueryString(window.location.search);
                let url = qs.ReturnUrl || '/';
                window.location.assign(url);
            },
            failure(msg) {
                this.password = '';
                this.submitted = false;
                this.serverError = msg;
            },
            reload() {
                window.location.reload();
            }
        }
    });
})();