# Theft System Design

## Status And Authority

This document defines the original theft system from low-rank physical theft
through the last pre-demigod tier. It is the authoritative Systems design input
for a later contract and implementation plan.

The design borrows only the progression idea that theft can grow from objects
and deception into techniques and thoughts. It does not copy another work's
sequence names, individual powers, advancement rituals, or setting rules.

The current runtime implements only a small deterministic physical-theft
prototype. Its three-band formula and hard-coded actions are not authoritative
where they conflict with this document.

## Scope

This specification covers:

- Theft during ordinary exploration, planned infiltration, and battle.
- Money, documents, carried items, worn equipment, garments, and personal
  effects.
- A dedicated, non-explicit state for an adult character noticing that an
  intimate garment was stolen.
- Final item ownership and state changes on success, plus detection,
  attribution, escape, evidence, and target adaptation only after failure.
- A complete four-tier theft progression beginning at roughly the competence
  level of a highly trained physical thief and ending before demigod powers.
- Skill ranks, technique points, qualifying practice, tier trials, and
  anti-grind rules.
- Exact final-success, failure-detection, and failure-attribution formulas.
- UI, portrait, emotion, schedule, quest, and battle handoffs.
- Deterministic randomness and save requirements.

This specification does not grant:

- Automatic ownership of a defeated target's Gu.
- Theft from an aperture, soul, or otherwise inaccessible internal storage.
- Permanent theft of identity, innate ability, lifespan, luck, fate, time,
  causality, or rules.
- Any demigod-tier ability.
- Explicit nudity or sexualized presentation.
- Intimate-garment interactions for a character who is not explicitly an
  adult.

## Design Principles

1. Theft is the protagonist's primary play style, so a valid, prepared attempt
   usually succeeds.
2. Success is final: the target transfers to the player, the theft interaction
   closes, and the former holder cannot trace, pursue, or recover it through
   that theft incident.
3. Important theft is planned. Information, tools, Gu, timing, disguises, and
   escape routes create the advantage.
4. Detection, attribution, pursuit, evidence, heat, and anti-thief adaptation
   are failure consequences only.
5. Failure should create a new situation more often than it creates a dead end.
6. Low-value repetition cannot advance the whole skill tree.
7. Character cultivation limits the maximum target. Technique cannot ignore a
   full power gap.
8. Every removed equipped item changes the target state immediately.
9. Emotional and quest consequences are authored from concrete item loss. A
   generic embarrassment bonus must not replace stateful consequences.
10. The player may see high-tier branches in the UI, but demigod branches remain
   sealed and have no executable effect.

## Core Terms

- **Success:** Atomically transfer the selected target to the player, apply all
  declared missing-item or stolen-effect state, and close theft resolution.
- **Failure:** Transfer nothing, then resolve whether the attempt was detected
  and attributed.
- **Evidence:** A fact created by a failed attempt that can connect the method
  or player to that attempt.
- **Action window:** A temporary target or scene state that makes a slot
  accessible.
- **Strong action window:** Sleep, unconsciousness, restraint, severe
  distraction, isolation plus misdirection, or combat stagger.
- **Qualifying use:** A skill use against sufficient security and a distinct
  target that may count toward mastery.
- **Technique point:** A non-repeatable advancement resource awarded by authored
  theft milestones.
- **Theft tier:** The protagonist's conceptual theft progression. It is
  independent from Gu Master cultivation.

## Theft Actions And Support Actions

Only a final-success target action uses the success formula and transfers an
item or bounded payload:

- `theft_skill_pick_pocket`
- `theft_skill_unfasten`
- `theft_skill_strip_garment`
- `theft_skill_combat_sleight`
- `theft_skill_steal_momentum`
- `theft_skill_intercept_technique`
- `theft_skill_take_effect`
- `theft_skill_borrow_technique`
- `theft_skill_take_intent`
- `theft_skill_take_recent_memory`
- `theft_skill_take_dream_clue`
- `theft_skill_take_attention`
- `theft_skill_induce_misrecognition`

These are support actions or riders and never make an independent final-success
roll:

- Read Opening, Misdirect, Conceal Goods, Break Ward, Mask Presence, Forge
  Credential, and similar preparation skills modify eligibility or the final
  success formula.
- Talk Out, Escape, False Trail, and Frame Target resolve only inside a detected
  failed-attempt consequence.
- Swap Decoy is selected before a physical theft; on success it atomically
  consumes the prepared decoy and places it in the vacated slot.
- Break Tracking is selected as a rider on a marked physical theft; its essence
  is included in the pre-roll cost, its strain is included in the post-resolution
  strain total, it makes the declared mark eligible, and success removes that
  mark during transfer.
- Leave False Thought is selected only as a rider on Take Intent; its essence
  is included in the pre-roll cost, its strain is included in the
  post-resolution strain total, and on success it consumes the stolen intent
  payload while applying the chosen replacement thought. The combined attempt
  uses `targetPenalty = 25`.

A support skill earns qualifying use only when its declared support objective
commits. It cannot award a separate stolen item, success milestone, or random
reroll.

For an action plus any riders, eligibility and the success penalty use
`mentalStrain` at attempt start. Sum and deduct all essence before the roll.
Sum all listed strain but add that combined strain only after success or failure
resolves.

## Two-Axis Power Model

Theft power uses two independent axes.

### Theft Technique

The theft tier and individual skill ranks determine:

- Which theft actions are visible.
- Which item slots can be targeted.
- How accurately the player reads risk.
- How well the player creates action windows.
- How safely a failed attempt avoids evidence and pursuit.
- Whether the player can intercept temporary states, techniques, or thoughts.

### Cultivation And Gu

Cultivation and compatible Gu determine:

- The maximum target cultivation difference.
- Whether a seal, sensory defense, Gu effect, or tracking mark can be opposed.
- The amount of essence available for supernatural theft.
- The duration and storage limit of intercepted effects.
- Resistance to backlash.

A character can be an expert thief and still be unable to affect a much
stronger target directly.

### Rank-Gap Rules

For comparison, Gu ranks are ordered first and initial, middle, upper, and peak
stages are ordered `0` through `3` inside a rank. `minorStageDelta` is used only
when both characters have the same Gu rank.

| Target difference | Success penalty | Failure-detection rank-gap | Failed-evidence strength | Physical access |
| --- | ---: | ---: | ---: | --- |
| Lower rank or same rank at an equal/lower stage | 0 | 0 | +0 | All otherwise accessible external slots |
| Same rank, one or two minor stages higher | 5 | 5 | +5 | All otherwise accessible external slots |
| Same rank, three minor stages higher | 10 | 10 | +5 | Exposed external slots during a strong action window |
| Exactly one full Gu rank higher | 25 | 15 | +10 | Exposed external slots during a strong action window |
| Two or more full Gu ranks higher | Blocked | N/A | N/A | No direct body theft |
| Immortal, soul-bound, aperture-bound, or rule-protected | Blocked | N/A | N/A | No direct theft |

On failure, the evidence modifier is added to every evidence record produced by
the attempt before clamping that record to `0..50`. A successful theft produces
no traceable evidence.

Non-physical effect-interception and thought skills are stricter than physical
theft:

- An equal/lower target follows the skill's normal rule.
- A target one or two minor stages higher requires that skill at rank 3 and an
  explicit prepared action or mental window; essence cost increases by 2 and
  evidence strength increases by 10.
- A target three minor stages higher or one full rank higher is blocked.
- A skill-specific limit may be stricter, but never looser.

The UI must explain a blocked attempt instead of displaying a misleading low
percentage.

## Theft Progression

`Liangshang Hand` is a pre-game apprentice tier. The protagonist begins at
`Shadow Thief`, roughly the desired low-sequence competence reference.

| Design ID | Display name | Reference pace | Minimum cultivation | Maximum domain |
| --- | --- | --- | --- | --- |
| `theft_tier_apprentice` | 梁上手 | Pre-game | None | Loose unattended items |
| `theft_tier_shadow_thief` | 暗线贼 | Low sequence | Rank One | Physical items, garments, deception |
| `theft_tier_wardbreaker` | 破禁客 | Next low sequence | Rank One middle stage | Locks, seals, credentials, evidence |
| `theft_tier_technique_interceptor` | 截术师 | Mid sequence | Rank Two initial stage | Prepared actions and temporary effects |
| `theft_tier_thought_thief` | 窃念使 | Last pre-demigod | Rank Three initial stage | Current intent, attention, recent memory |
| `theft_tier_demigod_sealed` | 越界之门 | Sealed | Not defined | No executable abilities |

The game must not translate these tiers into a claim of cross-setting combat
equivalence.

## Skill Rank Rules

Every skill has rank `0` through `3`.

| Rank | Meaning |
| --- | --- |
| `0` | Locked |
| `1` | Learned; base action available |
| `2` | Reliable; wider targets or lower risk |
| `3` | Mastered; special application unlocked |

Rank progression is:

- `0 -> 1`: current theft tier unlocked and spend one technique point.
- `1 -> 2`: three qualifying uses across at least two target IDs, then spend one
  technique point.
- `2 -> 3`: five qualifying uses across at least three target IDs, complete the
  skill's mastery challenge, then spend two technique points.

Every owned rank has one persisted `skillRankLedger[skillId][rank]` record:

```text
source: starting_grant | purchased | scripted_grant
sourceId: start | purchaseEventId | milestoneId
refundablePoints: 0 | 1 | 2
```

