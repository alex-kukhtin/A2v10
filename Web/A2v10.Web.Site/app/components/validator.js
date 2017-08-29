(function () {

    Vue.component('validator', {
        props: ['invalid', 'errors'],
        template: '<div v-if="invalid" class="validator"><span v-for="err in errors" v-text="err.msg" :class="err.severity"></span></div>',
    });

})();