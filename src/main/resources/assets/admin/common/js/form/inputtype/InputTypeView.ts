module api.form.inputtype {

    import PropertyArray = api.data.PropertyArray;
    import Value = api.data.Value;
    import ValueType = api.data.ValueType;

    export interface InputTypeView {

        getValueType(): ValueType;

        getElement(): api.dom.Element;

        layout(input: api.form.Input, propertyArray: PropertyArray) : wemQ.Promise<void>;

        update(propertyArray: PropertyArray, unchangedOnly?: boolean): wemQ.Promise<void>;

        reset();

        refresh();

        newInitialValue(): Value;

        /*
         * Whether the InputTypeView it self is managing adding new occurrences or not.
         * If false, then this is expected to implement interface InputTypeViewNotManagingOccurrences.
         */
        isManagingAdd():boolean;

        /*
         * Invoked when input wants to edit embedded content
         */
        onEditContentRequest(listener: (content: api.content.ContentSummary) => void);

        /*
         * Invoked when input wants to edit embedded content
         */
        unEditContentRequest(listener: (content: api.content.ContentSummary) => void);

        /*
         * Returns true if focus was successfully given.
         */
        giveFocus(): boolean;

        displayValidationErrors(value: boolean);

        hasValidUserInput(recording?: api.form.inputtype.InputValidationRecording) : boolean;

        validate(silent: boolean) : InputValidationRecording;

        onValidityChanged(listener: (event: InputValidityChangedEvent)=>void);

        unValidityChanged(listener: (event: InputValidityChangedEvent)=>void);

        onValueChanged(listener: (event: ValueChangedEvent)=>void);

        unValueChanged(listener: (event: ValueChangedEvent)=>void);

        availableSizeChanged();

        onFocus(listener: (event: FocusEvent) => void);

        unFocus(listener: (event: FocusEvent) => void);

        onBlur(listener: (event: FocusEvent) => void);

        unBlur(listener: (event: FocusEvent) => void);

    }
}