A normal purchase records source `purchased` and its exact rank cost. Starting
ranks record `starting_grant` and zero refundable points.

A scripted reward may grant a specific rank only with an idempotent milestone
ID. For every newly covered rank, record `scripted_grant` and zero refundable
points. If that rank was already purchased, atomically convert its ledger record
to the scripted grant and immediately refund its recorded points. An existing
starting or scripted grant is unchanged. Reapplying the milestone changes
nothing.

A mastery challenge is attempted while the skill is rank 2. It must be
completable with rank-2 effects plus ordinary tools, Gu, allies, and
reconnaissance; it cannot require the rank-3 effect it unlocks.

All skills in an unlocked tier may be learned at rank 1 without a cross-skill
prerequisite. Technique-point spending has no free or mid-scene undo; the
controlled retraining rule below is the only respec.

### Starting Skills

The protagonist starts with:

| Skill | Rank |
| --- | ---: |
| `theft_skill_read_opening` | 2 |
| `theft_skill_pick_pocket` | 2 |
| `theft_skill_unfasten` | 1 |
| `theft_skill_strip_garment` | 1 |
| `theft_skill_misdirect` | 1 |
| `theft_skill_talk_out` | 1 |
| `theft_skill_conceal_goods` | 1 |
| `theft_skill_escape` | 1 |

Starting competence is intentionally high enough that theft feels like the
protagonist's defining ability. A new game starts with zero unspent technique
points and zero mental strain; the listed ranks are `starting_grant` records and
cost no points.

## Shadow Thief Skills

### `theft_skill_read_opening` - 察隙

| Rank | Effect |
| --- | --- |
| 1 | Reveal visible item categories and broad risk: safe, risky, or blocked. |
| 2 | Reveal accessible slots, current action windows, approximate final-success/failure-detection bands, and whether an unexplained decoy or tracking anomaly may exist. |
| 3 | Reveal exact numeric modifiers, decoy suspicion, tracking marks, and remaining window duration. |

Mastery challenge: use the rank-2 anomaly warning plus external reconnaissance
to identify a decoy and a tracking mark in one planned theft, then leave both
untouched.

### `theft_skill_pick_pocket` - 探囊

| Rank | Effect |
| --- | --- |
| 1 | Target one loose small item in a pocket, pouch, sleeve, or bag. |
| 2 | Target a concealed pocket or fastened pouch; reduce its item penalty by 5. |
| 3 | Take two tiny items in one action or one small item without increasing witness exposure. |

Mastery challenge: take two mission-relevant small items from two alert targets
within one planned heist and resolve both thefts successfully.

### `theft_skill_unfasten` - 解佩

| Rank | Effect |
| --- | --- |
| 1 | Target an exposed accessory, token, purse, pendant, or keepsake. |
| 2 | Target a fastened accessory or concealed waist item; reduce item penalty by 5. |
| 3 | Remove a marked mundane accessory or low-rank talisman; if acquisition fails, detection chance is reduced by 10. |

Mastery challenge: successfully remove a worn key token from an alert same-rank
target and use it to pass an access check.

### `theft_skill_strip_garment` - 褪装

| Rank | Effect |
| --- | --- |
| 1 | Target an outer garment during a strong action window. |
| 2 | Target a uniform, cloak, footwear, or an adult character's intimate garment during a strong action window. |
| 3 | Target one fastened external armor or garment layer; reduce garment item penalty by 10. |

This skill never removes the target's protected base-coverage layer.

Mastery challenge: steal a key worn garment, use its resulting disguise or
schedule disruption to complete an objective.

### `theft_skill_misdirect` - 引目

| Rank | Effect |
| --- | --- |
| 1 | Once per target per scene, create a short distraction worth `windowBonus = 10`. |
| 2 | The bonus becomes 15 and may redirect one ordinary witness. |
| 3 | The bonus becomes 20; choose the false direction or false object that receives attention. |

Mastery challenge: create a distraction that opens a theft window and an escape
route without spending money or starting combat.

### `theft_skill_talk_out` - 伪辞

| Rank | Effect |
| --- | --- |
| 1 | Conditional attribution chance is reduced by 10 after verbal suspicion. |
| 2 | Reduction becomes 20; one named suspicion may become general uncertainty. |
| 3 | Reduction becomes 30; confirmed attribution is delayed by one time segment unless hard evidence exists. |

The skill cannot contradict a trusted eyewitness, a validated technique trace,
or a theft tool found in the player's hand during a failed attempt.

Mastery challenge: escape a direct accusation while leaving the accuser
uncertain and without framing an innocent third party.

### `theft_skill_conceal_goods` - 藏赃

| Rank | Effect |
| --- | --- |
| 1 | Prepare a concealed carry slot; physical acquisition gains +5. |
| 2 | The bonus becomes +10; if acquisition fails, detection chance is reduced by 10. |
| 3 | The bonus becomes +15; on success the item may be routed directly to the player's safe stash. |

The acquisition bonus is part of `preparationBonus` and does not raise its
15-point cap.

Mastery challenge: complete a planned theft whose pre-resolution route includes
a body search, using concealed carry to pass the search and finish successfully.

### `theft_skill_escape` - 脱身

| Rank | Effect |
| --- | --- |
| 1 | After a detected failed attempt, gain one movement unit in the escape scene or one escape preparation token. |
| 2 | Ignore the first ordinary pursuit-zone penalty caused by that failure. |
| 3 | Choose between two authored exit routes and retain one unused preparation tool while escaping. |

Mastery challenge: escape a multi-zone pursuit caused by a failed theft attempt
with no ally left captured.

## Wardbreaker Skills

### `theft_skill_swap_decoy` - 调包

| Rank | Effect |
| --- | --- |
| 1 | Replace an item with a same-size decoy; discovery is delayed until normal inspection. |
| 2 | Reproduce appearance and weight closely enough for one casual use. |
| 3 | Reproduce mundane marks or packaging; routine inspection does not reveal the swap. |

The skill cannot reproduce a Gu, soul mark, bloodline response, or unique
supernatural effect.

Mastery challenge: complete a key-item swap that survives one casual use and is
exposed only by the later routine inspection.

### `theft_skill_break_ward` - 破禁

| Rank | Effect |
| --- | --- |
| 1 | Open mundane locks and mechanical restraints. |
| 2 | Suppress one same-rank seal, alarm, or simple Gu formation for one action. |
| 3 | Resolve two layered same-rank protections in one planned theft. |

Mastery challenge: enter and exit a protected storehouse without destroying the
lock, seal, or contents.

### `theft_skill_mask_presence` - 匿息

| Rank | Effect |
| --- | --- |
| 1 | Immediate detection chance is reduced by 10. |
| 2 | Reduction becomes 20 and applies to ordinary scent. |
| 3 | Reduction becomes 30 and applies to one same-rank supernatural sense. |

Mastery challenge: cross a guarded area using two different sensory defenses
without disabling either guard permanently.

### `theft_skill_false_trail` - 假迹

| Rank | Effect |
| --- | --- |
| 1 | Attribution chance is reduced by 10 through a false exit trace. |
| 2 | Reduction becomes 20 and one search team takes the wrong route. |
| 3 | Reduction becomes 30 and the false route persists for one time segment. |

Mastery challenge: redirect a pursuit while keeping an uninvolved civilian out
of danger.

### `theft_skill_forge_credential` - 假证

| Rank | Effect |
| --- | --- |
| 1 | Create a temporary mundane pass or copied signature. |
| 2 | Pass one routine identity checkpoint. |
| 3 | Support one mission route until a close acquaintance, bloodline test, or supernatural inspection occurs. |

Mastery challenge: enter and act inside a faction location using a credential
created from stolen evidence, then leave through a route that needs no second
identity checkpoint.

### `theft_skill_frame_target` - 嫁祸

| Rank | Effect |
| --- | --- |
| 1 | Add a plausible alternative suspect to the investigation. |
| 2 | Attach one supporting evidence token to that suspect. |
| 3 | Redirect initial faction suspicion, but only while the fabricated evidence remains credible. |

Disproved framing adds double heat and a long-lived method signature to the
player.

Mastery challenge: frame a hostile actor using truthful evidence of their own
misconduct, then survive the later review.

## Technique Interceptor Skills

All skills in this tier consume essence and require a compatible theft Gu
function. A content item supplies functional tags such as `perception`,
`interception`, `storage`, or `concealment`; this design does not invent final
Gu names before the canon catalog is available.

### `theft_skill_combat_sleight` - 战中妙手

| Rank | Effect |
| --- | --- |
| 1 | Target one exposed small item on an adjacent staggered, restrained, or distracted same-rank enemy. |
| 2 | Target a fastened external item or a target up to two minor stages higher. |
| 3 | Target one key external item on a target one full rank higher during a strong authored window. |

On success, item ownership is final even if the surrounding battle continues.

Mastery challenge: take a key item successfully in battle and use the resulting
state change to leave rather than defeat the owner.

### `theft_skill_steal_momentum` - 偷势

| Rank | Effect |
| --- | --- |
| 1 | Remove one prepared ordinary action from a same-rank target; gain one initiative token. |
| 2 | Hold the initiative token for two rounds or transfer it to an ally. |
| 3 | Affect a target up to two minor stages higher during an exposed preparation. |

Mastery challenge: steal an enemy's prepared action and use the gained
initiative to complete a non-damage objective.

