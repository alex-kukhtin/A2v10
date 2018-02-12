// Copyright © 2015-2018 Alex Kukhtin. All rights reserved.

/*20180212-7112*/
/* directives/disable.js */

Vue.directive('disable', {
    bind(el, binding, vnode) {

        function doDisable(event) {
            if (this.getAttribute('disabled')) {
                event.preventDefault();
                event.stopImmediatePropagation();
                return false;
            }
        }
        // with capture !!!
        el.addEventListener("click", doDisable, true);
    }
});

