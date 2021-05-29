define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const module = {
        methods: {
            addNumber(x1, x2) {
                return x1 + x2;
            },
            addString(a, b) {
                return a + b;
            }
        }
    };
    exports.default = module;
});