### `theft_skill_intercept_technique` - 截术

| Rank | Effect |
| --- | --- |
| 1 | Interrupt one visible same-rank Gu activation; the target retains the Gu. |
| 2 | Store an echo for one round if the player owns a compatible Gu function. |
| 3 | Affect a target up to two minor stages higher; stored echo lasts two rounds. |

The player cannot reproduce an incompatible Gu ability.

Mastery challenge: interrupt three distinct Gu functions and safely discharge
or use each echo.

### `theft_skill_take_effect` - 夺效

| Rank | Effect |
| --- | --- |
| 1 | Transfer one ordinary short-lived buff or recovery tick from a same-rank target. |
| 2 | Transfer a same-rank protection effect for one round. |
| 3 | Transfer one exposed effect from a target up to two minor stages higher; backlash applies after expiry. |

Mastery challenge: take a protective effect, use it to survive one incoming
attack, and complete the original theft objective successfully.

### `theft_skill_borrow_technique` - 借技

| Rank | Effect |
| --- | --- |
| 1 | Borrow one observed mundane skill at novice quality for one scene. |
| 2 | Borrow it at the target's demonstrated quality, capped by the player's physical limits. |
| 3 | Borrow one compatible same-rank Gu activation pattern for one use; a compatible owned Gu is mandatory. |

Mastery challenge: finish a mission using a borrowed non-theft technique, then
return to the player's normal skill set without permanent gain.

### `theft_skill_break_tracking` - 断追

| Rank | Effect |
| --- | --- |
| 1 | Make an item with one mundane tracking mark eligible for the attempt. |
| 2 | Make an item with one same-rank aura or scent mark eligible for the attempt. |
| 3 | Make one non-soul-bound tracking connection up to two minor stages higher eligible. |

Mastery challenge: make a marked item eligible by suppressing its tracking
connection, then steal it successfully without destroying it.

At every rank, final success removes the eligible mark as part of ownership
transfer. Failure leaves it intact.

## Thought Thief Skills

Thought theft affects current mental activity, not permanent identity. Every use
adds mental strain. A failed detected use creates psychic evidence. It is
blocked against targets three minor stages higher or any full Gu rank higher.

### `theft_skill_take_intent` - 窃念

| Rank | Effect |
| --- | --- |
| 1 | Read and remove the target's strongest immediate intention for one round. |
| 2 | Hold the intention as a clue for one scene; target suffers brief hesitation. |
| 3 | Affect a target up to two minor stages higher during a prepared mental window. |

Mastery challenge: verify a stolen intention through later world behavior
without confronting the target.

### `theft_skill_take_recent_memory` - 摘忆

| Rank | Effect |
| --- | --- |
| 1 | Obtain one sensory fragment from the last few minutes. |
| 2 | Obtain one coherent recent event fragment, excluding deep secrets not present in current thought. |
| 3 | Select one of two recent-event categories during a prepared attempt. |

Mastery challenge: reconstruct a true event from three fragments and detect one
misleading interpretation.

### `theft_skill_take_dream_clue` - 偷梦

| Rank | Effect |
| --- | --- |
| 1 | Extract one image or emotion from a sleeping adult target's current dream. |
| 2 | Extract one symbolic clue and distinguish memory from fantasy. |
| 3 | Take one actionable clue while leaving the dream continuity intact. |

Mastery challenge: solve a mission lead from a dream clue without treating a
symbolic image as literal fact.

### `theft_skill_take_attention` - 夺目

| Rank | Effect |
| --- | --- |
| 1 | Remove attention from one object for one action. |
| 2 | Remove attention from one small zone for one round. |
| 3 | Redirect the stolen attention to a chosen plausible stimulus. |

Mastery challenge: pass a guarded checkpoint by moving attention rather than
disabling or harming the guard.

### `theft_skill_induce_misrecognition` - 错认

| Rank | Effect |
| --- | --- |
| 1 | Cause a brief mistake about one similar object. |
| 2 | Cause a brief mistake about direction or action source. |
| 3 | Cause a familiar target to misrecognize one prepared external role until contradictory evidence appears. |

This does not steal identity or alter records.

Mastery challenge: complete a guarded movement objective by causing a temporary
direction or action-source misrecognition, then leave before hard evidence
breaks it.

### `theft_skill_leave_false_thought` - 伪念

| Rank | Effect |
| --- | --- |
| 1 | Fill the removed intention with a simple neutral explanation. |
| 2 | Plant a plausible short-term explanation based on observed facts. |
| 3 | Delay recognition of the mental gap for one time segment. |

This cannot compel an action, rewrite values, or create lasting loyalty.

Mastery challenge: replace a stolen plan with a false explanation that the
target later rejects through their own reasoning.

## Mastery Challenge IDs

Every prose mastery challenge above has one stable design ID. Content and saves
must store the ID, not derive it from display text.

| Skill ID | Mastery challenge ID |
| --- | --- |
| `theft_skill_read_opening` | `mastery_theft_read_opening` |
| `theft_skill_pick_pocket` | `mastery_theft_pick_pocket` |
| `theft_skill_unfasten` | `mastery_theft_unfasten` |
| `theft_skill_strip_garment` | `mastery_theft_strip_garment` |
| `theft_skill_misdirect` | `mastery_theft_misdirect` |
| `theft_skill_talk_out` | `mastery_theft_talk_out` |
| `theft_skill_conceal_goods` | `mastery_theft_conceal_goods` |
| `theft_skill_escape` | `mastery_theft_escape` |
| `theft_skill_swap_decoy` | `mastery_theft_swap_decoy` |
| `theft_skill_break_ward` | `mastery_theft_break_ward` |
| `theft_skill_mask_presence` | `mastery_theft_mask_presence` |
| `theft_skill_false_trail` | `mastery_theft_false_trail` |
| `theft_skill_forge_credential` | `mastery_theft_forge_credential` |
| `theft_skill_frame_target` | `mastery_theft_frame_target` |
| `theft_skill_combat_sleight` | `mastery_theft_combat_sleight` |
| `theft_skill_steal_momentum` | `mastery_theft_steal_momentum` |
| `theft_skill_intercept_technique` | `mastery_theft_intercept_technique` |
| `theft_skill_take_effect` | `mastery_theft_take_effect` |
| `theft_skill_borrow_technique` | `mastery_theft_borrow_technique` |
| `theft_skill_break_tracking` | `mastery_theft_break_tracking` |
| `theft_skill_take_intent` | `mastery_theft_take_intent` |
| `theft_skill_take_recent_memory` | `mastery_theft_take_recent_memory` |
| `theft_skill_take_dream_clue` | `mastery_theft_take_dream_clue` |
| `theft_skill_take_attention` | `mastery_theft_take_attention` |
| `theft_skill_induce_misrecognition` | `mastery_theft_induce_misrecognition` |
| `theft_skill_leave_false_thought` | `mastery_theft_leave_false_thought` |

## Gu Functions, Essence, And Mental Strain

Shadow Thief and Wardbreaker actions cost no essence unless the player activates
a Gu bonus. An activated supporting Gu declares a cost from `1..4` essence and
only one acquisition Gu plus one concealment Gu may contribute to one attempt.

Technique Interceptor and Thought Thief actions require the following functional
tags. These are system tags, not final Gu names.

| Skill | Required Gu function tag(s) | Base essence | Mental strain |
| --- | --- | ---: | ---: |
| `theft_skill_combat_sleight` | `perception` or `interception` | 3 | 0 |
| `theft_skill_steal_momentum` | `interception` | 4 | 5 |
| `theft_skill_intercept_technique` | `perception`, `interception` | 5 | 10 |
| `theft_skill_take_effect` | `interception`, `storage` | 5 | 10 |
| `theft_skill_borrow_technique` | `perception`, `storage` | 6 | 10 |
| `theft_skill_break_tracking` | `concealment` | 4 | 5 |
| `theft_skill_take_intent` | `perception`, `storage` | 5 | 15 |
| `theft_skill_take_recent_memory` | `perception`, `storage` | 6 | 20 |
| `theft_skill_take_dream_clue` | `perception` | 4 | 15 |
| `theft_skill_take_attention` | `interception` | 5 | 15 |
| `theft_skill_induce_misrecognition` | `concealment`, `interception` | 6 | 20 |
| `theft_skill_leave_false_thought` | `concealment`, `storage` | 7 | 25 |

A comma means all listed tags are required. One Gu may supply multiple tags.
The `or` entry requires either tag. A one- or two-minor-stage-higher target adds
2 essence as defined by the rank-gap rule.

Eligibility is checked before spending. Once an eligible action commits, its
action-plus-rider essence total is deducted before any roll and is not refunded
on failure. The formula reads starting strain. Action-plus-rider strain is added
after the action resolves, whether it succeeds or fails, and is clamped to
`0..100`.

`mentalStrain` has deterministic thresholds:

| Starting strain | Effect on Technique Interceptor and Thought Thief actions |
| --- | --- |
| 0-39 | No modifier |
| 40-69 | Final success `-5`; failed detected use creates psychic or technique evidence `+5` |
| 70-89 | Final success `-15`; failed detected use creates related evidence `+15`; rank-3 variants disabled; apply `state_mental_backlash` |
| 90-100 | New supernatural theft actions are blocked |

