// Copyright © 2015-2018 Alex Kukhtin. All rights reserved.

/*20180112-7089*/
/*components/selector.js*/

(function () {
    const popup = require('std:popup');

    const utils = require('std:utils');
    const eventBus = require('std:eventBus');

    const baseControl = component('control');

    Vue.component('a2-selector', {
        extends: baseControl,
        template: `
<div :class="cssClass()">
	<label v-if="hasLabel" v-text="label" />
    <div class="input-group">
		<validator :invalid="invalid" :errors="errors" :options="validatorOptions"></validator>
    </div>
	<span class="descr" v-if="hasDescr" v-text="description"></span>
</div>
`,
        props: {
            item: Object,
            prop: String,
            itemToValidate: Object,
            propToValidate: String,
        },
        data() {
            return {
                isOpen: false
            };
        },
        methods: {
            __clickOutside() {
                this.isOpen = false;
            }
        },
        mounted() {
            popup.registerPopup(this.$el);
            this.$el._close = this.__clickOutside;
        },
        beforeDestroy() {
            popup.unregisterPopup(this.$el);
        }
    });
})();