(function () {

    Vue.component('validator', {
        props: ['invalid', 'errors'],
        template: '<span v-if="invalid" class="validator"><ul><li v-for="err in errors" v-text="err.msg" :class="err.severity"></li></ul></span>',
    });

})();