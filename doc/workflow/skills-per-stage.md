<!-- ai-coding-master-workflow v2 -->
# Skills per stage

Use a skill only when the task needs it. Skip it for small or clear work.

| Stage | Technical | Design (taste-skill: `design-taste-frontend`, then the motion pass) |
|---|---|---|
| study | `grilling`, then `domain-modeling`, when scope or terms are unclear; `research` for primary sources; `prototype` to test logic before planning | `design-taste-frontend` direction rules, written into the study as the visual direction. Use `redesign-existing-projects` when a redesign replaces an existing look |
| plan | `codebase-design` for structural changes; `grilling` on the plan before approval, for work past the size gate | Map each surface to the variant's layout and motion rules. After the design tasks, add a motion task list: each animated element with its property, easing or spring, duration, and reduced-motion behaviour (`find-animation-opportunities` helps to find the elements) |
| execute | `tdd`; `diagnosing-bugs` for failures; `wizard` for steps only the human can do | `design-taste-frontend`; `mobile-native` when the page ships to phones. Then the motion pass: `animate` for the decisions, the `motion` skill for the code. Search the docs with `search-motion-docs` before writing animation code |
| rendezvous | `code-review`; `simplify` when code changed (skip if not installed); `security-review` when auth, money, or user data change | `review-animations`, `break-ui`, and a check against the variant's ban list. Motion pass: MotionScore audit through the `motion` skill; `motion-reviewer` for a whole-site audit; `animation-performance` when a frame drops |
| sync docs | `writing-for-agents` when editing AGENTS.md, skills, or wiki | same |
| any | `claude-handoff` when a session gets long (skip if not installed; `handoff` from claude-mem does the same) | same |

Use the mattpocock-skills versions of `code-review` and `prototype` when another skill or built-in has the same name.

Motion pass rules: take the design as given. Add motion; do not change layout, type, or color. If the motion needs a design change, put it in the plan's OPEN QUESTIONS. Use the `motion` package, not `framer-motion`. Use `motion-plus` only if the human has authorised it.
