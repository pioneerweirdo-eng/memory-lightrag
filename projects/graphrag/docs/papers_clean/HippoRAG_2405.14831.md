# HippoRAG: Neurobiologically Inspired Long-Term Memory for Large Language Models

## HippoRAG

### 2.1 The Hippocampal Memory Indexing Theory

The hippocampal memory indexing theory proposes that human long-term memory is composed of three components: pattern separation, pattern completion, and memory encoding. The neocortex processes and stores actual memory representations, while the hippocampus holds an index of these representations and stores associations between them. Offline indexing involves using an LLM to transform a corpus into a schemaless knowledge graph (KG) as the artificial hippocampal index. Online retrieval uses the Personalized PageRank (PPR) algorithm to integrate information across passages.

### 2.2 Overview

HippoRAG mimics the human memory indexing theory. Offline indexing uses an LLM to extract open KG triples from passages. Online retrieval involves extracting query named entities, linking them to the KG, and using PPR to perform multi-hop retrieval.

### 2.3 Detailed Methodology

#### Offline Indexing

- **LLM Processing**: An LLM processes passages using OpenIE to extract noun phrases and relations.
- **KG Construction**: The extracted triples form the open KG, which is used as the artificial hippocampal index.

#### Online Retrieval

- **Query Named Entities**: The LLM extracts named entities from the query.
- **KG Linking**: Named entities are linked to the KG based on similarity.
- **PPR Algorithm**: PPR is used to perform multi-hop retrieval.

### Node Specificity

Node specificity is introduced to improve retrieval by modulating the neighborhood probability of each query node.

## Experimental Setup

### 3.1 Datasets

We evaluate HippoRAG on MuSiQue, 2WikiMultiHopQA, and HotpotQA. The details of these datasets are shown in Table 1.

### 3.2 Baselines

We compare HippoRAG with BM25, Contriever, GTR, ColBERTv2, RAPTOR, and IRCoT.

### 3.3 Metrics

We report retrieval and QA performance using recall@2, recall@5, exact match, and F1 scores.

### 3.4 Implementation Details

By default, we use GPT-3.5-turbo-1106 with a temperature of 0.7 as the LLM and Contriever or ColBERTv2 as the retriever. We use examples from MuSiQue’s training data to tune the synonymy threshold and PPR damping factor.

## Results

### 4.1 Single-Step Retrieval Results

HippoRAG outperforms all baselines on MuSiQue and 2WikiMultiHopQA, achieving competitive performance on HotpotQA.

### 4.2 Multi-Step Retrieval Results

Combining HippoRAG with IRCoT results in strong complementary improvements on all datasets.

### 4.3 QA Performance

HippoRAG’s QA improvements correlate with its retrieval improvements.

## Discussions

### 5.1 What Makes HippoRAG Work?

HippoRAG’s performance is attributed to its offline indexing and PPR-based retrieval. OpenIE alternatives and PPR alternatives are evaluated, showing that PPR is more effective for retrieval.

### 5.2 HippoRAG’s Advantage: Single-Step Multi-Hop Retrieval

HippoRAG can perform multi-hop retrieval in a single step, achieving better performance than iterative methods.

### 5.3 HippoRAG’s Potential: Path-Finding Multi-Hop Retrieval

HippoRAG can handle path-finding multi-hop questions, which are challenging for current RAG methods.

## Conclusions & Limitations

HippoRAG shows promise in overcoming the limitations of standard RAG systems while retaining their advantages. Further work is needed to improve practical viability and scalability.

## Acknowledgments

The authors thank colleagues from the OSU NLP group and Percy Liang for their comments. This research was supported by NSF, NIH, ARL, and Cisco.

## References

