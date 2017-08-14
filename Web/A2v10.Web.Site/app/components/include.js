/*20170814-7012*/
/*components/include.js*/
(function () {

    const http = require('http');

    Vue.component('include', {
        props: {
            src: String,
            cssClass: String
        },
        template: '<div :class="cssClass"></div>',
        mounted() {
            if (this.src)
                http.load(this.src, this.$el);
        },
        watch: {
            src: function (newUrl, oldUrl) {
                http.load(newUrl, this.$el);
            }
        }
    });
})();