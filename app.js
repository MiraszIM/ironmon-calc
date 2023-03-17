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

    getSTAB() {
        return this.isSTAB ? 1.5 : 1;
    }

    getCritical() {
        return this.isCritical ? 2 : 1;
    }

    getTypeEffectiveness() {
        return this.effectiveness.calculateValue();
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

    generation;

    constructor() {
        this.yourDef = 0;
        this.yourSpDef = 0;
        this.theirLevel = 0;
        this.theirPower = 0;
        this.isPhysicalCategory = true;
        this.theirDamage = 0;
        this.modifier = new Modifier();
        this.generation = 0;
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

    setGeneration(value) {
        this.generation = value;
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
            errors.push(this.wrongNumberMessage('Power', 10, 500));
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
            .setTheirDamage(UI.getInputValue('their-dmg'))
            .setGeneration(UI.getInputValue('generation'));

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
        inputs.generation = Number(inputs.generation);
    }

    calculateStats(inputs) {

        let calculatedStats = new CalculatedStats();
        let searchedForValues = new SearchedForValues();

        this.findBroadBoundaries(searchedForValues, inputs);
        this.findMinimumValue(searchedForValues, inputs, calculatedStats);
        this.findMaximumValue(searchedForValues, inputs, calculatedStats);
        this.calculateExtraStats(inputs, calculatedStats);
        this.setCalculatedStatsIntoTable(calculatedStats);
    }

    findBroadBoundaries(searchedForValues, inputs) {
        searchedForValues.testedAValue = 1;
        searchedForValues.lastLowerValue = 0;
        searchedForValues.lastHigherValue = 1000;
        let isRunning = true;
        do {

            let damageRange = this.calculateDamage(inputs, searchedForValues.testedAValue);

            if (damageRange.maxDamage < inputs.theirDamage) {
                searchedForValues.lastLowerValue = searchedForValues.testedAValue;
            } else if (damageRange.minDamage > inputs.theirDamage) {
                searchedForValues.lastHigherValue = searchedForValues.testedAValue;
                isRunning = false;
            }

            searchedForValues.testedAValue += 10;

        } while (isRunning);
    }

    findMinimumValue(searchedForValues, inputs, calculatedStats) {
        searchedForValues.testedAValue = searchedForValues.lastLowerValue + 1;
        let isRunning = true;
        do {
            let damageRange = this.calculateDamage(inputs, searchedForValues.testedAValue);
            if (damageRange.maxDamage >= inputs.theirDamage) {
                calculatedStats.aCurrentMin = searchedForValues.testedAValue;
                isRunning = false;
            }
            searchedForValues.testedAValue += 1;
        } while (isRunning);
        calculatedStats.aCurrentMin = Math.max(1, calculatedStats.aCurrentMin);
    }

    findMaximumValue(searchedForValues, inputs, calculatedStats) {
        searchedForValues.testedAValue = searchedForValues.lastHigherValue - 1;
        let isRunning = true;
        do {
            let damageRange = this.calculateDamage(inputs, searchedForValues.testedAValue);
            if (damageRange.minDamage <= inputs.theirDamage) {
                calculatedStats.aCurrentMax = searchedForValues.testedAValue;
                isRunning = false;
            }
            searchedForValues.testedAValue -= 1;
        } while (isRunning);
        calculatedStats.aCurrentMax = Math.max(1, calculatedStats.aCurrentMax);
    }

    calculateExtraStats(inputs, calculatedStats) {
        calculatedStats.aBaseMin = (((calculatedStats.aCurrentMin / 1.1) - 5) * 100 / inputs.theirLevel - 31) / 2;
        calculatedStats.aBaseMin = Math.ceil(calculatedStats.aBaseMin);
        calculatedStats.aBaseMin = Math.max(1, calculatedStats.aBaseMin);
        calculatedStats.aBaseMin = Math.min(255, calculatedStats.aBaseMin);

        calculatedStats.aBaseMax = (((calculatedStats.aCurrentMax / 0.9) - 5) * 100 / inputs.theirLevel) / 2;
        calculatedStats.aBaseMax = Math.floor(calculatedStats.aBaseMax);
        calculatedStats.aBaseMax = Math.max(1, calculatedStats.aBaseMax);
        calculatedStats.aBaseMax = Math.min(255, calculatedStats.aBaseMax);

        calculatedStats.aPossibleMin = Math.max(1, Math.floor((((2 * calculatedStats.aBaseMin) * inputs.theirLevel / 100) + 5) * 0.9));
        calculatedStats.aPossibleMin = Math.min(999, calculatedStats.aPossibleMin);

        calculatedStats.aPossibleMax = Math.max(1, Math.floor((((2 * calculatedStats.aBaseMax + 31) * inputs.theirLevel / 100) + 5) * 1.1));
        calculatedStats.aPossibleMax = Math.min(999, calculatedStats.aPossibleMax);
    }

    setCalculatedStatsIntoTable(calculatedStats) {
        document.getElementById('aCurrentMin').innerHTML = calculatedStats.aCurrentMin;
        document.getElementById('aCurrentMax').innerHTML = calculatedStats.aCurrentMax;
        document.getElementById('aBaseMin').innerHTML = calculatedStats.aBaseMin;
        document.getElementById('aBaseMax').innerHTML = calculatedStats.aBaseMax;
        document.getElementById('aPossibleMin').innerHTML = calculatedStats.aPossibleMin;
        document.getElementById('aPossibleMax').innerHTML = calculatedStats.aPossibleMax;
    }

    calculateDamage(inputs, testedAValue) {

        let minDamage;
        let maxDamage;

        let damage = 2 * inputs.theirLevel / 5;
        damage = Math.floor(damage);
        
        damage += 2;
        damage *= inputs.theirPower * testedAValue;
        damage /= (inputs.isPhysicalCategory ? inputs.yourDef : inputs.yourSpDef);
        damage = Math.floor(damage);

        damage /= 50;
        damage = Math.floor(damage);

        damage += 2;
        damage *= inputs.modifier.getCritical();
        damage = Math.floor(damage);
        
        if (inputs.generation === 3) {

            damage *= inputs.modifier.getSTAB();
            damage = Math.floor(damage);

            damage *= inputs.modifier.getTypeEffectiveness();
            damage = Math.floor(damage);

            minDamage = Math.floor(0.85 * damage);
            maxDamage = damage;
            
        } else if (inputs.generation === 4) {

            minDamage = Math.floor(0.85 * damage);
            maxDamage = damage;

            minDamage *= inputs.modifier.getSTAB();
            maxDamage *= inputs.modifier.getSTAB();

            minDamage = Math.floor(minDamage);
            maxDamage = Math.floor(maxDamage);

            minDamage *= inputs.modifier.getTypeEffectiveness();
            maxDamage *= inputs.modifier.getTypeEffectiveness();

            minDamage = Math.floor(minDamage);
            maxDamage = Math.floor(maxDamage);
            
        }
        
        return new DamageRange(minDamage, maxDamage);
    }

}

class DamageRange {

    minDamage;
    maxDamage;

    constructor(minDamage, maxDamage) {
        this.minDamage = minDamage;
        this.maxDamage = maxDamage;
    }
}

class CalculatedStats {

    aCurrentMin;
    aCurrentMax;
    aBaseMin;
    aBaseMax;
    aPossibleMin;
    aPossibleMax;

    constructor() {}
}

class SearchedForValues {

    testedAValue;
    lastLowerValue;
    lastHigherValue;

    constructor() {}
}

let calculateButton = document.getElementById("calculate-button");
calculateButton.addEventListener('click', event => {
    new Calculator().calculate();
});