Crossing into `70..89` applies `state_mental_backlash` once for that crossing.
The state clears only after strain falls below 70. Full sleep removes 20 strain;
an authored uninterrupted meditation action costs one time point and removes 10.
Ordinary travel, save/load, and battle end do not remove strain.

## Technique Points And Anti-Grind

Technique points are awarded only by unique milestone IDs.

| Milestone type | Points |
| --- | ---: |
| First completion of a new theft category or optional heist objective | 1 |
| Authored key heist or difficult evidence resolution | 2 |
| Theft-tier promotion trial | 3 |

Rules:

- A milestone is idempotent for the whole save.
- Target content declares `securityRating` from `0..3`. Practice for a skill at
  rank 1 requires security at least 1; practice for a skill at rank 2 requires
  security at least 2.
- The same target, item category, and method combination grants qualifying
  practice at most once per game day. The ledger key is
  `gameDay + targetId + itemCategory + skillId`.
- Routine theft may provide money or information after the practice cap, but no
  technique points.
- Failure may count as practice only when the player reaches execution and
  survives the consequence. It never completes a mastery challenge unless the
  challenge explicitly says so.
- Content must declare milestone and mastery-challenge IDs; runtime must not
  infer them from item value.

A content release that claims to support a tier must expose at least this many
new, mutually compatible technique points before its next cap:

| Supported progression | Newly obtainable points | Purpose |
| --- | ---: | --- |
| Shadow Thief promotion | 4 | Minimum named rank-2 gate |
| Wardbreaker promotion | 13 | 16-point gate minus 3 points from prior trial |
| Technique Interceptor promotion | 15 | 18-point gate minus 3 points from prior trial |
| Full Thought Thief mastery | 21 | 24 points to master six skills minus 3 points from prior trial |

Optional routes may provide more. Mutually exclusive quest branches cannot be
counted twice toward the minimum.

### Controlled Retraining

At a safe location, while no pursuit or tier trial is active, the player may
spend two world time points and five primeval stones to start one retraining
transaction. The transaction may lower any number of skills and refunds the
exact points previously spent on those removed ranks.

- For each skill, find the highest `starting_grant` or `scripted_grant` rank.
  Retraining cannot lower that skill below this grant floor.
- Only contiguous `purchased` ranks above the grant floor may be removed.
  Refund the sum of their persisted `refundablePoints`, then delete those rank
  records.
- A rank used by an active heist loadout cannot be lowered.
- Qualifying-use counts above the new rank are cleared; completed mastery IDs
  remain historical but do not bypass the use-count requirement when buying the
  rank again.
- A completed tier trial and unlocked tier never relock. Promotion gates are
  achievements checked at trial start, not a permanent loadout requirement.
- The cost, rank changes, cleared counters, and point refund commit atomically.

## Theft-Tier Promotion Gates

### Shadow Thief To Wardbreaker

All conditions are required:

1. `gate_stw_cultivation`: reach at least Rank One middle stage.
2. `gate_stw_core_skills`: raise `read_opening`, `pick_pocket`,
   `conceal_goods`, and `misdirect` to rank 2.
3. `gate_stw_support_skills`: raise any two other Shadow Thief skills to rank 2.
4. `gate_stw_worn_item`: steal one worn item from an alert same-rank target.
5. `gate_stw_infiltration`: complete one patrolled infiltration successfully.
6. `gate_stw_stolen_access`: use a successfully stolen key, token, or garment
   to pass an access check.
7. `gate_stw_failure_evidence`: escape one detected failed attempt and resolve
   its evidence chain.
8. `gate_stw_gu_functions`: own or have access to Gu supplying the `perception`
   and `concealment` function tags.
9. `gate_stw_trial`: complete `trial_theft_break_the_closed_room`.

### Wardbreaker To Technique Interceptor

All conditions are required:

1. `gate_wti_cultivation`: reach at least Rank Two initial stage.
2. `gate_wti_core_skills`: raise `break_ward`, `swap_decoy`, and
   `mask_presence` to rank 3.
3. `gate_wti_support_skills`: raise any two other Wardbreaker skills to rank 2.
4. `gate_wti_rank_gap_item`: take one key exposed item from a target one full Gu
   rank higher without obtaining it from post-battle loot.
5. `gate_wti_stolen_route`: use a stolen uniform, credential, or token to
   complete a mission route.
6. `gate_wti_defense_categories`: defeat physical-lock, active-guard, and
   Gu-ward defenses.
7. `gate_wti_failed_pursuit`: escape a multi-zone pursuit caused by a failed
   attempt.
8. `gate_wti_gu_functions`: own or have access to `perception`,
   `interception`, and `storage` Gu functions.
9. `gate_wti_trial`: complete `trial_theft_intercept_the_opportunity`.

### Technique Interceptor To Thought Thief

All conditions are required:

1. `gate_itt_cultivation`: reach at least Rank Three initial stage.
2. `gate_itt_core_skills`: raise `intercept_technique`, `steal_momentum`, and
   `break_tracking` to rank 3.
3. `gate_itt_support_skills`: raise any three other Technique Interceptor skills
   to rank 2.
4. `gate_itt_distinct_functions`: interrupt three distinct Gu functions from
   distinct target IDs.
5. `gate_itt_taken_effect`: take and survive one temporary effect from a
   same-rank or higher-minor-stage target.
6. `gate_itt_information_reward`: complete one key theft whose reward is
   information rather than a physical item.
7. `gate_itt_reconstruct_intent`: reconstruct one target's intended action from
   at least three independently stolen physical or information clues and verify
   it against later world behavior.
8. `gate_itt_backlash`: suffer and resolve one mental-backlash state.
9. `gate_itt_trial`: complete `trial_theft_take_the_unacted_plan`.

### Promotion Trial Resolution

A promotion condition ID is added to `completedPromotionConditionIds` when its
condition first commits. Conditions are latched achievements. Once all eight
non-trial IDs for a gate are present, add that trial ID to
`availableTierTrialIds`. Availability persists even after controlled retraining
or later stat changes. Trial completion adds its ninth gate ID and removes its
trial ID from the available list.

Common rules:

1. Starting a trial reads
   `ordinal = tierTrialAttemptCounterById[trialId] ?? 0`, creates
   `trialAttemptId = "trial-attempt:" + trialId + ":" + ordinal`, increments
   that persisted counter, and consumes its authored entry cost.
2. The trial uses normal injury, item, essence, strain, time, and failed-attempt
   consequence rules. Failure is not rolled back.
3. Saving and loading resumes the same attempt and random cursor.
4. Abandonment and failure set
   `tierTrialCooldownById[trialId] = currentGameDay + 1`; retry is enabled when
   `currentGameDay >= storedDay`. The player keeps their current tier.
5. Success atomically records the trial ID, unlocks the next tier, and awards
   exactly three technique points.
6. Repeating a completed trial grants no points, practice, or milestone.

`trial_theft_break_the_closed_room`:

- Setup: a designated ledger is inside a mundane locked room with one patrol,
  one witness route, and two discoverable entry routes.
- Required play: perform reconnaissance, enter without defeating a guard,
  acquire the ledger, and leave through a route different from the entry route.
- Success: the final ledger theft resolves successfully with no civilian injury;
  ownership transfers and the trial closes immediately.
- Failure: capture, abandonment, a failed final theft resolution, or defeating a
  guard to bypass the theft problem.

`trial_theft_intercept_the_opportunity`:

- Setup: a target exactly one Gu rank higher carries an exposed key item behind
  a mundane checkpoint and one same-rank Gu ward.
- Required play: pass the checkpoint with a stolen or forged credential,
  suppress rather than destroy the ward, create a strong action window, and
  choose a valid exit before committing the final theft.
- Success: the final key-item theft resolves successfully; ownership transfers,
  no pursuit is created, and the trial closes immediately.
- Failure: abandonment, destruction of the ward, failed theft resolution, or
  obtaining the item only as post-battle loot.

`trial_theft_take_the_unacted_plan`:

- Setup: three officers hold separate timing, route, and objective fragments;
  one officer prepares the action that commits the plan.
- Required play: steal all three fragments, use `steal_momentum` or
  `intercept_technique` on the prepared action, and choose the true objective
  before the plan executes.
- Success: identify the objective, prevent or exploit the plan through a
  non-lethal successful theft route; the trial closes immediately.
- Failure: choose a false objective, let the plan execute, obtain the answer
  through ordinary dialogue, or defeat the officers and loot the fragments.

### Demigod Gate

The `theft_tier_demigod_sealed` node is visible but permanently disabled in this
design. It has no advancement conditions, skills, formula modifiers, content
hooks, or save transition. A future approved specification must define it from
zero.

## Item And Equipment Contract

Every content-authored definition, instance, target, opportunity, action, skill,
gate, trial, and event ID used by theft must match:

```text
^[a-z][a-z0-9_]{0,63}$
```

Colon, comma, square brackets, plus, and byte `0x1f` are reserved for
runtime-constructed IDs and cannot occur in a content-authored component ID.
Constructed IDs below are not revalidated against the 64-character component
limit.

Every stealable item needs:

- Stable item-definition ID and item-instance ID.
- A constructed `successResolutionId`: `"unique:" + itemInstanceId` for a
  unique item, or
  `"renewable:" + opportunityId + ":" + spawnCycleOrdinal` for a renewable
  stack. `spawnCycleOrdinal` is a persisted unsigned integer.
