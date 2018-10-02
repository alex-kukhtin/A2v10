// Copyright © 2015-2018 Alex Kukhtin. All rights reserved.

(function () {

	function Form() {
		// form properties
		this.Width = 150;
		this.Height = 200;
		this.Title = "Form title from JS";
	}

	Form.prototype.type = "Form";

	Form.prototype._meta_ = {
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
	};

	function Grid() {
		this.Rows = 5;
	}
	Grid.prototype.type = "Grid";

	Grid.prototype._meta_ = {
		Rows: {
			category: "Layout",
			type: "string"
		}
	};

	//*** TextBox
	function TextBox() {

	}
	TextBox.prototype.type = "TextBox";
	TextBox.prototype._meta_ = {
		Value: { category: "Text", type: "string" }
	};

	//*** Button
	function Button() {

	}
	Button.prototype.type = "Button";
	Button.prototype._meta_ = {
		Content: {category: "Text", type: "string"}
	};

	//*** CheckBox
	function CheckBox() {

	}

	CheckBox.prototype.type = "CheckBox";
	CheckBox.prototype._meta_ = {

	};

	designer.form.__registerElement(Form);
	designer.form.__registerElement(Grid);
	designer.form.__registerElement(TextBox);
	designer.form.__registerElement(Button);
	designer.form.__registerElement(CheckBox);
})();


