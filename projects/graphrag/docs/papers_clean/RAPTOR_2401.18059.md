# RAPTOR: Recursive Abstractive Processing for Tree-Organized Retrieval

## 1 Introduction

Large Language Models (LLMs) have emerged as transformative tools showing impressive performance on many tasks. With the growing size of LLMs, they can serve standalone as very effective knowledge stores, with facts encoded within their parameters (Petroni et al., [2019](#bib.bib45); Jiang et al., [2020](#bib.bib25); Talmor et al., [2020](#bib.bib57); Rae et al., [2021](#bib.bib46); Hoffmann et al., [2022](#bib.bib22); Chowdhery et al., [2022](#bib.bib12); Bubeck et al., [2023](#bib.bib9); Kandpal et al., [2023](#bib.bib27)) and models can be further improved with fine-tuning on downstream tasks (Roberts et al., [2020](#bib.bib49)). Nevertheless, even a large model does not contain sufficient domain-specific knowledge for particular tasks and the world continues to change, invalidating facts in the LLM. Updating the knowledge of these models through additional fine-tuning or editing is difficult, particularly when dealing with vast text corpora (Lewis et al., [2020](#bib.bib32); Mitchell et al., [2022](#bib.bib39)). An alternative approach, pioneered in open domain question answering systems (Chen et al., [2017](#bib.bib11); Yu et al., [2018](#bib.bib60)), is to index large quantities of text, after splitting it into chunks (paragraphs), in a separate information retrieval system. Retrieved information is then presented to the LLM along with the question as context (“retrieval augmentation”, Lewis et al., [2020](#bib.bib32); Izacard et al., [2022](#bib.bib24); Min et al., [2023](#bib.bib38); Ram et al., [2023](#bib.bib47)), making it easy to provide a system with current knowledge particular to some domain and enabling easy interpretability and provenance tracking, whereas the parametric knowledge of LLMs is opaque and difficult to trace back to its source (Akyurek et al., [2022](#bib.bib3)).

Nevertheless, existing retrieval-augmented approaches also have flaws. The one we tackle is that most existing methods retrieve only a few short, contiguous text chunks, which limits their ability to represent and leverage large-scale discourse structure. This is particularly relevant for thematic questions that require integrating knowledge from multiple parts of a text, such as understanding an entire book, as in the NarrativeQA dataset (Kočiskỳ et al., [2018](#bib.bib31)). Consider the fairy tale of Cinderella, and the question “How did Cinderella reach her happy ending?”. The top-retrieved short contiguous texts will not contain enough context to answer the question.

To address this, we design an indexing and retrieval system that uses a tree structure to capture both high-level and low-level details about a text. As shown in [Figure 1](#S1.F1 "Figure 1 ‣ 1 Introduction ‣ RAPTOR: Recursive Abstractive Processing for Tree-Organized Retrieval"), our system, RAPTOR, clusters chunks of text, generates text summaries of those clusters, and then repeats, generating a tree from the bottom up. This structure enables RAPTOR to load into an LLM’s context chunks representing the text at different levels so that it can effectively and efficiently answer questions at different levels.

Our main contribution is the idea of using text summarization to allow retrieval augmentation of context at different scales, and to show its effectiveness in experiments on collections of long documents. Controlled experiments with three language models (UnifiedQA (Khashabi et al., [2020](#bib.bib29)), GPT-3 (Brown et al., [2020](#bib.bib8)) and GPT-4 (OpenAI, [2023](#bib.bib43))) show that RAPTOR outperforms current retrieval augmentation. Moreover, RAPTOR coupled with GPT-4, and sometimes even with UnifiedQA, gives new state-of-the-art results on three QA tasks: free text response questions on books and movies (NarrativeQA, Kočiskỳ et al. [2018](#bib.bib31)), full-text NLP papers (QASPER, Dasigi et al. [2021](#bib.bib16)), and multiple-choice questions based on medium-length passages (QuALITY, Pang et al. [2022](#bib.bib44)). 1 1 1We will release the code of RAPTOR publicly here.

## 2 Related Work

#### Why Retrieval?

Recent advances in hardware and algorithms have indeed expanded the context lengths that models can handle, leading to questions about the need for retrieval systems (Dai et al., [2019](#bib.bib14); Dao et al., [2022](#bib.bib15); Liu et al., [2023](#bib.bib34)). However, as Liu et al. ([2023](#bib.bib34)) and Sun et al. ([2021](#bib.bib55)) have noted, models tend to underutilize long-range context and see diminishing performance as context length increases, especially when pertinent information is embedded within a lengthy context. Moreover, practically, use of long contexts is expensive and slow. This suggests that selecting the most relevant information for knowledge-intensive tasks is still crucial.

#### Retrieval Methods

Retrieval-augmented language models (RALMs) have seen improvements in various components: the retriever, the reader, and end-to-end system training. Retrieval methods have transitioned from traditional term-based techniques like TF-IDF (Spärck Jones, [1972](#bib.bib54)) and BM25 (Robertson et al., [1995](#bib.bib51); Roberts et al., [2020](#bib.bib49)) to deep learning–based strategies (Karpukhin et al., [2020](#bib.bib28); Khattab & Zaharia, [2020](#bib.bib30); Sachan et al., [2023](#bib.bib52)). Some recent work proposes using large language models as retrievers due to their ability to memorize extensive knowledge (Yu et al., [2022](#bib.bib61); Sun et al., [2022](#bib.bib56)). Research on the reader component includes Fusion-in-Decoder (FiD) (Izacard & Grave, [2022](#bib.bib23)), which employs both DPR and BM25 for retrieval and processes passages independently in the encoder and RETRO (Borgeaud et al., [2022](#bib.bib7); Wang et al., [2023](#bib.bib58)), which utilizes cross-chunked attention and chunkwise retrieval to generate text grounded on retrieved context.

End-to-end system training work includes Atlas (Izacard et al., [2022](#bib.bib24)), which fine-tunes an encoder-decoder model in conjunction with the retriever; REALM (Guu et al., [2020](#bib.bib21)), a bidirectional, masked LM fine-tuned for open-domain question answering; and RAG (Retrieval-Augmented Generation) (Lewis et al., [2020](#bib.bib32)), which integrates pre-trained sequence-to-sequence models with a neural retriever. Min et al. ([2021](#bib.bib37)) introduced Joint Passage Retrieval (JPR) model which uses a tree-decoding algorithm to handle passage diversity and relevance in multi-answer retrieval. Dense Hierarchical Retrieval (DHR) and Hybrid Hierarchical Retrieval (HHR) represent advancements in retrieval accuracy by combining document and passage level retrievals and integrating sparse and dense retrieval methods, respectively (Liu et al., [2021](#bib.bib35); Arivazhagan et al., [2023](#bib.bib5)).

Despite a diversity in methods, the retrieving components of models predominantly rely on standard approaches, i.e., chunking corpora and encoding with BERT-based retrievers. Although this approach is widely adopted, Nair et al. ([2023](#bib.bib41]) highlights a potential shortcoming: contiguous segmentation might not capture the complete semantic depth of the text. Reading extracted snippets from technical or scientific documents may lack important context making them difficult to read or even misleading. (Cohan & Goharian, [2017](#bib.bib13); Newman et al., [2023](#bib.bib42); Zhang et al., [2023](#bib.bib62)).

#### Recursive summarization as Context

Summarization techniques provide a condensed view of documents, enabling more focused engagement with the content (Angelidis & Lapata, [2018](#bib.bib4)). The summarization/snippet model by Gao et al. ([2023](#bib.bib19)) uses summarizations and snippets of passages, which improves correctness on most datasets but can sometimes be a lossy means of compression. The recursive-abstractive summarization model by Wu et al. ([2021](#bib.bib59)) employs task decomposition to summarize smaller text chunks, which are later integrated to form summaries of larger sections. While this method is effective for capturing broader themes, it can miss granular details. LlamaIndex (Liu, [2022](#bib.bib33)) mitigates this issue by similarly summarizing adjacent text chunks but also retaining intermediate nodes thus storing varying levels of detail, keeping granular details. However, both methods, due to their reliance on adjacency for grouping or summarizing adjacent nodes, may still overlook distant interdependencies within the text, which we can find and group with RAPTOR.

## 3 Methods

#### Overview of RAPTOR

Building on the idea that long texts often present subtopics and hierarchical structures (Cao & Wang, [2022](#bib.bib10); Dong et al., [2023b](#bib.bib18)), RAPTOR addresses the issue of semantic depth and connection in reading by building a recursive tree structure that balances broader thematic comprehension with granular details and which allows nodes to be grouped based on semantic similarity not just order in the text.

Construction of the RAPTOR tree begins with segmenting the retrieval corpus into short, contiguous texts of length 100, similar to traditional retrieval augmentation techniques. If a sentence exceeds the 100-token limit, we move the entire sentence to the next chunk, rather than cutting it mid-sentence. This preserves the contextual and semantic

# Qualitative Examination of RAPTOR's Retrieval Process

To qualitatively examine RAPTOR’s retrieval process, we test it on thematic, multi-hop questions about a 1500-word version of the fairytale Cinderella. We compare the context retrieved by RAPTOR with the context retrieved by Dense Passage Retrieval (DPR). Figure 4 in the main paper details the retrieval process within RAPTOR’s tree structure for two questions. The nodes that RAPTOR selects for each question are highlighted, while the leaf nodes that DPR selects for the same question are indicated with arrows. This comparison illustrates the advantage of RAPTOR’s tree structure. RAPTOR selects nodes from different layers depending on the level of granularity required by the question at hand. Further, the information that would be retrieved by DPR is more often than not included in the context retrieved by RAPTOR, either directly as a leaf node or indirectly as part of a summary from a higher layer.

The first question we examine is “How does Cinderella find a happy ending?”, a multi-hop question best answered by synthesizing information from various text segments. To control for the language model’s potential familiarity with the Cinderella story, we instructed it to rely solely on the retrieved information for its answers. Table 13 shows the text retrieved by both RAPTOR and DPR for this question. RAPTOR’s context succinctly describes Cinderella’s journey to happiness, while DPR’s leaf nodes primarily focus on her initial transformation. The difference in retrieved information significantly impacts downstream tasks. When GPT-4 is provided with RAPTOR’s context, it generates a detailed answer: “Cinderella finds a happy ending when the Prince searches for the owner of the lost glass slipper and discovers it belongs to Cinderella. They eventually marry, transforming Cinderella’s life for the better.” In contrast, using DPR’s context, GPT-4 states: “Based on the given context, it is not possible to determine how Cinderella finds a happy ending, as the text lacks information about the story’s conclusion.”

The second question we examine is “What is the central theme of the story?”, a thematic question that requires holistic understanding of the entire text. The text retrieved by RAPTOR and DPR for this question is shown in Table 13. The text retrieved by RAPTOR contains short descriptions of all the major parts of the story, whereas the text retrieved by DPR contains detailed descriptions of a narrow subset of the story. Again, the difference in retrieval mechanisms affects the performance of GPT-4 when answering the question. Given DPR’s context, it outputs “The central theme of the story is transformation and the power of inner beauty, as Cinderella, a kind and humble girl, is magically transformed into a beautiful princess, capturing the attention and admiration of the Prince and others at the ball.” This answer only takes into account the first portion of the story, up until Cinderella first meets the prince. In contrast, given RAPTOR’s context, GPT-4 outputs “The central theme of the story is transformation and overcoming adversity, as Cinderella, with the help of her Fairy Godmother, transforms from a mistreated and downtrodden girl into a beautiful and confident young woman who ultimately finds happiness and love with the Prince.” This is a more complete answer, demonstrating a comprehensive understanding of the story.

This qualitative analysis indicates that RAPTOR outperforms prior retrieval mechanisms because the information that it retrieves is more relevant and exhaustive, allowing for better performance on downstream tasks.

We also created a 2600-word story along with questions about its narrative and theme. An excerpt from the story is present below and the full PDF of this story is linked [here](https://raptor-appendix-g.tiiny.site). For questions like “What is the central theme of the story?”, an upper-level node is retrieved which includes the sentence: “This story is about the power of human connection… inspiring and uplifting each other as they pursued their passions.”

Excerpt from “The Eager Writer”:

> Ethan’s passion for writing had always been a part of him. As a child, he would often scribble stories and poems in his notebook, and as he grew older, his love for writing only intensified. His evenings were often spent in the dim light of his room, typing away at his laptop. He had recently taken a job as a content writer for an online marketing firm to pay the bills, but his heart still longed for the world of storytelling. However, like many aspiring writers, he struggled to find a foothold in the industry. He took a job as a content writer for an online marketing firm, but it was growing increasingly evident to him that this was not the path he wanted to pursue. It was during this time that he stumbled upon the Pathways app. The app offered a platform for people in similar professions to connect and share knowledge, and he saw it as an opportunity to finally connect with others who shared his passion for writing. Ethan saw an opportunity to meet others who shared his passion and could offer guidance and mentorship. He quickly signed up and was surprised by the number of writers he found on the platform, from well-established professionals to beginners just starting out in the business.

## Appendix H NarrativeQA Evaluation Script

We made several modifications to AllenNLP’s evaluation script to better fit our evaluation needs:

- Added Smoothing: Smoothing was incorporated to handle cases where BLEU score is zero, due to no n-gram matches occurring in the reference text. A BLEU score of zero skews the results, leading to an overly harsh evaluation for rare or novel phrases. By adding a smoothing function, we prevent the BLEU scores from dropping to zero, providing a more fair evaluation.
- Modified BLEU-4 Weighting: The original script applied a weight of 1 to the highest order n-gram (4-gram) and 0 to the rest in its BLEU-4 calculation. This approach may overly focus on 4-gram matches while neglecting lower-order matches. To provide a more balanced evaluation, we evenly distributed the weight across all n-gram levels, changing the weights for the BLEU-4 calculation to (0.25, 0.25, 0.25, 0.25).
- Tokenization before Mapping in METEOR Calculation: The original script utilized a simple split and map method for METEOR calculation. We fixed this by first tokenizing the text and then mapping the tokens. This amendment improves the accuracy of the METEOR calculation by taking into account the correct linguistic boundaries of words.

## Appendix I Analysis of Different Layers on RAPTOR’s Performance

### I.1 How do different Layers impact performance?

In this section, we present a detailed breakdown of RAPTOR’s retrieval performance when querying different layers of the hierarchical tree structure for various stories. These tables validate the utility of RAPTOR’s multi-layered structure for diverse query requirements.

Figure 7: Histogram showing the percentage of nodes retrieved from different layers of the RAPTOR tree across three datasets (NarrativeQA, Quality, and Qasper) using three retrievers (SBERT, BM25, and DPR). The data indicate that a substantial portion of the nodes contributing to the final retrieval comes from non-leaf layers, with a notable percentage from the first and second layers, highlighting the importance of RAPTOR’s hierarchical summarization in the retrieval process.

Table 14: Performance of RAPTOR when querying different layers of the tree for Story 2.

| Layers Queried / Start Layer | Layer 0 (Leaf Nodes) | Layer 1 | Layer 2 | 1 layer | 2 layers | 3 layers |
|------------------------------|----------------------|---------|---------|---------|----------|----------|
| 1 layer                      | 58.8                 | 47.1    | 41.1    |         |          |          |
| 2 layers                     |                      | 64.7    | 52.9    |         |          |          |
| 3 layers                     |                      |         | 47.1    |         |          |          |

Table 15: Performance of RAPTOR when querying different layers of the tree for Story 3.

| Layers Queried / Start Layer | Layer 0 (Leaf Nodes) | Layer 1 | Layer 2 | 1 layer | 2 layers | 3 layers |
|------------------------------|----------------------|---------|---------|---------|----------|----------|
| 1 layer                      | 66.6                 | 61.1    | 61.1    |         |          |          |
| 2 layers                     |                      | 66.6    | 66.6    |         |          |          |
| 3 layers                     |                      |         | 83.3    |         |          |          |

Table 16: Performance of RAPTOR when querying different layers of the tree for Story 4.

| Layers Queried / Start Layer | Layer 0 (Leaf Nodes) | Layer 1 | 1 layer | 2 layers | 3 layers |
|------------------------------|----------------------|---------|---------|----------|----------|
| 1 layer                      | 94.7                 | 84.2    |         |          |          |
| 2 layers                     |                      | 89.4    |         |          |          |

Table 17: Performance of RAPTOR when querying different layers of the tree for Story 5.

| Layers Queried / Start Layer | Layer 0 (Leaf Nodes) | Layer 1 | 1 layer | 2 layers |
|------------------------------|----------------------|---------|---------|----------|
| 1 layer                      | 57.9                 | 47.3    |         |          |
| 2 layers                     |                      | 68.4    |         |          |

### I.2 Which Layers do Retrieved Nodes come from?

We further conduct an ablation study across all three datasets and across three different retrievers with RAPTOR with the collapsed tree retrieval to examine the layers from which the retrieved nodes originate. We observe that between 18.5% to 57% of the retrieved nodes come from non-leaf nodes. As illustrated in Figure 7, the retrieval pattern across layers reveals the importance of RAPTOR’s multi-layered tree structure. Notably, a significant percentage of the nodes retrieved by RAPTOR using the DPR retriever for the NarrativeQA dataset come from the first and second layers of the tree, as opposed to the leaf nodes. This pattern is consistent across the other datasets and retrievers, albeit with varying percentages.

Table 18: Percentage of nodes from non-leaf nodes across different datasets and retrievers

| Dataset | DPR | SBERT | BM25 |
|---------|-----|-------|------|
| NarrativeQA | 57.36% | 36.78% | 34.96% |
| Quality | 32.28% | 24.41% | 32.36% |
| Qasper | 22.93% | 18.49% | 22.76% |

Table 19: Percentage of nodes from different layers with DPR as the retriever

| Layer | NarrativeQA | Quality | Qasper |
|-------|-------------|---------|--------|
| 0     | 42.64%      | 67.71%  | 77.07% |
| 1     | 45.00%      | 29.43%  | 21.88% |
| 2     | 10.57%      | 2.85%   | 1.05%  |
| 3     | 1.78%       |