- Display name.
- Original owner character or faction ID.
- Current holder and location.
- Equipment slot.
- Size and attachment difficulty.
- Visibility and concealment.
- Mundane and supernatural marks.
- Whether it is external, aperture-bound, soul-bound, or otherwise blocked.
- Whether it is unique, replaceable, a decoy, or a quest key.
- Failed-attempt evidence profile.
- Atomic `onSuccessfulTheft` and later `onReplaced` effects.

### Equipment Slots

Required design slots are:

- `slot_outerwear`
- `slot_uniform`
- `slot_armor`
- `slot_waist`
- `slot_footwear`
- `slot_accessory`
- `slot_weapon`
- `slot_pouch`
- `slot_external_gu_container`
- `slot_keepsake`
- `slot_intimate_garment`
- `slot_base_coverage`

`slot_base_coverage` is never stealable or removable.
`slot_external_gu_container` may contain only an unrefined, unowned, sealed, or
otherwise externally carried Gu that content explicitly marks stealable. A
refined Gu inside an aperture remains blocked.

### Attachment Penalties

| Item state | Item penalty |
| --- | ---: |
| Loose unattended item | 0 |
| Pocket or open pouch | 5 |
| Concealed pocket or closed pouch | 10 |
| Exposed accessory or outer garment | 15 |
| Fastened accessory, uniform, or footwear | 20 |
| Fastened armor layer | 25 |
| Adult intimate garment | 30 |
| Aperture-bound, soul-bound, or protected base coverage | Attempt blocked |

Content may add up to 10 additional difficulty for a unique construction but
must not exceed the rank-gap rules.

### Two-Item Pick Pocket

Pick Pocket rank 3 may create one composite target with exactly two items.

- Both items must be `tiny`, have the same holder, be available in the same
  action window, and be individually eligible.
- Validate capacity for both items, both uncompleted `successResolutionId`
  values, and every ordinary item restriction before charging cost.
- Sort the two item-instance IDs by ASCII code point and encode
  `itemOrEffectId = "composite[" + id1 + "," + id2 + "]"`.
- Sort the two component success IDs the same way and encode
  `successResolutionId = "multi[" + successId1 + "," + successId2 + "]"`.
- Because component IDs exclude comma and square brackets, both composite
  encodings are injective and can be parsed without ambiguity.
- `targetPenalty = min(30, max(componentTargetPenalty) + 5)`.
- `detectionAttachment = min(25, max(componentDetectionAttachment) + 5)`.
- Use the holder's one guard/rank-gap value and one set of preparation/Gu
  bonuses.
- Make one final-success roll. Success transfers both items and records the
  composite plus both component success IDs atomically; failure transfers
  neither and makes only one failure-detection chain.

There is no partial two-item result. Any duplicate, capacity failure, or
ineligible component blocks the composite attempt before cost.

## Bounded Payload Contract

A non-item final-success action atomically applies one source mutation and
creates one player-owned bounded payload. The source mutation is an effect of
success, not evidence and not a path back to the player.

Every payload stores:

- `payloadInstanceId = "payload:" + theftAttemptId + ":" + payloadTypeId`
- `payloadTypeId`
- `ownerId = "player"`
- `sourceTargetId`
- `sourceMutationId`
- `createdByTheftAttemptId`
- `remainingUses`
- `expiresAtRound`, `expiresAtScene`, or `permanentClue = true`
- One exact content fragment or compatible Gu-function payload

| Final-success target | Payload type ID | Source mutation ID | Player-owned bound |
| --- | --- | --- | --- |
| Prepared action / momentum | `payload_stolen_initiative` | `mutation_prepared_action_removed` | One initiative use; expires after one round, or two rounds at skill rank 2+ |
| Visible Gu activation | `payload_intercepted_activation` | `mutation_activation_cancelled` | Rank 1 is consumed immediately by the cancel; rank 2 stores one echo for one round; rank 3 for two rounds |
| Temporary effect | `payload_stolen_effect` | `mutation_effect_removed` | Rank 1: one immediate tick; rank 2: one round; rank 3: `min(originalRemainingRounds, 2)` rounds; never permanent |
| Observed technique | `payload_borrowed_technique` | `mutation_technique_exposed` | Mundane technique for one scene, or one compatible Gu-pattern use at rank 3; source cannot repeat that exact technique for one action |
| Current intent | `payload_stolen_intent` | `mutation_intent_gap` | One authored intent clue for one scene; source lacks that intent for one round |
| Recent memory fragment | `payload_memory_fragment` | `mutation_recent_memory_gap` | One permanent journal clue; source cannot recall that fragment for one scene |
| Dream image or emotion | `payload_dream_fragment` | `mutation_dream_fragment_faded` | One permanent journal clue; the source dream bridges over the removed fragment |
| Attention | `payload_stolen_attention` | `mutation_attention_gap` | One action at rank 1, one round at rank 2+, then expires |
| Recognition | `payload_recognition_mask` | `mutation_recognition_shifted` | Prepared external role until contradictory evidence or scene end |

Payload creation and source mutation are all-or-nothing. Expiry, consumption, or
natural restoration of a bounded source mutation is not recovery of a stolen
item and cannot create attribution. A payload cannot be sold, duplicated,
refreshed by save/load, or converted into a permanent ability unless a later
approved contract explicitly allows it.

A permanent journal-clue payload is written to the existing clue ledger and
then marked consumed; all other unexpired payloads remain in
`activeTheftPayloads`.

Leave False Thought is a rider rather than a payload row: it consumes
`payload_stolen_intent` in the same success transaction and changes the source
mutation to `mutation_intent_replaced_by_false_thought` for its rank-defined
duration.

## Adult Intimate-Garment Boundary

An intimate-garment slot exists only when:

- `settings.allowAdultIntimateTheft === true`. This player-controlled setting
  defaults to `false` in every new or migrated save.
- `character.isAdult === true`.
- The character content explicitly allows the slot.
- A protected base-coverage visual exists.
- The required emotion, portrait, dialogue, quest, combat, and fallback states
  exist.

If any condition is absent, the slot is not targetable and is not shown.
The slot is never a combat-theft target. External clothing, armor, accessories,
and pouches remain valid combat targets when their ordinary access rules are
met.

The dedicated successful-loss state is:

- Design emotion ID: `emotion_embarrassed_intimate_theft`
- Portrait state: `portrait_intimate_item_stolen_embarrassed`
- Sprite state: `sprite_base_coverage`
- Schedule state: `schedule_seek_cover_or_replacement`
- Dialogue state: `dialogue_state_intimate_theft_embarrassed`
- Quest state: `quest_state_target_missing_intimate_item`
- Combat state: `combat_state_embarrassed_intimate_theft`

On successful theft, the target's missing-item state and reaction apply
immediately in the same transaction:

- Apply `composure -= 20` once for that missing item.
- Apply `vigilance += 15` once for that missing item.
- Current ordinary schedule is interrupted.
- Public dialogue is restricted until cover or replacement is found.
- The authored quest may gain an infiltration, distraction, negotiation, or
  combat-advantage route.
- If combat begins before replacement, the combat state lasts two rounds:
  initiative order is reduced by 1 and accuracy by 10 percentage points.
- After cover or replacement is found, emotion transitions according to
  authored personality; it does not remain generically embarrassed forever.

Clamp composure to `-30..30` and vigilance to `0..100` after applying the
deltas.

The `successResolutionId` is added to `completedSuccessfulTheftIds`; ownership
and every missing-item delta above are idempotent. The target reacts to the
missing item but receives no information that can identify, trace, pursue, or
recover it from the player.

The +15 vigilance is emotional presentation only. It cannot modify theft slot
visibility, access, `targetGuard`, success chance, failure detection,
attribution, evidence, heat, or target adaptation.

The Settings UI exposes `allowAdultIntimateTheft` as a toggle. Turning it off
after a prior success does not restore ownership or rewind world state; it hides
future intimate targets and uses the protected base-coverage plus generic
missing-garment fallback instead of the dedicated portrait/dialogue.

This state is presented as a consequential theft and not as explicit sexual
content.

## Theft Contexts

### Opportunistic Theft

Use for pockets, loose objects, exposed tokens, and simple distractions.

- One inspect action.
- One target action.
- One final success check. On success, transfer and close immediately.
- Detection and attribution are checked only after failure. A pursuit board may
  open only from that failed-attempt branch.

### Planned Infiltration

Use for guarded rooms, stores, key garments, faction records, Gu materials, and
other authored objectives.

Required phases:

1. Reconnaissance.
2. Preparation loadout.
3. Entry.
4. Access the target and choose a valid exit.
5. Commit the final theft-and-exit resolution.
6. Close on success, or resolve failed-attempt consequences.

Each phase commits state atomically. Steps 1 through 4 are preparation and never
display "theft succeeded." Success exists only at step 5 and ends the theft
interaction.

### Combat Theft

Use only for an external item or temporary state exposed during battle.

- The target must be staggered, restrained, distracted, preparing a technique,
  or affected by another explicit action window.
- Physical item theft requires adjacency. No pre-demigod skill in this design
  permits remote physical acquisition.
- A successful physical theft transfers final ownership immediately. The target
  cannot recover it even if the surrounding battle continues.
- Victory does not automatically grant every carried item.
- A later battle defeat does not reverse a completed successful theft.
- A failed combat theft transfers nothing and may change the enemy's battle
  behavior according to the failure result.

### Post-Battle Search

Post-battle search is ordinary loot or recovery, not a theft skill use. It
awards no theft practice, milestone, or mastery progress.

