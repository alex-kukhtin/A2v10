// Copyright © 2015-2017 Alex Kukhtin. All rights reserved.

(function () {


    Vue.directive('focus', {
        bind(el, binding, vnode) {

            el.addEventListener("focus", function (event) {
                event.target.parentElement.classList.add('focus');
            }, false);

            el.addEventListener("blur", function (event) {
                let t = event.target;
                t._selectDone = false;
                event.target.parentElement.classList.remove('focus');
            }, false);

            el.addEventListener("click", function (event) {
                let t = event.target;
                if (t._selectDone)
                    return;
                t._selectDone = true;
                if (t.select) t.select();
            }, false);
        },
        inserted(el) {
            if (el.tabIndex === 1) {
                setTimeout(() => {
                    if (el.focus) el.focus();
                    if (el.select) el.select();
                }, 0);
            }
        }
    });

    const token = '$(Token)';

    function post(url, data) {
        return new Promise(function (resolve, reject) {
            let xhr = new XMLHttpRequest();

            xhr.onload = function (response) {
                if (xhr.status === 200) {
                    let xhrResult = JSON.parse(xhr.responseText);
                    resolve(xhrResult);
                }
                else if (xhr.status === 255) {
                    reject(xhr.responseText || xhr.statusText);
                }
                else
                    reject(xhr.statusText);
            };
            xhr.onerror = function (response) {
                reject(xhr.statusText);
            };
            xhr.open('POST', url, true);
            xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
            xhr.setRequestHeader('Accept', 'application/json;charset=utf-8');
            xhr.setRequestHeader("__RequestVerificationToken", token);
            xhr.send(JSON.stringify(data));
        });
    }

    function parseQueryString(str) {
        var obj = {};
        str.replace(/\??([^=&]+)=([^&]*)/g, function (m, key, value) {
            obj[decodeURIComponent(key)] = '' + decodeURIComponent(value);
        });
        return obj;
    }


    const vm = new Vue({
        el: "#app",
        data: {
            login: '',
            email: '',
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
                return this.validLogin && this.validPassword && this.validEmail && this.validConfirm;
            },
            validLogin() {
                return this.submitted ? !!this.login : true;
            },
            validEmail() {
                return this.submitted ? !!this.email : true;
            },
            validPassword() {
                return this.submitted ? !!this.password : true;
            },
            validConfirm() {
                return this.submitted ? !!this.confirm && (this.password == this.confirm) : true;
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
                    Name: this.login,
                    Email: this.email,
                    Password: this.password
                };
                const that = this;
                post('/account/register', dataToSend)
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