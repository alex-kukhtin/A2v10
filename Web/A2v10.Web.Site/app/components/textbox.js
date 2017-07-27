(function() {


    let baseControl = {
        computed: {
            path() {
                return this.item._path_ + '.' + this.prop;
            },
            valid() {
                return !this.invalid;
            },
            invalid() {
                let err = this.errors;
                return err && err.length > 0;
            },
            errors() {
                if (!this.item) return null;
                let root = this.item._root_;
                return root._validate_(this.item, this.path, this.item[this.prop]);
            },
            cssClass() {
                let cls = 'control' + (this.invalid ? ' invalid' : ' valid');
                return cls;
            },
            inputClass() {
                let cls = '';
                if (this.align !== 'left')
                    cls += 'text-' + this.align;
                return cls;
            }
        },
        methods: {
            test() {
                alert('from base control');
            }
        }
    };

    let textBoxTemplate =
`<div :class="cssClass">
    <input v-model.lazy="item[prop]" :class="inputClass"/>
    <validator :invalid="invalid" :errors="errors"></validator>
    <span>{{path}}</span>
    <button @click="test">*</button>
</div>
`;

    Vue.component('textbox', {
        extends: baseControl,
        template: textBoxTemplate,
        props: {
            item: Object,
            prop: String,
            align: { type: String, default: 'left' }
        }
    });
})();