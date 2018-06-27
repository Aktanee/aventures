let heal = {
  name: 'Sainte lumière',
  description: 'Sort de soin cible unique',
  type: 'attaque',
  cost: 9,
  hitRate: '[stats:mental] + [potency:concentration]',
  results: {
    type: 'heal',
    baseHeal: '8'
  },
  armorReductions: 0
}

let dagueStrike = {
  name: 'Dague strike',
  description: 'Corps à corps',
  type: 'attaque',
  cost: 0,
  hitRate: '[stats:physique] + [potency:lightWeapon]',
  results: {
    type: 'attaque',
    baseWeaponDamage: '6d',
    addWeaponDamage: '1',
    weaponsHit: 2,
    addAttaqueDamage: {
      condition: "'[posture]' === 'agressif'",
      result: '1'
    }
  },
  armorReductions: '2(T)'
}

let bowStrike = {
  name: 'Bow strike',
  description: 'A distance',
  type: 'attaque',
  cost: '1 flèche',
  hitRate: '[stats:physique] + [potency:launchWeapon]',
  results: {
    type: 'attaque',
    baseWeaponDamage: '6d + 1',
    weaponsHit: 1,
  },
  armorReductions: '1(T)'
}

let customPc = {
  stats: {
    physique: 70,
    mental: 70,
    social: 55,
    chance: 72,
  },
  manaReduction: 3,
  potency: {
    lightWeapon: 25,
    launchWeapon: 15,
    concentration: 5,
    bonusEsquive: 40
  },
  abilities: [dagueStrike, bowStrike, heal]
}

function PC({ stats, abilities, manaReduction, potency }) {
  const pc = {
    stats,
    manaReduction,
    potency,
    posture: 'agressif'
  }

  console.log(`Number of abilities: ${abilities.length}`)
  abilities.forEach(abilitie => {
    abilitiesRapport(Object.assign({}, abilitie, { pc }))
  })
}

function abilitiesRapport({ name, description, hitRate, cost, results, armorReductions, pc }) {
  function returnValue(value) {
    const split = value.split(':')
    return split.reduce((memo, value) => {
      memo = memo || pc
      return memo[value]
    }, false)
  }

  function parseString(string) {
    const REGEX = /\[(.+?)\]/gm
    return string.replace(REGEX, (match, capture) => {
      return returnValue(capture, pc)
    })
  }

  function _calculateCost(cost, posture) {
    p = posture || pc.posture
    if (typeof cost === 'number' && p === 'focus') {
      return (cost - pc.manaReduction) / 2
    } else if (typeof cost === 'number') {
      return cost - pc.manaReduction
    } else {
      return cost
    }
  }

  function calculateCost(posture) {
    if (!cost || cost === 0) {
      return 'None'
    }



    return `${_calculateCost(cost, 'focus')}(focus) / ${_calculateCost(cost, 'agressif')}(agressif) / ${_calculateCost(cost, 'defensif')}(defensif)`
  }

  function calculateHitRate() {
    const parsedString = parseString(hitRate)
    return eval(parsedString)
  }

  function _handleDice(data) {
    const REGEX = /[0-9]d/gm
    const parsedString = parseString(data)
    const compileString = parsedString.replace(REGEX, (match) => {
      if (typeof match !== 'string') {
        return match
      }

      if (pc.posture === 'agressif') {
        return eval(match.replace('d', ''))
      } else {
        return eval(match.replace('d', '') / 2)
      }
    })
    return eval(compileString)
  }

  function handleDice(data) {
    if (typeof data === 'string') {
      return _handleDice(data)
    } else if (typeof data === 'object') {
      if (eval(parseString(data.condition))) {
        return _handleDice(data.result)
      } else {
        return 0
      }
    } else {
      return 0
    }

  }

  function calculateResult(result) {
    if (result.type === 'attaque') {
      const { baseWeaponDamage, addAttaqueDamage, addWeaponDamage, weaponsHit, type } = result
      pc.posture = 'agressif'
      const agressifResult = weaponsHit * (handleDice(baseWeaponDamage) + handleDice(addWeaponDamage)) + handleDice(addAttaqueDamage)

      pc.posture = 'defensif'
      const defensifResult = weaponsHit * (handleDice(baseWeaponDamage) + handleDice(addWeaponDamage)) + handleDice(addAttaqueDamage)

      pc.posture = 'focus'
      const focusResult = weaponsHit * (handleDice(baseWeaponDamage) + handleDice(addWeaponDamage)) + handleDice(addAttaqueDamage)

      return `${agressifResult}(Agressif) / ${defensifResult}(defensif) / ${focusResult}(focus)`
    } else if (result.type === 'heal') {
      const { baseHeal } = result
      pc.posture = 'agressif'
      const agressifResult = handleDice(baseHeal)

      pc.posture = 'defensif'
      const defensifResult = handleDice(baseHeal)

      pc.posture = 'focus'
      const focusResult = handleDice(baseHeal)

      return `${agressifResult}(Agressif) / ${defensifResult}(defensif) / ${focusResult}(focus)`
    }
  }

  console.log(`
    Name: ${name}
    Description: ${description}
    Hit Rate: ${calculateHitRate()}
    Cost: ${calculateCost()}
    Armor Reductions: ${armorReductions}
    Result: ${calculateResult(results)}
  `)
}

PC(customPc)


