/*20170813-7011*/
/*components/include.js*/
(function () {

    const http = require('http');

    Vue.component('include', {
        props: {
            src: String,
            cssClass: String
        },
        template: '<div :class="cssClass"></div>',
        created: function () {
            //alert('created');
        },
        watch: {
            src: function (newUrl, oldUrl) {
                http.load(newUrl, this.$el);
            }
        }
    });
})();