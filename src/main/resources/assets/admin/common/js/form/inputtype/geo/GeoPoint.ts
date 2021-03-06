module api.form.inputtype.geo {

    import ValueTypes = api.data.ValueTypes;
    import ValueType = api.data.ValueType;
    import Value = api.data.Value;
    import Property = api.data.Property;

    // TODO: GeoPoint is not dependent on the content domain and should therefore be moved to api.form.inputtype.geo
    export class GeoPoint
        extends api.form.inputtype.support.BaseInputTypeNotManagingAdd {

        getValueType(): ValueType {
            return ValueTypes.GEO_POINT;
        }

        newInitialValue(): Value {
            return super.newInitialValue() || ValueTypes.GEO_POINT.newNullValue();
        }

        createInputOccurrenceElement(_index: number, property: Property): api.dom.Element {
            if (!ValueTypes.GEO_POINT.equals(property.getType())) {
                property.convertValueType(ValueTypes.GEO_POINT);
            }

            let geoPoint = new api.ui.geo.GeoPoint(property.getGeoPoint());

            geoPoint.onValueChanged((event: api.ValueChangedEvent) => {
                let value = api.util.GeoPoint.isValidString(event.getNewValue()) ?
                            ValueTypes.GEO_POINT.newValue(event.getNewValue()) :
                            ValueTypes.GEO_POINT.newNullValue();
                this.notifyOccurrenceValueChanged(geoPoint, value);
            });

            return geoPoint;
        }

        protected updateFormInputElValue(occurrence: api.dom.FormInputEl, property: Property) {
            const geoPoint = <api.ui.geo.GeoPoint> occurrence;
            geoPoint.setGeoPoint(property.getGeoPoint());
        }

        resetInputOccurrenceElement(occurrence: api.dom.Element) {
            let input = <api.ui.geo.GeoPoint> occurrence;

            input.resetBaseValues();
        }

        valueBreaksRequiredContract(value: Value): boolean {
            return value.isNull() || !value.getType().equals(ValueTypes.GEO_POINT);
        }

        hasInputElementValidUserInput(inputElement: api.dom.Element) {
            let geoPoint = <api.ui.geo.GeoPoint>inputElement;
            return geoPoint.isValid();
        }
    }

    api.form.inputtype.InputTypeManager.register(new api.Class('GeoPoint', GeoPoint));
}
