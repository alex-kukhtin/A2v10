// Copyright © 2015-2018 Alex Kukhtin. All rights reserved.

// 20180125-7098
// components/selector.js

/* TODO:
    6. create element
    7. create element text
    8. scrollIntoView for template (table)
    9. 
*/

(function () {
    const popup = require('std:popup');
    const utils = require('std:utils');
    const platform = require('std:platform');

    const baseControl = component('control');

    const DEFAULT_DELAY = 300;

    Vue.component('a2-selector', {
        extends: baseControl,
        template: `
<div :class="cssClass()">
	<label v-if="hasLabel" v-text="label" />
    <div class="input-group">
        <input v-focus v-model="query" :class="inputClass" :placeholder="placeholder"
            @input="debouncedUpdate"
            @blur.stop="cancel"
            @keydown.stop="keyUp"
            :disabled="disabled" />
		<slot></slot>
		<validator :invalid="invalid" :errors="errors" :options="validatorOptions"></validator>
        <div class="selector-pane" v-if="isOpen" ref="pane">
            <slot name='pane' :items="items" :is-item-active="isItemActive" :item-name="itemName" :hit="hit">
                <ul class="selector-pane">
                    <li @mousedown.prevent="hit(itm)" :class="{active: isItemActive(itmIndex)}"
                        v-for="(itm, itmIndex) in items" :key="itmIndex" v-text="itemName(itm)">}</li>
                </ul>
                <a class="create-elem a2-hyperlink a2-inline"><i class="ico ico-plus"/> новый элемент</a>
            </slot>
        </div>
    </div>
	<span class="descr" v-if="hasDescr" v-text="description"></span>
</div>
`,
        props: {
            item: Object,
            prop: String,
            display: String,
            itemToValidate: Object,
            propToValidate: String,
            placeholder: String,
            delay: Number,
            minChars: Number,
            fetch: Function
        },
        data() {
            return {
                isOpen: false,
                loading: false,
                items: [],
                query: '',
                filter: '',
                current: -1
            };
        },
        computed: {
            $displayProp() {
                return this.display;
            },
            valueText() {
                return this.item ? this.item[this.prop][this.$displayProp] : '';
            },
            pane() {
                return {
                    items: this.items,
                    isItemActive: this.isItemActive,
                    itemName: this.itemName,
                    hit: this.hit
                };
            },
            debouncedUpdate() {
                let delay = this.delay || DEFAULT_DELAY;
                return utils.debounce(() => {
                    this.current = -1;
                    this.filter = this.query;
                    this.update();
                }, delay);
            }
        },
        watch: {
            valueText(newVal) {
                this.query = this.valueText;
            }
        },
        methods: {
            __clickOutside() {
                this.isOpen = false;
            },
            isItemActive(ix) {
                return ix === this.current;
            },
            itemName(itm) {
                return itm[this.$displayProp];
            },
            cancel() {
                this.query = this.valueText;
                this.isOpen = false;
            },
            keyUp(event) {
                if (!this.isOpen) return;
                switch (event.which) {
                    case 27: // esc
                        this.cancel();
                        break;
                    case 13: // enter
                        if (this.current == -1) return;
                        this.hit(this.items[this.current]);
                        break;
                    case 40: // down
                        event.preventDefault();
                        this.current += 1;
                        if (this.current >= this.items.length)
                            this.current = 0;
                        this.scrollIntoView();
                        break;
                    case 38: // up
                        event.preventDefault();
                        this.current -= 1;
                        if (this.current < 0)
                            this.current = this.items.length - 1;
                        this.scrollIntoView();
                        break;
                    default:
                        return;
                }
            },
            hit(itm) {
                Vue.set(this.item, this.prop, itm);
                this.query = this.valueText;
                this.isOpen = false;
            },
            scrollIntoView() {
                this.$nextTick(() => {
                    let pane = this.$refs['pane'];
                    if (!pane) return;
                    let elem = pane.querySelector('.active');
                    if (!elem) return;
                    let pe = elem.parentElement;
                    let t = elem.offsetTop;
                    let b = t + elem.offsetHeight;
                    let pt = pe.scrollTop;
                    let pb = pt + pe.clientHeight;
                    if (t < pt)
                        pe.scrollTop = t;
                    if (b > pb)
                        pe.scrollTop = b - pe.clientHeight;
                    //console.warn(`t:${t}, b:${b}, pt:${pt}, pb:${pb}`);
                });
            },
            update() {
                let text = this.query || '';
                let chars = +(this.minChars || 0);
                if (chars && text.length < chars) return;
                this.isOpen = true;
                this.loading = true;
                this.fetchData(text).then((result) => {
                    this.loading = false;
                    // first property from result
                    let prop = Object.keys(result)[0];
                    this.items = result[prop];
                });
            },
            fetchData(text) {
                let elem = this.item[this.prop];
                return this.fetch.call(elem, text);
                /*
                return new Promise((resolve, reject) => {
                    resolve(this.fetch.call(undefined, elem, text));
                });
                */
            }
        },
        mounted() {
            popup.registerPopup(this.$el);
            this.query = this.valueText;
            this.$el._close = this.__clickOutside;
        },
        beforeDestroy() {
            popup.unregisterPopup(this.$el);
        }
    });
})();