- AI@Meta [2024] AI@Meta. Llama 3 model card. 2024. URL https://github.com/meta-llama/llama3/blob/main/MODEL_CARD.md
- AlKhamissi et al. [2022] B. AlKhamissi, M. Li, A. Celikyilmaz, M. T. Diab, and M. Ghazvininejad. A review on language models as knowledge bases. ArXiv, abs/2204.06031, 2022. URL https://arxiv.org/abs/2204.06031
- Angeli et al. [2015] G. Angeli, M. J. Johnson, and C. D. Manning. Leveraging linguistic structure for open domain information extraction. In C. Zong and M. Strube, editors, Proceedings of the 53rd Annual Meeting of the Association for Computational Linguistics and the 7th International Joint Conference on Natural Language Processing (Volume 1: Long Papers), pages 344–354, Beijing, China, July 2015. Association for Computational Linguistics. URL https://aclanthology.org/P15-1034
- Asai et al. [2020] A. Asai, K. Hashimoto, H. Hajishirzi, R. Socher, and C. Xiong. Learning to retrieve reasoning paths over Wikipedia graph for question answering. In International Conference on Learning Representations, 2020. URL https://openreview.net/forum?id=SJgVHkrYDH
- Banko et al. [2007] M. Banko, M. J. Cafarella, S. Soderland, M. Broadhead, and O. Etzioni. Open information extraction from the web. In Proceedings of the 20th International Joint Conference on Artifical Intelligence, IJCAI’07, page 2670–2676, San Francisco, CA, USA, 2007. Morgan Kaufmann Publishers Inc.
- Bhardwaj et al. [2019] S. Bhardwaj, S. Aggarwal, and Mausam. CaRB: A crowdsourced benchmark for open IE. In K. Inui, J. Jiang, V. Ng, and X. Wan, editors, Proceedings of the 2019 Conference on Empirical Methods in Natural Language Processing and the 9th International Joint Conference on Natural Language Processing (EMNLP-IJCNLP), pages 6262–6267, Hong Kong, China, Nov. 2019. Association for Computational Linguistics. URL https://aclanthology.org/D19-1651
- Bosselut et al. [2019] A. Bosselut, H. Rashkin, M. Sap, C. Malaviya, A. Celikyilmaz, and Y. Choi. COMET: Commonsense transformers for automatic knowledge graph construction. In A. Korhonen, D. Traum, and L. Màrquez, editors, Proceedings of the 57th Annual Meeting of the Association for Computational Linguistics, pages 4762–4779, Florence, Italy, July 2019. Association for Computational Linguistics. URL https://aclanthology.org/P19-1470
- Chen and Bertozzi [2023] B. Chen and A. L. Bertozzi. AutoKG: Efficient Automated Knowledge Graph Generation for Language Models. In 2023 IEEE International Conference on Big Data (BigData), pages 3117–3126, Los Alamitos, CA, USA, dec 2023. IEEE Computer Society. URL https://doi.ieeecomputersociety.org/10.1109/BigData59044.2023.10386454
- Chen et al. [2023a] H. Chen, R. Pasunuru, J. Weston, and A. Celikyilmaz. Walking Down the Memory Maze: Beyond Context Limit through Interactive Reading. CoRR, abs/2310.05029, 2023a. URL https://doi.org/10.48550/arXiv.2310.05029
- Chen et al. [2023b] T. Chen, H. Wang, S. Chen, W. Yu, K. Ma, X. Zhao, H. Zhang, and D. Yu. Dense x retrieval: What retrieval granularity should we use? arXiv preprint arXiv:2312.06648, 2023b. URL https://arxiv.org/abs/2312.06648
- Chen et al. [2023c] Y. Chen, S. Qian, H. Tang, X. Lai, Z. Liu, S. Han, and J. Jia. Longlora: Efficient fine-tuning of long-context large language models. arXiv:2309.12307, 2023c.
- Chen et al. [2024] Y. Chen, P. Cao, Y. Chen, K. Liu, and J. Zhao. Journey to the center of the knowledge neurons: Discoveries of language-independent knowledge neurons and degenerate knowledge neurons. Proceedings of the AAAI Conference on Artificial Intelligence, 38(16):17817–17825, Mar. 2024. URL https://ojs.aaai.org/index.php/AAAI/article/view/29735
- Csárdi and Nepusz [2006] G. Csárdi and T. Nepusz. The igraph software package for complex network research. 2006. URL https://igraph.org/

# E.2 Qualitative Analysis

In Table 10, we show three more examples from three different domains that illustrate HippoRAG’s potential for solving retrieval tasks that require such cross-passage knowledge integration.

In the first question of Table 10, we want to find a book published in 2012 by an English author who won a specific award. In contrast to HippoRAG, ColBERTv2 and IRCoT are unable to identify Mark Haddon as such an author. ColBERTv2 focuses on passages related to awards while IRCoT mistakenly decides that Kate Atkinson is the answer to such question since she won the same award for a book published in 1995. For the second question, we wanted to find a war film based on a non-fiction book directed by someone famous for sci-fi and crime movies. HippoRAG is able to find our answer Black Hawk Down by Ridley Scott within the first four passages, while ColBERTv2 misses the answer completely and retrieves other films and film collections. In this instance, even though IRCoT is able to retrieve Ridley Scott, it does so mainly through parametric knowledge. The chain-of-thought output discusses his and Denis Villeneuve fame as well as their sci-fi and crime experience. Given the three-step iteration restriction used here and the need to explore two directors, the specific war film Black Hawk Down was not identified. Although a bit convoluted, people often ask these first two questions to remember a specific movie or book they watched or heard about from only a handful of disjointed details.

