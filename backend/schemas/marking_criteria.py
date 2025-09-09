"""
Marking criteria definitions for all question types.
"""

# Marking Criteria
MARKING_CRITERIA = {
    "igcse_descriptive": """
Core Principle for Descriptive Marking: Marking is about identifying and rewarding strengths in a candidate's work. While weaknesses exist, the primary focus is on how well the work meets the established criteria, guiding the placement within the mark scheme by identifying what the candidate does achieve.

Descriptive essays are assessed on the candidate's ability to create an imaginative and effective piece of writing, judged on two distinct skills: Content and Structure (16 Marks) and Style and Accuracy (24 Marks).

A. Content and Structure (16 Marks): The "What" and "How It's Built"

16-13 Marks (High Level): Compelling Description with sophisticated approach and excellent organization
12-9 Marks (Middle Level): Clear and Effective Description with good engagement and clear organization
8-5 Marks (Low Level): Basic Description with limited understanding and basic organization
4-1 Marks (Very Low Level): Minimal, confused description with chaotic organization

B. Style and Accuracy (24 Marks): The "Language Execution"

24-20 Marks (High Level): Sophisticated vocabulary, highly varied sentence structures, virtually error-free
19-14 Marks (Middle Level): Good vocabulary, varied sentence structures, mostly accurate
13-8 Marks (Low Level): Basic vocabulary, simple sentence structures, some errors

SPECIFIC FOCUS AREAS - Where you, the AI, consistently makes mistakes while marking:

Bad vocabulary, if the essay does not consistently display good vocabulary and flow, do not mark it higher than 27. But please think if it does or does not. And you do not always need to mark it 27

You give high marks to narratives, narratives and descriptives are not similar, please ensure high marking descriptives have descriptive qualities, and don't focus on a plot, it may have one, but the plot isn't the essay's focus. Instead the focus should be vocabulary, imagery and the six senses. Please focus you improvements feedback on those. 

7-1 Marks (Very Low Level): Very limited language, serious errors.""",
    "igcse_narrative": """Primary Focus: The candidate's ability to create an imaginative and effective piece of writing, judged on Content/Structure and Style/Accuracy.
A. Content and Structure (16 Marks): The "What" and "How It's Built"
Primary Focus: The strength of the ideas, the development of the plot/description, the creation of characters/atmosphere, and the overall organization.
Key Discriminators & How to Award/Deduct Marks:
16-13 Marks (High Level: Compelling, Sophisticated, Excellent) (If a story or description is merely "good" or "sufficient" in these categories — don't let it sit in the 13–16 band. That zone is for exceptional pieces.)
Award for:

Compelling Plot/Vivid Description: Narrative is gripping, original, with effective tension/climax/resolution. Description is exceptionally vivid, original, and appeals strongly to multiple senses.
Sophisticated Characterization (Narrative): Characters are complex, believable, and their motivations/emotions are deeply explored. May show development or strong internal conflict.
Excellent Organization: Highly effective structure (e.g., non-linear, frame story, escalating tension). Seamless transitions, logical progression, and sustained focus.
Strong Engagement: Captures and holds reader interest throughout. Creates a powerful atmosphere or mood.
Originality: Ideas and their execution feel fresh and imaginative.

Deduct for:

Minor predictability in one aspect of the plot (from 16 to 15/14).
Characterization is strong but lacks extreme depth in one area (from 15 to 14).
Organization is excellent but has one very slight awkward transition (from 14 to 13).

12-9 Marks (Middle Level: Clear, Coherent, Good)
Award for:

Clear Plot/Effective Description: Narrative is coherent, follows a logical sequence, but may be somewhat predictable. Description is clear and effective, appealing to some senses, but may lack significant originality or depth.
Clear Characterization (Narrative): Characters are generally believable and consistent, but may lack complexity or deep psychological insight.
Good Organization: Generally well-structured, clear beginning/middle/end. Paragraphing is mostly effective.
Good Engagement: Holds reader interest for most of the story/description, but may have moments of flagging.

Deduct for:

A slight lack of originality or predictability in the plot (from 12 to 11/10).
Characterization is good but could be more nuanced (from 11 to 10).
Organization is logical but basic (from 10 to 9).
Engagement is good but not consistently high (from 10 to 9).
Tendency to tell rather than show too often (from 12 downwards).

8-5 Marks (Low Level: Basic, Limited)
Award for:

Basic Plot/Limited Description: Narrative is simplistic, perhaps a mere recounting of events. Description is general, lacks detail, or appeals to few senses. May stray into narrative from description.
Limited Characterization (Narrative): Characters are one-dimensional or stereotypical. Motivations are unclear or unconvincing.
Basic Organization: Some attempt at structure, but may be disjointed or lack clear progression. Paragraphing may be inconsistent.
Limited Engagement: May not hold reader interest for long. Lacks atmosphere or tension.

SPECIFIC FOCUS AREAS - Deduct heavily for:

Predictable series of events (-3): "Reformed bully excels instantly, becomes superhero cop" type narratives that offer no complexity or tension; single events (like exam results) becoming sole proof of character change.
Gaps and implausibilities (-3): Major time periods glossed over (e.g., "three-year training to be sub-inspector"), unrealistic declarations (e.g., crime eradication "within two years… completely")—both undercut credibility.
Ending is sudden and incomplete (-3): Characters left in transitional states without resolution (e.g., "anxious at airport" with promised climax never reached), leaving no resolution or final reflection.
Limited atmosphere and sensory engagement (-3): Setting is functional rather than vivid; lacks immersive qualities.

Deduct for:

Plot is too simple or predictable (from 8 to 7).
Characterization is very basic (from 7 to 6).
Organization is messy, making the story hard to follow (from 6 to 5).
Engagement is very low; piece is bland (from 6 to 5).

4-1 Marks (Very Low Level: Minimal, Confused)
Award for:

Minimal Plot/Description: No discernible plot, or a completely rambling account. Description is very generic or absent.
No Characterization: Characters are just names, or inconsistent.
Chaotic Organization: No logical structure; ideas are jumbled.
No Engagement: Fails to interest the reader at all.

Deduct for:

Increasing levels of confusion, irrelevance, or incoherence.

0 Marks: No creditable resp onse.

B. Style and Accuracy (24 Marks): The "Language Execution"
Primary Focus: The quality of the language used (vocabulary, sentence structures, narrative techniques) and the level of technical correctness.
Key Discriminators & How to Award/Deduct Marks:
24-20 Marks (High Level: Sophisticated, Highly Controlled, Accurate)
Award for:

Sophisticated & Precise Vocabulary: Wide range, accurate, nuanced, used for powerful and deliberate effect. Fresh, imaginative word choices.
Highly Varied Sentence Structures: Excellent control of complex and varied sentence types. Controls pace, rhythm, and emphasis with skill.
Virtually Error-Free: Spelling, punctuation, and grammar are consistently accurate. Any errors are negligible and do not impede meaning.
Masterful Narrative/Descriptive Techniques: Consistently uses strong imagery, powerful figurative language (original metaphors/similes), sensory details, and 'showing' rather than 'telling.' Evokes strong atmosphere.

Deduct for:

A rare, isolated awkward phrasing or very minor grammatical slip (from 24 to 23/22).
Vocabulary is sophisticated but not consistently impactful or truly unique (from 22 to 21/20).
Techniques are strong but perhaps not every single one is executed with maximum effect (from 21 to 20).

19-14 Marks (Middle Level: Effective, Clear, Competent)
Award for:

Good Vocabulary: Clear, accurate, and generally varied. Some attempts at more sophisticated or vivid words.
Varied Sentence Structures: Attempts at different structures, some complexity, generally effective but may sometimes be repetitive or slightly awkward.
Mostly Accurate: Errors in spelling, punctuation, and grammar are present but generally minor and do not significantly impede meaning. Meaning is clear.
Effective Narrative/Descriptive Techniques: Uses some imagery and sensory details, some instances of 'showing.' Figurative language may be present but less original or impactful than higher levels.

Deduct for:

Noticeable repetition in vocabulary or sentence structures (from 19 to 17/16).
More frequent minor errors, or occasional errors that cause brief ambiguity (from 17 to 15/14).
Techniques are present but not consistently effective or may be clichéd (from 16 to 14).

13-8 Marks (Low Level: Adequate, Basic, Some Errors)
Award for:

Basic Vocabulary: Restricted range, often simple and repetitive. May use words inaccurately or awkwardly.
Simple Sentence Structures: Predominantly simple sentences, lacking variety. May contain grammatical errors.
Frequent Errors: Errors in spelling, punctuation, and grammar are frequent. They may sometimes impede meaning or cause awkwardness.
Minimal/Ineffective Techniques: Little to no evidence of specific narrative/descriptive techniques, or their use is clumsy/nonsensical. Heavy reliance on "telling."

SPECIFIC FOCUS AREAS - Deduct heavily for:

Repetition and bland diction (-4): "Because/because", "very", "extremely", "simply"—removes dynamism and impact from prose.
Over-reliance on very short, declarative sentences (-4): Little sentence variety to control pace or mood; monotonous rhythm.
Techniques: no figurative language, sensory details or fresh imagery (-4): Exposition equals telling throughout; lacks literary sophistication.
Minor errors noted but not heavily penalized: Punctuation slips (missing commas after introductory phrases, occasional capitalisation quirks); none impede meaning.
Overall assessment: Serviceable but functional prose anchored in the low–middle band.

Deduct for:

More frequent errors that sometimes obscure meaning (from 13 to 11/10).
Reliance on very basic sentence structures (from 11 to 9/8).
Figurative language is awkward or misused (from 10 to 8).

7-1 Marks (Very Low Level: Very Limited, Serious Errors)
Award for:

Very Limited Language: Extremely basic vocabulary, severe repetition.
Severe Grammatical Errors: Sentences are often incomprehensible or grammatically incorrect.
Serious Errors Impeding Meaning: Errors are so frequent and severe that the writing is largely unintelligible.
No Narrative/Descriptive Features: No attempt at imagery or effective language.

Deduct for:

Increasing levels of unintelligibility and grammatical breakdown.

0 Marks: No creditable response.

WHERE YOU, THE AI, GOES WRONG IN MARKING:

1. Deduction of too many marks for "less insight on the characters" if you're thinking: "The student should have added a brief paragraph to explain the characters/plot more". Stop thinking that, this isn't needed and please do not deduct many marks for this. 
2. Deduction of too many marks for diction consistency, please focus on spellings, grammar, tenses and vocabulary more. Do not deduct for "Verify Diction"


IV. FINAL MARK ALLOCATION
Once both components are marked, add them together for a total out of 40.
The final assessment should justify the total mark by summarizing the strengths and weaknesses for each component, making direct reference to specific examples from the candidate's work and linking them to the level descriptors.
Mark this text based on the above criteria: Do not over-scrutinize, marks can be awarded positively and negatively. Heavily limit marks when endings are rushed/not good. Please don't call every essay a rushed ending, do remember there is a word limit, however, rushed endings will cause heavy deduction of marks.""",
    "igcse_directed": """
Task Overview

Evaluate a candidate's directed writing response based on one or two reading passages totaling 650 to 750 words. Candidates must write in a specific format - speech, letter, or article - addressing a clear purpose and audience while using ideas from the texts but in their own words. The response should be 250 to 350 words.
Assessment Objectives Distribution

Reading Assessment: 15 marks total
R1: Demonstrate understanding of explicit meanings
R2: Demonstrate understanding of implicit meanings and attitudes
R3: Analyse, evaluate and develop facts, ideas and opinions, using appropriate support from the text
R5: Select and use information for specific purposes

Writing Assessment: 25 marks total
W1: Articulate experience and express what is thought, felt and imagined
W2: Organise and structure ideas and opinions for deliberate effect
W3: Use a range of vocabulary and sentence structures appropriate to context
W4: Use register appropriate to context
W5: Make accurate use of spelling, punctuation and grammar
Reading Criteria Detailed Breakdown

Level 6: 13 to 15 marks
Successfully evaluates ideas and opinions, both explicit and implicit. Assimilates ideas from the text to give a developed, sophisticated response.
Award 15 marks for: Sophisticated evaluation of subtle implicit meanings, comprehensive development of textual ideas with original insight.
Award 14 marks for: Strong evaluation with minor gaps in sophistication.
Award 13 marks for: Good evaluation but less sophisticated development.

Level 5: 10 to 12 marks
Some successful evaluation of ideas and opinions, both explicit and implicit. A thorough response, supported by a detailed selection of relevant ideas from the text.
Award 12 marks for: Clear evaluation with good textual support.
Award 11 marks for: Generally thorough but uneven evaluation.
Award 10 marks for: Adequate evaluation but limited depth.

Level 4: 7 to 9 marks
Begins to evaluate mainly explicit ideas and opinions. An appropriate response that includes relevant ideas from the text.
Award 9 marks for: Clear identification with some evaluative comment.
Award 8 marks for: Mainly identification with limited evaluation.
Award 7 marks for: Basic appropriate response with minimal evaluation.

Level 3: 5 to 6 marks
Selects and comments on explicit ideas and opinions. Makes a general response including a few relevant ideas from the text.

Level 2: 3 to 4 marks
Identifies explicit ideas and opinions. Makes a limited response with little evidence from the text.

Level 1: 1 to 2 marks
Very limited response with minimal relation to the text.

Level 0: 0 marks
No creditable content.
Writing Criteria Detailed Breakdown

Level 6: 22 to 25 marks
Highly effective style capable of conveying subtle meaning. Carefully structured for benefit of the reader. Wide range of sophisticated vocabulary, precisely used. Highly effective register for audience and purpose. Spelling, punctuation and grammar almost always accurate.
Specific deductions: Deduct 1 mark for minor vocabulary imprecision. Deduct 2 marks for occasional structural lapses. Deduct 3+ marks for any grammar errors that impede sophisticated expression.

Level 5: 18 to 21 marks
Effective style. Secure overall structure, organised to help the reader. Wide range of vocabulary, used with some precision. Effective register for audience and purpose. Spelling, punctuation and grammar mostly accurate, with occasional minor errors.
Specific deductions: Deduct 1 mark for limited vocabulary range. Deduct 2 marks for structural inconsistencies. Deduct 3+ marks for frequent minor errors affecting flow.

Level 4: 14 to 17 marks
Sometimes effective style. Ideas generally well sequenced. Range of vocabulary is adequate and sometimes effective. Sometimes effective register for audience and purpose. Spelling, punctuation and grammar generally accurate though with some errors.

Level 3: 10 to 13 marks
Inconsistent style, expression sometimes awkward but meaning clear. Relies on the sequence of the original text. Vocabulary is simple, limited in range or reliant on the original text. Some awareness of an appropriate register for audience and purpose. Frequent errors of spelling, punctuation and grammar, sometimes serious.

Level 2: 6 to 9 marks
Limited style. Response is not well sequenced. Limited vocabulary or words and phrases copied from the original text. Limited awareness of appropriate register for audience and purpose. Persistent errors of spelling, punctuation and grammar.

Level 1: 1 to 5 marks
Expression unclear. Poor sequencing of ideas. Very limited vocabulary or copying from the original text. Very limited awareness of appropriate register for audience and purpose. Persistent errors in spelling, punctuation and grammar impede communication.

Level 0: 0 marks
No creditable content.
Common Examiner Deductions and Error Patterns

Major Reading Deductions:
Excessive lifting or copying from original texts without own words adaptation results in 3 to 5 mark deductions. Failure to address implicit meanings or attitudes drops candidates to Level 3 maximum. Missing evaluation component limits responses to Level 4 maximum. Irrelevant or invented content not derived from texts results in significant mark loss.

Major Writing Deductions:
Inappropriate register for specified audience reduces writing marks by 2 to 4 marks. Over-reliance on original text vocabulary and phrasing limits Level 3 maximum achievement. Poor structural organization with weak opening or closing results in 1 to 3 mark deductions. Persistent grammar errors that impede communication drop candidates below Level 4.

Format-Specific Requirements – Expanded Guidance

Candidates are required to write in a specified format such as a speech, letter, or article. The format must be adhered to strictly as it influences tone, style, structure, and language features. Familiarity with conventions of each format is essential for a high-scoring response.
Speech Format

    Purpose: Often to inform, persuade, motivate, or entertain an audience in a live or virtual setting.

    Audience Awareness: Must directly address the audience using second-person pronouns (e.g., "you," "we"), inclusive language ("together," "our community"), and rhetorical devices to engage listeners.

    Opening: Needs a strong, attention-grabbing introduction (e.g., a rhetorical question, dramatic statement, or anecdote) to hook the audience quickly.

    Tone: Should reflect the context—formal or informal—but must maintain engagement and appropriate energy or passion throughout.

    Structure: Clear signposting and transitions are critical. Use of phrases like "Firstly," "Furthermore," and "In conclusion" help guide listeners.

    Techniques: Use of repetition, rhetorical questions, anecdotes, emotive language, and pauses or commands enhances persuasive effect.

    Closing: Memorable and motivating calls to action or a summary statement encouraging reflection or decision-making.

    Marking Focus: Examiners specifically look for the ability to connect with an audience, clarity of purpose, and use of features unique to spoken performance.

Letter Format

    Purpose: Communication directed officially or personally to a reader, with intent to inform, request, complain, or express feelings.

    Audience: Formal (e.g., a professional, authority figure) or informal (e.g., friend, family), which strongly affects tone and register.

    Opening: Clear and appropriate salutation (e.g., "Dear Sir/Madam," or "Dear John") that matches the relationship with the recipient.

    Tone and Register: Formal letters require polite, measured language with formal vocabulary and less colloquialism; informal letters allow conversational style and personal touches.

    Content Organization: Purpose should be stated early, with paragraphs serving distinct points or themes; coherence and cohesion must be strong.

    Conventions: Use of conventional phraseology, appropriate endings ("Yours faithfully," "Best wishes"), and correct paragraphing.

    Language Features: Politeness strategies, modal verbs for requests or suggestions, indirectness for complaints, and expressive devices for emotional content.

    Closing: Should contain an appropriate sign-off reflecting the relationship and tone.

    Marking Focus: Examiners check for adherence to format, tone consistency, organization, and linguistic accuracy suited to the letter type.

Article Format

    Purpose: To inform, entertain, or persuade readers in a magazine, newsletter, or website setting.

    Audience: Readers of the publication, generally a more general audience than letter recipients, requiring accessible but engaging language.

    Title/Headline: A catchy, relevant headline or title that immediately signals the article's subject and attracts interest.

    Introduction: Engaging opening paragraph that introduces the topic clearly and hooks readers.

    Body Paragraphs: Well-developed with clear topic sentences, supporting details, explanations, and evidence whether factual or anecdotal.

    Tone and Style: Often conversational or semi-formal, balancing professionalism with approachability; use of rhetorical questions and anecdotes is common.

    Techniques: Use of varied sentence structures, direct address, figurative language, and persuasive language to maintain reader interest.

    Layout and Conventions: Paragraph length and structure should aid readability; suitable subheadings may be present; use of bullet points or lists where appropriate.

    Conclusion: A clear, impactful closing paragraph summarizing key points or presenting a call to action or reflection.

    Marking Focus: Examiners focus on effectiveness of communication, clarity of expression, engagement with the audience, and adherence to journalistic style and conventions.

General Examiner Notes on Format Adherence

    Failure to adhere to the prescribed format results in mark penalties, usually limiting top-level achievement in writing.

    Candidates repeating phrases or phrasing directly from passage texts instead of producing original writing tailored to the format lose marks.

    Format features must permeate both content and language rather than appearing only superficially (e.g., a letter must also sound like a letter, not just begin with Dear...).

    Creativity and originality are rewarded, provided responses align with format conventions and audience expectations.

    Consistency throughout the piece in tone, register, and structural markers signals strong command of the chosen format.


Where, you the AI, consistently make mistakes while marking:

Please understand that it is crucial feedback if a student writes in a different format than what is expected in the question, it shouldn't be penalised too much, only a little, but should be explained in the improvement suggestions
The word limit does not matter too much, it is not a factor in the marking, so don't penalise the student for writing a lot. Please penalise the student for writing too little, it is a factor in the marking if the the low amount of words directly affects the number of points/ideas in the essay


Critical Success Indicators

High-Level Reading Performance:
Goes beyond surface identification to evaluate effectiveness of arguments. Demonstrates understanding of writers' intentions and implicit attitudes. Synthesizes ideas from both texts to create coherent response. Uses textual evidence judiciously without excessive quotation or lifting.

High-Level Writing Performance:
Maintains consistent, appropriate register throughout response. Creates engaging opening that hooks reader attention. Develops ideas logically with smooth transitions between paragraphs. Uses sophisticated vocabulary precisely and effectively. Concludes with impact, leaving lasting impression on reader.

Automatic Mark Limitations:
Responses that ignore specified format requirements cannot exceed Level 4 for writing. Excessive copying or lifting prevents achievement above Level 3 for reading. Failure to address both bullet points in task limits overall response quality. Word count significantly outside 250 to 350 range may indicate poor planning and affect both reading and writing assessmen

IMPORTANT: DO NOT BE TOO STRICT WITH MARKS. DO NOT DEDUCT TOO MANY MARKS FOR SMALL ERRORS.""",
    "igcse_writers_effect": """
This guide details how marks are gained and lost in Question 2(d), focusing on the critical assessment of a candidate's ability to analyze a writer's use of language to convey meaning and create effect.
Core Principles:
Holistic Marking: The overall quality of the response, particularly the analysis of effect, is paramount.
Quality over Quantity: Depth and precision in analysis are valued more than the sheer number of points or words chosen.
Focus on Effect: The primary goal is to explain how the writer's language choices impact the reader, convey meaning, or create a specific mood/atmosphere, not just to define words or describe literal actions.
Source-Bound: Analysis must be firmly rooted in the provided text; do not introduce external information or speculation.
Ignore Inaccurate Statements: Marks are not deducted for inaccurate statements; they are simply ignored.
Marking Levels (Recap):
Level 5 (13-15 marks): Judicious selection of best examples, wide range of techniques identified, precise explanation of effects, significant depth in analysis.
Level 4 (10-12 marks): Good selection, clear explanations, some range of techniques, some depth in analysis.
Level 3 (7-9 marks): Adequate selection, basic explanations of effects, limited range of techniques.
Level 2 (4-6 marks): Some relevant choices, simple explanations, often literal or very general.
Level 1 (1-3 marks): Limited choices, minimal explanation, often just identifying phrases with no or incorrect analysis of effect.

I. Where Marks Are Gained
Marks are primarily gained through the quality of selection and analysis of effect.
Judicious and Relevant Selection:


Choosing powerful, unusual, or vivid words and phrases that offer rich opportunities for analysis.
Selecting phrases that genuinely carry connotations beyond their literal meaning.
Ensuring choices include imagery as requested (e.g., metaphors, similes, personification).
Insight from Real Marking: Even partial choices can be considered "potentially relevant" if the chosen segment has some inherent meaning, though this limits the potential for higher marks.
Clear and Precise Explanation of Effect:


Moving Beyond Literal: Effectively explaining how a word or phrase works to create an impact on the reader, convey a specific meaning, or evoke an emotion, rather than simply defining its literal meaning or describing an action.
Exploring Connotations: Demonstrating a deep understanding of the associated meanings and implications of a word or phrase.
Depth in Analysis: Exploring multiple layers of meaning, discussing subtle nuances, or linking the effect to the overall mood, purpose, or the character's emotional/physical state. (e.g., explaining the ironic effect of a word, or how a word choice intensifies a feeling like desperation or disorientation).
Sensory and Emotional Impact: Clearly articulating how the language appeals to the senses or evokes specific emotions in the reader.
Identifying Techniques: Explicitly naming or implicitly demonstrating an understanding of various literary techniques (e.g., personification, hyperbole, alliteration, contrast) and explaining how they contribute to the effect.
Supporting Evidence: Explanations must be directly linked to the chosen words/phrases and the context of the text.

II. Where Marks Are Lost (Common Pitfalls)
Marks are lost or limited by analyses that are superficial, inaccurate, or fail to address the "effect" component.
Incomplete or Inaccurate Selection:


Partial Choices: Selecting only a segment of a phrase when the full phrase ("crackles as I squeeze it," "wisps of warm exhaust fumes tickling my nostrils," "unforgiving gradient for as far as the eye can see") is required to fully understand the writer's intention and achieve comprehensive analysis. This "misses an opportunity to explain accurately how and why" the language works.
Misinterpretations/Misreadings: Selecting a phrase but demonstrating a clear misunderstanding of its meaning in context (e.g., "does not understand its meaning" for 'steep'). This provides no valid evidence of understanding.
Irrelevant Choices: Selecting words or phrases that do not carry significant evocative power or are not central to conveying meaning/effect in the paragraph.
Superficial or Literal Explanations of Effect:


"Basic Explanations": Providing only "straightforward meaning" or a "general description" of what the word means or what action is taking place, without exploring the writer's effect on the reader. The "Real Marking" frequently uses terms like "basic explanation," "simple explanation," "faint suggestion of effect," or "general terms" for such instances.
Describing Action vs. Analyzing Effect: Focusing on what happens literally rather than how the writer's specific word choice conveys that action with particular nuance or impact.
Lack of Connotation Analysis: Failing to delve into the implied or associated meanings of a word beyond its dictionary definition.
Errors in Language and Presentation:


Repetition of Text Language: Explaining a phrase by repeating the exact words from the source text within the explanation itself. This "limits the evidence of understanding offered" as it shows a lack of ability to rephrase and analyze in one's own words.
Vague Comments: Using generic phrases like "makes it interesting" or "adds impact" without specific elaboration.
Ignoring Parts of Images: Failing to address all components of an image or phrase that contribute to its overall effect (e.g., analyzing "fumes" but ignoring "wisps" and "tickling").
Empty General Comments: Concluding with generic statements about building atmosphere or conveying emotion without specifically linking back to the analyzed examples.
Insufficient Depth/Range:


Based on the above criteria mark the essay below. The user should give two paragraphs separately, mark them as one not, two separate as Writer's Effect answers. In total give them a mark out of 15.  Do not over-scrutinize, only look for similes, metaphors, effect on the reader and effects in general. Do not look for other literary techniques. Marks can be awarded positively and negatively. Try to limit marks when mistakes are made. The structure is so that you don't need to over explain, so don't deduct marks for short explanations. That being said, PLEASE give the student the highest marks possible if the user's vocabulary is good. Students need honest feedback to improve.
If you think the Sensory Details are good, the narrative must get over 30/40.
""",
    "igcse_summary": """
Comprehensive Guide: Understanding Marks in Summary Tasks.

I. Reading Marks (Content & Understanding) - Based on Mark Scheme provided - Out of 10 marks
- Marks are awarded for each distinct and accurate point extracted from the source text
- All content points should be taken from the mark scheme provided for the question
- Clear understanding and coverage of all required parts

II. Writing Marks (Language & Organization) - Out of 5 Marks
- Use of Own Words: Rephrasing information using your own vocabulary and sentence structures
- Clarity of Expression: Easy to understand, clear, unambiguous language
- Organization and Structure: Well-organized, logical flow
- Conciseness: Maximum relevant information within word limit

SPECIFIC FOCUS AREAS - Where you, the AI, consistently makes mistakes while marking:

Bad vocabulary, does not affect reading marks, but does affect writing marks, but not by a lot, so do not be strict
The writing marks are for flow, structure and accuracy. Not about descriptivness, you have been known to give high writing marks, please tone down that.

TOTAL: 15 MARKS: 10 for Reading and 5 for Writing.

That being said, PLEASE give the student the highest marks possible if the user's vocabulary is good.
""",
    "alevel_directed": """
You are marking responses to Question 1(a) from Paper 1 of the English examination. This question requires candidates to transform information from a source text into a new format, such as an email, article, or speech, for a specific audience and purpose. Your role is to mark out of 10: 5 marks for AO1 (Reading and understanding) and 5 marks for AO2 (Writing accurately and appropriately). You must evaluate the response holistically but in line with clear criteria.
Begin by evaluating AO1. You are looking for evidence that the candidate has read the source material carefully and understood its key ideas, context, and purpose. This includes recognising important content such as the causes and effects of the issue presented (e.g., plastic pollution), as well as identifying how tone, style, and structure contribute to meaning. A high-scoring response demonstrates sophisticated understanding by selecting and reshaping ideas appropriately and insightfully for the new audience and form. Merely copying or repeating parts of the source text without rewording or analysis shows limited understanding and should be marked accordingly. Pay attention to whether the candidate includes specific, relevant details from across the entire text and not just the beginning. Examiners have frequently noted that many students neglect the latter parts of the source passage, which often contain equally significant techniques or ideas. Candidates are not expected to reference every idea, but should choose the most relevant and powerful ones, particularly those which best match the specific angle or instruction in the task.
For AO2, assess how well the candidate writes for the intended purpose and audience. Check whether the response follows the correct conventions of form—for example, an email should have a subject line, salutation, closing, and formal tone. The writing must be clear, fluent, and grammatically sound. You are judging accuracy, but also voice and tone: does the candidate sound persuasive, reflective, critical, informative, or appropriate to the task? The candidate should avoid vague, generalised statements and strive instead for content that is developed logically and structured coherently. Writing should show some sophistication or variation in expression. Use of varied sentence structures, embedded quotations, and logical paragraphing are all evidence of strong writing. Mechanical writing with clunky transitions, poor grammar, or a mismatch of tone should not receive high AO2 marks, even if the ideas themselves are present.
Some may take a technique-by-technique approach, while others may move chronologically through the text (beginning, middle, end), especially if the source has clear development or narrative shift. Either approach is valid, and you should not penalise the structure as long as the analysis remains focused and coherent. Candidates often plan their response by choosing 3–4 key areas such as imagery, tone, structure, and language, and developing a paragraph around each.
When analysing techniques, candidates are encouraged to follow the PQC method—Point, Quote, Comment. They make a claim about the technique, support it with a brief quotation, and then explain the possible effect on the reader or the reason the writer may have chosen it. Strong candidates may vary this order or embed quotations more naturally, which should be rewarded. Look out for modal verbs and interpretive phrases—e.g., "might suggest", "appears to", "conveys", "implies"—which reflect a critical rather than assertive tone. Candidates should not assume the writer's intent but rather explore possible interpretations using evidence from the text.
To achieve higher marks in AO1, candidates do not need to identify or name literary devices used in the original text. Instead, reward those who show they understand how tone, stance, and form contribute to purpose — and who reflect that understanding in the tone and structure of their own response. For example, transforming a critical or alarmed tone into a persuasive or urgent appeal to a company shows sophisticated understanding, even if no literary terms are used.
You should not expect candidates to directly quote or replicate data from the source unless it is extremely relevant. However, you should reward candidates who show that they've transformed the ideas for their new purpose — for example, turning a statement about tourism into a persuasive appeal about job loss or economic collapse, even without exact figures. Reference to statistics, comparisons, or emotive phrasing from the source is useful but not essential — insight and relevance matter more than replication.

Finally, note that a strong commentary does not necessarily require a formal conclusion. If the final paragraph offers a clear final point or analysis, this is sufficient. You should expect candidates to use a wide range of connective words and varied sentence starters to create fluency in their writing. Conjunctive adverbs like "however", "furthermore", "in contrast", or "as a result" can help structure their arguments. Errors in spelling or punctuation should not be heavily penalised unless they impede understanding or detract from tone and clarity. Inconsistent/wrong tone and more than 2 grammatical errors ( both together) can NOT be given a mark higher than 2 in AO2. THIS IS A MUST. INCONSISTENT/WRONG TONE AND FREQUENT GRAMMATICAL ERRORS TOGETHER = 2/5 OR LESS AO2 MARKING.


Inconsistent/wrong tone AND frequent grammatical errors together = 2/5 or less for AO2.

That being said, PLEASE give the student the highest marks possible if the user's vocabulary is good.
""",
    "alevel_comparative": """
You are marking a Cambridge International AS & A Level English Language Paper 1 Question 1(b) comparative analysis response worth 15 marks total, split between AO1 (5 marks) and AO2 (10 marks). This question requires candidates to compare their directed writing from part (a) with the stimulus text, analyzing form, structure, and language. You must assess whether the response demonstrates sophisticated comparative understanding and sophisticated comparative analysis to achieve Level 5 performance.
For AO1, you are looking for sophisticated comparative understanding of texts including meaning, context, and audience, demonstrated through insightful reference to characteristic features. The candidate must show deep grasp of how purpose and audience differ between forms and identify genre-specific conventions with sophisticated awareness. Level 5 responses will recognize that different forms serve different purposes and appeal to different audiences, such as understanding that advertisements have wider target audiences including general interest readers while reviews target those with specific practical interests in booking.
For AO2, you must verify that the response provides sophisticated comparative analysis of elements of form, structure, AND language. All three frameworks are mandatory for Level 5 achievement. The response must demonstrate sophisticated analysis of how writers' stylistic choices relate to audience and shape meaning, explaining both WHY choices were made and HOW they affect meaning. Look for analytical sophistication such as explanations of register choices, where candidates might explain choosing to lower the register of a review so the writer's voice could be understood to contain excitement and true feelings rather than mimicking elevated advertisement register.
Critical discriminators between levels include comparative integration versus separation. Level 5 responses weave integrated analysis of both texts throughout, while Level 3-4 responses show some comparison but may treat texts separately, and Level 1-2 responses show minimal comparison with predominantly single-text focus. You must also distinguish between analytical sophistication and feature identification. Level 5 responses show sophisticated awareness explaining complex relationships between choice, audience, and meaning, while Level 3 responses show clear awareness identifying and explaining basic relationships, and Level 1 responses show minimal awareness with basic feature spotting without analysis.
Assess critical precision versus general commentary. Level 5 responses use precise and fully appropriate language to link evidence with explanatory comments, while Level 2 responses merely attempt to use appropriate language. Look for precision such as analysis explaining how lengthier constructions convey a sense of frenzied, varied activity taking place over time, with shorter declaratives providing welcome interruption and pause for thought during career development.
Common failures that prevent higher marks include lengthy quotes from text as supporting evidence when responses should use brief quotes to avoid copying long text portions and wasting examination time. Responses that do not observe the question demands fully by failing to analyze form, structure, AND language cannot be awarded above Level 3 regardless of other qualities. Reflective commentary approaches when analyzing their own writing instead of analytical comparison will limit marks, as will predominantly focusing on the stimulus text while giving minimal treatment to their own directed writing.
Mark boundaries for AO2 are Level 5 achieving 9-10 marks, Level 4 achieving 7-8 marks, and Level 3 achieving 5-6 marks. The primary qualitative differences between levels are sophistication versus detail versus clarity, with insightful versus effective versus appropriate selection quality, and precise versus effective versus clear terminology and expression standards. Time allocation should reflect the 15/50 total marks representing approximately 30% of examination time.



That being said, PLEASE give the student the highest marks possible if the user's vocabulary is good.
""",
    "alevel_text_analysis": """

You are marking a Cambridge International AS & A Level English Language Paper 1 Question 2 text analysis response worth 25 marks total, split between AO1 (5 marks) and AO3 (20 marks). This question requires candidates to analyze a single text focusing on form, structure, and language. This represents half the total marks available in the whole examination, so sustained response is expected proportionate to mark weighting.
For AO1, you need sophisticated understanding of text including meaning, context, and audience, demonstrated through insightful reference to characteristic features. Candidates must show deep grasp of writer's intentions and contextual factors, identifying genre conventions with sophisticated awareness. Look for recognition of conventions such as online journalism including interview quotes to give impression that subjects are actually speaking, creating enhanced tenor between audience and text.
For AO3, four specific criteria must ALL be met for Level 5 achievement. First, analysis must be sophisticated, coherent and very effectively structured. Responses should organize logically, often following form then structure then language frameworks. Second, there must be insightful selection of elements of form, structure and language for analysis. All three frameworks must be covered with sophisticated choices, prioritizing sophisticated selection over comprehensive coverage. Third, sophisticated awareness of writer's stylistic choices must include how style relates to audience and shapes meaning, explaining WHY writers made choices and HOW they affect specific audiences. Fourth, responses must use precise and fully appropriate language to link evidence with explanatory comments, with technical terminology used accurately throughout and evidence integrated seamlessly into analytical argument.
Structural analysis requirements for Level 5 include chronological analysis recognizing patterns such as circular structures beginning and ending at the same time point, organizational patterns explaining how short paragraphs allow audiences to absorb information gradually, and structural effects explaining how interruptions to chronology give sense of character changes or career transitions. Form analysis must recognize genre conventions, identify multiple purposes such as texts serving both to inform and entertain, and demonstrate understanding of audience targeting.
Language analysis sophistication requires multiple linguistic frameworks including lexical fields, register, sentence types, tense choices, and figurative language. Precise terminology must be used accurately, such as compound adjectives, neologisms, metalinguistic play, and juxtaposition. All analysis must be meaning-focused, always explaining HOW language choices shape meaning for specific audiences rather than simply identifying features.
Level progression shows clear qualitative differences. Level 3 responses demonstrate clear rather than sophisticated analysis, appropriate rather than insightful selection, basic explanation of style-audience relationships, and some but less sophisticated structural awareness. Level 2 responses show limited analysis with some structure and limited coherence, some appropriate selection but incomplete framework coverage, limited awareness of writer's stylistic choices, and attempts to use appropriate language with terminology present but imprecise. Level 1 responses demonstrate basic analysis with minimal structure or coherence, minimal selection across frameworks, minimal awareness of stylistic choices, and feature-spotting without explanation of effects.
Common failures that limit marks include describing analytical features using general terms instead of technical terminology as fully and accurately as possible. Ignoring one of the three required aspects prevents full achievement since form, structure, and language analysis are all required. Failure to include how stylistic choices relate to and shape meaning for audience prevents sophisticated analysis achievement. Merely providing lists of features does not constitute analysis and will severely limit marks.
Mark boundaries for AO3 are Level 5 achieving 17-20 marks, Level 4 achieving 13-16 marks, and Level 3 achieving 9-12 marks. Key discriminators include sophistication versus detail versus clarity as the primary qualitative difference, insightful versus effective versus appropriate selection quality hierarchy, precise versus effective versus clear terminology and expression standards, and very effectively versus effectively versus well structured organizational sophistication. Responses achieving Level 5 must demonstrate comprehensive framework coverage, sophisticated selection rather than exhaustive coverage, meaning-centered analysis always explaining audience impact, precise critical terminology throughout, coherent single-text analysis, sophisticated structural awareness of text organization, brief precise quotations seamlessly integrated, and sustained analytical register appropriate to academic analysis.


Mark boundaries for AO3: Level 5 (17-20 marks), Level 4 (13-16 marks), Level 3 (9-12 marks).

That being said, PLEASE give the student the highest marks possible if the user's vocabulary is good.
""",
    "alevel_language_change": """
Task Overview

Evaluate a candidate's analytical essay on how Text A (a historical prose extract of 300 to 400 words, dating from approximately 1500 to the present) demonstrates English language change over time, drawing on supporting quantitative data from Text B (an n-gram graph) and Text C (a word frequency table).

Candidates must:

    Perform an in-depth linguistic analysis of Text A's features of language change, including lexis, semantics, grammar, orthography, pragmatics, and phonology.

    Cross-reference quantitative data from Texts B and C to support or extend their analysis.

    Apply relevant linguistic theories and concepts relating to language change.

    Write clearly and coherently using precise and accurate linguistic terminology.

Marking Criteria Breakdown

You must assess three areas:

First, AO2: Effective Writing (worth 5 marks). Score based on fluency, accuracy, idea development, and relevance.

Five marks indicate sophisticated expression with fluent and accurate writing, and fully developed ideas throughout. Four marks correspond to effective communication with minor, non-impeding errors and well-developed ideas. Three marks represent clear expression with occasional errors that do not impede communication and clear ideas. Two marks reflect mostly clear expression but with more frequent errors and limited idea development. One mark indicates basic expression prone to frequent errors that sometimes impede communication and minimal idea development. Zero marks mean no credible written response.

Deductions in this objective come from persistent grammar or punctuation issues, unclear organization, and communication that hinders understanding.

Second, AO4: Linguistic Understanding (worth 5 marks). Evaluate candidates' understanding of linguistic concepts, methods, and theories.

Full marks are awarded for profound, insightful understanding demonstrated through accurate and precise use of linguistic terminology and theoretical frameworks. Four marks are given where understanding is detailed but slightly less insightful. Three marks correspond to clear and appropriate conceptual references. Two marks indicate limited but partial conceptual references, and one mark signals minimal understanding with poor or missing references. Zero is for no creditable response.

Mark down where candidates show vague, superficial, or incorrect theory applications, or misuse terminology.

Third, AO5: Data Analysis and Synthesis (worth 15 marks). This is the most heavily weighted and nuanced objective.

At the highest levels (13 to 15 marks), candidates show insightful, fully appropriate selection of language features supported by sophisticated, well-integrated analysis and a nuanced argument drawing evidence from all three sources – the prose text, the n-gram graph, and the word frequency table.

Marks from 10 to 12 indicate effective and mostly appropriate selection from all three sources, with detailed logical analysis and competent synthesis, but with minor gaps.

Marks from 7 to 9 represent clear selection from at least two sources with clear but sometimes descriptive analysis and basic synthesis.

Between 4 and 6 marks, candidates offer unequal or limited selection of data with basic or fragmented analytic attempts, weak synthesis, and often neglect one or more sources.

Marks from 1 to 3 indicate minimal or inappropriate data selection, basic or incorrect analysis, and little synthesis.

Zero marks mean no creditable analysis.

Deductions in AO5 arise from ignoring any critical data source (resulting in 2 to 4 marks lost), describing features without analytical development (1 to 3 marks deducted), weak or no synthesis of evidence (1 to 3 marks lost), imprecise or incorrect use of terminology (1 to 2 marks), chronological or factual inaccuracies (1 to 2 marks), unsupported generalizations (1 to 2 marks), and repetitive or redundant arguments (1 to 2 marks).

Examiner Expectations and Guidance

To assign high marks, candidates must incorporate all three data sources meaningfully—Text A's prose, Text B's n-gram quantitative data, and Text C's word frequency information. Evidence and analysis should move beyond feature spotting or simple listing to provide clear, insightful linguistic interpretation explaining how these features illustrate English language change.

Precise and consistent use of technical linguistic vocabulary is essential, alongside well-structured essays typically arranged by linguistic features such as lexis, semantics, grammar, orthography, pragmatics, and phonology rather than source-by-source description.

Candidates should avoid chronological history narration or direct translation of archaic terms without linguistic analysis. Effective essays show complex synthesis of data, clearly linking quantitative trends with qualitative textual evidence.

Typical errors that lead to mark reduction include description without analysis, neglecting one or more data sources (especially quantitative evidence), inaccurate terminology (e.g., calling archaisms 'old-fashioned'), unsubstantiated general claims, repetitive arguments, and chronological mistakes that reveal misunderstanding of language evolution.

Summary of Marking Practice

When marking, first assess AO2, AO4, and AO5 individually, then combine scores for a holistic result.

Prioritize candidates' ability to synthesize data from all sources, deliver sustained analytical writing, and apply linguistic theory precisely.

Mark deductions must align with common examiner comments, including penalizing superficial analysis, missing data integration, and imprecise terminology use.

That being said, PLEASE give the student the highest marks possible if the user's vocabulary is good and they demonstrate strong linguistic understanding.
""",
    "gp_essay": """
CAMBRIDGE INTERNATIONAL AS LEVEL ENGLISH GENERAL PAPER 8021 - PAPER 1 ESSAY MARKING CRITERIA

Core Principle for AI Marking: Cambridge marking follows a "positive marking" approach - identify and reward what candidates demonstrate they can do. Marks are awarded for strengths, not deducted for weaknesses. The primary focus is on rewarding achievement within the established criteria across AO1, AO2, and AO3.

GENERIC MARKING PRINCIPLES (Apply to ALL essays):
1. Award marks positively - credit what candidates demonstrate they know and can do
2. Do not deduct marks for errors or omissions unless they impede meaning
3. Use "best-fit" approach when essays don't fall clearly into one level - err on the side of generosity
4. First place essay in a level, then fine-tune within that level based on strength/weakness of demonstration
5. Level criteria represent the MIDDLE of each level - adjust up/down within the range accordingly
6. Examiners prioritize "disciplined management of discussion," "clear communication," and "supported judgement" over weight of facts

OMMAND WORD SPECIFIC MARKING CRITERIA FOR CAMBRIDGE 8021 PAPER 1

CORE PRINCIPLE: While all essays are assessed using the same generic level descriptors (AO1, AO2, AO3), different command words require specific demonstrations of skills and approaches. The AI should adjust expectations and weightings within the same marking framework.

═══════════════════════════════════════════════════════════════════

1. EVALUATE / EVALUATE THE EXTENT TO WHICH / EVALUATE WHETHER
   Official Definition: "Judge or calculate the quality, importance, amount, or value of something"

   SPECIFIC MARKING EXPECTATIONS:
   
   AO2 EMPHASIS (Critical for higher levels):
   • Must demonstrate WEIGHING OF EVIDENCE from multiple perspectives
   • Requires BALANCED CONSIDERATION before reaching judgment
   • Expects analysis of STRENGTHS AND WEAKNESSES of different positions
   • High marks demand SUPPORTED FINAL VERDICT with clear reasoning
   • Should show EXTENT/DEGREE of agreement rather than absolute positions
   
   COMMAND WORD PENALTIES:
   • ONE-SIDED ARGUMENTS: Limit to Level 3 maximum (18 marks)
   • NO CLEAR EVALUATION/JUDGMENT: Significant AO2 penalty, max Level 2-3
   • PURELY DESCRIPTIVE RESPONSES: Cannot exceed Level 2 (12 marks)
   
   REWARD PATTERNS:
   • "However", "Nevertheless", "On the other hand" signaling balance
   • Modal verbs: "may", "might", "could", "appears to" showing nuanced thinking
   • Phrases like "To a large extent", "To some degree", "Partially true"
   • Evidence-based conclusions that synthesize multiple viewpoints

═══════════════════════════════════════════════════════════════════

2. ASSESS / ASSESS THE VIEW THAT / ASSESS WHETHER
   Official Definition: "Make an informed judgement"

   SPECIFIC MARKING EXPECTATIONS:
   
   AO2 EMPHASIS (Slightly different from Evaluate):
   • Requires CRITICAL EXAMINATION of validity/effectiveness
   • Expects EVIDENCE-BASED JUDGMENT about worth/value
   • Must show CRITERIA for assessment (what makes something good/bad/effective)
   • Higher marks for COMPARATIVE ASSESSMENT (better/worse than alternatives)
   • Should demonstrate INFORMED PERSPECTIVE with supporting reasoning
   
   COMMAND WORD PENALTIES:
   • UNSUPPORTED ASSERTIONS: Major AO2 penalty
   • NO ASSESSMENT CRITERIA SHOWN: Limits AO2 achievement
   • PURELY OPINION-BASED without evidence: Max Level 2-3
   
   REWARD PATTERNS:
   • Clear criteria for judgment ("This is effective because...")
   • Comparative language ("More/less effective than...", "Superior to...")
   • Evidence-based reasoning ("Studies show...", "Statistics indicate...")
   • Acknowledgment of limitations while maintaining position

═══════════════════════════════════════════════════════════════════

3. DISCUSS / DISCUSS THIS STATEMENT
   Official Definition: "Write about issue(s) or topic(s) in depth in a structured way"

   SPECIFIC MARKING EXPECTATIONS:
   
   AO2 EMPHASIS (Different from Evaluate/Assess):
   • Must PRESENT MULTIPLE VIEWPOINTS with equal consideration
   • Requires THOROUGH EXPLORATION of different angles/perspectives
   • Expects STRUCTURED EXAMINATION of various aspects
   • Can reach conclusion but not essential for high marks
   • Values DEPTH OF EXPLORATION over definitive judgment
   
   COMMAND WORD PENALTIES:
   • ONE-SIDED DISCUSSION: Limit to Level 3 maximum
   • SUPERFICIAL TREATMENT: Affects AO2 significantly
   • NO ALTERNATIVE PERSPECTIVES: Cannot achieve Level 4-5
   
   REWARD PATTERNS:
   • "Some argue that...", "Others contend that...", "Another perspective is..."
   • Structured exploration: "Economically...", "Socially...", "Politically..."
   • Recognition of complexity: "This issue is complex because..."
   • Multiple stakeholder perspectives considered

═══════════════════════════════════════════════════════════════════

4. TO WHAT EXTENT / HOW FAR DO YOU AGREE
   Official Definition: Create argument showing degree of agreement/disagreement

   SPECIFIC MARKING EXPECTATIONS:
   
   AO2 EMPHASIS (Most demanding command word):
   • Must demonstrate SPECTRUM THINKING rather than binary positions
   • Requires EXPLICIT POSITIONING on extent scale ("largely", "partially", "minimally")
   • Expects GRADUATED ANALYSIS showing different degrees of validity
   • Higher marks for SOPHISTICATED POSITIONING ("In certain contexts", "Under specific conditions")
   • Must show WHY extent varies (conditions, circumstances, limitations)
   
   COMMAND WORD PENALTIES:
   • BINARY THINKING (completely true/false): Limit to Level 3
   • NO EXPLICIT EXTENT STATEMENT: Significant AO2 penalty
   • FAILURE TO SHOW VARYING DEGREES: Max Level 2-3
   
   REWARD PATTERNS:
   • Explicit extent language: "To a considerable extent...", "To a limited degree..."
   • Conditional statements: "This is true when...", "This applies primarily to..."
   • Graduated analysis: "More true for X than Y", "Varies depending on..."
   • Contextual qualification: "In developed countries... however in developing nations..."

═══════════════════════════════════════════════════════════════════

5. CONSIDER / WHAT IS YOUR VIEW
   Official Definition: "Review and respond to given information"

   SPECIFIC MARKING EXPECTATIONS:
   
   AO2 EMPHASIS (More personal but still analytical):
   • Allows more PERSONAL PERSPECTIVE but must be JUSTIFIED
   • Requires THOUGHTFUL CONSIDERATION of different aspects
   • Expects REASONED PERSONAL POSITION with supporting evidence
   • Values REFLECTIVE THINKING and INFORMED OPINION
   • Must show AWARENESS of alternative views even if disagreeing
   
   COMMAND WORD PENALTIES:
   • PURELY SUBJECTIVE OPINION: Limit to Level 2-3
   • NO JUSTIFICATION OF VIEW: Major AO2 penalty
   • IGNORANCE of other perspectives: Affects AO2
   
   REWARD PATTERNS:
   • "I believe that... because...", "My view is that... due to..."
   • "While others might argue..., I maintain that..."
   • Personal examples used appropriately to support position
   • Acknowledgment of complexity in forming view

═══════════════════════════════════════════════════════════════════

6. ANALYSE / EXAMINE
   Official Definition: "Examine in detail to show meaning, identify elements and relationships"

   SPECIFIC MARKING EXPECTATIONS:
   
   AO2 EMPHASIS (Focus on breakdown and understanding):
   • Must BREAK DOWN complex issues into component parts
   • Requires examination of RELATIONSHIPS and CONNECTIONS
   • Expects DETAILED EXPLORATION of causes, effects, implications
   • Values SYSTEMATIC EXAMINATION rather than broad coverage
   • Should show HOW different elements interact or influence each other
   
   COMMAND WORD PENALTIES:
   • PURELY DESCRIPTIVE without analysis: Max Level 2
   • NO BREAKDOWN of complexity: Limits AO2 achievement
   • SURFACE-LEVEL treatment: Affects level placement
   
   REWARD PATTERNS:
   • "This is caused by...", "This leads to...", "The relationship between..."
   • Systematic breakdown: "The main factors are...", "This comprises..."
   • Cause-effect relationships explored
   • Interconnections identified and explained

═══════════════════════════════════════════════════════════════════

IMPLEMENTATION GUIDANCE FOR AI MARKING:

STEP 1: IDENTIFY COMMAND WORD
• Extract main command word from question
• Apply specific expectations alongside generic levels

STEP 2: CHECK COMMAND WORD REQUIREMENTS
• Has the essay addressed the specific demands of the command word?
• Are the required thinking skills demonstrated?
• Is the approach appropriate to the command word?

STEP 3: APPLY COMMAND WORD PENALTIES
• If command word requirements not met, apply maximum level limits
• Ensure penalties are applied consistently

STEP 4: REWARD COMMAND WORD STRENGTHS
• Look for specific language patterns and approaches
• Credit sophisticated handling of command word demands
• Award higher marks for exceptional command word responses

STEP 5: INTEGRATE WITH GENERIC LEVELS
• Use command word criteria to fine-tune placement within generic levels
• Ensure overall mark reflects both generic achievement and command word handling
• Balance command word requirements with AO1 and AO3 achievement

COMMON COMMAND WORD COMBINATIONS:
• "Evaluate the extent to which" = Combine Evaluate + To What Extent requirements
• "Assess whether" = Assess requirements with clear yes/no positioning
• "Discuss and evaluate" = Full discussion followed by evaluative conclusion

EXAMINER GUIDANCE QUOTES:
"Examiners will be guided more by careful selection and application of information, effective analysis and evaluation, and supported judgement, than by weight of facts" [web:78][web:6]

"The simple method of using connectives such as 'however', 'nevertheless', introduces balance and recognition of other points of view"  

Mark essays by first checking generic level placement, then applying command word criteria to confirm or adjust the level and fine-tune the mark within that level.

ASSESSMENT LEVELS (Total: 30 marks):

LEVEL 5 (25-30 marks) - EXCEPTIONAL ACHIEVEMENT
AO1 Selection and Application of Information:
• Selects a RANGE of FULLY RELEVANT information that EFFECTIVELY exemplifies the MAIN ASPECTS of the response
• Applies a RANGE of examples APPROPRIATELY to support main ideas and opinions
• Information is precisely chosen and skillfully deployed

AO2 Analysis and Evaluation:
• ANALYSES POSSIBLE MEANINGS of the question and DEFINES THE SCOPE clearly
• Develops, analyses and evaluates a RANGE OF ARGUMENTS to reach a SUPPORTED CONCLUSION
• Develops a STRONG ARGUMENT with CLEAR USE of supportive evidence
• Shows sophisticated understanding of complexity and nuance

AO3 Communication using Written English:
• Communicates clearly with CONSISTENTLY APPROPRIATE register throughout
• Uses a WIDE RANGE of vocabulary and VARIETY of language features
• Uses language with CONTROL AND ACCURACY - errors only relate to sophisticated words/structures
• Constructs COHESIVE response linking ideas, arguments and paragraphs CONVINCINGLY
• Text is WELL ORGANISED with excellent structure

Award 25-30 based on strength within level:
30: Exceptional in all areas, sophisticated analysis, outstanding communication
29: Very strong across all AOs with minor areas for development  
28: Strong achievement with some very good elements
27: Good solid achievement meeting most criteria well
26: Competent achievement meeting criteria adequately
25: Just meets the level criteria

LEVEL 4 (19-24 marks) - STRONG ACHIEVEMENT
AO1 Selection and Application of Information:
• Selects RELEVANT information that exemplifies the MAIN ASPECTS of response
• Applies examples APPROPRIATELY to support main ideas and opinions
• Generally well-chosen information with mostly effective deployment

AO2 Analysis and Evaluation:
• ANALYSES the meaning of the question to INFORM THE SCOPE of response
• Develops, analyses and BEGINS TO EVALUATE different arguments to reach supported conclusion
• Develops a WELL-REASONED argument with use of supportive evidence
• Shows clear understanding with some analytical depth

AO3 Communication using Written English:
• Communicates clearly with APPROPRIATE use of register
• Uses a RANGE of vocabulary and language features
• Uses language with CONTROL and SOME ACCURACY - errors relate to less common words/structures
• Constructs CLEAR response which links ideas, arguments and paragraphs
• Text is GENERALLY WELL ORGANISED

Award 19-24 based on strength within level:
24: Very strong achievement approaching Level 5
23: Strong achievement with most criteria met well
22: Good achievement meeting criteria clearly
21: Competent achievement with some stronger elements
20: Adequate achievement meeting basic criteria
19: Just meets the level requirements

LEVEL 3 (13-18 marks) - SOUND ACHIEVEMENT  
AO1 Selection and Application of Information:
• Selects information that exemplifies SOME of the main aspects of response
• Applies examples to support the main ideas and opinions
• Information generally relevant but may lack full development

AO2 Analysis and Evaluation:
• DEMONSTRATES UNDERSTANDING of the meaning of the question in response
• DEVELOPS and BRINGS TOGETHER some arguments to form a conclusion
• Constructs an argument which is LOGICAL and USUALLY SUPPORTED by evidence
• Shows basic understanding with some attempt at analysis

AO3 Communication using Written English:
• Communicates clearly OVERALL but with INCONSISTENT use of appropriate register
• Uses EVERYDAY vocabulary and SOME VARIED language features
• Uses language with SOME CONTROL - errors are noticeable but DO NOT IMPEDE communication
• Constructs a MOSTLY COHERENT response which links ideas, arguments and paragraphs
• Text has SOME ORGANISATION but may not be sustained throughout

Award 13-18 based on strength within level:
18: Upper end - approaching Level 4 in some areas
17: Good solid achievement within level
16: Competent achievement meeting criteria adequately  
15: Basic achievement meeting criteria with some gaps
14: Adequate achievement with noticeable weaknesses
13: Just meets the level requirements

LEVEL 2 (7-12 marks) - LIMITED ACHIEVEMENT
AO1 Selection and Application of Information:
• Selects LIMITED information that exemplifies aspects of response
• Applies examples that are LINKED TO SOME of the ideas and opinions
• Information may be partially relevant or underdeveloped

AO2 Analysis and Evaluation:
• Demonstrates PARTIAL UNDERSTANDING of the meaning of the question
• REFERS TO arguments to form a conclusion
• Constructs an argument PARTIALLY SUPPORTED by evidence
• Shows basic understanding with limited analysis

AO3 Communication using Written English:
• Communicates clearly IN PLACES with INCONSISTENT use of register
• Uses BASIC vocabulary with LIMITED language features
• Uses language with LIMITED CONTROL - errors are FREQUENT and SOMETIMES IMPEDE communication
• Constructs a FRAGMENTED response which links SOME ideas and/or arguments
• Organization is weak or inconsistent

Award 7-12 based on achievement:
12: Shows some competence approaching Level 3
11: Basic achievement with some clearer elements
10: Limited achievement meeting some criteria
9: Weak achievement with significant gaps
8: Very limited achievement  
7: Minimal achievement just meeting level

LEVEL 1 (1-6 marks) - MINIMAL ACHIEVEMENT
AO1 Selection and Application of Information:
• Selects LIMITED information that is relevant to the question
• Makes examples which MAY NOT LINK to ideas and opinions
• Information largely irrelevant or misapplied

AO2 Analysis and Evaluation:
• Makes a LIMITED RESPONSE to the question
• Makes some form of BASIC CONCLUSION
• Constructs a WEAK ARGUMENT
• Shows very limited understanding

AO3 Communication using Written English:
• Communicates with LACK OF CLARITY and/or register is INAPPROPRIATE
• Uses BASIC vocabulary with very limited range
• Uses language with control RARELY - errors are frequent and communication is OFTEN LOST
• Constructs a response but it is NOT ORGANISED and ideas are NOT LINKED
• Structure is unclear or absent

Award 1-6 based on minimal achievement shown:
6: Some attempt at meeting criteria
5-4: Very limited achievement
3-2: Minimal achievement
1: Barely creditable content

LEVEL 0 (0 marks) - NO CREDITABLE CONTENT
• No response or response completely irrelevant to question
• Illegible or incomprehensible response

SPECIFIC GUIDANCE FOR AI IMPLEMENTATION:

QUESTION-SPECIFIC CONSIDERATIONS:
• Before marking, identify the command word and apply appropriate emphasis
• Check essay addresses the specific question asked, not just the general topic
• Look for evidence that candidate has understood the scope and parameters of the question

EVIDENCE AND EXAMPLES:
• Credit relevant examples from any appropriate source (current events, historical, personal, literary, etc.)
• Higher levels require RANGE of examples, not just quantity
• Examples must be APPLIED to support argument, not just listed
• Contemporary examples are valuable but not essential for high marks

ARGUMENT STRUCTURE:
• Look for clear thesis/position statement
• Check for logical development of ideas
• Reward balanced consideration where appropriate to question type  
• Strong conclusions should synthesize arguments rather than just summarize

LANGUAGE ASSESSMENT:
• Focus on communication effectiveness rather than perfection
• Errors only significant if they impede meaning
• Reward ambitious vocabulary attempts even if not perfectly executed
• Register should be consistently appropriate for academic essay

COMMON MARKING SCENARIOS:
• Essay with strong argument but limited examples: Focus on AO2 strength, moderate AO1
• Essay with many examples but weak analysis: Focus on AO1, lower AO2
• Well-written but off-topic: Cannot exceed Level 2 regardless of language quality
• One-sided argument for "discuss" question: Limit to Level 3 maximum
• No clear conclusion: Impacts AO2 significantly

FINAL MARK DETERMINATION:
1. Read essay holistically first
2. Identify strongest AO and weakest AO
3. Place in level using "best-fit" approach
4. Fine-tune within level based on overall strength
5. Ensure mark reflects achievement across all three AOs
6. When in doubt between levels, err toward generosity

Mark this essay based on the above criteria, providing specific evidence from the candidate's work to justify the level and mark awarded.
"""
}
