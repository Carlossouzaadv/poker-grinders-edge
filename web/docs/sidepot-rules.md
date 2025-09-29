# Canonical Side Pot Rules

## Core Principle

**Se um pot tem exatamente um jogador elegível, esse jogador ganha esse pot automaticamente.**

Elegibilidade é decidida NO MOMENTO da criação do slice do pot com base em:
1. `totalCommitted >= level` (jogador contribuiu o suficiente para esse nível de pot)
2. Status/timeline: jogador não fez fold antes da criação do pot

## Detailed Rules

### 1. Pot Creation (computeSidePots)
- Pots são criados em ordem crescente de commitment level
- Para cada level `L`, o pot slice contém: `(L - previous_level) × remaining_players_count`
- Elegibilidade é determinada no momento da criação:
  - Jogador deve ter `totalCommitted >= L`
  - Jogador não deve ter folded antes do momento da criação do pot

### 2. Pot Distribution (distributePots)
- **Single Eligible Player Rule**: Se `pot.eligible.length === 1`, esse jogador ganha automaticamente
- **Multi Eligible Player Rule**: Se `pot.eligible.length > 1`, compare apenas entre jogadores elegíveis
- **Zero Eligible Players**: ANOMALY - deve ser detectado e logado, não deve ocorrer em operação normal

### 3. Mathematical Invariants
- `sum(all_pot_amounts) === sum(totalCommitted)` (antes da distribuição)
- `sum(all_payouts) === sum(all_pot_amounts)` (após distribuição)
- Remainder cents são distribuídos deterministicamente (lowest seat index)

### 4. Fold Timing Rules
- Se um jogador folda ANTES da criação de um pot slice, ele não é elegível para esse slice
- Se um jogador folda DEPOIS da criação de um pot slice, ele permanece elegível para esse slice
- Tie-breaker: fold no mesmo timestamp que criação do pot → jogador NÃO elegível

### 5. Anomaly Handling
- Anomalias devem ser detectadas e logadas com full debug dump
- Default behavior: throw exception (fail-fast)
- Optional: `ALLOW_FALLBACK_ON_ANOMALY=true` permite fallback controlado com logging

## Examples

### Single Eligible Player (200-chip case)
```
Players: A commits 159.69, B commits 161.69
Pot 0: Main pot (159.69 × 2 = 319.38) - eligible: [A, B]
Pot 1: Side pot (2.00) - eligible: [B only]

Result: B automatically wins Pot 1 regardless of showdown result
```

### Multi Eligible Players
```
Players: A, B, C all commit 100.00
Pot 0: Main pot (300.00) - eligible: [A, B, C]

At showdown: A wins with best hand
Result: A wins entire main pot
```

### Fold Timing
```
Players: A commits 50, B commits 100
A folds after committing but before B's extra commitment
Pot 0: Main pot (50 × 2 = 100) - eligible: [A, B]
Pot 1: Side pot (50) - eligible: [B only] (A folded before this level)

Result: B automatically wins Pot 1
```

## Implementation Notes

- All monetary values handled as integer cents internally
- Conversion to dollars only for display purposes
- Comprehensive logging for auditability
- Deterministic behavior ensures same inputs → same outputs
- Guards and assertions prevent mathematical inconsistencies