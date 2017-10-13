/*20170824-7019*/
/*components/include.js*/

(function () {

    const http = require('std:http');
    const urlTools = require('std:url');

    Vue.component('include', {
        template: '<div :class="implClass"></div>',
        props: {
            src: String,
            cssClass: String,
            needReload: Boolean
        },
        data() {
            return {
                loading: true,
                currentUrl: '',
                _needReload: true
            };
        },
        methods: {
            loaded(ok) {
                this.loading = false;
            },
            requery() {
				if (this.currentUrl) {
                    // Do not set loading. Avoid blinking
                    http.load(this.currentUrl, this.$el).then(this.loaded);
                }
            }
        },
        computed: {
            implClass() {
                return `include ${this.cssClass || ''} ${this.loading ? 'loading' : ''}`;
            }
		},
        mounted() {
            if (this.src) {
				this.currentUrl = this.src;
                http.load(this.src, this.$el).then(this.loaded);
            }
        },
        destroyed() {
            let fc = this.$el.firstElementChild;
			if (fc && fc.__vue__) {
				//console.warn('desroy component');
				fc.__vue__.$destroy();
			}
        },
        watch: {
			src: function (newUrl, oldUrl) {
                if (newUrl.split('?')[0] === oldUrl.split('?')[0]) {
                    // Only the search has changed. No need to reload.
                    this.currentUrl = newUrl;
                }
                else if (urlTools.idChangedOnly(newUrl, oldUrl)) {
                    // Id has changed after save. No need to reload.
                    this.currentUrl = newUrl;
                }
				else {
					this.loading = true; // hides the current view
					this.currentUrl = newUrl;
                    //console.warn('src was changed. load');
					http.load(newUrl, this.$el).then(this.loaded);
				}
            },
            needReload(val) {
                // works like a trigger
                if (val) this.requery();
            }
        }
    });
})();