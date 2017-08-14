(function() {


    let textBoxTemplate =
`<div :class="cssClass">
    <input v-model.lazy="item[prop]" :class="inputClass"/>
    <validator :invalid="invalid" :errors="errors"></validator>
    <span>{{path}}</span>
    <button @click="test">*</button>
</div>
`;
    let baseControl = require('control').control;

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