// Copyright © 2015-2018 Alex Kukhtin. All rights reserved.

(function () {

    'use strict';

    const store = component('std:store');
    const eventBus = require('std:eventBus');

    const vm = new Vue({
        el: "#$(PageGuid)",
        store: store,
        data: {
        },
        computed: {
        },
        methods: {
            $close() {
                this.$store.commit("close");
            },
            $requery() {
                eventBus.$emit('requery');
            }
        },
        destroyed() {
        }
    });

})();