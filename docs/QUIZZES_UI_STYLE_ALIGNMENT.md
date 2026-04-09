# Quizzes UI Style Alignment

Этот документ фиксирует визуальные правила для публичных `quizzes`-страниц, чтобы они оставались частью shipped SirBro public site, а не отдельным mini-landing.

## Source Of Truth

- главный визуальный reference: [`/Users/serhiimytakii/Projects/Levantem/admin-panel/components/public/PublicHomepage.tsx`](/Users/serhiimytakii/Projects/Levantem/admin-panel/components/public/PublicHomepage.tsx)
- общий style reference: [`/Users/serhiimytakii/Projects/Levantem/admin-panel/docs/FIGMA_APP_STYLE_REFERENCE.md`](/Users/serhiimytakii/Projects/Levantem/admin-panel/docs/FIGMA_APP_STYLE_REFERENCE.md)
- reusable quiz tokens: [`/Users/serhiimytakii/Projects/Levantem/admin-panel/components/public/quizzes/quizStyles.ts`](/Users/serhiimytakii/Projects/Levantem/admin-panel/components/public/quizzes/quizStyles.ts)

## Visual Rules

- использовать ту же dark surface language, что и у homepage: `#111827` / `#0b1220`, мягкие бордеры `#334155`, blur, холодные тени;
- headline и key titles должны быть `Roboto, var(--font-geist-sans), sans-serif`;
- primary CTA должен идти через homepage accent: `#4f46e5` и hover `#5b54ff`;
- accent использовать умеренно: для hero accent text, progress, hover border и plot highlights;
- не возвращаться к яркому donor / neon-стилю с heavy gold gradients и агрессивным uppercase как к основной системе;
- новые quiz surfaces сначала собирать через `quizStyles.ts`, а не дублировать большой inline `sx`.
- hub quiz cards начинаются сразу с title: не добавлять сверху дублирующий chip `Quiz`, если тип контента уже очевиден из контекста страницы.

## Current Scope

Эти правила применены к:

- shared public header / navigation block;
- quiz hub;
- quiz detail landing;
- quiz questionnaire;
- quiz result screen;
- ternary plot accent colors.

## Header Constraint

- quizzes pages не должны использовать отдельный custom nav shell;
- navigation block на quizzes обязан повторять homepage standard из [`/Users/serhiimytakii/Projects/Levantem/admin-panel/components/public/PublicHomepage.tsx`](/Users/serhiimytakii/Projects/Levantem/admin-panel/components/public/PublicHomepage.tsx);
- если меняется header на homepage, shared public header нужно синхронизировать в тот же change-set.

## Shell Constraint

- background секций на quizzes должен быть full-bleed как на homepage;
- ограничивать нужно inner content grid, а не сам section background;
- footer на quizzes обязан использовать ту же композицию, фон и колонку brand copy, что и homepage footer.