Finally, the third question is more similar to the motivating example in the main paper and shows the importance of this type of question in real-world domains. In this question, we ask for a drug used to treat chronic lymphocytic leukemia by interacting with cytosolic p53. While HippoRAG is able to leverage the associations within the supporting passages to identify the Chlorambucil passage as the most important, ColBERTv2 and IRCoT are only able to extract passages associated with lymphocytic leukemia. Interestingly enough, IRCoT uses its parametric knowledge to guess that Venetoclax, which also treats leukemia, would do so through the relevant mechanism even though no passage in the curated dataset explicitly stated this.

Table 10: Ranking result examples for different approaches on several path-finding multi-hop questions.

Question

HippoRAG

ColBERTv2

IRCoT

Which book was published in 2012 by an English author who is a Whitbread Award winner?

1. Oranges Are Not the Only Fruit

2. William Trevor Legacies

3. Mark Haddon

1. World Book Club Prize winners

2. Leon Garfield Awards

3. Twelve Bar Blues (novel)

1. Kate Atkinson

2. Leon Garfield Awards

3. Twelve Bar Blues (novel)

Which war film based on a non-fiction book was directed by someone famous in the science fiction and crime genres?

1. War Film

2. Time de Zarn

3. Outline of Sci-Fi

4. Black Hawk Down

1. Paul Greengrass

2. List of book-based war films

3. Korean War Films

4. All the King's Men Book

1. Ridley Scott

2. Peter Hyams

3. Paul Greengrass

4. List of book-based war films

What drug is used to treat chronic lymphocytic leukemia by interacting with cytosolic p53?

1. Chlorambucil

2. Lymphocytic leukemia

3. Mosquito bite allergy

1. Lymphocytic leukemia

2. Obinutuzumab

3. Venetoclax

1. Venetoclax

2. Lymphocytic leukemia

3. Idelalisib

## Appendix F Error Analysis

### F.1 Overview

In this section, we provide a detailed error analysis of 100 errors made by HippoRAG on the MuSiQue dataset. As shown in Table 11, these errors can be categorized into three main types: NER, OpenIE, and PPR.

