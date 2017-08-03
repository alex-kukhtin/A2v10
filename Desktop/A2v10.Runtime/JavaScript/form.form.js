(function () {

    function Form() {
        // form properties
        this.Width = 150;
        this.Height = 200;
        this.Title = "Form title from JS";
	}

	Form.prototype.type = "Form";

	Form.prototype._meta_ = {
		properties: {
            Title: {
                category: "Appearance",
                type: "string",
                description: "Specifies the text that will be displayed in the form's title bar"
            },
			Width: {
				category: "Layout",
				type: "number",
				description: "Specifies the width of the element"
			},
			Height: {
				category: "Layout",
				type: "number",
				description: "Specifies the height of the element"
            }
		}
	};

    designer.form.__registerElement(Form);

})();


