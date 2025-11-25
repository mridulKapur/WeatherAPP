export class RulesEngine {
  constructor(rules) {
    this.rules = rules;
  }

  evaluate(facts) {
    const out = [];
    for (const r of this.rules) {
      if (r.when(facts)) out.push(r.message);
    }
    return out;
  }
}