### Time And Turn Costs

| Committed action | Cost |
| --- | --- |
| Open/close inspect or loadout UI | 0 world time |
| Opportunistic theft attempt | 1 world time point |
| Planned reconnaissance action | 1 world time point |
| Choose preparation loadout | 0 world time |
| Planned entry phase | 1 world time point |
| Planned access and exit preparation phase | 1 world time point |
| Planned final theft-and-exit resolution | 1 world time point |
| Combat theft | 1 battle action and the listed essence; 0 additional world time |
| Post-battle search | Included in battle settlement; 0 additional world time |

Each cost is charged exactly once when its phase commits, including a failed
eligible phase. Rejected or blocked input costs nothing. A chase or follow-up
dialogue created by failure uses its own ordinary action costs; opening it does
not add a hidden theft surcharge. Battle settlement remains the only source of
persistent world time for the battle as a whole.

## Action Windows

| Window | Modifier | Strength |
| --- | ---: | --- |
| Item unattended | +20 | Strong |
| Target asleep or unconscious | +20 | Strong |
| Target restrained | +20 | Strong |
| Target severely distracted | +15 | Strong |
| Target isolated plus successful misdirection | +15 plus skill bonus | Strong |
| Target casually distracted | +10 | Ordinary |
| Target in conversation with another character | +5 | Ordinary |
| Combat stagger | +10 | Strong for exposed combat items |
| Target alert with no distraction | 0 | Ordinary |
| Target actively guarding the item | -25 | Not strong |

An adult intimate garment requires `strip_garment >= 2` and a strong action
window.

## Resolution Formula

Theft uses one final success check. If and only if it fails, the system checks
failure detection and then, when detected, failure attribution. A success
cannot become detected, attributed, hot, contested, pursued, or recovered
later.

### Final Success

```text
theftSuccessChance =
  clamp(
    70
    + relevantSkillRank * 8
    + preparationBonus
    + actionWindowModifier
    + theftGuBonus
    - targetPenalty
    - targetGuard
    - rankGapPenalty
    - mentalStrainPenalty,
    minimumEligibleChance,
    95
  )
```

Inputs:

- `relevantSkillRank` is the rank of the action skill used on this item or
  effect, never a general character level.
- `preparationBonus` is clamped to `0..15`: add 1 per verified relevant
  reconnaissance fact up to 5, add 5 for the correct prepared tool, add 5 for a
  valid disguise or credential, and add the active Conceal Goods bonus.
- `actionWindowModifier` is taken once from the action-window table. The
  Misdirect skill's named bonus is added only for a window that it created.
- `theftGuBonus` is `0`, `5`, `10`, or `15` as declared by one activated
  compatible Gu. Multiple success bonuses do not stack.
- `targetPenalty` is the attachment penalty after explicit skill reductions for
  a physical item, or the effect difficulty below for a non-item target.
- `targetGuard` uses the authored security band: unsecured 0, routine 5,
  trained 10, alert 15, specialist 20, or actively guarded 25.
- `rankGapPenalty` is taken from the rank-gap table.
- `mentalStrainPenalty` is 0 for physical theft. For Technique Interceptor and
  Thought Thief targets it uses strain at attempt start: 0 for `0..39`, 5 for
  `40..69`, and 15 for `70..89`; `90..100` is blocked before the formula.
- `minimumEligibleChance` is 35.

| Non-item target | Effect difficulty |
| --- | ---: |
| Prepared mundane action or initiative | 10 |
| Ordinary short-lived buff or recovery tick | 15 |
| Current intent, attention, or dream image | 15 |
| Active same-rank Gu technique | 20 |
| Coherent recent-memory fragment | 20 |
| Temporary misrecognition | 20 |
| Replacement false thought | 25 |

An authored guaranteed opportunity may set chance to 100 only when the item,
target, and exact action-window ID all match.

A canonical starter example is a same-stage concealed-pocket theft using
`pick_pocket` rank 2, two verified facts, a correct tool, conversation cover
`(+5)`, item penalty 10, and trained guard 10:

```text
70 + 16 + 7 + 5 - 10 - 10 = 78 percent
```

### Failure Detection

This check is rolled only after the final success check fails.

```text
failureDetectionChance =
  clamp(
    45
    + targetAlert
    + witnessPressure
    + detectionAttachment
    + detectionRankGap
    - relevantSkillRank * 8
    - sceneCover
    - activeMisdirection
    - maskPresenceBonus
    - concealmentGuBonus
    - failureConcealmentBonus,
    5,
    95
  )
```

Inputs:

- `targetAlert`: unaware 0, relaxed 5, routine 10, suspicious 20, alarmed 30.
- `witnessPressure`: none 0, one inattentive 5, one attentive 10, small group
  15, dedicated guard 20, or multiple guards/sensor coverage 25.
- `detectionAttachment`: unattended 0, pocket/open pouch 5, concealed
  pocket/closed pouch 10, exposed worn item 15, fastened worn item 20, or
  fastened armor/adult intimate garment 25.
- `detectionRankGap`: taken from the rank-gap table.
- `sceneCover`: open 0, partial 5, good 10, prepared 15, total 20.
- `activeMisdirection`: 0 or the Misdirect rank value 10, 15, or 20.
- `maskPresenceBonus`: 0 unless Mask Presence is actively used, then 10, 20, or
  30 by its rank.
- `concealmentGuBonus`: `0`, `5`, `10`, or `15` from one activated compatible
  Gu; multiple Gu do not stack.
- `failureConcealmentBonus` is the sum of explicit failure-only bonuses such as
  Conceal Goods rank 2 and Unfasten rank 3, clamped to `0..20`.

### Failure Attribution

This check is rolled only when the theft failed and that failed attempt was
detected.

```text
failureAttributionChance =
  clamp(
    30
    + evidenceStrength
    + targetFamiliarity
    + knownMethodSignature
    - activeTalkOutReduction
    - falseTrailStrength
    - disguiseStrength,
    0,
    95
  )
```

Inputs:

- `evidenceStrength` is the sum of discovered, non-disproved evidence from this
  failed attempt visible to the investigating faction, clamped to `0..50`.
- `targetFamiliarity`: stranger 0, seen before 5, acquaintance 10, familiar 15,
  or intimate knowledge of habits 20.
- `knownMethodSignature`: none 0, weak match 5, repeated match 10, or validated
  signature 15.
- `activeTalkOutReduction`: 0 unless Talk Out is successfully invoked for this
  accusation, then 10, 20, or 30 by rank.
- `falseTrailStrength`: 0 to 30.
- `disguiseStrength`: none 0, improvised 5, prepared 10, or validated role 15.

After clamping and all reductions, failed-attempt hard evidence sets the highest
applicable floor:

- Trusted direct witness: minimum 40.
- Player caught with a theft tool in hand: minimum 70.
- Validated technique or psychic residue: minimum 80.

The one attribution roll produces exactly one status:

| Roll result | `failureAttributionStatus` |
| --- | --- |
| `roll <= failureAttributionChance` | `player_confirmed` |
| `failureAttributionChance < roll <= min(100, failureAttributionChance + 15)` | `player_suspected` |
| Higher | `unattributed` |

An active credible Frame Target rank-3 effect may replace `player_suspected`
with `alternative_suspect`; it cannot replace `player_confirmed` created under
a hard-evidence floor.

One failed incident makes at most one attribution roll. A later authored
investigation may make one new check only when new hard evidence exists and it
uses a unique persisted `investigationEventId`.

### Final Outcomes

| Success | Failure detected | Failure attribution status | Final state |
| --- | --- | --- | --- |
| Yes | Not rolled | Not rolled | Target transfers to player; all success deltas apply; theft closes |
| No | No | Not rolled | No transfer; failed attempt remains unknown; theft closes |
| No | Yes | `unattributed` | No transfer; general alert and scene-local response |
| No | Yes | `player_suspected` or `alternative_suspect` | No transfer; questioning, search, or short escape consequence |
| No | Yes | `player_confirmed` | No transfer; identified failure, confrontation, escape, or pursuit |

A deterministic roll is an integer from 1 through 100 and succeeds when it is
less than or equal to the chance. A failed success roll is a near miss only when
`roll <= theftSuccessChance + 10`. Near miss is informational and does not
override failure detection.

### Atomic Resolution Order

One theft attempt resolves in this exact order:

1. Validate target existence, slot/effect visibility, adulthood restrictions,
   action window, skill rank, Gu functions, rank gap, time, essence, tools, and
   duplicate-attempt guards. Rejected input changes no state.
2. Read `attemptOrdinal = theftAttemptCounter`, create
   `theftAttemptId = "theft-attempt:" + attemptOrdinal`, snapshot every numeric
   input, charge time and consumable costs, deduct essence, and persist
   `theftAttemptCounter = attemptOrdinal + 1`.
3. Roll final success and increment the random cursor.
4. If successful, atomically transfer ownership to the player, remove the prior
   equipment/effect, apply portrait, sprite, emotion, schedule, quest, and
   combat deltas, record `completedSuccessfulTheftIds`, add strain/practice/
   milestones, autosave, and close. Do not roll detection or attribution; do not
   create evidence, heat, pursuit, recovery, or anti-thief adaptation.
5. If failed, transfer nothing and roll failure detection, then increment the
   cursor.
6. If the failure was not detected, add strain/practice as allowed, autosave,
   and close with no evidence or heat.
