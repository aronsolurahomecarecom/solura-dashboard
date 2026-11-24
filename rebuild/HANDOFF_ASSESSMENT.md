# Design handoff: the In-Home Assessment form

A companion to the main design brief. This is the one screen with real depth that the brief only named. Everything below describes the form as it exists and works today, plus explicit notes on what the rebuild should change.

## What it is and when it happens

The assessment is the in-home visit: an assessor (Meir or the employee) sits at a family's kitchen table and works through a structured clinical-and-social intake, on a laptop or tablet, with the client and family present. It is the moment the relationship becomes real, so the form must feel calm and unhurried even though it is thorough.

Flow into it: when a lead's status becomes **Assessment Scheduled** (set by the scheduling dialog, which also sends the branded confirmation email with the calendar invite), the lead's primary action button becomes **"Start Assessment."** Clicking it opens the form full-screen for that lead. The assessor named at scheduling time is already filled in; it falls back to Meir if none was logged.

## How it appears today

A full-screen takeover (with an explicit fullscreen toggle), not a small modal:

- **Header**: the client's name, then "Section 4 of 14 — Pain Assessment", a slim progress bar, fullscreen and close buttons.
- **Body**: ONE section at a time. Fields lay out in a responsive two-column grid; wide fields span both columns.
- **Footer**: Back on the left; center label "Worksheet only — not saved until you Finish"; Next on the right, replaced by **"Finish & Upload"** on the last section.

## The 14 sections

1. **Client Information** — visit date, assessor, legal and preferred name, DOB and age, phones, address, gender, language, marital status, religion/culture, two emergency contacts (name, relationship, phone, lives-with).
2. **Insurance & Payment (Ohio)** — primary and secondary insurance with member IDs, Ohio program checkboxes (Medicaid, Medicare, PASSPORT Waiver, MyCare Ohio, Private Pay, LTC insurance, Other), billing notes.
3. **Medical History & Conditions** — the deepest section, three parts: (a) universal questions for everyone: PCP and phone, specialists, next appointment, medications (type a list OR attach a file), medication management level, allergies, recent hospitalizations and surgeries, baseline mobility and cognition, sensory aids, smoking, alcohol, advance directives; (b) **cross-cutting concerns**: seven checkable packs that apply regardless of diagnosis, each revealing targeted follow-ups when checked: Fall risk, Incontinence, Swallowing difficulty, Wandering/elopement risk, Sleep disturbance, Behavioral or mood concerns, Chronic pain; (c) the **condition picker**: 14 common conditions as searchable pills (Dementia/Alzheimer's, Parkinson's, Stroke, Heart disease/CHF, COPD, Diabetes, Arthritis, Hypertension, Cancer, Kidney disease, Post-surgical recovery, Vision impairment, Hearing impairment, Depression/anxiety), EACH opening its own tailored question pack (e.g. dementia asks severity, observed behaviors, caregiver recognition; hearing asks aids used), plus 19 long-tail conditions (MS, ALS, Huntington's, lupus, Crohn's, epilepsy, TBI, chronic pain syndrome, liver, thyroid, osteoporosis, GERD, anemia, chronic wounds, amputation, tracheostomy, feeding tube, catheter, substance use) behind an expandable list, each using a shared generic pack (when diagnosed, functional impact, treatment, care concerns). Conditions noted earlier in the pipeline (the "Responded" conditions picker, or the intake form) arrive **pre-selected**.
4. **Pain Assessment** — yes/no gate, then repeating pain rows (location, level, type, frequency, what helps; add and remove rows), and what pain affects.
5. **Nutrition & Swallowing** — swallowing checklist, diet type, fluid consistency, nutrition concerns, weight and change, food preferences and cultural diet needs.
6. **Activities of Daily Living** — the signature widget of the form: a 14-row by 4-column assistance matrix (Bathing, Dressing, Toileting, Continence x2, Transferring, Walking, Meal Prep, Feeding, Medication Mgmt, Housekeeping, Laundry, Shopping, Transportation x Independent / Needs Reminders / Needs Assist / Unable), one selection per row, plus notes.
7. **Skin Integrity & Physical Health** — skin condition, wound description, bowel and bladder patterns, incontinence level, assistive equipment checklist.
8. **Home Safety** — fall-risk flags, home environment checklist (grab bars, lighting, rugs, stairs, detectors), safety concerns, then emergency preparedness: legal documents (POA, living will), the POA's name, power-dependent equipment.
9. **Cognitive & Mental Health** — orientation (person/place/time/situation), communication, memory, mood observations, the PHQ-2 screening question, notes.
10. **Daily Routine & Client Preferences** — wake and bed times, naps, sleep issues, morning routine, hobbies, cultural and religious care preferences, caregiver gender preference, dietary preferences, languages at home.
11. **Family & Caregiver Situation** — who provides care now, caregiver stress level (low / strained / burned out), primary caregiver, availability, confidential caregiver concerns.
12. **Client Goals & What Matters Most** — three open questions asked of the CLIENT directly, not the family (the form says so in an instruction note): what matters most right now, what they hope home care helps with, what they do NOT want help with.
13. **Recommended Care Plan** — hours per day, days per week, shift timing, caregiver task checklist, proposed start date, rate and payment method, special instructions.
14. **Signatures** — accuracy statement, client/representative printed name, relationship, date, **drawn signature pad**, then the assessor's name, agency, date, and signature pad.

