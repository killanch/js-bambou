import NUAttribute from './NUAttribute';
import NUEntity from './NUEntity';
import NUValidator from './NUValidator';

class CustomValidator1 extends NUValidator {
    validate() {
        if (this.attr5 && !this.attr4) {
            return 'attr4 must be set when attr5 is true';
        }
        return undefined;
    }
}

class CustomValidator2 extends NUValidator {
    validate() {
        if (this.attr5 && this.attr3 !== 'C') {
            return 'attr3 must be C when attr5 is true';
        }
        return undefined;
    }
}

class CustomValidator3 extends NUValidator {
    validate(...args) {
        if (this.attr6 !== args[0].attr6) {
            return `thatEntity1 attr6 match failed, ${this.attr6} != ${args[0].attr6}`;
        }
        if (this.attr6 !== args[1].attr6) {
            return `thatEntity2 attr6 match failed, ${this.attr6} != ${args[1].attr6}`;
        }
        return undefined;
    }
}

class MyEntity extends NUEntity {
    static attributeDescriptors = {
        ...NUEntity.attributeDescriptors,
        attr1: new NUAttribute({ localName: 'attr1', remoteName: 'ATTR1', attributeType: NUAttribute.ATTR_TYPE_STRING }),
        attr2: new NUAttribute({ localName: 'attr2', attributeType: NUAttribute.ATTR_TYPE_STRING }),
        attr3: new NUAttribute({ localName: 'attr3', remoteName: 'ATTR3', attributeType: NUAttribute.ATTR_TYPE_ENUM, isRequired: true, choices: ['A', 'B', 'C'] }),
        attr4: new NUAttribute({ localName: 'attr4', attributeType: NUAttribute.ATTR_TYPE_STRING, minLength: 3, maxLength: 6 }),
        attr5: new NUAttribute({ localName: 'attr5', attributeType: NUAttribute.ATTR_TYPE_BOOLEAN }),
        attr6: new NUAttribute({ localName: 'attr6', attributeType: NUAttribute.ATTR_TYPE_NUMBER }),
    }
    constructor() {
        super();
        this.defineProperties({
            attr1: null,
            attr2: null,
        });
        this.registerValidator(new CustomValidator1('customValidator1'));
        this.registerValidator(new CustomValidator2('customValidator2'));
    }

    get RESTName() {
        return 'childentity';
    }
}

// test validate mandatory attribute, choice, min length, max length
it('attribute validations', () => {
    const myEntity = new MyEntity();
    myEntity.ID = 'xyz123';
    let isValid = myEntity.isValid();
    const errors = myEntity.validationErrors;
    expect(isValid).toEqual(false);
    expect(errors.get('attr3').description).toEqual('This value is mandatory');
    myEntity.attr3 = 'Z';
    isValid = myEntity.isValid();
    expect(isValid).toEqual(false);
    expect(errors.get('attr3').description).toEqual('Allowed values are A,B,C, but value provided is Z');
    myEntity.attr3 = 'B';
    isValid = myEntity.isValid();
    expect(isValid).toEqual(true);
    expect(errors.get('attr3')).toEqual(undefined);
    myEntity.attr4 = 'ab';
    isValid = myEntity.isValid();
    expect(isValid).toEqual(false);
    expect(errors.get('attr4').description).toEqual('Minimum length should be 3, but is 2');
    myEntity.attr4 = 'abcdefgh';
    isValid = myEntity.isValid();
    expect(isValid).toEqual(false);
    expect(errors.get('attr4').description).toEqual('Maximum length should be 6, but is 8');
    myEntity.attr4 = 123;
    isValid = myEntity.isValid();
    expect(isValid).toEqual(false);
    expect(errors.get('attr4').description).toEqual('Data type should be string, but is number');
    myEntity.attr4 = 'abcdef';
    isValid = myEntity.isValid();
    expect(isValid).toEqual(true);
    expect(errors.get('attr4')).toEqual(undefined);
});


it('custom validations', () => {
    const myEntity = new MyEntity();
    myEntity.ID = 'xyz123';
    myEntity.attr3 = 'B';
    let isValid = myEntity.isValid();
    myEntity.attr5 = true;
    isValid = myEntity.isValid();
    const errors = myEntity.validationErrors;
    expect(isValid).toEqual(false);
    expect(errors.get('customValidator1')).toEqual('attr4 must be set when attr5 is true');
    expect(errors.get('customValidator2')).toEqual('attr3 must be C when attr5 is true');
    myEntity.attr4 = 'value4';
    myEntity.attr3 = 'C';
    isValid = myEntity.isValid();
    expect(isValid).toEqual(true);
    const thatEntity1 = new MyEntity();
    thatEntity1.attr6 = 111;
    const thatEntity2 = new MyEntity();
    thatEntity2.attr6 = 222;
    myEntity.attr6 = 333;
    myEntity.registerValidator(new CustomValidator3('customValidator3'), thatEntity1, thatEntity2);
    isValid = myEntity.isValid();
    expect(isValid).toEqual(false);
    expect(errors.get('customValidator3')).toEqual('thatEntity1 attr6 match failed, 333 != 111');
    thatEntity1.attr6 = 333;
    isValid = myEntity.isValid();
    expect(isValid).toEqual(false);
    expect(errors.get('customValidator3')).toEqual('thatEntity2 attr6 match failed, 333 != 222');
    thatEntity2.attr6 = 333;
    isValid = myEntity.isValid();
    expect(isValid).toEqual(true);
});