7. If the failure was detected, create failed-attempt evidence, roll failure
   attribution, increment the cursor, and apply the corresponding failure-only
   heat, confrontation, escape/pursuit, and adaptation.
8. Add strain/practice as allowed, autosave the complete failed result, and
   enter its consequence scene.

No callback may expose an item in both inventories or in neither inventory.
Presentation animation starts only after the relevant success or failure
transaction commits.

## Deterministic Randomness

Each save persists:

- `theftRngVersion = "fnv1a32-xorshift32-v1"`
- `theftSeed`
- `theftAttemptCounter`
- `theftRandomCursor`

Each phase result is keyed by:

```text
theftSeed
+ attemptOrdinal
+ targetId
+ itemOrEffectId
+ actionId
+ phaseId
+ theftRandomCursor
```

At commit start, `attemptOrdinal` is the current `theftAttemptCounter`,
`theftAttemptId = "theft-attempt:" + attemptOrdinal`, and the persisted counter
becomes `attemptOrdinal + 1`. The first attempt therefore uses ordinal `0`.

Serialization is canonical:

- Use exactly the seven fields above in that order.
- Encode `attemptOrdinal` and `theftRandomCursor` as unsigned base-10 integers
  with no leading zeroes; zero is `"0"`.
- Stable IDs are ASCII and are used byte-for-byte. Composite item IDs are
  constructed by the Two-Item Pick Pocket rule before serialization.
- No field may be empty or contain byte `0x1f`.
- UTF-8 encode each field and join fields with the single unit-separator byte
  `0x1f`; do not append a trailing separator.

`phaseId` is exactly `final_success`, `failure_detection`, or
`failure_attribution:<attemptOrInvestigationEventId>`.

The version-1 roll algorithm is:

```text
h = 2166136261
for each key byte:
  h = unsigned32((h XOR byte) * 16777619)
if h == 0:
  h = 0x9e3779b9
x = h
x = unsigned32(x XOR (x << 13))
x = unsigned32(x XOR (x >>> 17))
x = unsigned32(x XOR (x << 5))
roll = (x modulo 100) + 1
```

Implementations must use 32-bit integer multiplication semantics. The cursor
increments only after an actually required roll commits; a skipped attribution
check consumes no cursor value. Saving and loading cannot reroll the same chosen
action. Cancelling before commit consumes neither attempt counter nor cursor.
Changing a choice after commit creates a new attempt.

### Fixed RNG Fixture

The cross-runtime fixture uses:

- `theftSeed = "00000000"`
- `attemptOrdinal = 0`
- `targetId = "char_test_target"`
- `itemOrEffectId = "item_test_coin"`
- `actionId = "theft_skill_pick_pocket"`

| Phase ID | Cursor | FNV-1a hash | Xorshift result | Roll |
| --- | ---: | --- | --- | ---: |
| `final_success` | 0 | `413bf9f2` | `feb178f0` | 97 |
| `failure_detection` | 1 | `4d5afe6b` | `40657320` | 33 |
| `failure_attribution:theft-attempt:0` | 2 | `9cb15391` | `6ea636f0` | 1 |

Any supported runtime that produces a different hash, xorshift value, or roll
for this fixture violates `theftRngVersion`.

## Final Ownership

```text
success: held_by_prior_holder -> owned_by_player
failure: held_by_prior_holder -> held_by_prior_holder
```

Success transfers the item or bounded effect directly to final player ownership.
There is no provisional, hot, contested, laundering, owner-recovery, or
post-success attribution state.

- Quest ownership and inventory ownership change in the same success
  transaction.
- The former holder cannot recover the item through battle defeat, pursuit,
  investigation, save/load, or a delayed callback from this theft.
- The player may later consume, trade, equip, gift, discard, or voluntarily
  return the item through a new ordinary action. That new action does not reopen
  the completed theft.
- `successResolutionId` is recorded before presentation. The same ID cannot
  transfer value or apply success deltas twice.
- A new daily or respawned opportunity increments its persisted
  `spawnCycleOrdinal`; changing save/load time does not increment it.

## Failed-Attempt Evidence And Heat

Evidence types are:

- `evidence_witness`
- `evidence_scent_or_aura`
- `evidence_tracking_mark`
- `evidence_method_signature`
- `evidence_false_credential`
- `evidence_schedule_anomaly`
- `evidence_technique_residue`
- `evidence_psychic_residue`

Each evidence record stores source, strength 0 to 50, discovering faction,
known suspect IDs, expiry or persistence, and whether it has been disproved. An
evidence record may be created only from a detected failed attempt.

Heat is directed and faction-specific:

```text
heatByFaction[factionId] = 0..100
```

Heat gained from one incident is:

- Failed attempt detected: +5 once.
- `player_suspected`: +5.
- `player_confirmed`: +15 instead of the suspected +5.
- `unattributed` or `alternative_suspect`: +0 player-attribution heat.
- Attempted key or quest item: +10.
- Protected faction property: +5.
- Authored incident modifier: `-10..+10`.

Clamp the total incident delta to `0..30`, then clamp faction heat to `0..100`.
An undetected failed attempt and every successful theft add zero heat.

The bands are:

- 0-19: no organized response.
- 20-39: extra questions and routine searches.
- 40-59: changed patrols, locked storage, targeted inspection.
- 60-79: active pursuit, bounties, decoys, tracking Gu.
- 80-100: faction-wide hostile response and specialist countermeasures.

After three consecutive full game days without a new relevant incident, heat
falls by 5 per additional full quiet day. It cannot decay below 20 while a
confirmed failed-attempt case or active bounty remains. An authored amnesty,
payment, or frame resolution may change heat directly but must use an idempotent
event delta.

Heat does not replace character relationships or Fang Yuan's separate alert
state.

## Target Adaptation

After a detected failed attempt, targets may:

- Move items to a different slot or location.
- Change route or schedule.
- Add guards, seals, witnesses, decoys, or tracking marks.
- Carry less value.
- Ask another faction for help.
- Publicize a false item to bait the thief.
- Start private negotiation or blackmail.

After success, none of those anti-thief responses is created by that incident.
The target may equip an authored replacement and run the item's declared
emotion, schedule, quest, and combat effects, but gains no clue about the
player. The same equipment slot cannot be stolen repeatedly while empty.
Replacement requires an authored item, resource cost, and schedule event.

## Emotion, Quest, And Combat Effects

An item does not apply one universal success bonus. It declares concrete
effects.

Examples:

- Stolen uniform: target leaves post, a disguise route opens, familiar-NPC
  recognition risk rises.
- Stolen footwear: movement may fall by one and target seeks replacement.
- Stolen armor: defense falls according to the item's actual armor value.
- Stolen weapon: related actions become unavailable until replacement.
- Stolen keepsake: target may become anxious, angry, or negotiable depending on
  personality.
- Successful intimate-garment theft: the dedicated embarrassment state
  interrupts schedule and lowers composure, but also raises vigilance.

Mood modifies authored checks through named state values:

- `composure`: -30 to +30.
- `vigilance`: 0 to 100.
- `trust`, `enmity`, `debt`, and `interest`: existing directed relationship
  dimensions.

The sum of temporary item-loss and mood modifiers to one task check is clamped
to `-30..+30` percentage points. A content record must identify the affected
task check; there is no global "embarrassed target is easier" modifier.

A successful theft cannot directly change a target-to-player relationship
dimension because success provides no attribution. A later quest may change a
relationship only from a separate witnessed interaction.

## UI Contract

### Theft Inspect View

The view contains:

- Target name and current observed emotion.
- A body/equipment slot layout with only discovered slots.
- Item visibility, access state, and blocked reason.
- Action-window duration.
- Final success chance, plus conditional failure-detection and
  failure-attribution risk.
- Selected skills, Gu functions, tools, and preparation bonus.
- Failed-attempt evidence forecast.
- Escape route and current faction heat, explicitly labeled as failure-only.

Information precision depends on `read_opening` rank:

- Rank 1: safe, risky, blocked.
- Rank 2: percentage bands in increments of 10.
- Rank 3: exact percentages and individual modifiers.

### Theft Progression View

The progression view contains:

- Current theft tier, cultivation gate, technique-point balance, essence, and
  mental strain.
- One column per tier and one node per skill; every node has stable dimensions
  and displays rank `0..3`.
- For the selected skill, current qualifying-use count, distinct-target count,
  technique-point cost, mastery challenge ID/status, Gu-function requirement,
  and exact unmet condition.
- For the next tier, a live checklist of all nine promotion conditions and the
  trial retry time when cooling down.
- The visible but disabled `theft_tier_demigod_sealed` node with no previewable
  abilities or fabricated requirements.

A purchase confirmation must show the point cost and controlled-retraining
rule. The control is disabled when any requirement is unmet and never spends a
point optimistically.

### Immediate Theft Feedback

After success:

- Remove the item from the target slot and add final player ownership in one
  transaction.
- Update portrait, sprite, emotion, schedule, quest, and combat layers.
- Show the successful item/effect and close the theft interaction.
- Do not show detection, attribution, evidence, heat, pursuit, or recovery
  follow-up.

After failure:

- Keep ownership and equipment unchanged.
- Show whether the failed attempt was detected and attributed.
- Display failed-attempt evidence without revealing evidence the player has not
  perceived.
- Open escape, confrontation, pursuit, or normal return according to the failed
  outcome.

