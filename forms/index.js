const forms = require('forms');
// create some shorts
const fields = forms.fields;
const validators = forms.validators;

const bootstrapField = function (name, object) {
    if (!Array.isArray(object.widget.classes)) { object.widget.classes = []; }

    if (object.widget.classes.indexOf('form-control') === -1) {
        object.widget.classes.push('form-control');
    }

    var validationclass = object.value && !object.error ? 'is-valid' : '';
    validationclass = object.error ? 'is-invalid' : validationclass;
    if (validationclass) {
        object.widget.classes.push(validationclass);
    }

    var label = object.labelHTML(name);
    var error = object.error ? '<div class="invalid-feedback">' + object.error + '</div>' : '';

    var widget = object.widget.toHTML(name, object);
    return '<div class="form-group">' + label + widget + error + '</div>';
};

const createProductForm = () => {
    // forms.create takes in one argument
    // it is an object that defines the form
    // the key will be the `name` of each form field
    // and the value will be an object that define the field's properties
    return forms.create({   
        name: fields.string({
            required: true,
            errorAfterField: true
        }),
        cost:fields.string({
            required: true,
            errorAfterField: true,
            validators:[validators.integer()]
        }),
        description: fields.string({
            required: true,
            errorAfterField: true
        })
    })
}

module.exports = { createProductForm, bootstrapField}