The main error type, with nearly half of all error examples, is due to limitations of our NER based design. As further discussed in §[F.2](#F.2), our NER design does not extract enough information from the query for retrieval. For example, in the question “When was one internet browser’s version of Windows 8 made accessible?”, only the phrase “Windows 8” is extracted, leaving any signal about “browsers” or “accessibility” behind for the subsequent graph search. OpenIE errors, the second most common, are discussed in more detail in §[F.3](#F.3).

We define the third error category as cases where both NER and OpenIE are functioning properly but the PPR algorithm is still unable to identify relevant subgraphs, often due to confounding signals. For instance, consider the query “How many refugees emigrated to the European country where Huguenots felt a kinship for emigration?”. Despite the term “Huguenots” being accurately extracted from both the question and the supporting passages, and the PPR algorithm initiating with the nodes labeled “European” and “Huguenots”, the PPR algorithm struggles to find the appropriate subgraphs around them that define the most related passage. This occurs when multiple passages exist in the corpus that discuss very similar topics since the PPR algorithm is not able to leverage query context directly.

Table 11: Error analysis on MuSiQue.

Error Type

Error Percentage (%)

NER Limitation

48

Incorrect/Missing OpenIE

32

PPR

20

### F.2 Concepts vs. Context Tradeoff

Given our method’s entity-centric nature in extraction and indexing, it has a strong bias towards concepts that leaves many contextual signals unused. This design enables single-step multi-hop retrieval while also enabling contextual cues to avoid distracting from more salient entities. As seen in the first example in Table 12, ColBERTv2 uses the context to retrieve passages that are related to famous Spanish navigators but not “Sergio Villanueva”, who is a boxer. In contrast, HippoRAG is able to hone in on “Sergio” and retrieve one relevant passage.

Unfortunately, this design is also one of our method’s greatest limitations since ignoring contextual cues accounts for around 20% of errors in our small-scale error analysis. This problem is more apparent in the second example since the concepts are general, making the context more important. Since the only concept tagged by HippoRAG is “protons”, it extracts passages related to “Uranium” and “nuclear weapons” while ColBERTv2 uses the context to extract more relevant passages associated with the discovery of atomic numbers.

Table 12: Examples showing the concept-context tradeoff on MuSiQue.

Question

HippoRAG

ColBERTv2

Whose father was a navigator who explored the east coast of the continental region where Sergio Villanueva would later be born?

Sergio Villanueva

César Gaytan

Faustino Reyes

Francisco de Eliza (navigator)

Exploration of N. America

Vicente Pinzón (navigator)

What undertaking included the person who discovered that the number of protons in each element’s atoms is unique?

Uranium

Chemical element

History of nuclear weapons

Atomic number

Atomic theory

Atomic nucleus

### F.3 OpenIE Limitations

OpenIE is a critical step in extracting structured knowledge from unstructured text. Nonetheless, its shortcomings can result in gaps in knowledge that may impair retrieval and QA capabilities. As shown in Table 15, GPT-3.5 Turbo overlooks the crucial song title “Don’t Let Me Wait Too Long” during the OpenIE process. This title represents the most significant element within the passage. A probable reason is that the model is insensitive to such a long entity. Besides, the model does not accurately capture the beginning and ending years of the war, which are essential for the query. This is an example of how models routinely ignore temporal properties. Overall, these failures highlight the need to improve the extraction of critical information.

Table 15: Open information extraction error examples on MuSiQue.

Question

Passage

Missed Triples

What company is the label responsible for “Don’t Let Me Wait Too Long” a part of?

“Don’t Let Me Wait Too Long” was sequenced on side one of the LP, between the ballads “The Light That Has Lighted the World” and “Who Can See It” …

(Don’t Let Me Wait Too Long, sequenced on, side one of the LP)

When did the president of the Confederate States of America end his fight in the Mexican-American war?

Jefferson Davis fought in the Mexican–American War (1846–1848), as the colonel of a volunteer regiment …

(Mexican-American War, starts, 1846), (Mexican-American War, ends, 1848)

### F.4 OpenIE Document Length Analysis

Finally, we present a small-scale intrinsic experiment to help us understand the robustness of our OpenIE methods to increasing passage length. The length-dependent evaluation results in Table 16 show that GPT-3.5-Turbo OpenIE results deteriorate substantially when extracting from longer instead of shorter passages. This is likely due to a higher sentence and paragraph complexity for longer passages which leads to lower quality extraction. More work is needed to address this limitation since further chunking would only create other issues due to sentence interdependence.

Table 16: Intrinsic OpenIE evaluation using the CaRB framework. Performance difference between the 10 longest and 10 shortest annotated passages using our default GPT-3.5 Turbo (1106) model.

AUC

Precision

Recall

F1

10 Shortest Passages

0.95

0.92

0.93

0.93

10 Longest Passages

0.75

0.68

0.70

0.69

## Appendix G Cost and Efficiency Comparison

One of HippoRAG’s main advantages against iterative retrieval methods is the dramatic online retrieval efficiency gains brought on by its single-step multi-hop retrieval ability in terms of both cost and time. Specifically, as seen in Table 17, retrieval costs for IRCoT are 10 times higher than HippoRAG since it only requires extracting relevant named entities from the query instead of processing all of the retrieved documents. In systems with extremely high usage, a cost difference of an order of magnitude such as this one could be extremely important. The difference with IRCoT in terms of latency is also substantial, although more challenging to measure exactly. Also as seen in Table 17, HippoRAG can be 10 times faster than IRCoT, depending on the number of retrieval rounds that need to be executed (2-10 in our experiments).

Table 17: Average cost and efficiency measurements for online retrieval using GPT-3.5 Turbo on queries.

ColBERTv2

IRCoT

HippoRAG

API Cost ($)

0.001

0.01

0.0001

Time (minutes)

0.1

1

0.01

Although offline indexing time and costs are higher for HippoRAG than IRCoT—around 10 times slower and $10 more expensive for every 1000 passages—these costs can be dramatically reduced by leveraging open source LLMs. As shown in our ablation study in Table 5, Llama-3.1-70B-Instruct performs similarly to GPT-3.5 Turbo even though it can be deployed locally using vLLM and 4