When `emotion_embarrassed_intimate_theft` activates, the target panel switches
to `portrait_intimate_item_stolen_embarrassed`, the equipment slot shows the
specific missing item, and the schedule/quest strip shows the interruption.
This is a dedicated state, not a generic low-composure portrait.

### Portrait And Sprite Fallback

If a specific missing-item image is unavailable:

1. Remove the stolen optional layer.
2. Render the protected base-coverage layer.
3. Use the nearest valid adult emotion portrait.
4. Display the explicit missing-item status in UI text.

Missing art must never produce nudity, a blank character, or a broken image.

## Save-State Design

A future runtime contract must persist an equivalent of:

```text
settings:
  allowAdultIntimateTheft

theft:
  tierId
  techniquePoints
  mentalStrain
  skillRanks
  skillRankLedger
  qualifyingUseLedger
  completedMilestoneIds
  completedMasteryIds
  completedPromotionConditionIds
  completedTierTrialIds
  availableTierTrialIds
  activeTierTrial
  tierTrialAttemptCounterById
  tierTrialCooldownById
  theftRngVersion
  theftSeed
  theftAttemptCounter
  theftRandomCursor
  heatByFaction
  evidenceLedger
  attributionLedger
  failedAttemptLedger
  completedSuccessfulTheftIds
  activeTheftPayloads
```

Character state must persist equipped item IDs, replacement state, current
emotion, schedule interruption, `missingItemIds`, and whether each missing item
has been replaced. Non-item targets also persist active source-mutation IDs and
their exact expiry.

Migration from an older save:

- Continue the read order and non-destructive key behavior in
  `contracts/game-state-v3.md`; the legacy
  `tianwai-daojuren-save-v2` key is never deleted.
- Preserve existing `player.theftRank` byte-for-byte. If it is a finite number,
  also copy it to `theft.legacyTheftRank`; the old score is not interpreted as a
  higher conceptual tier.
- Map every current prototype save to `theft_tier_shadow_thief`, because the
  prototype contains only physical theft and has no evidence of later-tier
  unlocks.
- Grant exactly the defined starting skill ranks, zero technique points, zero
  mental strain, `starting_grant` rank-ledger records, and otherwise empty
  ledgers. Do this only when the theft branch is absent, so migration is
  idempotent.
- Add `settings.allowAdultIntimateTheft = false` only when the setting is
  absent. Never infer consent from existing character or inventory state.
- Set `theftRngVersion` to `fnv1a32-xorshift32-v1`.
- Generate `theftSeed` deterministically once: use the existing
  `wilderness.expeditionSeed` when present; otherwise use canonical JSON of the
  preserved legacy payload with object keys sorted lexicographically. Hash
  `"theft-v1" + 0x1f + seedSource` with the FNV-1a step defined above and store
  the eight-digit lowercase hexadecimal result.
- Preserves all unrelated player, quest, item, relationship, and world fields.

No runtime migration is implemented by this design-only commit.

## Content Authoring Requirements

Every authored theft target declares:

- Target ID, item/effect instance ID, `successResolutionId`, and current holder.
- Required scene and time window.
- Discoverable and hidden item slots.
- `securityRating` and the exact guard, alert, witness, and cover bands.
- Strong-window eligibility.
- Required or optional skills.
- Preparation opportunities.
- Gu functional tags.
- Success item/effect ID and attachment or effect difficulty.
- For a non-item target, exact payload type, source mutation, use/duration
  bound, and compatible Gu-function content.
- Atomic success ownership, equipment, emotion, schedule, quest, combat, and
  replacement effects. Successful content cannot declare evidence, heat,
  attribution, pursuit, recovery, or anti-thief adaptation.
- Separate `onFailureUndetected`, `onFailureDetected`, and
  `onFailureAttributed` effects.
- Separate attribution handling for `unattributed`, `player_suspected`,
  `player_confirmed`, and `alternative_suspect`.
- Failed-attempt evidence, relationship, faction heat, escape/pursuit, and
  adaptation deltas.
- Unique milestone, mastery, promotion-condition, and trial IDs.

Any `slot_intimate_garment` target additionally declares `isAdult: true`, the
protected base-coverage visual, dedicated successful-loss portrait, emotion,
dialogue, schedule interruption, quest handoff, combat effect, and fallback.
Validation rejects the entire slot rather than silently supplying any of those
fields.

Unknown IDs and out-of-range modifiers must fail future content validation.

## Acceptance Criteria

An implementation plan based on this design must include tests proving:

1. The canonical starter pocket fixture calculates exactly 78 percent
   final success chance.
2. An eligible attempt never falls below 35 percent; an impossible attempt is
   blocked instead.
3. Success skips failure detection and attribution and creates zero evidence,
   heat, pursuit, recovery, or anti-thief adaptation.
4. Failure detection is rolled only after failure; attribution is rolled only
   after a detected failure.
5. Save/load does not reroll a committed choice.
6. The same milestone cannot award technique points twice.
7. Repeating one low-value target cannot unlock a tier.
8. Every skill rank transition enforces practice, target diversity, points, and
   mastery requirements.
9. Every tier promotion enforces cultivation, skill, feat, Gu-function, and
   trial conditions.
10. A full-rank gap permits only exposed external items during a strong window.
11. A two-rank gap blocks direct body theft.
12. Post-battle search gives no theft progression.
13. Successful combat theft gives final ownership immediately.
14. A later battle defeat cannot reverse a completed successful theft.
15. Failed combat theft transfers nothing.
16. Successful garment theft updates ownership, equipment, portrait, sprite,
    emotion, schedule, quest, and combat state atomically.
17. An intimate-garment slot is absent unless the persisted, default-off player
    setting is enabled and the character is explicitly marked adult.
18. An adult intimate-garment theft always preserves a base-coverage visual and
    uses the dedicated emotion, portrait, dialogue, quest, schedule, and combat
    IDs.
19. Its dedicated embarrassment and vigilance deltas trigger exactly once on
    success, reveal nothing about the player, and cannot modify any theft
    formula or anti-thief adaptation.
20. Mood affects only authored task checks and cannot create a global success
   bonus.
21. Empty slots cannot be stolen repeatedly.
22. Replacement items require an authored replacement event and cannot recover
    the successfully stolen original.
23. Failed-attempt evidence, heat, attribution, and adaptation persist through
    save/load.
24. Caught-tool and validated-residue evidence enforce their attribution floors.
25. Decoys cannot reproduce Gu, soul marks, bloodline checks, or unique powers.
26. Thought-tier skills cannot permanently steal identity, values, loyalty, or
   deep memory.
27. The demigod gate remains disabled and has no executable effect.
28. No promotion gate requires a skill from the tier it unlocks.
29. Trial success unlocks a tier and grants three points exactly once; trial
    failure persists consequences and a one-day cooldown.
30. Essence is charged before rolls and is not refunded on an eligible failure.
31. Starting mental strain contributes success penalties 0, 5, or 15, persists
    through battle end/save/load, and blocks new supernatural theft at 90.
32. The fixed RNG fixture produces rolls 97, 33, and 1 with the listed hashes
    and xorshift values in every supported runtime.
33. Success consumes one cursor value, undetected failure consumes two, and
    detected failure consumes three; skipped checks consume none.
34. Controlled retraining charges two time and five stones, preserves all grant
    floors/unlocked tiers, and refunds exactly the persisted expenditure of
    removed purchased ranks.
35. Only explicitly external, unrefined, unowned, or sealed Gu containers are
    physically stealable; aperture-bound refined Gu remain blocked.
36. UI inspection costs no time, blocked input costs no time, and every
    committed phase costs exactly the value in the time table.
37. Heat is zero on success; detected failures change it once, respect the
    30-point incident cap, and obey quiet-day decay floors.
38. A repeated success ID cannot duplicate an item or reapply success deltas.
39. The former holder cannot recover a successfully stolen item through battle,
    pursuit, investigation, save/load, or delayed callbacks.
40. Success UI shows final ownership and closes without presenting failure-only
    detection, attribution, evidence, heat, or pursuit.
41. Every non-item success creates exactly one declared player-owned bounded
    payload and one source mutation atomically.
42. Leave False Thought consumes a stolen-intent payload only as a Take Intent
    rider and never makes an independent success roll.
43. Failure attribution maps one roll to `player_confirmed`,
    `player_suspected`, `unattributed`, or an eligible `alternative_suspect`
    using the exact 15-point band.
44. A two-item Pick Pocket uses canonical composite IDs, one roll, one failure
    chain, capacity prevalidation, and all-or-nothing transfer.
45. `theftAttemptId`, integer encoding, field order, separators, and phase IDs
    match the deterministic serialization contract.
46. All 27 promotion-condition IDs latch once, trial availability persists, and
    cooldown is stored by trial ID.
47. A scripted rank grant records a non-refundable source and immediately
    refunds any purchased record it replaces exactly once.
48. Content ID validation rejects reserved delimiters, and unique, renewable,
    composite, payload, attempt, and trial IDs cannot collide through
    concatenation.

## Follow-Up Boundary

After human approval of this written specification, the next planning stage may
define:

- Stable theft IDs in the central ID registry.
- JSON Schemas for skills, items, equipment, evidence, and authored targets.
- Balance JSON copied from the formulas and tables above.
- Runtime modules, migrations, UI, art-state manifest updates, and tests.

Those are implementation-planning outputs and are not part of this design-only
document.
