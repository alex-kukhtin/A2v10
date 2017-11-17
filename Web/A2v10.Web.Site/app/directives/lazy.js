/*20171117-7069*/
/* directives/lazy.js */

Vue.directive('lazy', {
    componentUpdated(el, binding, vnode) {
        let arr = binding.value;
        if (arr && arr.$loadLazy)
            arr.$loadLazy();
    }
});

