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

    isGen6Plus = false;

    constructor() {}

    getSTAB() {
        return this.isSTAB ? 1.5 : 1;
    }

    getCritical() {
        if (this.isCritical) {
            return this.isGen6Plus ? 1.5 : 2;
        }
        return 1;
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
        if (this.generation >= 6) {
            this.modifier.isGen6Plus = true;
        }
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

        if (errors.length === 0) {
            this.numberifyInputs(inputs);
            this.calculateStats(inputs);
            this.clearErrors();

        } else {
            this.showErrors(errors);
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

    showErrors(errors) {
        let errorHtml = '';
        errors.forEach(error => {
            errorHtml += '<li>' + error + '</li>';
        });
        document.getElementById('error-list').innerHTML = errorHtml;
    }

    clearErrors() {
        document.getElementById('error-list').innerHTML = '';
    }

    calculateDamage(inputs, testedAValue) {

        let range = new DamageRange();

        this.calculateInitialBaseDamage(range, inputs, testedAValue);

        switch (inputs.generation) {
            case 2:
                this.applyGen2Calculations(range, inputs);
                break;
            case 3:
                this.applyGen3Calculations(range, inputs);
                break;
            case 4:
                this.applyGen4Calculations(range, inputs);
                break;
            case 5:
                this.applyGen5Calculations(range, inputs);
                break;
            case 6:
                this.applyGen6Calculations(range, inputs);
                break;
        }
        
        return range;
    }

    calculateInitialBaseDamage(range, inputs, testedAValue) {
        range.damage = 2 * inputs.theirLevel / 5;
        range.damage = Math.floor(range.damage);
        
        range.damage += 2;
        range.damage *= inputs.theirPower * testedAValue;
        range.damage /= (inputs.isPhysicalCategory ? inputs.yourDef : inputs.yourSpDef);
        range.damage = Math.floor(range.damage);

        range.damage /= 50;
        range.damage = Math.floor(range.damage);
    }

    applyGen2Calculations(range, inputs) {
        range.damage = this.applyCriticalTruncate(range.damage, inputs);
        range.damage = this.addTwo(range.damage);
        range.damage = this.applySTABTruncate(range.damage, inputs);
        range.damage = this.applyTypeTruncate(range.damage, inputs);
        this.applyRandomTruncate(range);
    }

    applyGen3Calculations(range, inputs) {
        range.damage = this.addTwo(range.damage);
        range.damage = this.applyCriticalTruncate(range.damage, inputs);
        range.damage = this.applySTABTruncate(range.damage, inputs);
        range.damage = this.applyTypeTruncate(range.damage, inputs);
        this.applyRandomTruncate(range);
    }

    applyGen4Calculations(range, inputs) {
        range.damage = this.addTwo(range.damage);
        range.damage = this.applyCriticalTruncate(range.damage, inputs);
        this.applyRandomTruncate(range);
        range.minDamage = this.applySTABTruncate(range.minDamage, inputs);
        range.maxDamage = this.applySTABTruncate(range.maxDamage, inputs);
        range.minDamage = this.applyTypeTruncate(range.minDamage, inputs);
        range.maxDamage = this.applyTypeTruncate(range.maxDamage, inputs);
    }

    applyGen5Calculations(range, inputs) {
        range.damage = this.addTwo(range.damage);
        range.damage = this.applyCriticalGen5OrLater(range.damage, inputs);
        this.applyRandomRoundHalfDown(range);
        range.minDamage = this.applySTABRoundHalfDown(range.minDamage, inputs);
        range.maxDamage = this.applySTABRoundHalfDown(range.maxDamage, inputs);
        range.minDamage = this.applyTypeRoundHalfDown(range.minDamage, inputs);
        range.maxDamage = this.applyTypeRoundHalfDown(range.maxDamage, inputs);
    }

    applyGen6Calculations(range, inputs) {
        this.applyGen5Calculations(range, inputs); // critical value is handled by Modifier class
    }

    addTwo(damage) {
        return damage + 2;
    }

    applyCriticalTruncate(damage, inputs) {
        damage *= inputs.modifier.getCritical();
        damage = Math.floor(damage);
        return damage;
    }

    applyCriticalGen5OrLater(damage, inputs) {
        damage *= inputs.modifier.getCritical();
        damage = this.roundHalfDown(damage);
        return damage;
    }

    applyRandomTruncate(range) {
        range.minDamage = Math.floor(0.85 * range.damage);
        range.maxDamage = range.damage;
    }

    applyRandomRoundHalfDown(range) {
        range.minDamage = this.roundHalfDown(0.85 * range.damage);
        range.maxDamage = range.damage;
    }

    applySTABTruncate(damage, inputs) {
        damage *= inputs.modifier.getSTAB();
        damage = Math.floor(damage);
        return damage;
    }

    applySTABRoundHalfDown(damage, inputs) {
        damage *= inputs.modifier.getSTAB();
        damage = this.roundHalfDown(damage);
        return damage;
    }

    applyTypeTruncate(damage, inputs) {
        damage *= inputs.modifier.getTypeEffectiveness();
        damage = Math.floor(damage);
        return damage;
    }

    applyTypeRoundHalfDown(damage, inputs) {
        damage *= inputs.modifier.getTypeEffectiveness();
        damage = this.roundHalfDown(damage);
        return damage;
    }

    roundHalfDown(value) {
        return -Math.round(-value);
    }

}

class DamageRange {

    damage; // before random
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
