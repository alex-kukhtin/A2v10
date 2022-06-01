#### Change Log

##### 01-jun-2022 build 7848

* **javascript (server) environment**: New ```require(fileName, prms, args)``` method is added.
* **model.json**: Added new ```IRenderer``` implementation. Now you can specify clr-type in the ```view``` property. 
* Bug fixes and other minor improvements.


##### 06-jun-2020 build 7672

* Add new User interface mode (Page).
* Add new server command (sendMail).
* `Role` Property added to `<DataGridColumn>` object.
* Bug fixes and other minor improvements.

##### 10 feb 2018 builds 7110
* `Splitter.MinWidth` is now supported for the second pane too (fixed [#12](../../issues/12)).
* Selector is not disabled for the read only data model. Fixed.
* Unable to clean the filter after reload the page. Fixed.

##### 09 feb 2018 builds 7107-7109
* Xaml. `<Radio>` element added.
* Xaml. `<FieldSet>` element added.
* Fix: `<Panel.Header>`, `<PropertyGridItem.Name>`, `<PropertyGrid.Content>` did not support localization. Fixed.
* Dialogs are now draggable (fixed [#2](../../issues/2)).

##### 07 feb 2018 builds 7106
* Grid Columns now support MinMax syntax.
* Elements `<Span>`, `<Text>` now support localization (fixed [#5](../../issues/5)).

##### 06 feb 2018 builds 7103-7105
* JavaScript template files now support localization.
* `<TextBox>` (multiline). `AutoSize` property added.
* `<Selector>` element added.
* `<Splitter>`. Height property added.

##### 05 feb 2018 build 7102
* AppDictionary added. It must be in ~\[Apps]\[AppKey]\Localization\*.[locale].txt.
* `<TreeView>`. `ExpandFirstItem` property added.

