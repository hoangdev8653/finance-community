# Finance Community — News vs Learning Architecture

## Core Distinction

The platform has two different editorial engines:

```text
NEWS
= What is happening now?

LEARNING
= What does it mean and how does it work?
```

Community is a third layer:

```text
COMMUNITY
= What do people think, ask, experience, and discuss?
```

## News Pipeline

The News pipeline should be domain-neutral:

```text
RSS / Atom / API / Official Source / Web
        |
        v
Collection
        |
Normalization
        |
Filtering
        |
Deduplication
        |
Extraction
        |
Classification
        |
Relevance / Confidence Scoring
        |
Fact Check
        |
AI Drafting
        |
BTV Review
        |
Publish
```

The same pipeline must support:

- Money
- Business
- Technology / AI
- Career
- Sports
- Life

## Source Registry

A source should not be modeled as a finance-only object.

Recommended metadata:

```text
id
name
publisher
sourceType
trustLevel
language
country
feedUrl
homepageUrl
active
usageNotes
domain/category mapping
```

Potential source types:

```text
RSS
ATOM
API
OFFICIAL_WEBSITE
NEWSROOM
WEB
MANUAL
```

## Source Trust

Suggested conceptual tiers:

```text
PRIMARY
PROFESSIONAL
SECONDARY
COMMUNITY
```

Trust level should inform editorial handling. It must never be interpreted as an automatic publish permission.

## Learning Pipeline

Learning content uses a different process:

```text
Topic / Knowledge Gap / Editorial Opportunity
        |
        v
Research
        |
Primary Sources
        |
Cross-check
        |
Definition Lock
        |
Knowledge Map
        |
Series Curriculum
        |
Lesson Blueprint
        |
AI Draft
        |
Fact Review
        |
Editorial Review
        |
Publish
```

## Learning Content Rules

Learning articles should prioritize:

```text
Definition
-> Theory
-> Evidence
-> Explanation
-> Example
-> Application
-> Limitations
-> Common Misconceptions
-> Key Takeaways
```

Examples must explain principles, not replace evidence.

## Definition Lock

For important concepts, store/track:

```text
Concept
Canonical verified definition
Authoritative source
Secondary verification
Editorial explanation
```

The AI writer may simplify the language but must not alter the underlying meaning.

## AI Writing Policy

AI may perform:

- research assistance
- knowledge extraction
- outlining
- drafting
- synthesis
- editorial review assistance

AI must not be the sole authority for:

- definitions
- statistics
- formulas
- laws
- regulations
- market data
- historical claims

## News-to-Learning Bridge

A news article may expose a knowledge gap, but must not automatically become a lesson.

Correct flow:

```text
News
  -> recurring topic / knowledge gap
  -> editorial decision
  -> research
  -> learning series
```

Example:

```text
News: inflation rises
        |
        v
Learning Series: Hiểu về lạm phát
        |
        +-> Lạm phát là gì?
        +-> Đo lạm phát thế nào?
        +-> Vì sao lạm phát xảy ra?
        +-> Lạm phát ảnh hưởng sức mua ra sao?
```

## Article End Recommendations

Future article detail should support:

```text
Continue Series
Related Learning
Related Articles
Explore Another Domain
```

Recommendation should be based on topic/category/domain/series relationships, not only matching category strings.