## Widget inventory (design each)

Text (with date and time variants), textarea, single-choice pill row, multi-check pill group, instruction note, section sub-header, the **ADL grid** (14x4 matrix, radio-per-row, must work on a tablet), **repeating pain rows** (add/remove), **file-attach chip** on the medications field (shows name and size, removable), **searchable condition pills** with check marks and an expandable long-tail list, **conditional reveal** (concern and condition packs expand inline under their pill when selected), and the **signature pad** (finger or mouse drawing on touch).

## The intelligence (must survive exactly)

- **Pre-filled from the pipeline**: visit date (today), client legal name, cell phone, assessor (from the scheduling dialog, falling back to Meir), assessor agency, and the pre-selected conditions.
- **Asked-once, filled-later**: a question repeated in a later section auto-fills from the earlier answer, visibly marked as auto-filled, freely editable, and a typed answer is NEVER overwritten. The live map: age computes from DOB (exact calendar age); primary language fills languages-at-home; food preferences fill dietary preferences; sleep answers merge into sleep issues; emergency contact 1 composes into primary caregiver ("Ruth Cohen (daughter)"); the POA name fills from contact 1 ONLY when the Power of Attorney box is checked; the signature section pre-fills the client's printed name, relationship, and both dates from the visit date.
- "Worksheet only" semantics today: nothing persists until Finish. See rebuild notes.

## Finish & Upload (the output)

One button does four things, with failures isolated so one miss never loses the visit's work:

1. Builds a formatted Word-compatible document of the whole assessment.
2. Uploads it to the client's folder (today: OneDrive `/Patients/{Client Name}/Onboarding/`, auto-creating folders; rebuild: Supabase Storage with the same per-client structure).
3. Uploads any attached files (the meds list photo, etc.) to the same folder, names prefixed by category; an attachment failure warns and continues.
4. Sends an "In-Home Assessment Completed — {name} — {date}" email to the intake mailbox with a readable summary, the document link, and attachment links; if the email fails the upload is kept and the error says so.

Then a plain toast: "Saved to OneDrive · intake@ notified."

## Rebuild notes for the designer (changes we want)

- **Draft autosave.** "Not saved until you Finish" was a limitation, not a choice. The rebuild saves continuously to the database; design the quiet "Saved" indicator and the resume-where-you-left-off moment (reopening a lead with an assessment in progress).
- **A section rail.** With 14 sections, add a jump-to-section list (with per-section completion state) alongside the progress bar; the linear Next/Back flow stays primary.
- **Tablet-first for THIS screen.** It is filled at a kitchen table. Large touch targets, the ADL grid and signature pads designed for fingers, and tolerant of a weak connection (autosave queues).
- **A review step.** Before Finish, a compact read-through of everything captured, with per-section edit links; families sometimes ask "what did you write down."
- **Register.** Clinical content, Solura calm: linen and cream, navy headings, gold accents on progress and completion, generous spacing. The form is filled in front of a stressed family; nothing on screen should look like a hospital chart. Instruction notes (like "ask the client directly") styled as gentle guidance, not warnings.
