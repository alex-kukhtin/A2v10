(function () {

    const cmn = require('std:datamodel');

    app.modules['std:testdata'] = {
        createCustomer,
        createCustomerArray,
        createDocument
    };

    function createCustomer(source, template) {
        function TCustomer(source, path, parent) {
            cmn.createObject(this, source, path, parent);
        }

        // metadata
        cmn.defineObject(TCustomer, {
            props: {
                Id: Number,
                Name: String,
                Amount: Number
            },
            $id: 'Id'
        }, /* array item */ false);

        let ctors = {
            TCustomer
        };

        cmn.implementRoot(TCustomer, template, ctors);

        return new TCustomer(source);
    }

    function createCustomerArray(source, template) {

        function TCustomer(source, path, parent) {
            cmn.createObject(this, source, path, parent);
        }

        function TRoot(source) {
            cmn.createObject(this, source, '', this);
        }

        function TCustomerArray(source, path, parent) {
            return cmn.createArray(source, path, TCustomer, TCustomerArray, parent);
        }

        // metadata
        cmn.defineObject(TCustomer, {
            props: {
                Id: Number,
                Name: String,
                Amount: Number
            }
        }, /* array item */ true);

        cmn.defineObject(TRoot, {
            props: {
                Customers: TCustomerArray
            }
        }, /* array item */ false);

        let ctors = {
            TCustomer,
            TRoot
        };

        cmn.implementRoot(TRoot, template, ctors);

        return new TRoot(source);
    }

    function createDocument(source, template) {
        function TDocument(source, path, parent) {
            cmn.createObject(this, source, path, parent);
        }

        function TEntity(source, path, parent) {
            cmn.createObject(this, source, path, parent);
        }

        function TEntityArray(source, path, parent) {
            return cmn.createArray(source, path, TEntity, TEntityArray, parent);
        }

        function TRow(source, path, parent) {
            cmn.createObject(this, source, path, parent);
        }

        function TRowArray(source, path, parent) {
            return cmn.createArray(source, path, TRow, TRowArray, parent);
        }

        function TRoot(source) {
            cmn.createObject(this, source, '', this);
        }

        // metadata
        cmn.defineObject(TDocument, {
            props: {
                Id: Number,
                'Date': Date,
                Rows: TRowArray
            }
        }, /* array item */ false);

        cmn.defineObject(TEntity, {
            props: {
                Id: Number,
                Name: String,
                Memo: String
            }
        }, /* array item */ false);

        cmn.defineObject(TRow, {
            props: {
                Id: Number,
                Qty: Number,
                Price: Number,
                Sum: Number,
                Entity: TEntity
            }
        }, /* array item */ true);

        cmn.defineObject(TRoot, {
            props: {
                Document: TDocument,
                Entities: TEntityArray
            }
        }, /* array item */ false);

        let ctors = {
            TDocument,
            TRow,
            TEntity,
            TRoot
        };

        cmn.implementRoot(TRoot, template, ctors);

        return new TRoot(source);
    }

})();