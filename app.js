class UI {
    constructor() {}

    static getInputValue(id) {
        return document.getElementById(id).value;
    }

    static getCheckboxValue(id) {
        return document.getElementById(id).checked;
    }
}

class Effectiveness {

    isDoublyIneffective = false;
    isNotVeryEffective = false;
    isNeutral = false;
    isVeryEffective = false;
    isDoublyEffective = false;

    constructor() {}

    calculateValue() {
        if (this.isDoublyIneffective) {
            return 0.25;
        }
        if (this.isNotVeryEffective) {
            return 0.5;
        }
        if (this.isNeutral) {
            return 1;
        }
        if (this.isVeryEffective) {
            return 2;
        }
        return 4; // doubly effective
    }

    static grabEffectiveness() {
        let effectiveness = new Effectiveness();
        effectiveness.isDoublyIneffective = UI.getCheckboxValue('doublyIneffective-radio');
        effectiveness.isNotVeryEffective = UI.getCheckboxValue('notVeryEffective-radio');
        effectiveness.isNeutral = UI.getCheckboxValue('neutral-radio');
        effectiveness.isVeryEffective = UI.getCheckboxValue('veryEffective-radio');
        effectiveness.isDoublyEffective = UI.getCheckboxValue('doublyEffective-radio');
        return effectiveness;
    }
}

class Modifier {

    effectiveness;
    isSTAB = false;
    isCritical = false;

    constructor() {}

    getValue() {
        let value = 1;
        if (this.isSTAB) {
            value *= 1.5;
        }
        if (this.isCritical) {
            value *= 2;
        }
        return value * this.effectiveness.calculateValue();
    }

}

class Inputs {

    yourDef;
    yourSpDef;

    theirLevel;
    theirPower;
    isPhysicalCategory;
    theirDamage;

    modifier;

    constructor() {
        this.yourDef = 0;
        this.yourSpDef = 0;
        this.theirLevel = 0;
        this.theirPower = 0;
        this.isPhysicalCategory = true;
        this.theirDamage = 0;
        this.modifier = new Modifier();
    }

    setYourDef(value) {
        this.yourDef = value;
        return this;
    }

    setYourSpDef(value) {
        this.yourSpDef = value;
        return this;
    }

    setTheirLevel(value) {
        this.theirLevel = value;
        return this;
    }

    setTheirPower(value) {
        this.theirPower = value;
        return this;
    }

    setIsPhysicalCategory(value) {
        this.isPhysicalCategory = value;
        return this;
    }

    setTheirDamage(value) {
        this.theirDamage = value;
        return this;
    }

    setEffectiveness(value) {
        this.modifier.effectiveness = value;
        return this;
    }

    setIsSTAB(value) {
        this.modifier.isSTAB = value;
        return this;
    }

    setIsCritical(value) {
        this.modifier.isCritical = value;
        return this;
    }

}

class Validator {

    constructor() {}

    validate(inputs) {
        let errors = [];
        this.validateDefense(inputs, errors);
        this.validateSpDef(inputs, errors);
        this.validateTheirLevel(inputs, errors);
        this.validateTheirPower(inputs, errors);
        this.validateTheirDamage(inputs, errors);
        return errors;
    }

    validateDefense(inputs, errors) {
        if (inputs.isPhysicalCategory && !this.isNumberBetween(inputs.yourDef, 1, 999)) {
            errors.push(this.wrongNumberMessage('Defense', 1, 999));
        }
    }

    validateSpDef(inputs, errors) {
        if (!inputs.isPhysicalCategory && !this.isNumberBetween(inputs.yourSpDef, 1, 999)) {
            errors.push(this.wrongNumberMessage('Sp. Def', 1, 999));
        }
    }

    validateTheirLevel(inputs, errors) {
        if (!this.isNumberBetween(inputs.theirLevel, 1, 100)) {
            errors.push(this.wrongNumberMessage('Level', 1, 100));
        }
    }

