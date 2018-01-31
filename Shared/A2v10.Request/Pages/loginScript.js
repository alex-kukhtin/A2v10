// Copyright © 2015-2017 Alex Kukhtin. All rights reserved.

(function () {


    const token = '$(Token)';


    $(Utils)

    const vm = new Vue({
        el: "#app",
        data: {
            login: '',
            password: '',
            rememberMe: false,
            processing: false,
            info: $(LoginData),
            submitted: false,
            serverError: ''
        },
        computed: {
            valid() {
                if (!this.submitted) return true;
                return this.validLogin && this.validPassword;
            },
            validLogin() {
                return this.submitted ? !!this.login : true;
            },
            validPassword() {
                return this.submitted ? !!this.password : true;
            }
        },
        methods: {
            submit() {
                this.submitted = true;
                this.serverError = '';
                if (!this.valid)
                    return;
                this.processing = true;
                let dataToSend = {
                    Name: this.login,
                    Password: this.password,
                    RememberMe: this.rememberMe
                };
                const that = this;
                post('/account/login', dataToSend)
                    .then(function (response) {
                        that.processing = false;
                        let result = response.Status;
                        if (result === "Success")
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