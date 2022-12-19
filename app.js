function apply() {

    let input = {
        yourDef: document.getElementById('your-def').value,
        yourSpDef: document.getElementById('your-spdef').value,

        theirLevel: document.getElementById('their-level').value,
        theirPower: document.getElementById('their-power').value,
        modifier: document.getElementById('modifier').value,
        isPhysicalCategory: document.getElementById('physical-radio').checked,
        theirDamage: document.getElementById('their-dmg').value
    };

    let errors = validate(input);

    if (errors.length === 0) {
        let values = {
            def: Number(input.yourDef),
            spdef: Number(input.yourSpDef),
            level: Number(input.theirLevel),
            power: Number(input.theirPower),
            mod: Number(input.modifier),
            isPhys: input.isPhysicalCategory,
            dmg: Number(input.theirDamage)
        };
        calculateStats(values);

    } else {
        console.log(errors);
    }
}

function validate(input) {
    let errors = [];
    if (input.isPhysicalCategory && (input.yourDef === '' || isNaN(input.yourDef) || Number(input.yourDef) < 1 || Number(input.yourDef) > 999)) {
        errors.push('Defense has to be an integer between 1 and 999');
    }
    if (!input.isPhysicalCategory && (input.yourSpDef === '' || isNaN(input.yourSpDef) || Number(input.yourSpDef) < 1 || Number(input.yourSpDef) > 999)) {
        errors.push('Sp. Def has to be an integer between 1 and 999');
    }
    if (input.theirLevel === '' || isNaN(input.theirLevel) || Number(input.theirLevel) < 1 || Number(input.theirLevel) > 100) {
        errors.push('Level has to be an integer between 1 and 100');
    }
    if (input.theirPower === '' || isNaN(input.theirPower) || Number(input.theirPower) < 10 || Number(input.theirPower) > 500) {
        errors.push('Power has to be an integer between 10 and 500');
    }
    if (input.modifier === '' || isNaN(input.modifier) || Number(input.modifier) < 0.25 || Number(input.modifier) > 12) {
        errors.push('Modifier has to be a real number between 0.25 and 12');
    }
    if (input.theirDamage === '' || isNaN(input.theirDamage) || Number(input.theirDamage) < 2 || Number(input.theirDamage) > 999) {
        errors.push('Damage has to be an integer between 2 and 999');
    }
    return errors;
}

function calculateStats(values) {
    let d = values.isPhys ? values.def : values.spdef;
    let rs = 0.4 * values.level + 2;
    rs *= values.power;
    rs = rs / (50 * d);
    let dmgMax = values.dmg + 0.99999999;
    let lsMin = values.dmg / values.mod;
    lsMin -= 2;
    let lsMax = dmgMax / values.mod;
    lsMax /= 0.85;
    lsMax -= 2;

    let aCurrentMin = Math.max(1, Math.floor(lsMin / rs));
    let aCurrentMax = Math.max(1, Math.ceil(lsMax / rs));

    let aBaseMin = (((aCurrentMin / 1.1) - 5) * 100 / values.level - 31) / 2;
    aBaseMin = Math.ceil(aBaseMin);
    let aBaseMax = (((aCurrentMax / 0.9) - 5) * 100 / values.level) / 2;
    aBaseMax = Math.floor(aBaseMax);

    let aPossibleMin = Math.max(1, Math.floor((((2 * aBaseMin) * values.level / 100) + 5) * 0.9));
    let aPossibleMax = Math.max(1, Math.floor((((2 * aBaseMax + 31) * values.level / 100) + 5) * 1.1));

    document.getElementById('aCurrentMin').innerHTML = aCurrentMin;
    document.getElementById('aCurrentMax').innerHTML = aCurrentMax;
    document.getElementById('aBaseMin').innerHTML = aBaseMin;
    document.getElementById('aBaseMax').innerHTML = aBaseMax;
    document.getElementById('aPossibleMin').innerHTML = aPossibleMin;
    document.getElementById('aPossibleMax').innerHTML = aPossibleMax;
}

let applyButton = document.getElementById("apply-button");
applyButton.addEventListener('click', event => {
    apply();
});