# Design System Documentation: The Restorative Ledger

## 1. Overview & Creative North Star
This design system is built for the high-stakes environment of public health nursing. In the context of tuberculosis treatment, clarity is not just an aesthetic—it is a clinical requirement. 

### Creative North Star: "The Restorative Ledger"
The aesthetic moves away from the "cluttered database" look of legacy medical software. Instead, it adopts the persona of a **Restorative Ledger**: a digital environment that feels as authoritative as a medical journal but as calm as a sanctuary. 

We break the "standard template" look through:
*   **Intentional Asymmetry:** Using off-center layouts and varied column widths to guide the eye toward critical patient data.
*   **Editorial Scaling:** High-contrast typography that mirrors high-end medical publications.
*   **Tonal Architecture:** Defining sections through light and depth rather than rigid lines.

---

## 2. Colors & Surface Philosophy
The palette is rooted in a clinical "Primary Blue" (#0061A4), but it is expanded into a sophisticated range of tonal variants to ensure the UI feels layered and multidimensional.

### The "No-Line" Rule
**Explicit Instruction:** Designers are prohibited from using 1px solid borders to section off content. 
Boundaries must be defined solely through background color shifts. For example, a `surface-container-low` section should sit on a `surface` background. This reduces visual noise and cognitive load for nurses managing complex caseloads.

### Surface Hierarchy & Nesting
Treat the UI as a series of physical layers. Use the surface-container tiers to create "nested" depth:
*   **Base Layer:** `surface` (#F9F9FF)
*   **Sectional Layer:** `surface-container-low` (#F0F3FF) for secondary information.
*   **High-Priority Layer:** `surface-container-highest` (#DCE2F3) for critical patient alerts.

### Glass & Gradient Rule
To move beyond a "flat" feel, use **Glassmorphism** for floating elements (e.g., patient quick-view modals). 
*   **Token:** `surface` at 80% opacity with a `20px backdrop-blur`.
*   **CTAs:** Use subtle linear gradients for primary buttons, transitioning from `primary` (#0061A4) to `primary_container` (#2196F3). This provides a "jewel-like" quality that demands attention without causing fatigue.

---

## 3. Typography: Editorial Precision
The system utilizes **Public Sans** for display/headlines to provide an authoritative, modern feel, and **Inter** paired with **Noto Sans JP** for body text to ensure maximum legibility for medical professional use.

*   **Display-LG (3.5rem / Public Sans):** Used for critical statistics (e.g., "98% Adherence").
*   **Headline-SM (1.5rem / Public Sans):** Used for Patient Names and Section Headers.
*   **Body-MD (0.875rem / Inter/Noto Sans JP):** The workhorse for medical notes. Use a generous `line-height` (1.6) to ensure Kanji characters are easily scannable.
*   **Label-SM (0.6875rem / Inter):** Used for metadata, such as timestamps and dosage units, set in `on-surface-variant` (#404752).

---

## 4. Elevation & Depth
Depth is achieved through **Tonal Layering** and ambient light, rather than traditional drop shadows.

*   **The Layering Principle:** Place a `surface-container-lowest` (#FFFFFF) card on a `surface-container-low` (#F0F3FF) section to create a soft, natural lift.
*   **Ambient Shadows:** When an element must float (e.g., a critical medication pop-over), use a shadow with a 24px blur, 0px spread, and 6% opacity. The shadow color must be tinted with the `primary` hue to avoid a "dirty" grey appearance.
*   **The Ghost Border Fallback:** If a border is required for accessibility, use the `outline-variant` token (#BFC7D4) at **15% opacity**. Never use 100% opaque borders.

---

## 5. Components

### Buttons
*   **Primary:** Gradient fill (`primary` to `primary_container`). `xl` roundedness (1.5rem). No border.
*   **Secondary:** `surface-container-high` fill with `on-surface` text.
*   **Tertiary:** No background. Bold `primary` text.

### Cards & Lists (The "Breathable" List)
*   **Execution:** Forbid the use of divider lines. 
*   **Separation:** Use `1.5rem` of vertical white space (Spacing Scale) between patient records. Use a `surface-container-low` background on hover to indicate interactivity.

### Input Fields
*   **Style:** Minimalist. A subtle `surface-variant` fill with a bottom-only "Ghost Border" that transitions to a `primary` 2px line upon focus.
*   **Japanese Legibility:** Ensure `body-lg` sizing for input text to accommodate complex Kanji characters.

### Status Chips (Risk Labels)
*   **Success:** `surface-container` background with `green` text (using high-contrast variants).
*   **Warning (Amber):** `tertiary_container` (#DB7900).
*   **Danger (Red):** `error_container` (#FFDAD6) with `on-error-container` (#93000A) text.

### Specialized Component: The Adherence Timeline
A horizontal "ribbon" using `surface-container-highest`. Daily check-ins are represented by soft-edged circles. This creates an "organic" feel that avoids the rigidity of a standard table.

---

## 6. Do’s and Don’ts

### Do
*   **Do** use asymmetric white space to draw attention to "Danger" status labels.
*   **Do** prioritize Noto Sans JP's weight distribution; use "Medium" for body text to ensure clarity on mobile screens.
*   **Do** use `surface-bright` for the main content area to keep the "Sanctuary" feel.

### Don't
*   **Don't** use 1px solid dividers between list items. Use background tonal shifts instead.
*   **Don't** use pure black (#000000) for text. Always use `on-surface` (#151C27) to reduce eye strain during long shifts.
*   **Don't** use sharp corners. Stick to the `DEFAULT` (0.5rem) or `lg` (1rem) roundedness scale to maintain a "calm and trustworthy" aesthetic.