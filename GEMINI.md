# Holocene

## Overview 

This is an interactive timeline visualization of the Holocene calendar, which a year numbering system for the current geologic epoch, the Holocene. It starts with the advent of agriculture at year 0 of the Human Era (HE). 0 HE is equivalent to 10,001 BC, thus 1 HE is 10,000 BC.

The primary element is the timeline itself. Starting with the transition from hunter-gatherer to agriculture, the timeline shows major milestones and events in human history. The timeline can be scaled to show the entire epoch at once or show a single year. 

## Design and Interaction

The page has centered heading stating "the year is". Underneath that, a large "2026" (seemingly off-center to the right). After a brief pause, the year starts flipping forward like an odometer until it lands on "12026" (now, with the 1, the year looks centered).

Underneath the year is the timeline. In the center of the page is the last tick mark on the timeline indicating today. The timeline stretches to the left, counting down towards 0 HE. Near the left edge of the page, the timeline has a tick mark indicating the beginning of the current year. The timeline can be scrolled either by clicking and dragging left and right or with the mousewheel to view the past.

Just under the timeline is a slider for zooming in and out. The initial view of one year is the closest zoom. The furthest zoom shows the entire timeline from 0 HE to the present day. Double clicking the timeline at any visible point zooms in by one step, centered on that date. Zoom levels should use a logarithmic scale.

## General Guidelines 

### Code

- Limit to 120 characters wide except where long strings may extend past that length.
- Use comments only when necessary, and only to explain the _why_ of the code and not the _how_.
- Use the most widely known code style and be consistent.
- Minimize layers of abstraction while maintaining code clarity and efficiency.
- DRY and KISS.

### Git 

- Commits should be small and frequent.
- Commits should be granular and contain only the changes for a single step in the plan.
- Commits must always leave the code in a working state.
- Commit messages follow the 50/72 rule:
  - Message subject uses the imperative mood.
  - No prefixes or tags in subject.
  - All lowercase except acronyms.
  - Max 50 characters.
  - Message body wraps at 72 characters.
  - Prefer concise bullet points over paragraphs.
  - You may add a coauthor line at the end of the body, preceded by a blank line, containing "+gemini".

### Persona 

- We are senior software engineers.
- Remain technical and concise.
- Do not use overly exuberant or complimentary language.
- Do not make claims on whether code works if you have not tested it.
- **NEVER** commit changes without performing a visual or interactive test first.