    validateTheirPower(inputs, errors) {
        if (!this.isNumberBetween(inputs.theirPower, 10, 500)) {
            errors.push(wrongNumberMessage('Power', 10, 500));
        }
    }

    validateTheirDamage(inputs, errors) {
        if (!this.isNumberBetween(inputs.theirDamage, 2, 999)) {
            errors.push(this.wrongNumberMessage('Damage', 2, 999));
        }
    }

    isNumberBetween(value, lowest, highest) {
        return value !== '' && !isNaN(value) && Number(value) >= lowest && Number(value) <= highest;
    }

    wrongNumberMessage(attribute, lowest, highest) {
        return attribute + ' has to be a number between ' + lowest + ' and ' + highest;
    }
}

class Calculator {

    constructor() {}

    calculate() {

        let inputs = new Inputs()
            .setYourDef(UI.getInputValue('your-def'))
            .setYourSpDef(UI.getInputValue('your-spdef'))
            .setTheirLevel(UI.getInputValue('their-level'))
            .setTheirPower(UI.getInputValue('their-power'))
            .setIsPhysicalCategory(UI.getCheckboxValue('physical-radio'))
            .setIsSTAB(UI.getCheckboxValue('isStab'))
            .setIsCritical(UI.getCheckboxValue('isCritical'))
            .setEffectiveness(Effectiveness.grabEffectiveness())
            .setTheirDamage(UI.getInputValue('their-dmg'));

        let errors = new Validator().validate(inputs);

        // TODO show errors

        if (errors.length === 0) {
            this.numberifyInputs(inputs);
            this.calculateStats(inputs);

        } else {
            console.log(errors);
        }
    }

    numberifyInputs(inputs) {
        inputs.yourDef = Number(inputs.yourDef);
        inputs.yourSpDef = Number(inputs.yourSpDef);
        inputs.theirLevel = Number(inputs.theirLevel);
        inputs.theirPower = Number(inputs.theirPower);
        inputs.theirDamage = Number(inputs.theirDamage);
    }

    calculateStats(values) {
        
        let modifier = values.modifier.getValue();

        let d = values.isPhysicalCategory ? values.yourDef : values.yourSpDef;
        let rs = 0.4 * values.theirLevel + 2;
        rs *= values.theirPower;
        rs = rs / (50 * d);
        let dmgMax = values.theirDamage + 0.99999999;
        let lsMin = values.theirDamage / modifier;
        lsMin -= 2;
        let lsMax = dmgMax / modifier;
        lsMax /= 0.85;
        lsMax -= 2;

        let aCurrentMin = Math.max(1, Math.floor(lsMin / rs));
        let aCurrentMax = Math.max(1, Math.ceil(lsMax / rs));

        let aBaseMin = (((aCurrentMin / 1.1) - 5) * 100 / values.theirLevel - 31) / 2;
        aBaseMin = Math.ceil(aBaseMin);
        let aBaseMax = (((aCurrentMax / 0.9) - 5) * 100 / values.theirLevel) / 2;
        aBaseMax = Math.floor(aBaseMax);

        let aPossibleMin = Math.max(1, Math.floor((((2 * aBaseMin) * values.theirLevel / 100) + 5) * 0.9));
        let aPossibleMax = Math.max(1, Math.floor((((2 * aBaseMax + 31) * values.theirLevel / 100) + 5) * 1.1));

        document.getElementById('aCurrentMin').innerHTML = aCurrentMin;
        document.getElementById('aCurrentMax').innerHTML = aCurrentMax;
        document.getElementById('aBaseMin').innerHTML = aBaseMin;
        document.getElementById('aBaseMax').innerHTML = aBaseMax;
        document.getElementById('aPossibleMin').innerHTML = aPossibleMin;
        document.getElementById('aPossibleMax').innerHTML = aPossibleMax;
    }

}

let applyButton = document.getElementById("apply-button");
applyButton.addEventListener('click', event => {
    new Calculator().calculate();
});
