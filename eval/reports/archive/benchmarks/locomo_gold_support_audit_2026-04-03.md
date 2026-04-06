# LoCoMo Gold-Support Audit — 2026-04-03T14:36:48.986Z

## Scope

- Offline audit only; does not write benchmark data.
- Checks whether each gold answer is literally or near-literally supported by its official evidence neighborhood.
- Intended to separate likely benchmark abstraction gaps from retrieval/path failures.

## Configuration

| Parameter | Value |
|---|---|
| Dataset | C:\Users\24787\.openclaw\workspace\agents\director\projects\memory-engine-plugin\memory-lightrag\eval\datasets\locomo10.json |
| Samples | 10 |
| Queries | 1986 |
| Sample filter | (all) |

## Overall Summary

| Bucket | Count | Rate |
|---|---|---|
| temporal_or_derived | 137 | 6.90% |
| lexically_supported | 908 | 45.72% |
| partially_supported | 692 | 34.84% |
| unsupported_gold_abstraction_likely | 249 | 12.54% |

## By Category

| Category | Total | Temporal | Lexically Supported | Partially Supported | Unsupported Abstraction Likely |
|---|---|---|---|---|---|
| 1 | 282 | 2 | 61 | 170 | 49 |
| 2 | 321 | 135 | 42 | 77 | 67 |
| 3 | 96 | 0 | 9 | 9 | 78 |
| 4 | 841 | 0 | 517 | 288 | 36 |
| 5 | 446 | 0 | 279 | 148 | 19 |

## Likely Unsupported Gold Abstractions

