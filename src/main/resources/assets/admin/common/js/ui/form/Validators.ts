module api.ui.form {
    import i18n = api.util.i18n;

    export class Validators {

        public static required(input: api.dom.FormInputEl): string {
            let value = input.getValue();
            return api.util.StringHelper.isBlank(value) ? i18n('field.value.required') : undefined;
        }

        public static validEmail(input: api.dom.FormInputEl): string {
            let regexEmail = /\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*/;
            let value = input.getValue();
            return !regexEmail.test(value) ? i18n('field.value.invalid') : undefined;
        }

        public static validUrl(input: api.dom.FormInputEl): string {
            let regexUrl =
                /^((http(s)?:\/\/.)?(www\.)?[a-zA-Z0-9][-a-zA-Z0-9@:%._\+~#=]{1,255})\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/;
            let value = input.getValue();
            return !regexUrl.test(value) ? i18n('field.value.invalid') : undefined;
        }
    }

}
