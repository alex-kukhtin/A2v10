(function () {
	"use strict";

	function Form() {
	}

	Form.prototype.type = "Form";

	Form.prototype.metadata = {
		properties: {
			Width: {
				category: "Layout",
				type: "string",
				description: "Specifies the width of the element"
			},
			Height: {
				category: "Layout",
				type: "string",
				description: "Specifies the height of the element"
			}
		}
	};

	designer.form.__registerElement(Form);
})();


