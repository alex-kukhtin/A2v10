/*20170814-7013*/
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
        destroyed() {
            let fc = this.$el.firstElementChild;
            if (fc && fc.__vue__)
                fc.__vue__.$destroy();
        },
        watch: {
            src: function (newUrl, oldUrl) {
                http.load(newUrl, this.$el);
            }
        },
    });
})();