| Query | Cat | Gold Answer | Token Recall | Missing Tokens | Evidence IDs |
|---|---|---|---|---|---|
| LOCOMO-conv-26-015 | 3 | Likely no | 0.00 | likely | ["D4:15","D3:5"] |
| LOCOMO-conv-26-031 | 3 | Likely no, she does not refer to herself as part of it | 0.00 | likely, not, refer, herself, part | [] |
| LOCOMO-conv-26-038 | 1 | sunset | 0.00 | sunset | ["D8:6; D9:17"] |
| LOCOMO-conv-26-043 | 3 | National park; she likes the outdoors | 0.00 | national, park, likes, outdoors | ["D10:12","D10:14"] |
| LOCOMO-conv-26-047 | 3 | Yes, she is supportive | 0.00 | yes, supportive | [] |
| LOCOMO-conv-26-051 | 3 | Liberal | 0.00 | liberal | ["D12:1"] |
| LOCOMO-conv-26-056 | 1 | Sunsets | 0.00 | sunsets | ["D14:5","D8:6"] |
| LOCOMO-conv-26-102 | 4 | Yes | 0.00 | yes | ["D5:8"] |
| LOCOMO-conv-30-019 | 1 | Yes | 0.00 | yes | ["D1:4","D6:8"] |
| LOCOMO-conv-30-028 | 1 | Yes | 0.00 | yes | ["D1:14","D14:14","D1:16","D1:17","D9:10"] |
| LOCOMO-conv-30-032 | 1 | six months | 0.00 | six, months | ["D1:2","D15:13"] |
| LOCOMO-conv-30-069 | 4 | quit | 0.00 | quit | ["D14:17"] |
| LOCOMO-conv-30-078 | 4 | Hoodies | 0.00 | hoodies | ["D16:3"] |
| LOCOMO-conv-30-103 | 5 | Hoodies | 0.00 | hoodies | ["D16:3"] |
| LOCOMO-conv-41-001 | 2 | her mother | 0.00 | mother | ["D13:16"] |
| LOCOMO-conv-41-009 | 3 | Middle-class or wealthy | 0.00 | middle-class, wealthy | ["D5:5"] |
| LOCOMO-conv-41-015 | 3 | Yes | 0.00 | yes | ["D8:18","D8:20"] |
| LOCOMO-conv-41-018 | 3 | Political science, Public administration, Public affairs | 0.00 | political, science, public, administration, affairs | ["D9:6"] |
| LOCOMO-conv-41-032 | 2 | In 2013 | 0.00 | 2013 | ["D17:1"] |
| LOCOMO-conv-41-040 | 3 | Independence Day | 0.00 | independence, day | ["D21:3"] |
| LOCOMO-conv-41-051 | 3 | Selfless, family-oriented, passionate, rational | 0.00 | selfless, family-oriented, passionate, rational | ["D26:6","D2:14","D3:5","D4:6"] |
| LOCOMO-conv-42-013 | 3 | asthma | 0.00 | asthma | ["D5:11","D2:23"] |
| LOCOMO-conv-42-020 | 1 | twice | 0.00 | twice | ["D8:4","D11:3"] |
| LOCOMO-conv-42-044 | 2 | four months | 0.00 | four, months | ["D17:14","D22:9"] |
| LOCOMO-conv-42-050 | 1 | Twice | 0.00 | twice | ["D14:1","D24:12"] |
| LOCOMO-conv-42-054 | 1 | Twice. | 0.00 | twice | ["D5:4","D25:15"] |
| LOCOMO-conv-42-062 | 1 | Gamecube, PC,Playstation. | 0.00 | gamecube, playstation | ["D22:2","D27:21","D27:15"] |
| LOCOMO-conv-42-071 | 1 | takes them onwalks, holds them,feeds themstrawberries, givesthem baths. | 0.00 | takes, onwalks, holds, feeds, themstrawberries, givesthem, baths | ["D25:21","D25:23","D28:31"] |
| LOCOMO-conv-42-074 | 3 | Indiana | 0.00 | indiana | ["D28:22"] |
| LOCOMO-conv-42-079 | 1 | nine | 0.00 | nine | ["D1:3","D6:7","D10:4","D14:8","D17:1","D19:1","D20:1","D22:2","D27:1"] |
| LOCOMO-conv-42-085 | 3 | No; because both of them faced setbacks in their career | 0.00 | because, both, faced, setbacks, career | ["D20:1","D21:1"] |
| LOCOMO-conv-42-086 | 3 | filmmaker. | 0.00 | filmmaker | ["D29:1"] |
| LOCOMO-conv-42-088 | 3 | Florida | 0.00 | florida | ["D29:6"] |
| LOCOMO-conv-42-092 | 4 | dragons | 0.00 | dragons | ["D9:14"] |
| LOCOMO-conv-42-093 | 4 | red and purple lighting | 0.00 | red, purple, lighting | ["D10:2"] |
| LOCOMO-conv-42-137 | 4 | Four | 0.00 | four | ["D17:1"] |
| LOCOMO-conv-42-202 | 5 | dragons | 0.00 | dragons | ["D9:14"] |
| LOCOMO-conv-42-203 | 5 | red and purple lighting | 0.00 | red, purple, lighting | ["D10:2"] |
| LOCOMO-conv-43-004 | 3 | C. S.Lewis | 0.00 | lewis | ["D1:14","D1:16","D1:18"] |
| LOCOMO-conv-43-017 | 2 | three weeks | 0.00 | three, weeks | ["D3:2","D5:1"] |
| LOCOMO-conv-43-028 | 3 | Pomodoro technique | 0.00 | pomodoro, technique | ["D18:3","D18:7"] |
| LOCOMO-conv-43-033 | 3 | California or Florida | 0.00 | california, florida | ["D10:9"] |
| LOCOMO-conv-43-041 | 2 | Yes | 0.00 | yes | ["D14:16"] |
| LOCOMO-conv-43-050 | 1 | two times | 0.00 | two, times | ["D18:2","D19:6"] |
| LOCOMO-conv-43-054 | 3 | Sprinting, long-distance running, and boxing. | 0.00 | sprinting, long-distance, running, boxing | ["D8:5","D20:2"] |
| LOCOMO-conv-43-065 | 2 | December, 2023 | 0.00 | december, 2023 | ["D27:2"] |
| LOCOMO-conv-44-017 | 2 | August | 0.00 | august | ["D11:7"] |
| LOCOMO-conv-44-018 | 1 | three times | 0.00 | three, times | ["D11:7","D24:13","D26:20"] |
| LOCOMO-conv-44-025 | 1 | Yes | 0.00 | yes | ["D2:16","D13:10"] |
| LOCOMO-conv-44-035 | 2 | three months | 0.00 | three, months | ["D12:1","D24:2"] |
| LOCOMO-conv-44-044 | 3 | Minnesota | 0.00 | minnesota | ["D11:9"] |
| LOCOMO-conv-44-060 | 2 | 4 months | 0.00 | months | ["D12:1"] |
| LOCOMO-conv-44-111 | 4 | Walking | 0.00 | walking | ["D24:8"] |
| LOCOMO-conv-44-155 | 5 | Walking | 0.00 | walking | ["D24:8"] |
| LOCOMO-conv-47-001 | 3 | Obesity | 0.00 | obesity | ["D1:27"] |
| LOCOMO-conv-47-007 | 3 | Likely yes | 0.00 | likely, yes | ["D5:1"] |
| LOCOMO-conv-47-008 | 3 | Connecticut. | 0.00 | connecticut | ["D5:1"] |
| LOCOMO-conv-47-012 | 2 | seeking solitude | 0.00 | seeking, solitude | ["D6:7"] |
| LOCOMO-conv-47-013 | 3 | Presumably not | 0.00 | presumably, not | ["D6:6"] |
| LOCOMO-conv-47-014 | 2 | In 2021 | 0.00 | 2021 | ["D6:12"] |
| LOCOMO-conv-47-017 | 3 | UNO | 0.00 | uno | ["D8:34"] |
| LOCOMO-conv-47-018 | 3 | Mafia | 0.00 | mafia | ["D8:36"] |
| LOCOMO-conv-47-031 | 3 | Canada | 0.00 | canada | ["D16:9","D16:11"] |
| LOCOMO-conv-47-035 | 1 | Canada, Greenland | 0.00 | canada, greenland | ["D16:9","D17:22"] |
| LOCOMO-conv-47-036 | 3 | Greenland | 0.00 | greenland | ["D17:22"] |
| LOCOMO-conv-47-054 | 2 | six months | 0.00 | six, months | ["D6:1","D27:2"] |
| LOCOMO-conv-47-063 | 2 | nearly three months | 0.00 | nearly, three, months | ["D19:14","D29:8","D29:10"] |
| LOCOMO-conv-47-065 | 2 | nearly four months | 0.00 | nearly, four, months | ["D17:1","D30:2","D30:4"] |
| LOCOMO-conv-48-004 | 2 | in 2022 | 0.00 | 2022 | ["D1:6"] |
| LOCOMO-conv-48-006 | 3 | In France | 0.00 | france | ["D1:8"] |
| LOCOMO-conv-48-007 | 1 | pendants | 0.00 | pendants | ["D1:8","D1:9"] |
| LOCOMO-conv-48-008 | 2 | France | 0.00 | france | ["D1:8"] |
| LOCOMO-conv-48-012 | 3 | yes | 0.00 | yes | ["D2:5","D19:11","D23:4","D28:11"] |
| LOCOMO-conv-48-018 | 2 | in 2022 | 0.00 | 2022 | ["D2:24"] |
| LOCOMO-conv-48-019 | 3 | In France | 0.00 | france | ["D2:24"] |
| LOCOMO-conv-48-020 | 1 | two times | 0.00 | two, times | ["D2:24","D1:8"] |
| LOCOMO-conv-48-029 | 3 | Colombia | 0.00 | colombia | ["D4:33"] |
| LOCOMO-conv-48-033 | 2 | in 2022 | 0.00 | 2022 | ["D6:10"] |
| LOCOMO-conv-48-037 | 3 | likely no more than 30; since she's in school | 0.00 | likely, since, school | ["D8:2","D13:5","D21:6","D21:8","D22:6","D22:14","D24:2","D24:14","D25:5","D26:6"] |
| LOCOMO-conv-48-047 | 2 | four months | 0.00 | four, months | ["D3:1","D12:10","D13:1"] |
| LOCOMO-conv-48-049 | 3 | Alaska | 0.00 | alaska | ["D13:15"] |
| LOCOMO-conv-48-054 | 2 | in 2021 | 0.00 | 2021 | ["D16:6","D28:26"] |
| LOCOMO-conv-48-056 | 2 | Seraphim | 0.00 | seraphim | ["D2:24","D2:28","D16:6"] |
| LOCOMO-conv-48-066 | 2 | Brazil | 0.00 | brazil | ["D23:1"] |
| LOCOMO-conv-48-071 | 3 | likely yes | 0.00 | likely, yes | ["D23:22"] |
| LOCOMO-conv-48-074 | 1 | yes | 0.00 | yes | ["D2:28","D24:8"] |
| LOCOMO-conv-48-076 | 3 | Exploding Kittens | 0.00 | exploding, kittens | ["D27:12"] |
| LOCOMO-conv-48-079 | 2 | Phuket | 0.00 | phuket | ["D2:1"] |
| LOCOMO-conv-48-080 | 1 | yes | 0.00 | yes | ["D28:11","D29:25"] |
| LOCOMO-conv-48-082 | 2 | in October 2023 | 0.00 | october, 2023 | ["D29:34"] |
| LOCOMO-conv-48-088 | 1 | Thailand, Brazil | 0.00 | thailand, brazil | ["D6:10","D23:18"] |
| LOCOMO-conv-48-118 | 4 | a yellow coffee cup with a handwritten message | 0.00 | yellow, coffee, cup, handwritten, message | ["D8:22"] |
| LOCOMO-conv-48-136 | 4 | comforted | 0.00 | comforted | ["D14:6"] |
| LOCOMO-conv-48-213 | 5 | comforted | 0.00 | comforted | ["D14:6"] |
| LOCOMO-conv-49-006 | 3 | Canada | 0.00 | canada | ["D2:1"] |
| LOCOMO-conv-49-040 | 2 | three months | 0.00 | three, months | ["D2:6","D7:2"] |
| LOCOMO-conv-49-044 | 3 | every three months | 0.00 | every, three, months | ["D2:6","D7:2","D12:1"] |
| LOCOMO-conv-49-058 | 3 | California | 0.00 | california | ["D13:14"] |
| LOCOMO-conv-49-071 | 2 | four months | 0.00 | four, months | ["D5:1","D21:1"] |
| LOCOMO-conv-49-072 | 3 | Christmas | 0.00 | christmas | ["D21:2"] |
| LOCOMO-conv-50-005 | 3 | United States | 0.00 | united, states | ["D3:9","D3:10"] |
| LOCOMO-conv-50-008 | 3 | Yes | 0.00 | yes | ["D4:17"] |
| LOCOMO-conv-50-019 | 1 | two times | 0.00 | two, times | ["D6:5","D9:1"] |
| LOCOMO-conv-50-023 | 1 | yes | 0.00 | yes | ["D12:11","D18:7"] |
| LOCOMO-conv-50-025 | 1 | yes | 0.00 | yes | ["D13:7","D22:5","D20:1"] |
| LOCOMO-conv-50-038 | 3 | yes | 0.00 | yes | ["D18:7","D16:2","D7:1"] |
| LOCOMO-conv-50-040 | 3 | Dodge Charger | 0.00 | dodge, charger | [] |
| LOCOMO-conv-50-062 | 2 | nearly two months | 0.00 | nearly, two, months | ["D14:11","D20:1","D21:4"] |
| LOCOMO-conv-50-063 | 2 | two weeks | 0.00 | two, weeks | ["D14:1","D17:1"] |
| LOCOMO-conv-50-068 | 2 | Tokyo | 0.00 | tokyo | ["D28:1"] |
| LOCOMO-conv-49-032 | 3 | Their experiences likely lead them to view challenges as opportunities for growth and change. They both have embraced healthier lifestyles, indicating a proactive approach to managing stress and challenges. | 0.06 | experiences, likely, lead, view, challenges, opportunities, growth, change, both, embraced, lifestyles, indicating, proactive, approach, managing, stress | ["D9:1 D4:4 D4:6"] |
| LOCOMO-conv-43-071 | 3 | Skellig Michael, Malin Head, Loop Head, Ceann Sibéal, and Brow Head because they are Star Wars filming locations. | 0.15 | skellig, michael, malin, head, loop, ceann, sib, brow, because, filming, locations | ["D1:18","D27:21","D28:1"] |
| LOCOMO-conv-47-020 | 3 | Most likely yes, because he mentioned that the only creatures that gave him joy are dogs and he was actively trying to date. | 0.15 | likely, yes, because, mentioned, only, creatures, gave, him, dogs, actively, date | ["D9:16"] |
| LOCOMO-conv-49-039 | 3 | Nature and outdoor activities seem to be significant stress relievers and sources of joy for both Evan and Sam. These activities likely contribute positively to their mental well-being. | 0.18 | outdoor, activities, seem, significant, stress, relievers, sources, joy, both, likely, contribute, positively, mental, well-being | ["D22:1 D22:2 D9:10 D9:11"] |
| LOCOMO-conv-42-005 | 3 | Hairless cats or pigs,since they don't have fur, which is one of the main causes of Joanna's allergy. | 0.18 | hairless, cats, pigs, since, don, one, main, causes, allergy | ["D2:23"] |
| LOCOMO-conv-42-060 | 1 | Hangs them on a corkboard, writes themin a notebook. | 0.20 | hangs, corkboard, writes, themin | ["D15:9","D27:34"] |
| LOCOMO-conv-43-016 | 3 | likely John's friend, colleague or family | 0.20 | likely, friend, colleague, family | ["D4:8"] |
| LOCOMO-conv-44-034 | 3 | Change to a hybrid or remote job so he can move away from the city to the suburbs to have a larger living space and be closer to nature. | 0.23 | change, hybrid, remote, job, move, away, suburbs, larger, space, closer | ["D12:3","D18:1","D21:5"] |
| LOCOMO-conv-26-060 | 3 | Somewhat, but not extremely religious | 0.25 | somewhat, not, extremely | ["D14:19","D12:1"] |
| LOCOMO-conv-26-152 | 4 | Went on a nature walk or hike | 0.25 | went, walk, hike | ["D18:17"] |
| LOCOMO-conv-26-198 | 5 | Went on a nature walk or hike | 0.25 | went, walk, hike | ["D18:17"] |
| LOCOMO-conv-30-052 | 4 | personal style and customer comfort | 0.25 | personal, customer, comfort | ["D3:6"] |
| LOCOMO-conv-30-091 | 5 | personal style and customer comfort | 0.25 | personal, customer, comfort | ["D3:6"] |
| LOCOMO-conv-43-035 | 3 | become a basketball coach since he likes giving back and leadership | 0.25 | become, coach, since, likes, giving, back | ["D11:19","D26:1","D27:26"] |
| LOCOMO-conv-43-152 | 4 | Academic achievements and sports successes | 0.25 | academic, achievements, successes | ["D23:1","D23:2","D23:3"] |
| LOCOMO-conv-48-024 | 3 | She's more interested in playing video games | 0.25 | interested, playing, video | ["D3:11","D2:30"] |
| LOCOMO-conv-50-014 | 3 | Yes; because he enjoys the rush of performing onstage to large crowds | 0.25 | yes, because, enjoys, onstage, large, crowds | ["D7:11"] |
| LOCOMO-conv-50-016 | 1 | because it relaxes and calms him | 0.25 | because, relaxes, calms | ["D8:4","D1:16"] |
| LOCOMO-conv-43-019 | 1 | J.K. Rowling, R.R. Martin, Patrick Rothfuss, Paulo Coelho, and J. R. R. Tolkien. | 0.29 | rowling, martin, paulo, coelho, tolkien | ["D1:14","D2:7","D4:7","D5:15","D:11:26","D20:21","D26:36"] |
| LOCOMO-conv-44-054 | 3 | Park ranger or a similar position working for the National Park Services. | 0.29 | ranger, similar, position, working, services | ["D2:18","D3:1","D5:7","D8:27"] |
| LOCOMO-conv-47-045 | 3 | Possibly because he likes to drink beer on his days off. | 0.29 | possibly, because, likes, drink, days | ["D21:12","D21:14"] |
| LOCOMO-conv-49-021 | 3 | a cookbook with healthy recipes or a subscription to a healthy meal delivery service. | 0.29 | cookbook, subscription, meal, delivery, service | ["D2:9","D3:1","D3:3","D3:5","D4:10","D14:12","D5:9","D7:3","D7:2","D7:5","D7:12","D8:1","D8:5","D8:7","D8:8","D8:12","D9:1"] |
| LOCOMO-conv-49-047 | 3 | Evan and Sam use creative activities, like painting and writing, as therapeutic tools to express themselves and cope with stress. | 0.29 | use, creative, activities, like, writing, therapeutic, tools, themselves, cope, stress | ["D21:18 D21:22 D11:15 D11:19"] |
| LOCOMO-conv-26-003 | 3 | Psychology, counseling certification | 0.33 | psychology, certification | ["D1:9","D1:11"] |
| LOCOMO-conv-26-023 | 3 | Yes, since she collects classic children's books | 0.33 | yes, collects, classic, children | ["D6:9"] |
| LOCOMO-conv-26-028 | 3 | LIkely no; though she likes reading, she wants to be a counselor | 0.33 | likely, though, likes, counselor | ["D7:5","D7:9"] |
| LOCOMO-conv-26-037 | 2 | The weekend before 17 July 2023 | 0.33 | july, 2023 | ["D9:2"] |
| LOCOMO-conv-26-054 | 2 | The week of 23 August 2023 | 0.33 | august, 2023 | ["D13:1"] |
| LOCOMO-conv-26-070 | 3 | Thoughtful, authentic, driven | 0.33 | authentic, driven | ["D16:18","D13:16","D7:4"] |
| LOCOMO-conv-26-125 | 4 | Two cats and a dog | 0.33 | two, cats | ["D13:4"] |
| LOCOMO-conv-26-137 | 4 | Read a book and paint. | 0.33 | read, paint | ["D17:10"] |
| LOCOMO-conv-26-190 | 5 | Read a book and paint. | 0.33 | read, paint | ["D17:10"] |
| LOCOMO-conv-41-052 | 2 | Around August 2022 | 0.33 | around, 2022 | ["D27:4"] |
| LOCOMO-conv-41-065 | 3 | Shelter coordinator, Counselor | 0.33 | coordinator, counselor | ["D32:14","D5:8","D11:10","D27:4"] |
| LOCOMO-conv-41-127 | 4 | appreciation for giving back | 0.33 | appreciation, giving | ["D24:1"] |
| LOCOMO-conv-41-182 | 5 | appreciation for giving back | 0.33 | appreciation, giving | ["D24:1"] |
| LOCOMO-conv-42-025 | 2 | The weekend after 3June, 2022. | 0.33 | 3june, 2022 | ["D14:20"] |
| LOCOMO-conv-42-026 | 2 | The weekend after 3June, 2022. | 0.33 | 3june, 2022 | ["D14:19"] |
| LOCOMO-conv-42-027 | 2 | The week before 3June, 2022 | 0.33 | 3june, 2022 | ["D14:8"] |
| LOCOMO-conv-42-032 | 2 | The Friday before 10July, 2022. | 0.33 | 10july, 2022 | ["D17:1"] |
| LOCOMO-conv-43-068 | 3 | Writing a travel blog. | 0.33 | travel, blog | ["D4:1","D6:6","D15:3","D27:37"] |
| LOCOMO-conv-44-020 | 3 | cook dog treats | 0.33 | cook, treats | ["D10:12","D12:1"] |
| LOCOMO-conv-47-037 | 3 | Most likely John's partner. | 0.33 | likely, partner | ["D17:24"] |
| LOCOMO-conv-47-039 | 1 | quit his IT Job, secured his dream job, aspires to become an eSports competition organizer | 0.33 | quit, secured, dream, aspires, esports, competition | ["D4:36","D18:1","D18:7"] |
| LOCOMO-conv-47-053 | 2 | approximately summer of 2022 | 0.33 | approximately, summer | ["D25:9"] |
| LOCOMO-conv-47-093 | 4 | computer application on smartphones | 0.33 | computer, smartphones | ["D11:3"] |
| LOCOMO-conv-47-159 | 5 | computer application on smartphones | 0.33 | computer, smartphones | ["D11:3"] |
| LOCOMO-conv-48-022 | 2 | Saturday after 27 January, 2023 | 0.33 | january, 2023 | ["D2:30"] |
| LOCOMO-conv-48-030 | 2 | Wednesday before 9 February, 2023 | 0.33 | february, 2023 | ["D5:1"] |
| LOCOMO-conv-48-077 | 2 | Friday before 17 September, 2023 | 0.33 | september, 2023 | ["D29:4"] |
| LOCOMO-conv-49-011 | 3 | camping trip in the outdoors | 0.33 | camping, outdoors | ["D2:1","D2:3","D19:1","D19:3"] |
| LOCOMO-conv-49-029 | 1 | journalling, creative writing | 0.33 | journalling, creative | ["D6:4","D11:7"] |
| LOCOMO-conv-49-067 | 2 | end of October 2023 | 0.33 | end, october | ["D16:10"] |
| LOCOMO-conv-43-067 | 3 | Star Wars: Jedi Apprentice by Judy Blundell and David Farland. It is a highly rated and immersive series about his favorite movies. | 0.36 | jedi, apprentice, judy, blundell, david, farland, highly, rated, series | ["D27:19","D27:21"] |
| LOCOMO-conv-50-065 | 1 | weekly visits to local parks, countryside roadtrip, celebration of the opening of his car maintenance shop, card-playing nights | 0.38 | weekly, visits, local, roadtrip, celebration, maintenance, card-playing, nights | ["D10:3","D11:1","D6:8","D15:1"] |
| LOCOMO-conv-26-078 | 3 | Likely no; since this one went badly | 0.40 | likely, one, badly | ["D18:3","D18:1"] |
| LOCOMO-conv-42-006 | 1 | Writing, watchingmovies, exploringnature, hanging withfriends. | 0.40 | watchingmovies, exploringnature, withfriends | ["D1:10","D2:25"] |
| LOCOMO-conv-42-035 | 1 | "Little Women",'A Court of Thorns andRoses'. | 0.40 | court, thorns, androses | ["D3:17","D19:14","D19:16"] |
| LOCOMO-conv-42-067 | 3 | an animalkeeper at a localzoo and workingwith turtles; as heknows a great dealabout turtles andhow to care for them,and he enjoys it. | 0.40 | animalkeeper, localzoo, workingwith, heknows, dealabout, andhow | ["D5:8","D19:3","D25:19","D28:25"] |
| LOCOMO-conv-43-003 | 1 | sneakers, fantasy movie DVDs, jerseys | 0.40 | sneakers, movie, dvds | ["D1:15","D12:18","D27:20"] |
| LOCOMO-conv-49-082 | 1 | Drawing, traveling, places with a beautiful view, yoga, sunsets or something comfortable for Evan | 0.40 | drawing, traveling, places, beautiful, view, comfortable | ["D1:14","D2:10","D2:11","D2:14","D8:18","D10:8","D11:8","D16:23","D18:7","D24:19","D24:21"] |
| LOCOMO-conv-43-020 | 3 | Good Sports, because they work with Nike, Gatorade, and Under Armour and they aim toprovide youth sports opportunities for kids ages 3-18 in high-need communities. | 0.41 | because, aim, toprovide, youth, opportunities, kids, ages, 3-18, high-need, communities | ["D3:13","D3:15","D6:15"] |
| LOCOMO-conv-49-052 | 3 | Sam faces challenges like maintaining motivation and making dietary changes. He addresses them by enrolling in cooking classes and seeking support from friends like Evan. | 0.41 | faces, challenges, maintaining, motivation, making, addresses, enrolling, cooking, classes, seeking | ["D4:2","D4:6","D14:1","D14:2"] |
| LOCOMO-conv-44-053 | 3 | Install a bird feeder outside where he can see the birds without going outdoors. | 0.44 | install, feeder, outside, without, outdoors | ["D20:5","D20:21","D23:1","D1:14"] |
| LOCOMO-conv-26-020 | 1 | dinosaurs, nature | 0.50 | dinosaurs | ["D6:6","D4:8"] |
| LOCOMO-conv-26-024 | 1 | "Nothing is Impossible", "Charlotte's Web" | 0.50 | nothing, impossible | ["D7:8","D6:10"] |
| LOCOMO-conv-26-035 | 1 | Mentoring program, school speech | 0.50 | mentoring, speech | ["D9:2","D3:3"] |
| LOCOMO-conv-26-036 | 2 | two weekends before 17 July 2023 | 0.50 | july, 2023 | ["D9:1"] |
| LOCOMO-conv-26-044 | 1 | abstract art | 0.50 | abstract | ["D11:12","D11:8","D9:14"] |
| LOCOMO-conv-26-049 | 1 | bowls, cup | 0.50 | bowls | ["D12:14","D8:4","D5:6"] |
| LOCOMO-conv-26-069 | 2 | Since 2016 | 0.50 | 2016 | ["D16:8"] |
| LOCOMO-conv-26-087 | 4 | LGBTQ+ individuals | 0.50 | individuals | ["D2:12"] |
| LOCOMO-conv-26-091 | 4 | Mel and her husband have been married for 5 years. | 0.50 | mel, husband | ["D3:16"] |
| LOCOMO-conv-26-149 | 4 | She was happy and thankful | 0.50 | happy | ["D18:5"] |
| LOCOMO-conv-26-151 | 4 | She appreciated them a lot | 0.50 | appreciated | ["D18:13"] |
| LOCOMO-conv-26-155 | 5 | LGBTQ+ individuals | 0.50 | individuals | ["D2:12"] |
| LOCOMO-conv-26-185 | 5 | clarinet and violin | 0.50 | violin | ["D15:26"] |
| LOCOMO-conv-26-197 | 5 | She was happy and thankful | 0.50 | happy | ["D18:5"] |
| LOCOMO-conv-30-004 | 1 | They lost their jobs and decided to start their own businesses. | 0.50 | jobs, decided, businesses | ["D1:2","D1:3","D1:4","D2:1"] |
| LOCOMO-conv-30-007 | 2 | February, 2023 | 0.50 | february | ["D1:24"] |
| LOCOMO-conv-30-016 | 2 | May, 2023 | 0.50 | may | ["D8:13"] |
| LOCOMO-conv-41-025 | 2 | April.2023 | 0.50 | april | ["D13:3"] |
| LOCOMO-conv-41-027 | 1 | Join a local church, buy a cross necklace | 0.50 | join, local, buy | ["D14:10","D11:10"] |
| LOCOMO-conv-41-060 | 2 | The summer of 2022 | 0.50 | 2022 | ["D30:6"] |
| LOCOMO-conv-41-076 | 4 | divorce, job loss, homelessness | 0.50 | loss, homelessness | ["D7:7"] |
| LOCOMO-conv-41-092 | 2 | a tech-for-good convention | 0.50 | tech-for-good | ["D12:9"] |
| LOCOMO-conv-42-001 | 3 | Yesteammates on hisvideo game team. | 0.50 | yesteammates, hisvideo | ["D1:7"] |
| LOCOMO-conv-42-024 | 1 | first screenplay on drama and romance, third screenplay on loss identity and connection | 0.50 | third, loss, identity, connection | ["D14:1","D3:1","D2:7","D24:12","D24:13"] |
| LOCOMO-conv-42-031 | 1 | Screenplays,books, online blog posts, journal | 0.50 | screenplays, books, posts | ["D2:3","D17:14","D18:1","D18:5"] |
| LOCOMO-conv-42-068 | 1 | A dog and threeturtles. | 0.50 | threeturtles | ["D8:3","D12:3","D28:23"] |
| LOCOMO-conv-42-148 | 4 | Coconut milk ice cream | 0.50 | ice, cream | ["D18:9"] |
| LOCOMO-conv-42-153 | 4 | lactose intolerance | 0.50 | intolerance | ["D20:10"] |
| LOCOMO-conv-42-180 | 4 | surreal and cool | 0.50 | cool | ["D25:6"] |
| LOCOMO-conv-42-185 | 4 | a handwritten letter | 0.50 | handwritten | ["D27:29"] |
| LOCOMO-conv-42-251 | 5 | a handwritten letter | 0.50 | handwritten | ["D27:29"] |
| LOCOMO-conv-43-006 | 3 | House of MinaLima | 0.50 | house | ["D2:9"] |
| LOCOMO-conv-43-029 | 3 | John Williams | 0.50 | williams | ["D8:14","D8:16"] |
| LOCOMO-conv-43-032 | 2 | September, 2023 | 0.50 | september | ["D10:9"] |
| LOCOMO-conv-43-034 | 2 | October, 2023 | 0.50 | october | ["D11:7"] |
| LOCOMO-conv-43-052 | 3 | Hatha Yoga | 0.50 | hatha | ["D20:2"] |
| LOCOMO-conv-43-060 | 1 | highest point score, highest assist | 0.50 | point, assist | ["D3:1","D23:2"] |
| LOCOMO-conv-43-069 | 2 | Januarty 5, 2024 | 0.50 | januarty | ["D28:1"] |
| LOCOMO-conv-43-070 | 2 | February, 2024 | 0.50 | february | ["D28:1"] |
| LOCOMO-conv-43-079 | 4 | a tough win | 0.50 | win | ["D3:5"] |
| LOCOMO-conv-43-092 | 4 | Aug 15th | 0.50 | aug | ["D7:1"] |
| LOCOMO-conv-43-155 | 4 | electric and intense | 0.50 | intense | ["D23:5"] |
| LOCOMO-conv-43-184 | 5 | a tough win | 0.50 | win | ["D3:5"] |
| LOCOMO-conv-44-005 | 2 | The week of April 3rd to 9th | 0.50 | 3rd, 9th | ["D3:18"] |
| LOCOMO-conv-44-011 | 2 | June, 2023 | 0.50 | june | ["D6:2"] |
| LOCOMO-conv-44-048 | 2 | one month | 0.50 | one | ["D24:2","D28:6"] |
| LOCOMO-conv-44-056 | 2 | few days before November 22, 2023 | 0.50 | few, days | ["D28:12"] |
| LOCOMO-conv-44-058 | 2 | few days before November 2023 | 0.50 | few, days | ["D28:6"] |
| LOCOMO-conv-44-105 | 4 | By donating a portion of his profits frmo selling jwelery | 0.50 | donating, frmo, jwelery | ["D22:9"] |
| LOCOMO-conv-47-009 | 1 | Three dogs. | 0.50 | three | ["D1:12","D1:14","D5:1"] |
| LOCOMO-conv-47-024 | 2 | In July, 2022 | 0.50 | july | ["D13:5"] |
| LOCOMO-conv-47-033 | 2 | Toronto, Canada | 0.50 | canada | ["D16:9"] |
| LOCOMO-conv-47-044 | 2 | In September, 2022 | 0.50 | september | ["D20:17"] |
| LOCOMO-conv-47-074 | 4 | One month | 0.50 | one | ["D3:5"] |
| LOCOMO-conv-47-098 | 4 | debating on which team will perform better in the championship | 0.50 | debating, perform, better | ["D13:15"] |
| LOCOMO-conv-48-028 | 2 | in summer 2022 | 0.50 | 2022 | ["D4:33"] |
| LOCOMO-conv-48-032 | 2 | in summer 2022 | 0.50 | 2022 | ["D6:8"] |
| LOCOMO-conv-48-087 | 1 | an appreciate letter from her community, a flower bouqet from her friend, a motivational quote from a friend | 0.50 | appreciate, flower, bouqet, motivational | ["D2:7","D2:9","D4:26","D23:20","D23:22"] |
| LOCOMO-conv-48-132 | 4 | Valuable and relaxing | 0.50 | relaxing | ["D12:6"] |
| LOCOMO-conv-48-135 | 4 | one year | 0.50 | one | ["D14:6"] |
| LOCOMO-conv-48-160 | 4 | thrilled and rewarded | 0.50 | rewarded | ["D21:8"] |
| LOCOMO-conv-48-211 | 5 | Valuable and relaxing | 0.50 | relaxing | ["D12:6"] |
| LOCOMO-conv-48-212 | 5 | one year | 0.50 | one | ["D14:6"] |
| LOCOMO-conv-48-223 | 5 | thrilled and rewarded | 0.50 | rewarded | ["D21:8"] |
| LOCOMO-conv-49-012 | 1 | Weight problem | 0.50 | problem | ["D2:6","D3:4","D24:12","D24:14","D5:5","D6:2","D7:2","D7:12","D8:1","D10:6","D12:1","D13:2","D14:1","D15:1","D16:3","D17:3","D24:20","D25:1","D25:3"] |
| LOCOMO-conv-49-025 | 2 | He fell in love with a Canadian woman | 0.50 | fell, love | ["D5:1"] |
| LOCOMO-conv-49-030 | 1 | Evan met the woman he fell in love with and returned with her. | 0.50 | fell, love, returned | ["D5:1","D6:1"] |
| LOCOMO-conv-49-062 | 2 | work-related stress | 0.50 | work-related | ["D13:4"] |
| LOCOMO-conv-49-068 | 2 | December, 2023 | 0.50 | december | ["D16:24"] |
| LOCOMO-conv-49-074 | 2 | Summer 2024 | 0.50 | 2024 | ["D19:11"] |
| LOCOMO-conv-49-128 | 4 | Lost their job due to downsizing | 0.50 | due, downsizing | ["D16:10"] |
| LOCOMO-conv-50-001 | 2 | between 26 March and 20 April 2023 | 0.50 | between, march | ["D3:1"] |
| LOCOMO-conv-50-012 | 1 | flooding of his mansion, car accident | 0.50 | flooding, mansion | ["D6:1","D9:1"] |
| LOCOMO-conv-50-138 | 4 | at an early age | 0.50 | early | ["D26:6"] |
| LOCOMO-conv-50-192 | 5 | at an early age | 0.50 | early | ["D26:6"] |

## Spotlight

- LOCOMO-conv-26-003 | bucket=unsupported_gold_abstraction_likely | gold=Psychology, counseling certification | token_recall=0.33 | missing=psychology, certification

---
*LoCoMo gold-support audit v2026-04-03 · offline evidence-support analysis only*