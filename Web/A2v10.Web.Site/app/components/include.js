/*20170818-7015*/
/*components/include.js*/

(function () {

    const http = require('http');

    Vue.component('include', {
        template: '<div :class="implClass"></div>',
        props: {
            src: String,
            cssClass: String
        },
        data() {
            return {
                loading: true
            };
        },
        methods: {
            loaded(ok) {
                this.loading = false;
            }
        },
        computed: {
            implClass() {
                return `include ${this.cssClass || ''} ${this.loading ? 'loading' : ''}`;
            }
        },
        mounted() {
            if (this.src) {
                http.load(this.src, this.$el).then(this.loaded);
            }
        },
        destroyed() {
            let fc = this.$el.firstElementChild;
            if (fc && fc.__vue__)
                fc.__vue__.$destroy();
        },
        watch: {
            src: function (newUrl, oldUrl) {
                this.loading = true;
                http.load(newUrl, this.$el).then(this.loaded);
            }
        }
    });
})();