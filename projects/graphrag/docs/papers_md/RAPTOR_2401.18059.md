---
source: https://arxiv.org/html/2401.18059
arxiv: 2401.18059
downloaded_at: 2026-03-11T05:27:29.981Z
---
RAPTOR: Recursive Abstractive Processing for Tree-Organized Retrieval        

Title: 

Content selection saved. Describe the issue below:

Description:

[License: CC BY 4.0](https://info.arxiv.org/help/license/index.html#licenses-available)

arXiv:2401.18059v1 \[cs.CL\] 31 Jan 2024

# RAPTOR: Recursive Abstractive Processing for Tree-Organized Retrieval

<span class="ltx_creator ltx_role_author"><span class="ltx_personname">Parth Sarthi, Salman Abdullah, Aditi Tuli, Shubh Khanna, Anna Goldie, Christopher D. Manning<br class="ltx_break">Stanford University<br class="ltx_break"><span id="id1.1.id1" class="ltx_text ltx_font_typewriter">psarthi@cs.stanford.edu</span></span></span>

###### Abstract

Retrieval-augmented language models can better adapt to changes in world state and incorporate long-tail knowledge. However, most existing methods retrieve only short contiguous chunks from a retrieval corpus, limiting holistic understanding of the overall document context. We introduce the novel approach of recursively embedding, clustering, and summarizing chunks of text, constructing a tree with differing levels of summarization from the bottom up. At inference time, our RAPTOR model retrieves from this tree, integrating information across lengthy documents at different levels of abstraction. Controlled experiments show that retrieval with recursive summaries offers significant improvements over traditional retrieval-augmented LMs on several tasks. On question-answering tasks that involve complex, multi-step reasoning, we show state-of-the-art results; for example, by coupling RAPTOR retrieval with the use of GPT-4, we can improve the best performance on the QuALITY benchmark by 20% in absolute accuracy.

## <span class="ltx_tag ltx_tag_section">1 </span> Introduction

Large Language Models (LLMs) have emerged as transformative tools showing impressive performance on many tasks. With the growing size of LLMs, they can serve standalone as very effective knowledge stores, with facts encoded within their parameters (Petroni et al., [2019](#bib.bib45); Jiang et al., [2020](#bib.bib25); Talmor et al., [2020](#bib.bib57); Rae et al., [2021](#bib.bib46); Hoffmann et al., [2022](#bib.bib22); Chowdhery et al., [2022](#bib.bib12); Bubeck et al., [2023](#bib.bib9); Kandpal et al., [2023](#bib.bib27)) and models can be further improved with fine-tuning on downstream tasks (Roberts et al., [2020](#bib.bib49)). Nevertheless, even a large model does not contain sufficient domain-specific knowledge for particular tasks and the world continues to change, invalidating facts in the LLM. Updating the knowledge of these models through additional fine-tuning or editing is difficult, particularly when dealing with vast text corpora (Lewis et al., [2020](#bib.bib32); Mitchell et al., [2022](#bib.bib39)). An alternative approach, pioneered in open domain question answering systems (Chen et al., [2017](#bib.bib11); Yu et al., [2018](#bib.bib60)), is to index large quantities of text, after splitting it into chunks (paragraphs), in a separate information retrieval system. Retrieved information is then presented to the LLM along with the question as context (“retrieval augmentation”, Lewis et al., [2020](#bib.bib32); Izacard et al., [2022](#bib.bib24); Min et al., [2023](#bib.bib38); Ram et al., [2023](#bib.bib47)), making it easy to provide a system with current knowledge particular to some domain and enabling easy interpretability and provenance tracking, whereas the parametric knowledge of LLMs is opaque and difficult to trace back to its source (Akyurek et al., [2022](#bib.bib3)).

![Refer to caption](2401.18059v1/x1.png)

<span class="ltx_tag ltx_tag_figure">Figure 1: </span> <span id="S1.F1.2.1" class="ltx_text ltx_font_bold">Tree construction process:</span> RAPTOR recursively clusters chunks of text based on their vector embeddings and generates text summaries of those clusters, constructing a tree from the bottom up. Nodes clustered together are siblings; a parent node contains the text summary of that cluster.

Nevertheless, existing retrieval-augmented approaches also have flaws. The one we tackle is that most existing methods retrieve only a few short, contiguous text chunks, which limits their ability to represent and leverage large-scale discourse structure. This is particularly relevant for thematic questions that require integrating knowledge from multiple parts of a text, such as understanding an entire book, as in the NarrativeQA dataset (Kočiskỳ et al., [2018](#bib.bib31)). Consider the fairy tale of Cinderella, and the question “How did Cinderella reach her happy ending?”. The top-<math id="S1.p2.1.m1" class="ltx_Math" alttext="k" display="inline" intent=":literal"><semantics><mi>k</mi><annotation encoding="application/x-tex">k</annotation></semantics></math> retrieved short contiguous texts will not contain enough context to answer the question.

To address this, we design an indexing and retrieval system that uses a tree structure to capture both high-level and low-level details about a text. As shown in [<span class="ltx_text ltx_ref_tag">Figure&nbsp;1</span>](#S1.F1 "Figure 1 ‣ 1 Introduction ‣ RAPTOR: Recursive Abstractive Processing for Tree-Organized Retrieval"), our system, RAPTOR, clusters chunks of text, generates text summaries of those clusters, and then repeats, generating a tree from the bottom up. This structure enables RAPTOR to load into an LLM’s context chunks representing the text at different levels so that it can effectively and efficiently answer questions at different levels.

Our main contribution is the idea of using text summarization to allow retrieval augmentation of context at different scales, and to show its effectiveness in experiments on collections of long documents. Controlled experiments with three language models (UnifiedQA (Khashabi et al., [2020](#bib.bib29)), GPT-3 (Brown et al., [2020](#bib.bib8)) and GPT-4 (OpenAI, [2023](#bib.bib43))) show that RAPTOR outperforms current retrieval augmentation. Moreover, RAPTOR coupled with GPT-4, and sometimes even with UnifiedQA, gives new state-of-the-art results on three QA tasks: free text response questions on books and movies (NarrativeQA, Kočiskỳ et al. [2018](#bib.bib31)), full-text NLP papers (QASPER, Dasigi et al. [2021](#bib.bib16)), and multiple-choice questions based on medium-length passages (QuALITY, Pang et al. [2022](#bib.bib44)).<span id="footnote1" class="ltx_note ltx_role_footnote"><sup class="ltx_note_mark">1</sup><span class="ltx_note_outer"><span class="ltx_note_content"><sup class="ltx_note_mark">1</sup><span class="ltx_tag ltx_tag_note">1</span>We will release the code of RAPTOR publicly <a href="https://github.com/parthsarthi03/raptor" title="" class="ltx_ref ltx_href">here</a>.</span></span></span>

## <span class="ltx_tag ltx_tag_section">2 </span> Related Work

#### Why Retrieval?

Recent advances in hardware and algorithms have indeed expanded the context lengths that models can handle, leading to questions about the need for retrieval systems (Dai et al., [2019](#bib.bib14); Dao et al., [2022](#bib.bib15); Liu et al., [2023](#bib.bib34)). However, as Liu et al. ([2023](#bib.bib34)) and Sun et al. ([2021](#bib.bib55)) have noted, models tend to underutilize long-range context and see diminishing performance as context length increases, especially when pertinent information is embedded within a lengthy context. Moreover, practically, use of long contexts is expensive and slow. This suggests that selecting the most relevant information for knowledge-intensive tasks is still crucial.

#### Retrieval Methods

Retrieval-augmented language models (RALMs) have seen improvements in various components: the retriever, the reader, and end-to-end system training. Retrieval methods have transitioned from traditional term-based techniques like <span id="S2.SS0.SSS0.Px2.p1.1.1" class="ltx_text ltx_font_bold">TF-IDF</span> (Spärck Jones, [1972](#bib.bib54)) and <span id="S2.SS0.SSS0.Px2.p1.1.2" class="ltx_text ltx_font_bold">BM25</span> (Robertson et al., [1995](#bib.bib51); Roberts et al., [2020](#bib.bib49)) to deep learning–based strategies (Karpukhin et al., [2020](#bib.bib28); Khattab & Zaharia, [2020](#bib.bib30); Sachan et al., [2023](#bib.bib52)). Some recent work proposes using large language models as retrievers due to their ability to memorize extensive knowledge (Yu et al., [2022](#bib.bib61); Sun et al., [2022](#bib.bib56)). Research on the reader component includes <span id="S2.SS0.SSS0.Px2.p1.1.3" class="ltx_text ltx_font_bold">Fusion-in-Decoder (FiD)</span> (Izacard & Grave, [2022](#bib.bib23)), which employs both DPR and BM25 for retrieval and processes passages independently in the encoder and <span id="S2.SS0.SSS0.Px2.p1.1.4" class="ltx_text ltx_font_bold">RETRO</span> (Borgeaud et al., [2022](#bib.bib7); Wang et al., [2023](#bib.bib58)), which utilizes cross-chunked attention and chunkwise retrieval to generate text grounded on retrieved context.

End-to-end system training work includes <span id="S2.SS0.SSS0.Px2.p2.1.1" class="ltx_text ltx_font_bold">Atlas</span> (Izacard et al., [2022](#bib.bib24)), which fine-tunes an encoder-decoder model in conjunction with the retriever; <span id="S2.SS0.SSS0.Px2.p2.1.2" class="ltx_text ltx_font_bold">REALM</span> (Guu et al., [2020](#bib.bib21)), a bidirectional, masked LM fine-tuned for open-domain question answering; and <span id="S2.SS0.SSS0.Px2.p2.1.3" class="ltx_text ltx_font_bold">RAG (Retrieval-Augmented Generation)</span> (Lewis et al., [2020](#bib.bib32)), which integrates pre-trained sequence-to-sequence models with a neural retriever. Min et al. ([2021](#bib.bib37)) introduced <span id="S2.SS0.SSS0.Px2.p2.1.4" class="ltx_text ltx_font_bold">Joint Passage Retrieval (JPR)</span> model which uses a tree-decoding algorithm to handle passage diversity and relevance in multi-answer retrieval. <span id="S2.SS0.SSS0.Px2.p2.1.5" class="ltx_text ltx_font_bold">Dense Hierarchical Retrieval (DHR)</span> and <span id="S2.SS0.SSS0.Px2.p2.1.6" class="ltx_text ltx_font_bold">Hybrid Hierarchical Retrieval (HHR)</span> represent advancements in retrieval accuracy by combining document and passage level retrievals and integrating sparse and dense retrieval methods, respectively (Liu et al., [2021](#bib.bib35); Arivazhagan et al., [2023](#bib.bib5)).

Despite a diversity in methods, the retrieving components of models predominantly rely on standard approaches, i.e., chunking corpora and encoding with BERT-based retrievers. Although this approach is widely adopted, Nair et al. ([2023](#bib.bib41)) highlights a potential shortcoming: contiguous segmentation might not capture the complete semantic depth of the text. Reading extracted snippets from technical or scientific documents may lack important context making them difficult to read or even misleading. (Cohan & Goharian, [2017](#bib.bib13); Newman et al., [2023](#bib.bib42); Zhang et al., [2023](#bib.bib62)).

#### Recursive summarization as Context

Summarization techniques provide a condensed view of documents, enabling more focused engagement with the content (Angelidis & Lapata, [2018](#bib.bib4)). The summarization/snippet model by Gao et al. ([2023](#bib.bib19)) uses summarizations and snippets of passages, which improves correctness on most datasets but can sometimes be a lossy means of compression. The recursive-abstractive summarization model by Wu et al. ([2021](#bib.bib59)) employs task decomposition to summarize smaller text chunks, which are later integrated to form summaries of larger sections. While this method is effective for capturing broader themes, it can miss granular details. LlamaIndex (Liu, [2022](#bib.bib33)) mitigates this issue by similarly summarizing adjacent text chunks but also retaining intermediate nodes thus storing varying levels of detail, keeping granular details. However, both methods, due to their reliance on adjacency for grouping or summarizing adjacent nodes, may still overlook distant interdependencies within the text, which we can find and group with RAPTOR.

## <span class="ltx_tag ltx_tag_section">3 </span> Methods

#### Overview of RAPTOR

Building on the idea that long texts often present subtopics and hierarchical structures (Cao & Wang, [2022](#bib.bib10); Dong et al., [2023b](#bib.bib18)), RAPTOR addresses the issue of semantic depth and connection in reading by building a recursive tree structure that balances broader thematic comprehension with granular details and which allows nodes to be grouped based on semantic similarity not just order in the text.

Construction of the RAPTOR tree begins with segmenting the retrieval corpus into short, contiguous texts of length 100, similar to traditional retrieval augmentation techniques. If a sentence exceeds the 100-token limit, we move the entire sentence to the next chunk, rather than cutting it mid-sentence. This preserves the contextual and semantic coherence of the text within each chunk. These texts are then embedded using SBERT, a BERT-based encoder (<span id="S3.SS0.SSS0.Px1.p2.1.1" class="ltx_text ltx_font_typewriter">multi-qa-mpnet-base-cos-v1</span>) (Reimers & Gurevych, [2019](#bib.bib48)). The chunks and their corresponding SBERT embeddings form the leaf nodes of our tree structure.

To group similar text chunks, we employ a clustering algorithm. Once clustered, a Language Model is used to summarize the grouped texts. These summarized texts are then re-embedded, and the cycle of embedding, clustering, and summarization continues until further clustering becomes infeasible, resulting in a structured, multi-layered tree representation of the original documents. An important aspect of RAPTOR is its computational efficiency. The system scales linearly in terms of both build time and token expenditure, making it suitable for processing large and complex corpora. For a comprehensive discussion on RAPTOR’s scalability, please refer to the Appendix [<span class="ltx_text ltx_ref_tag">A</span>](#A1 "Appendix A Scalability and Computational Efficiency of the Tree-Building Process ‣ RAPTOR: Recursive Abstractive Processing for Tree-Organized Retrieval").

For querying within this tree, we introduce two distinct strategies: tree traversal and collapsed tree. The tree traversal method traverses the tree layer-by-layer, pruning and selecting the most relevant nodes at each level. The collapsed tree method evaluates nodes collectively across all layers to find the most relevant ones.

#### Clustering Algorithm

Clustering plays a key role in building the RAPTOR tree, organizing text segments into cohesive groups. This step groups related content together, which helps the subsequent retrieval process.

One of the unique aspects of our clustering approach is the use of soft clustering, where nodes can belong to multiple clusters without requiring a fixed number of clusters. This flexibility is essential because individual text segments often contain information relevant to various topics, thereby warranting their inclusion in multiple summaries.

Our clustering algorithm is based on Gaussian Mixture Models (GMMs), an approach that offers both flexibility and a probabilistic framework. GMMs assume that data points are generated from a mixture of several Gaussian distributions.

Given a set of <math id="S3.SS0.SSS0.Px2.p4.1.m1" class="ltx_Math" alttext="N" display="inline" intent=":literal"><semantics><mi>N</mi><annotation encoding="application/x-tex">N</annotation></semantics></math> text segments, each represented as a <math id="S3.SS0.SSS0.Px2.p4.2.m2" class="ltx_Math" alttext="d" display="inline" intent=":literal"><semantics><mi>d</mi><annotation encoding="application/x-tex">d</annotation></semantics></math>\-dimensional dense vector embedding, the likelihood of a text vector, <math id="S3.SS0.SSS0.Px2.p4.3.m3" class="ltx_Math" alttext="\mathbf{x}" display="inline" intent=":literal"><semantics><mi>𝐱</mi><annotation encoding="application/x-tex">\mathbf{x}</annotation></semantics></math>, given its membership in the <math id="S3.SS0.SSS0.Px2.p4.4.m4" class="ltx_Math" alttext="k^{th}" display="inline" intent=":literal"><semantics><msup><mi>k</mi><mrow><mi>t</mi><mo lspace="0em" rspace="0em">​</mo><mi>h</mi></mrow></msup><annotation encoding="application/x-tex">k^{th}</annotation></semantics></math> Gaussian distribution, is denoted by <math id="S3.SS0.SSS0.Px2.p4.5.m5" class="ltx_Math" alttext="P(\mathbf{x}|k)=\mathcal{N}(\mathbf{x};\mathbf{\mu}_{k},\mathbf{\Sigma}_{k})" display="inline" intent=":literal"><semantics><mrow><mrow><mi>P</mi><mo lspace="0em" rspace="0em">​</mo><mrow><mo stretchy="false">(</mo><mrow><mi>𝐱</mi><mo fence="false">|</mo><mi>k</mi></mrow><mo stretchy="false">)</mo></mrow></mrow><mo>=</mo><mrow><mi class="ltx_font_mathcaligraphic">𝒩</mi><mo lspace="0em" rspace="0em">​</mo><mrow><mo stretchy="false">(</mo><mi>𝐱</mi><mo>;</mo><msub><mi>μ</mi><mi>k</mi></msub><mo>,</mo><msub><mi>𝚺</mi><mi>k</mi></msub><mo stretchy="false">)</mo></mrow></mrow></mrow><annotation encoding="application/x-tex">P(\mathbf{x}|k)=\mathcal{N}(\mathbf{x};\mathbf{\mu}_{k},\mathbf{\Sigma}_{k})</annotation></semantics></math>. The overall probability distribution is a weighted combination <math id="S3.SS0.SSS0.Px2.p4.6.m6" class="ltx_Math" alttext="P(\mathbf{x})=\sum_{k=1}^{K}\pi_{k}\mathcal{N}(\mathbf{x};\mathbf{\mu}_{k},\mathbf{\Sigma}_{k})" display="inline" intent=":literal"><semantics><mrow><mrow><mi>P</mi><mo lspace="0em" rspace="0em">​</mo><mrow><mo stretchy="false">(</mo><mi>𝐱</mi><mo stretchy="false">)</mo></mrow></mrow><mo rspace="0.111em">=</mo><mrow><msubsup><mo>∑</mo><mrow><mi>k</mi><mo>=</mo><mn>1</mn></mrow><mi>K</mi></msubsup><mrow><msub><mi>π</mi><mi>k</mi></msub><mo lspace="0em" rspace="0em">​</mo><mi class="ltx_font_mathcaligraphic">𝒩</mi><mo lspace="0em" rspace="0em">​</mo><mrow><mo stretchy="false">(</mo><mi>𝐱</mi><mo>;</mo><msub><mi>μ</mi><mi>k</mi></msub><mo>,</mo><msub><mi>𝚺</mi><mi>k</mi></msub><mo stretchy="false">)</mo></mrow></mrow></mrow></mrow><annotation encoding="application/x-tex">P(\mathbf{x})=\sum_{k=1}^{K}\pi_{k}\mathcal{N}(\mathbf{x};\mathbf{\mu}_{k},\mathbf{\Sigma}_{k})</annotation></semantics></math>, where <math id="S3.SS0.SSS0.Px2.p4.7.m7" class="ltx_Math" alttext="\pi_{k}" display="inline" intent=":literal"><semantics><msub><mi>π</mi><mi>k</mi></msub><annotation encoding="application/x-tex">\pi_{k}</annotation></semantics></math> signifies the mixture weight for the <math id="S3.SS0.SSS0.Px2.p4.8.m8" class="ltx_Math" alttext="k^{\mathrm{th}}" display="inline" intent=":literal"><semantics><msup><mi>k</mi><mi>th</mi></msup><annotation encoding="application/x-tex">k^{\mathrm{th}}</annotation></semantics></math> Gaussian distribution.

The high dimensionality of vector embeddings presents a challenge for traditional GMMs, as distance metrics may behave poorly when used to measure similarity in high-dimensional spaces (Aggarwal et al., [2001](#bib.bib1)). To mitigate this, we employ Uniform Manifold Approximation and Projection (UMAP), a manifold learning technique for dimensionality reduction (McInnes et al., [2018](#bib.bib36)). The number of nearest neighbors parameter, <math id="S3.SS0.SSS0.Px2.p5.1.m1" class="ltx_Math" alttext="n\_neighbors" display="inline" intent=":literal"><semantics><mrow><mi>n</mi><mo lspace="0em" rspace="0em">​</mo><mi mathvariant="normal">_</mi><mo lspace="0em" rspace="0em">​</mo><mi>n</mi><mo lspace="0em" rspace="0em">​</mo><mi>e</mi><mo lspace="0em" rspace="0em">​</mo><mi>i</mi><mo lspace="0em" rspace="0em">​</mo><mi>g</mi><mo lspace="0em" rspace="0em">​</mo><mi>h</mi><mo lspace="0em" rspace="0em">​</mo><mi>b</mi><mo lspace="0em" rspace="0em">​</mo><mi>o</mi><mo lspace="0em" rspace="0em">​</mo><mi>r</mi><mo lspace="0em" rspace="0em">​</mo><mi>s</mi></mrow><annotation encoding="application/x-tex">n\_neighbors</annotation></semantics></math>, in UMAP determines the balance between the preservation of local and global structures. Our algorithm varies <math id="S3.SS0.SSS0.Px2.p5.2.m2" class="ltx_Math" alttext="n\_neighbors" display="inline" intent=":literal"><semantics><mrow><mi>n</mi><mo lspace="0em" rspace="0em">​</mo><mi mathvariant="normal">_</mi><mo lspace="0em" rspace="0em">​</mo><mi>n</mi><mo lspace="0em" rspace="0em">​</mo><mi>e</mi><mo lspace="0em" rspace="0em">​</mo><mi>i</mi><mo lspace="0em" rspace="0em">​</mo><mi>g</mi><mo lspace="0em" rspace="0em">​</mo><mi>h</mi><mo lspace="0em" rspace="0em">​</mo><mi>b</mi><mo lspace="0em" rspace="0em">​</mo><mi>o</mi><mo lspace="0em" rspace="0em">​</mo><mi>r</mi><mo lspace="0em" rspace="0em">​</mo><mi>s</mi></mrow><annotation encoding="application/x-tex">n\_neighbors</annotation></semantics></math> to create a hierarchical clustering structure: it first identifies global clusters and then performs local clustering within these global clusters. This two-step clustering process captures a broad spectrum of relationships among the text data, from broad themes to specific details.

Should a local cluster’s combined context ever exceed the summarization model’s token threshold, our algorithm recursively applies clustering within the cluster, ensuring that the context remains within the token threshold.

To determine the optimal number of clusters, we employ the Bayesian Information Criterion (BIC) for model selection. BIC not only penalizes model complexity but also rewards goodness of fit (Schwarz, [1978](#bib.bib53)). The BIC for a given GMM is <math id="S3.SS0.SSS0.Px2.p7.1.m1" class="ltx_Math" alttext="BIC=\ln(N)k-2\ln(\hat{L})" display="inline" intent=":literal"><semantics><mrow><mrow><mi>B</mi><mo lspace="0em" rspace="0em">​</mo><mi>I</mi><mo lspace="0em" rspace="0em">​</mo><mi>C</mi></mrow><mo>=</mo><mrow><mrow><mrow><mi>ln</mi><mo>⁡</mo><mrow><mo stretchy="false">(</mo><mi>N</mi><mo stretchy="false">)</mo></mrow></mrow><mo lspace="0em" rspace="0em">​</mo><mi>k</mi></mrow><mo>−</mo><mrow><mn>2</mn><mo lspace="0.167em" rspace="0em">​</mo><mrow><mi>ln</mi><mo>⁡</mo><mrow><mo stretchy="false">(</mo><mover accent="true"><mi>L</mi><mo>^</mo></mover><mo stretchy="false">)</mo></mrow></mrow></mrow></mrow></mrow><annotation encoding="application/x-tex">BIC=\ln(N)k-2\ln(\hat{L})</annotation></semantics></math>, where <math id="S3.SS0.SSS0.Px2.p7.2.m2" class="ltx_Math" alttext="N" display="inline" intent=":literal"><semantics><mi>N</mi><annotation encoding="application/x-tex">N</annotation></semantics></math> is the number of text segments (or data points), <math id="S3.SS0.SSS0.Px2.p7.3.m3" class="ltx_Math" alttext="k" display="inline" intent=":literal"><semantics><mi>k</mi><annotation encoding="application/x-tex">k</annotation></semantics></math> is the number of model parameters, and <math id="S3.SS0.SSS0.Px2.p7.4.m4" class="ltx_Math" alttext="\hat{L}" display="inline" intent=":literal"><semantics><mover accent="true"><mi>L</mi><mo>^</mo></mover><annotation encoding="application/x-tex">\hat{L}</annotation></semantics></math> is the maximized value of the likelihood function of the model. In the context of GMM, the number of parameters <math id="S3.SS0.SSS0.Px2.p7.5.m5" class="ltx_Math" alttext="k" display="inline" intent=":literal"><semantics><mi>k</mi><annotation encoding="application/x-tex">k</annotation></semantics></math> is a function of the dimensionality of the input vectors and the number of clusters.

With the optimal number of clusters determined by BIC, the Expectation-Maximization algorithm is then used to estimate the GMM parameters, namely the means, covariances, and mixture weights.

While the Gaussian assumption in GMMs may not perfectly align with the nature of text data, which often exhibits a sparse and skewed distribution, our empirical observations suggest that it offers an effective model for our purpose. We run an ablation comparing GMM Clustering with summarizing contiguous chunks and provide details in Appendix [<span class="ltx_text ltx_ref_tag">B</span>](#A2 "Appendix B Ablation Study on Clustering Mechanism in RAPTOR ‣ RAPTOR: Recursive Abstractive Processing for Tree-Organized Retrieval").

#### Model-Based Summarization

After clustering the nodes using Gaussian Mixture Models, the nodes in each cluster are sent to a language model for summarization. This step allows the model to transform large chunks of text into concise, coherent summaries of the selected nodes. For our experiments, we use <span id="S3.SS0.SSS0.Px3.p1.1.1" class="ltx_text ltx_font_typewriter">gpt-3.5-turbo</span> to generate the summaries. The summarization step condenses the potentially large volume of retrieved information into a manageable size. We provide statistics on the compression due to the summarization in Appendix [<span class="ltx_text ltx_ref_tag">C</span>](#A3 "Appendix C Dataset Statistics and Compression Ratios ‣ RAPTOR: Recursive Abstractive Processing for Tree-Organized Retrieval") and the prompt used for summarization in Appendix [<span class="ltx_text ltx_ref_tag">D</span>](#A4 "Appendix D Summarization Prompt ‣ RAPTOR: Recursive Abstractive Processing for Tree-Organized Retrieval").

While the summarization model generally produces reliable summaries, a focused annotation study revealed that about 4% of the summaries contained minor hallucinations. These did not propagate to parent nodes and had no discernible impact on question-answering tasks. For an in-depth analysis of hallucinations, refer to the appendix [<span class="ltx_text ltx_ref_tag">E</span>](#A5 "Appendix E Hallucination Analysis ‣ RAPTOR: Recursive Abstractive Processing for Tree-Organized Retrieval").

![Refer to caption](2401.18059v1/images/querying.jpg)

<span class="ltx_tag ltx_tag_figure">Figure 2: </span> <span id="S3.F2.10.1" class="ltx_text ltx_font_bold">Illustration of the tree traversal and collapsed tree retrieval mechanisms.</span> Tree traversal starts at the root level of the tree and retrieves the top-<math id="S3.F2.5.m1" class="ltx_Math" alttext="k" display="inline" intent=":literal"><semantics><mi>k</mi><annotation encoding="application/x-tex">k</annotation></semantics></math> (here, top-<math id="S3.F2.6.m2" class="ltx_Math" alttext="1" display="inline" intent=":literal"><semantics><mn>1</mn><annotation encoding="application/x-tex">1</annotation></semantics></math>) node(s) based on cosine similarity to the query vector. At each level, it retrieves the top-<math id="S3.F2.7.m3" class="ltx_Math" alttext="k" display="inline" intent=":literal"><semantics><mi>k</mi><annotation encoding="application/x-tex">k</annotation></semantics></math> node(s) from the child nodes of the previous layer’s top-<math id="S3.F2.8.m4" class="ltx_Math" alttext="k" display="inline" intent=":literal"><semantics><mi>k</mi><annotation encoding="application/x-tex">k</annotation></semantics></math>. Collapsed tree collapses the tree into a single layer and retrieves nodes until a threshold number of tokens is reached, based on cosine similarity to the query vector. The nodes on which cosine similarity search is performed are highlighted in both illustrations.

#### Querying

In this section, we elaborate on the two querying mechanisms employed by RAPTOR: tree traversal and collapsed tree. These methods offer unique ways of traversing the multi-layered RAPTOR tree to retrieve relevant information, each with its own advantages and trade-offs. We provide the pseudocode of both methods in Appendix [<span class="ltx_text ltx_ref_tag">F</span>](#A6 "Appendix F Pseudocode for Retrieval Methods ‣ RAPTOR: Recursive Abstractive Processing for Tree-Organized Retrieval"). Note that we embed all nodes using SBERT.

The <span id="S3.SS0.SSS0.Px4.p2.1.1" class="ltx_text ltx_font_bold">tree traversal</span> method first selects the top-k most relevant root nodes based on their cosine similarity to the query embedding. The children of these selected nodes are considered at the next layer and the top-k nodes are selected from this pool again based on their cosine similarity to the query vector. This process is repeated until we reach the leaf nodes. Finally, the text from all selected nodes is concatenated to form the retrieved context. The algorithm’s steps are outlined below:

1.  <span class="ltx_tag ltx_tag_item">1.</span>

    Start at the root layer of the RAPTOR tree. Compute the cosine similarity between the query embedding and the embeddings of all nodes present at this initial layer.

2.  <span class="ltx_tag ltx_tag_item">2.</span>

    Choose the top-<math id="S3.I1.i2.p1.1.m1" class="ltx_Math" alttext="k" display="inline" intent=":literal"><semantics><mi>k</mi><annotation encoding="application/x-tex">k</annotation></semantics></math> nodes based on the highest cosine similarity scores, forming the set <math id="S3.I1.i2.p1.2.m2" class="ltx_Math" alttext="S_{1}" display="inline" intent=":literal"><semantics><msub><mi>S</mi><mn>1</mn></msub><annotation encoding="application/x-tex">S_{1}</annotation></semantics></math>.

3.  <span class="ltx_tag ltx_tag_item">3.</span>

    Proceed to the child nodes of the elements in set <math id="S3.I1.i3.p1.1.m1" class="ltx_Math" alttext="S_{1}" display="inline" intent=":literal"><semantics><msub><mi>S</mi><mn>1</mn></msub><annotation encoding="application/x-tex">S_{1}</annotation></semantics></math>. Compute the cosine similarity between the query vector and the vector embeddings of these child nodes.

4.  <span class="ltx_tag ltx_tag_item">4.</span>

    Select the top <math id="S3.I1.i4.p1.1.m1" class="ltx_Math" alttext="k" display="inline" intent=":literal"><semantics><mi>k</mi><annotation encoding="application/x-tex">k</annotation></semantics></math> child nodes with the highest cosine similarity scores to the query, forming the set <math id="S3.I1.i4.p1.2.m2" class="ltx_Math" alttext="S_{2}" display="inline" intent=":literal"><semantics><msub><mi>S</mi><mn>2</mn></msub><annotation encoding="application/x-tex">S_{2}</annotation></semantics></math>.

5.  <span class="ltx_tag ltx_tag_item">5.</span>

    Continue this process recursively for <math id="S3.I1.i5.p1.1.m1" class="ltx_Math" alttext="d" display="inline" intent=":literal"><semantics><mi>d</mi><annotation encoding="application/x-tex">d</annotation></semantics></math> layers, producing sets <math id="S3.I1.i5.p1.2.m2" class="ltx_Math" alttext="S_{1},S_{2},\ldots,S_{d}" display="inline" intent=":literal"><semantics><mrow><msub><mi>S</mi><mn>1</mn></msub><mo>,</mo><msub><mi>S</mi><mn>2</mn></msub><mo>,</mo><mi mathvariant="normal">…</mi><mo>,</mo><msub><mi>S</mi><mi>d</mi></msub></mrow><annotation encoding="application/x-tex">S_{1},S_{2},\ldots,S_{d}</annotation></semantics></math>.

6.  <span class="ltx_tag ltx_tag_item">6.</span>

    Concatenate sets <math id="S3.I1.i6.p1.1.m1" class="ltx_Math" alttext="S_{1}" display="inline" intent=":literal"><semantics><msub><mi>S</mi><mn>1</mn></msub><annotation encoding="application/x-tex">S_{1}</annotation></semantics></math> through <math id="S3.I1.i6.p1.2.m2" class="ltx_Math" alttext="S_{d}" display="inline" intent=":literal"><semantics><msub><mi>S</mi><mi>d</mi></msub><annotation encoding="application/x-tex">S_{d}</annotation></semantics></math> to assemble the relevant context to the query.

By adjusting the depth <math id="S3.SS0.SSS0.Px4.p4.1.m1" class="ltx_Math" alttext="d" display="inline" intent=":literal"><semantics><mi>d</mi><annotation encoding="application/x-tex">d</annotation></semantics></math> and the number of nodes <math id="S3.SS0.SSS0.Px4.p4.2.m2" class="ltx_Math" alttext="k" display="inline" intent=":literal"><semantics><mi>k</mi><annotation encoding="application/x-tex">k</annotation></semantics></math> selected at each layer, the tree traversal method offers control over the specificity and breadth of the information retrieved. The algorithm starts with a broad outlook by considering the top layers of the tree and progressively focuses on finer details as it descends through the lower layers.

The <span id="S3.SS0.SSS0.Px4.p5.1.1" class="ltx_text ltx_font_bold">collapsed tree</span> approach offers a simpler way to search for relevant information by considering all nodes in the tree simultaneously, as depicted in Figure [<span class="ltx_text ltx_ref_tag">2</span>](#S3.F2 "Figure 2 ‣ Model-Based Summarization ‣ 3 Methods ‣ RAPTOR: Recursive Abstractive Processing for Tree-Organized Retrieval"). Instead of going layer-by-layer, this method flattens the multi-layered tree into a single layer, essentially bringing all the nodes onto the same level for comparison. The steps for this method are outlined below:

1.  <span class="ltx_tag ltx_tag_item">1.</span>

    First, collapse the entire RAPTOR tree into a single layer. This new set of nodes, denoted as <math id="S3.I2.i1.p1.1.m1" class="ltx_Math" alttext="C" display="inline" intent=":literal"><semantics><mi>C</mi><annotation encoding="application/x-tex">C</annotation></semantics></math>, contains nodes from every layer of the original tree.

2.  <span class="ltx_tag ltx_tag_item">2.</span>

    Next, calculate the cosine similarity between the query embedding and the embeddings of all nodes present in the collapsed set <math id="S3.I2.i2.p1.1.m1" class="ltx_Math" alttext="C" display="inline" intent=":literal"><semantics><mi>C</mi><annotation encoding="application/x-tex">C</annotation></semantics></math>.

3.  <span class="ltx_tag ltx_tag_item">3.</span>

    Finally, pick the top-<math id="S3.I2.i3.p1.1.m1" class="ltx_Math" alttext="k" display="inline" intent=":literal"><semantics><mi>k</mi><annotation encoding="application/x-tex">k</annotation></semantics></math> nodes that have the highest cosine similarity scores with the query. Keep adding nodes to the result set until you reach a predefined maximum number of tokens, ensuring you don’t exceed the model’s input limitations.

We tested both approaches on 20 stories from the QASPER dataset. Figure [<span class="ltx_text ltx_ref_tag">3</span>](#S3.F3 "Figure 3 ‣ Querying ‣ 3 Methods ‣ RAPTOR: Recursive Abstractive Processing for Tree-Organized Retrieval") shows the performance of tree traversal with different top- sizes and collapsed tree with different maximum token numbers. The collapsed tree approach consistently performs better. We believe collapsed tree retrieval is better due to offering greater flexibility than tree traversal; i.e., by searching through all the nodes simultaneously, it retrieves information that is at the correct level of granularity for a given question. In comparison, while using tree traversal with the same values of <math id="S3.SS0.SSS0.Px4.p7.1.m1" class="ltx_Math" alttext="d" display="inline" intent=":literal"><semantics><mi>d</mi><annotation encoding="application/x-tex">d</annotation></semantics></math> and <math id="S3.SS0.SSS0.Px4.p7.2.m2" class="ltx_Math" alttext="k" display="inline" intent=":literal"><semantics><mi>k</mi><annotation encoding="application/x-tex">k</annotation></semantics></math>, the ratio of nodes from each level of the tree will be constant. So, the ratio of higher-order thematic information to granular details will remain the same regardless of the question.

One drawback, however, of the collapsed tree approach is that it requires cosine similarity search to be performed on all nodes in the tree. However, this can be made more efficient with fast <math id="S3.SS0.SSS0.Px4.p8.1.m1" class="ltx_Math" alttext="k" display="inline" intent=":literal"><semantics><mi>k</mi><annotation encoding="application/x-tex">k</annotation></semantics></math>\-nearest neighbor libraries such as FAISS (Johnson et al., [2019](#bib.bib26)).

![Refer to caption](2401.18059v1/images/beam_and_collapsed.png)

<span class="ltx_tag ltx_tag_figure">Figure 3: </span> <span id="S3.F3.2.1" class="ltx_text ltx_font_bold">Comparison of querying methods.</span> Results on 20 stories from the QASPER dataset using tree traversal with different top-k values, and collapsed tree with different context lengths. Collapsed tree with 2000 tokens produces the best results, so we use this querying strategy for our main results.

Overall, given the collapsed tree approach’s greater flexibility and its superior performance on the subset of the QASPER dataset, this is the querying approach with which we proceed. Specifically, we use the collapsed tree with 2000 maximum tokens, which approximately equates to retrieving the top-20 nodes. Using a token-based approach ensures the context does not exceed model context constraints as token counts can vary across nodes. For experiments with the UnifiedQA model, we provide 400 tokens of context, as UnifiedQA has a max context length of 512 tokens. We provide the same amount of tokens of context to RAPTOR and to the baselines.

#### Qualitative Study

We conduct a qualitative analysis to understand the benefits of RAPTOR’s retrieval process compared to Dense Passage Retrieval (DPR) methods. Our study focuses on thematic, multi-hop questions using a 1500-word Cinderella fairytale. As illustrated in Figure [<span class="ltx_text ltx_ref_tag">4</span>](#S4.F4 "Figure 4 ‣ Datasets ‣ 4 Experiments ‣ RAPTOR: Recursive Abstractive Processing for Tree-Organized Retrieval"), RAPTOR’s tree-based retrieval allows it to choose nodes from different tree layers, matching the question’s detail level. This approach often yields more relevant and comprehensive information for downstream tasks than DPR. For a detailed discussion and examples, including the text retrieved by both RAPTOR and DPR for specific questions, please refer to the appendix [<span class="ltx_text ltx_ref_tag">G</span>](#A7 "Appendix G Qualitative Analysis ‣ RAPTOR: Recursive Abstractive Processing for Tree-Organized Retrieval").

## <span class="ltx_tag ltx_tag_section">4 </span> Experiments

#### Datasets

We measure RAPTOR’s performance across three question-answering datasets: NarrativeQA, QASPER, and QuALITY.

NarrativeQA is a dataset that comprises question-answer pairs based on the full texts of books and movie transcripts, totaling 1,572 documents (Kočiskỳ et al., [2018](#bib.bib31); Wu et al., [2021](#bib.bib59)). The NarrativeQA-Story task requires a comprehensive understanding of the entire narrative in order to accurately answer its questions, thus testing the model’s ability to comprehend longer texts in the literary domain. We measure performance on this dataset using the standard BLEU (B-1, B-4), ROUGE (R-L), and METEOR (M) metrics. Please see appendix [<span class="ltx_text ltx_ref_tag">H</span>](#A8 "Appendix H NarrativeQA Evaluation Script ‣ RAPTOR: Recursive Abstractive Processing for Tree-Organized Retrieval") for more details on the NarrativeQA evaluation script used in our experiments.

The QASPER dataset includes 5,049 questions across 1,585 NLP papers, with each question probing for information embedded within the full text (Dasigi et al., [2021](#bib.bib16)). The answer types in QASPER are categorized as Answerable/Unanswerable, Yes/No, Abstractive, and Extractive. Accuracy is measured using standard F1.

Lastly, the QuALITY dataset consists of multiple-choice questions, each accompanied by context passages averaging approximately 5,000 tokens in length (Pang et al., [2022](#bib.bib44)). This dataset calls for reasoning over the entire document for QA tasks, enabling us to measure the performance of our retrieval system on medium-length documents. The dataset includes a challenging subset, QuALITY-HARD, which contains questions that a majority of human annotators answered incorrectly in a speed-setting. We report accuracies for both the entire test set and the HARD subset.

![Refer to caption](2401.18059v1/images/qualitative_querying.png)

<span class="ltx_tag ltx_tag_figure">Figure 4: </span> <span id="S4.F4.2.1" class="ltx_text ltx_font_bold">Querying Process:</span> Illustration of how RAPTOR retrieves information for two questions about the Cinderella story: “What is the central theme of the story?” and “How did Cinderella find a happy ending?”. Highlighted nodes indicate RAPTOR’s selections, while arrows point to DPR’s leaf nodes. Notably, RAPTOR’s context often encompasses the information retrieved by DPR, either directly or within higher-layer summaries.

#### Controlled Baseline Comparisons

We first present controlled comparisons using the UnifiedQA 3B as the reader, with SBERT (Reimers & Gurevych, [2019](#bib.bib48)), BM25 (Robertson et al., [1995](#bib.bib51); [2009](#bib.bib50)), and DPR (Karpukhin et al., [2020](#bib.bib28)) as the embedding models with and without the RAPTOR tree structure, on three datasets: QASPER, NarrativeQA, and QuALITY. As shown in Tables [<span class="ltx_text ltx_ref_tag">1</span>](#S4.T1 "Table 1 ‣ Controlled Baseline Comparisons ‣ 4 Experiments ‣ RAPTOR: Recursive Abstractive Processing for Tree-Organized Retrieval") and [<span class="ltx_text ltx_ref_tag">2</span>](#S4.T2 "Table 2 ‣ Controlled Baseline Comparisons ‣ 4 Experiments ‣ RAPTOR: Recursive Abstractive Processing for Tree-Organized Retrieval"), our results demonstrate that RAPTOR, when combined with any retriever, consistently outperforms the respective retriever across all datasets. <span id="footnote2" class="ltx_note ltx_role_footnote"><sup class="ltx_note_mark">2</sup><span class="ltx_note_outer"><span class="ltx_note_content"><sup class="ltx_note_mark">2</sup><span class="ltx_tag ltx_tag_note">2</span>For the DPR experiments in Tables <a href="#S4.T1" title="Table 1 ‣ Controlled Baseline Comparisons ‣ 4 Experiments ‣ RAPTOR: Recursive Abstractive Processing for Tree-Organized Retrieval" class="ltx_ref"><span class="ltx_text ltx_ref_tag">1</span></a> and <a href="#S4.T2" title="Table 2 ‣ Controlled Baseline Comparisons ‣ 4 Experiments ‣ RAPTOR: Recursive Abstractive Processing for Tree-Organized Retrieval" class="ltx_ref"><span class="ltx_text ltx_ref_tag">2</span></a>, we used the <span id="footnote2.1" class="ltx_text ltx_font_typewriter">dpr-multiset-base</span> model as opposed to <span id="footnote2.2" class="ltx_text ltx_font_typewriter">dpr-single-nq-base</span> which was used in rest of the experiments done earlier. This decision was based on the performance observed in <cite class="ltx_cite ltx_citemacro_cite">Karpukhin et&nbsp;al. (<a href="#bib.bib28" title="" class="ltx_ref">2020</a>)</cite>, where <span id="footnote2.3" class="ltx_text ltx_font_typewriter">dpr-multiset-base</span> showed superior results.</span></span></span>

Since RAPTOR with SBERT has the best performance, we use it in all subsequent experiments. We now compare RAPTOR with BM25 and DPR, using three different LLMs: GPT-3, GPT-4, and UnifiedQA. As shown in Table [<span class="ltx_text ltx_ref_tag">3</span>](#S4.T3 "Table 3 ‣ Controlled Baseline Comparisons ‣ 4 Experiments ‣ RAPTOR: Recursive Abstractive Processing for Tree-Organized Retrieval"), RAPTOR consistently outperforms BM25 and DPR across all three Language Models on the QASPER dataset. RAPTOR’s F-1 Match scores are 53.1%, 55.7%, and 36.6% when using GPT-3, GPT-4, and UnifiedQA, respectively. These scores surpass DPR by margins of 1.8, 2.7, and 4.5 points, and outdo BM25 by 6.5, 5.5, and 10.2 points across the respective LLMs. QASPER requires synthesizing information within NLP papers, so it is unsurprising that RAPTOR’s higher-level summary nodes would allow it to outperform methods that can only extract the top-<math id="S4.SS0.SSS0.Px2.p2.1.m1" class="ltx_Math" alttext="k" display="inline" intent=":literal"><semantics><mi>k</mi><annotation encoding="application/x-tex">k</annotation></semantics></math> most similar raw chunks of text, which may not contain the correct response in isolation.

<span class="ltx_tag ltx_tag_table">Table 1: </span> <span id="S4.T1.2.1" class="ltx_text ltx_font_bold">NarrativeQA Performance With + Without RAPTOR: </span> Performance comparison of various retrieval methods (SBERT, BM25, DPR) with and without RAPTOR on the NarrativeQA dataset, using UnifiedQA-3B as the language model. RAPTOR outperforms baselines of each respective retrieval method.

<span id="S4.T1.3.1.1.1.1" class="ltx_text ltx_font_bold">Model</span>

<span id="S4.T1.3.1.1.2.1" class="ltx_text ltx_font_bold">ROUGE</span>

<span id="S4.T1.3.1.1.3.1" class="ltx_text ltx_font_bold">BLEU-1</span>

<span id="S4.T1.3.1.1.4.1" class="ltx_text ltx_font_bold">BLEU-4</span>

<span id="S4.T1.3.1.1.5.1" class="ltx_text ltx_font_bold">METEOR</span>

<span id="S4.T1.3.2.1.1.1" class="ltx_text ltx_font_bold">SBERT with RAPTOR</span>

<span id="S4.T1.3.2.1.2.1" class="ltx_text ltx_font_bold">30.87%</span>

<span id="S4.T1.3.2.1.3.1" class="ltx_text ltx_font_bold">23.50%</span>

<span id="S4.T1.3.2.1.4.1" class="ltx_text ltx_font_bold">6.42%</span>

<span id="S4.T1.3.2.1.5.1" class="ltx_text ltx_font_bold">19.20%</span>

SBERT without RAPTOR

29.26%

22.56%

5.95%

18.15%

<span id="S4.T1.3.4.3.1.1" class="ltx_text ltx_font_bold">BM25 with RAPTOR</span>

<span id="S4.T1.3.4.3.2.1" class="ltx_text ltx_font_bold">27.93%</span>

<span id="S4.T1.3.4.3.3.1" class="ltx_text ltx_font_bold">21.17%</span>

<span id="S4.T1.3.4.3.4.1" class="ltx_text ltx_font_bold">5.70%</span>

<span id="S4.T1.3.4.3.5.1" class="ltx_text ltx_font_bold">17.03%</span>

BM25 without RAPTOR

23.52%

17.73%

4.65%

13.98%

<span id="S4.T1.3.6.5.1.1" class="ltx_text ltx_font_bold">DPR with RAPTOR</span>

<span id="S4.T1.3.6.5.2.1" class="ltx_text ltx_font_bold">30.94%</span>

<span id="S4.T1.3.6.5.3.1" class="ltx_text ltx_font_bold">23.51%</span>

<span id="S4.T1.3.6.5.4.1" class="ltx_text ltx_font_bold">6.45%</span>

<span id="S4.T1.3.6.5.5.1" class="ltx_text ltx_font_bold">19.05%</span>

DPR without RAPTOR

29.56%

22.84%

6.12%

18.44%

Likewise, in the QuALITY dataset as shown in Table [<span class="ltx_text ltx_ref_tag">5</span>](#S4.T5.fig1 "Table 5 ‣ Controlled Baseline Comparisons ‣ 4 Experiments ‣ RAPTOR: Recursive Abstractive Processing for Tree-Organized Retrieval"), RAPTOR achieves an accuracy of 62.4%, which is a 2% and 5.1% improvement over DPR and BM25. Similar trends are observed when UnifiedQA is employed, with RAPTOR outperforming DPR and BM25 by 2.7% and 6.7%, respectively.

Finally, in the NarrativeQA dataset, as presented in Table [<span class="ltx_text ltx_ref_tag">6</span>](#S4.T6 "Table 6 ‣ Comparison to State-of-the-art Systems ‣ 4 Experiments ‣ RAPTOR: Recursive Abstractive Processing for Tree-Organized Retrieval"), RAPTOR excels across multiple metrics. For ROUGE-L, it surpasses BM25 and DPR by 7.3 and 2.7 points, respectively. In other metrics like BLEU-1, BLEU-4, and METEOR, RAPTOR outperforms BM25 and DPR by margins ranging from 1.7 to 5.8 and 0.7 to 2.1 points, respectively.

<span class="ltx_tag ltx_tag_table">Table 2: </span> <span id="S4.T2.2.1" class="ltx_text ltx_font_bold">QuALITY and QASPER Performance With + Without RAPTOR:</span> Performance comparison across the QuALITY and QASPER datasets of various retrieval methods (SBERT, BM25, DPR) with and without RAPTOR. UnifiedQA-3B is used as the language model. RAPTOR outperforms baselines of each respective retrieval method for both datasets.

<span id="S4.T2.3.1.1.1.1" class="ltx_text ltx_font_bold">Model</span>

<span id="S4.T2.3.1.1.2.1" class="ltx_text ltx_font_bold">Accuracy (QuALITY)</span>

<span id="S4.T2.3.1.1.3.1" class="ltx_text ltx_font_bold">Answer F1 (QASPER)</span>

<span id="S4.T2.3.2.1.1.1" class="ltx_text ltx_font_bold">SBERT with RAPTOR</span>

<span id="S4.T2.3.2.1.2.1" class="ltx_text ltx_font_bold">56.6%</span>

<span id="S4.T2.3.2.1.3.1" class="ltx_text ltx_font_bold">36.70%</span>

SBERT without RAPTOR

54.9%

36.23%

<span id="S4.T2.3.4.3.1.1" class="ltx_text ltx_font_bold">BM25 with RAPTOR</span>

<span id="S4.T2.3.4.3.2.1" class="ltx_text ltx_font_bold">52.1%</span>

<span id="S4.T2.3.4.3.3.1" class="ltx_text ltx_font_bold">27.00%</span>

BM25 without RAPTOR

49.9%

26.47%

<span id="S4.T2.3.6.5.1.1" class="ltx_text ltx_font_bold">DPR with RAPTOR</span>

<span id="S4.T2.3.6.5.2.1" class="ltx_text ltx_font_bold">54.7%</span>

<span id="S4.T2.3.6.5.3.1" class="ltx_text ltx_font_bold">32.23%</span>

DPR without RAPTOR

53.1%

31.70%

<span class="ltx_tag ltx_tag_table">Table 3: </span> Controlled comparison of F-1 scores on the QASPER dataset, using three different language models (GPT-3, GPT-4, UnifiedQA 3B) and various retrieval methods. The column ”Title + Abstract” reflects performance when only the title and abstract of the papers are used for context. RAPTOR outperforms the established baselines BM25 and DPR across all tested language models. Specifically, RAPTOR’s F-1 scores are at least 1.8% points higher than DPR and at least 5.3% points higher than BM25.

<span id="S4.T3.1.1.1.1.1" class="ltx_text ltx_font_bold">Retriever</span>

<span id="S4.T3.1.1.1.2.1" class="ltx_text ltx_font_bold">GPT-3 F-1 Match</span>

<span id="S4.T3.1.1.1.3.1" class="ltx_text ltx_font_bold">GPT-4 F-1 Match</span>

<span id="S4.T3.1.1.1.4.1" class="ltx_text ltx_font_bold">UnifiedQA F-1 Match</span>

Title + Abstract

25.2

22.2

17.5

BM25

46.6

50.2

26.4

DPR

51.3

53.0

32.1

<span id="S4.T3.1.5.4.1.1" class="ltx_text ltx_font_bold">RAPTOR</span>

<span id="S4.T3.1.5.4.2.1" class="ltx_text ltx_font_bold">53.1</span>

<span id="S4.T3.1.5.4.3.1" class="ltx_text ltx_font_bold">55.7</span>

<span id="S4.T3.1.5.4.4.1" class="ltx_text ltx_font_bold">36.6</span>

<span class="ltx_tag ltx_tag_table">Table 4: </span> Comparison of accuracies on the QuALITY dev dataset for two different language models (GPT-3, UnifiedQA 3B) using various retrieval methods. RAPTOR outperforms the baselines of BM25 and DPR by at least 2.0% in accuracy.

<span id="S4.T5.fig1.1.1.1.1.1" class="ltx_text ltx_font_bold">Model</span>

<span id="S4.T5.fig1.1.1.1.2.1" class="ltx_text ltx_font_bold">GPT-3 Acc.</span>

<span id="S4.T5.fig1.1.1.1.3.1" class="ltx_text ltx_font_bold">UnifiedQA Acc.</span>

BM25

57.3

49.9

DPR

60.4

53.9

<span id="S4.T5.fig1.1.4.3.1.1" class="ltx_text ltx_font_bold">RAPTOR</span>

<span id="S4.T5.fig1.1.4.3.2.1" class="ltx_text ltx_font_bold">62.4</span>

<span id="S4.T5.fig1.1.4.3.3.1" class="ltx_text ltx_font_bold">56.6</span>

<span class="ltx_tag ltx_tag_table">Table 5: </span> Results on F-1 Match scores of various models on the QASPER dataset.

<span id="S4.T5.fig1.2.1.1.1.1" class="ltx_text ltx_font_bold">Model</span>

<span id="S4.T5.fig1.2.1.1.2.1" class="ltx_text ltx_font_bold">F-1 Match</span>

LongT5 XL (Guo et al., [2022](#bib.bib20))

53.1

CoLT5 XL (Ainslie et al., [2023](#bib.bib2))

53.9

<span id="S4.T5.fig1.2.4.3.1.1" class="ltx_text ltx_font_bold">RAPTOR + GPT-4</span>

<span id="S4.T5.fig1.2.4.3.2.1" class="ltx_text ltx_font_bold">55.7</span>

#### Comparison to State-of-the-art Systems

Building upon our controlled comparisons, we examine RAPTOR’s performance relative to other state-of-the-art models. As shown in Table [<span class="ltx_text ltx_ref_tag">5</span>](#S4.T5.fig1 "Table 5 ‣ Controlled Baseline Comparisons ‣ 4 Experiments ‣ RAPTOR: Recursive Abstractive Processing for Tree-Organized Retrieval"), RAPTOR with GPT-4 sets a new benchmark on QASPER, with a 55.7% F-1 score, surpassing the CoLT5 XL’s score of 53.9%.

In the QuALITY dataset, as shown in Table [<span class="ltx_text ltx_ref_tag">7</span>](#S4.T7 "Table 7 ‣ Comparison to State-of-the-art Systems ‣ 4 Experiments ‣ RAPTOR: Recursive Abstractive Processing for Tree-Organized Retrieval"), RAPTOR paired with GPT-4 sets a new state-of-the-art with an accuracy of 82.6%, surpassing the previous best result of 62.3%. In particular, it outperforms CoLISA by 21.5% on QuALITY-HARD, which represents questions that humans took unusually long to correctly answer, requiring rereading parts of the text, difficult reasoning, or both.

For the NarrativeQA dataset, as represented in Table [<span class="ltx_text ltx_ref_tag">6</span>](#S4.T6 "Table 6 ‣ Comparison to State-of-the-art Systems ‣ 4 Experiments ‣ RAPTOR: Recursive Abstractive Processing for Tree-Organized Retrieval"), RAPTOR paired with UnifiedQA sets a new state-of-the-art METEOR score. When compared to the recursively summarizing model by Wu et al. ([2021](#bib.bib59)), which also employs UnifiedQA, RAPTOR outperforms it on all metrics. While Wu et al. ([2021](#bib.bib59)) rely solely on the summary in the top root node of the tree structure, RAPTOR benefits from its intermediate layers and clustering approaches, which allows it to capture a range of information, from general themes to specific details, contributing to its overall strong performance.

<span class="ltx_tag ltx_tag_table">Table 6: </span> Performance comparison on the NarrativeQA dataset across multiple models, focusing on four metrics: ROUGE-L, BLEU-1, BLEU-4, and METEOR. RAPTOR, when paired with UnifiedQA 3B, not only surpasses retrieval methods like BM25 and DPR but also sets a new state-of-the-art in the METEOR metric.

<span id="S4.T6.13.14.1.1.1" class="ltx_text ltx_font_bold">Model</span>

<span id="S4.T6.13.14.1.2.1" class="ltx_text ltx_font_bold">ROUGE-L</span>

<span id="S4.T6.13.14.1.3.1" class="ltx_text ltx_font_bold">BLEU-1</span>

<span id="S4.T6.13.14.1.4.1" class="ltx_text ltx_font_bold">BLEU-4</span>

<span id="S4.T6.13.14.1.5.1" class="ltx_text ltx_font_bold">METEOR</span>

BiDAF (Kočiskỳ et al., [2018](#bib.bib31))

<math id="S4.T6.1.1.1.m1" class="ltx_Math" alttext="6.2" display="inline" intent=":literal"><semantics><mn>6.2</mn><annotation encoding="application/x-tex">6.2</annotation></semantics></math>

<math id="S4.T6.2.2.2.m1" class="ltx_Math" alttext="5.7" display="inline" intent=":literal"><semantics><mn>5.7</mn><annotation encoding="application/x-tex">5.7</annotation></semantics></math>

<math id="S4.T6.3.3.3.m1" class="ltx_Math" alttext="0.3" display="inline" intent=":literal"><semantics><mn>0.3</mn><annotation encoding="application/x-tex">0.3</annotation></semantics></math>

<math id="S4.T6.4.4.4.m1" class="ltx_Math" alttext="3.7" display="inline" intent=":literal"><semantics><mn>3.7</mn><annotation encoding="application/x-tex">3.7</annotation></semantics></math>

BM25 + BERT (Mou et al., [2020](#bib.bib40))

<math id="S4.T6.5.5.1.m1" class="ltx_Math" alttext="15.5" display="inline" intent=":literal"><semantics><mn>15.5</mn><annotation encoding="application/x-tex">15.5</annotation></semantics></math>

<math id="S4.T6.6.6.2.m1" class="ltx_Math" alttext="14.5" display="inline" intent=":literal"><semantics><mn>14.5</mn><annotation encoding="application/x-tex">14.5</annotation></semantics></math>

<math id="S4.T6.7.7.3.m1" class="ltx_Math" alttext="1.4" display="inline" intent=":literal"><semantics><mn>1.4</mn><annotation encoding="application/x-tex">1.4</annotation></semantics></math>

<math id="S4.T6.8.8.4.m1" class="ltx_Math" alttext="5.0" display="inline" intent=":literal"><semantics><mn>5.0</mn><annotation encoding="application/x-tex">5.0</annotation></semantics></math>

Recursively Summarizing Books (Wu et al., [2021](#bib.bib59))

<math id="S4.T6.9.9.1.m1" class="ltx_Math" alttext="21.6" display="inline" intent=":literal"><semantics><mn>21.6</mn><annotation encoding="application/x-tex">21.6</annotation></semantics></math>

<math id="S4.T6.10.10.2.m1" class="ltx_Math" alttext="22.3" display="inline" intent=":literal"><semantics><mn>22.3</mn><annotation encoding="application/x-tex">22.3</annotation></semantics></math>

<math id="S4.T6.11.11.3.m1" class="ltx_Math" alttext="4.2" display="inline" intent=":literal"><semantics><mn>4.2</mn><annotation encoding="application/x-tex">4.2</annotation></semantics></math>

<math id="S4.T6.12.12.4.m1" class="ltx_Math" alttext="10.6" display="inline" intent=":literal"><semantics><mn>10.6</mn><annotation encoding="application/x-tex">10.6</annotation></semantics></math>

Retriever + Reader (Izacard & Grave, [2022](#bib.bib23))

<span id="S4.T6.13.13.3.1" class="ltx_text ltx_font_bold">32.0</span>

<span id="S4.T6.13.13.4.1" class="ltx_text ltx_font_bold">35.3</span>

<span id="S4.T6.13.13.5.1" class="ltx_text ltx_font_bold">7.5</span>

<math id="S4.T6.13.13.1.m1" class="ltx_Math" alttext="11.1" display="inline" intent=":literal"><semantics><mn>11.1</mn><annotation encoding="application/x-tex">11.1</annotation></semantics></math>

<span id="S4.T6.13.15.1.1.1" class="ltx_text ltx_font_bold">RAPTOR + UnifiedQA</span>

30.8

23.5

6.4

<span id="S4.T6.13.15.1.5.1" class="ltx_text ltx_font_bold">19.1</span>

<span class="ltx_tag ltx_tag_table">Table 7: </span> Accuracies of the QuALITY dataset on both the overall test set and the more challenging hard subset. GPT-4 with RAPTOR sets a new state-of-the-art.

<span id="S4.T7.8.9.1.1.1" class="ltx_text ltx_font_bold">Model</span>

<span id="S4.T7.8.9.1.2.1" class="ltx_text ltx_font_bold">Accuracy</span>

<span id="S4.T7.8.10.2.1.1" class="ltx_text ltx_font_bold">Test Set</span>

<span id="S4.T7.8.10.2.2.1" class="ltx_text ltx_font_bold">Hard Subset</span>

Longformer-base (Beltagy et al., [2020](#bib.bib6))

<math id="S4.T7.1.1.1.m1" class="ltx_Math" alttext="39.5" display="inline" intent=":literal"><semantics><mn>39.5</mn><annotation encoding="application/x-tex">39.5</annotation></semantics></math>

<math id="S4.T7.2.2.2.m1" class="ltx_Math" alttext="35.3" display="inline" intent=":literal"><semantics><mn>35.3</mn><annotation encoding="application/x-tex">35.3</annotation></semantics></math>

DPR and DeBERTaV3-large (Pang et al., [2022](#bib.bib44))

<math id="S4.T7.3.3.1.m1" class="ltx_Math" alttext="55.4" display="inline" intent=":literal"><semantics><mn>55.4</mn><annotation encoding="application/x-tex">55.4</annotation></semantics></math>

<math id="S4.T7.4.4.2.m1" class="ltx_Math" alttext="46.1" display="inline" intent=":literal"><semantics><mn>46.1</mn><annotation encoding="application/x-tex">46.1</annotation></semantics></math>

CoLISA (DeBERTaV3-large) (Dong et al., [2023a](#bib.bib17))

<math id="S4.T7.5.5.1.m1" class="ltx_Math" alttext="62.3" display="inline" intent=":literal"><semantics><mn>62.3</mn><annotation encoding="application/x-tex">62.3</annotation></semantics></math>

<math id="S4.T7.6.6.2.m1" class="ltx_Math" alttext="54.7" display="inline" intent=":literal"><semantics><mn>54.7</mn><annotation encoding="application/x-tex">54.7</annotation></semantics></math>

<span id="S4.T7.8.8.3.1" class="ltx_text ltx_font_bold">RAPTOR + GPT-4</span>

<span id="S4.T7.7.7.1.1" class="ltx_text ltx_markedasmath ltx_font_bold">82.6</span>

<span id="S4.T7.8.8.2.1" class="ltx_text ltx_markedasmath ltx_font_bold">76.2</span>

### <span class="ltx_tag ltx_tag_subsection">4.1 </span> Contribution of the tree structure

<span class="ltx_tag ltx_tag_table">Table 8: </span> Performance of RAPTOR when querying different tree layers for Story 1 from the QuALITY dataset. Columns represent different starting points (highest layer) and rows represent different numbers of layers queried.

<span id="S4.T8.1.1.1.1.1" class="ltx_text ltx_font_bold">Layers Queried / Start Layer</span>

<span id="S4.T8.1.1.1.2.1" class="ltx_text ltx_font_bold">Layer 0 (Leaf Nodes)</span>

<span id="S4.T8.1.1.1.3.1" class="ltx_text ltx_font_bold">Layer 1</span>

<span id="S4.T8.1.1.1.4.1" class="ltx_text ltx_font_bold">Layer 2</span>

1 layer

57.9

57.8

57.9

2 layers

\-

52.6

63.15

3 layers

\-

\-

<span id="S4.T8.1.4.3.4.1" class="ltx_text ltx_font_bold">73.68</span>

We examine the contribution of each layer of nodes to RAPTOR’s retrieval capabilities. We hypothesized that upper nodes play a crucial role in handling thematic or multi-hop queries requiring a broader understanding of the text.

We validated this hypothesis both quantitatively and qualitatively. We present qualitative analysis in appendix [<span class="ltx_text ltx_ref_tag">G</span>](#A7 "Appendix G Qualitative Analysis ‣ RAPTOR: Recursive Abstractive Processing for Tree-Organized Retrieval"). To quantitatively understand the contribution of the upper-level nodes, we used stories from the QuALITY dataset. The RAPTOR tree is built for each of these stories, as described in Section [<span class="ltx_text ltx_ref_tag">3</span>](#S3.SS0.SSS0.Px1 "Overview of RAPTOR ‣ 3 Methods ‣ RAPTOR: Recursive Abstractive Processing for Tree-Organized Retrieval"). However, during retrieval, we limit the search to different subsets of layers. For example, we exclusively retrieve from the leaf nodes and each upper layer, as well as from different contiguous subsets of the layers. We show findings specific to one story in Table [<span class="ltx_text ltx_ref_tag">8</span>](#S4.T8 "Table 8 ‣ 4.1 Contribution of the tree structure ‣ 4 Experiments ‣ RAPTOR: Recursive Abstractive Processing for Tree-Organized Retrieval"), revealing that a full-tree search, utilizing all layers, outperformed retrieval strategies that focused only on specific layers.

These findings highlight the importance of the full tree structure in RAPTOR. By providing both the original text and higher-level summaries for retrieval, RAPTOR can effectively handle a wider range of questions, from higher-order thematic queries to detail-oriented questions. Detailed results for additional stories and an ablation study on layer contributions can be found in Appendix [<span class="ltx_text ltx_ref_tag">I</span>](#A9 "Appendix I Analysis of Different Layers on RAPTOR’s Performance ‣ RAPTOR: Recursive Abstractive Processing for Tree-Organized Retrieval").

## <span class="ltx_tag ltx_tag_section">5 </span> Conclusion

In this paper, we have presented RAPTOR, a novel tree-based retrieval system that augments the parametric knowledge of large language models with contextual information at various levels of abstraction. By employing recursive clustering and summarization techniques, RAPTOR creates a hierarchical tree structure that is capable of synthesizing information across various sections of the retrieval corpora. During the query phase, RAPTOR leverages this tree structure for more effective retrieval. Our controlled experiments demonstrated that RAPTOR not only outperforms traditional retrieval methods but also sets new performance benchmarks on several question-answering tasks.

## <span class="ltx_tag ltx_tag_section">6 </span> Reproducibility Statement

#### Language Models for QA and Summarization

Four language models are used in our RAPTOR experiments: GPT-3 and GPT-4 for QA tasks, and GPT-3.5-turbo for summarization. The <span id="S6.SS0.SSS0.Px1.p1.1.1" class="ltx_text ltx_font_typewriter">gpt-3</span>, <span id="S6.SS0.SSS0.Px1.p1.1.2" class="ltx_text ltx_font_typewriter">gpt-4</span>, and <span id="S6.SS0.SSS0.Px1.p1.1.3" class="ltx_text ltx_font_typewriter">gpt-3.5-turbo</span> models can be accessed via API calls ([OpenAI API](https://beta.openai.com/examples/)). UnifiedQA, which is used for QA tasks, is publicly available at [Hugging Face](https://huggingface.co/allenai/unifiedqa-v2-t5-3b-1363200).

#### Evaluation Datasets

The three evaluation datasets used in our experiments—[QuALITY](https://github.com/nyu-mll/quality), [QASPER](https://allenai.org/data/qasper), and [NarrativeQA](https://github.com/google-deepmind/narrativeqa)—are all publicly accessible. These datasets ensure that the retrieval and QA tests conducted in this study can be replicated.

#### Source Code

The source code for RAPTOR will be publicly available [here](https://github.com/parthsarthi03/raptor).

## References

*   <span class="ltx_tag ltx_role_refnum ltx_tag_bibitem">Aggarwal et&nbsp;al. (2001)</span> <span class="ltx_bibblock">Charu&nbsp;C Aggarwal, Alexander Hinneburg, and Daniel&nbsp;A Keim. </span> <span class="ltx_bibblock">On the Surprising Behavior of Distance Metrics in High Dimensional Space. </span> <span class="ltx_bibblock">In <em id="bib.bib1.1.1" class="ltx_emph ltx_font_italic">Database Theory—ICDT 2001: 8th International Conference London, UK, January 4–6, 2001 Proceedings 8</em>, pp. 420–434. Springer, 2001. </span> <span class="ltx_bibblock">URL <a href="https://link.springer.com/chapter/10.1007/3-540-44503-x_27" title="" class="ltx_ref ltx_url ltx_font_typewriter">https://link.springer.com/chapter/10.1007/3-540-44503-x_27</a>.</span>
*   <span class="ltx_tag ltx_role_refnum ltx_tag_bibitem">Ainslie et&nbsp;al. (2023)</span> <span class="ltx_bibblock">Joshua Ainslie, Tao Lei, Michiel de&nbsp;Jong, Santiago Ontañón, Siddhartha Brahma, Yury Zemlyanskiy, David Uthus, Mandy Guo, James Lee-Thorp, Yi&nbsp;Tay, et&nbsp;al. </span> <span class="ltx_bibblock">CoLT5: Faster long-range transformers with conditional computation. </span> <span class="ltx_bibblock"><em id="bib.bib2.1.1" class="ltx_emph ltx_font_italic">arXiv preprint arXiv:2303.09752</em>, 2023. </span> <span class="ltx_bibblock">URL <a href="https://arxiv.org/abs/2303.09752" title="" class="ltx_ref ltx_url ltx_font_typewriter">https://arxiv.org/abs/2303.09752</a>.</span>
*   <span class="ltx_tag ltx_role_refnum ltx_tag_bibitem">Akyurek et&nbsp;al. (2022)</span> <span class="ltx_bibblock">Ekin Akyurek, Tolga Bolukbasi, Frederick Liu, Binbin Xiong, Ian Tenney, Jacob Andreas, and Kelvin Guu. </span> <span class="ltx_bibblock">Towards tracing knowledge in language models back to the training data. </span> <span class="ltx_bibblock">In <em id="bib.bib3.1.1" class="ltx_emph ltx_font_italic">Findings of the Association for Computational Linguistics: EMNLP 2022</em>, pp. 2429–2446, Abu Dhabi, United Arab Emirates, December 2022. Association for Computational Linguistics. </span> <span class="ltx_bibblock">doi: <span class="ltx_ref ltx_nolink ltx_Url ltx_ref_self">10.18653/v1/2022.findings-emnlp.180</span>. </span> <span class="ltx_bibblock">URL <a href="https://aclanthology.org/2022.findings-emnlp.180" title="" class="ltx_ref ltx_url ltx_font_typewriter">https://aclanthology.org/2022.findings-emnlp.180</a>.</span>
*   <span class="ltx_tag ltx_role_refnum ltx_tag_bibitem">Angelidis &amp; Lapata (2018)</span> <span class="ltx_bibblock">Stefanos Angelidis and Mirella Lapata. </span> <span class="ltx_bibblock">Summarizing opinions: Aspect extraction meets sentiment prediction and they are both weakly supervised. </span> <span class="ltx_bibblock"><em id="bib.bib4.1.1" class="ltx_emph ltx_font_italic">arXiv preprint arXiv:1808.08858</em>, 2018. </span> <span class="ltx_bibblock">URL <a href="https://arxiv.org/abs/1808.08858" title="" class="ltx_ref ltx_url ltx_font_typewriter">https://arxiv.org/abs/1808.08858</a>.</span>
*   <span class="ltx_tag ltx_role_refnum ltx_tag_bibitem">Arivazhagan et&nbsp;al. (2023)</span> <span class="ltx_bibblock">Manoj&nbsp;Ghuhan Arivazhagan, Lan Liu, Peng Qi, Xinchi Chen, William&nbsp;Yang Wang, and Zhiheng Huang. </span> <span class="ltx_bibblock">Hybrid hierarchical retrieval for open-domain question answering. </span> <span class="ltx_bibblock">In Anna Rogers, Jordan Boyd-Graber, and Naoaki Okazaki (eds.), <em id="bib.bib5.1.1" class="ltx_emph ltx_font_italic">Findings of the Association for Computational Linguistics: ACL 2023</em>, pp. 10680–10689, Toronto, Canada, July 2023. Association for Computational Linguistics. </span> <span class="ltx_bibblock">doi: <span class="ltx_ref ltx_nolink ltx_Url ltx_ref_self">10.18653/v1/2023.findings-acl.679</span>. </span> <span class="ltx_bibblock">URL <a href="https://aclanthology.org/2023.findings-acl.679" title="" class="ltx_ref ltx_url ltx_font_typewriter">https://aclanthology.org/2023.findings-acl.679</a>.</span>
*   <span class="ltx_tag ltx_role_refnum ltx_tag_bibitem">Beltagy et&nbsp;al. (2020)</span> <span class="ltx_bibblock">Iz&nbsp;Beltagy, Matthew&nbsp;E. Peters, and Arman Cohan. </span> <span class="ltx_bibblock">Longformer: The Long-document Transformer, 2020. </span> <span class="ltx_bibblock">URL <a href="https://arxiv.org/abs/2004.05150" title="" class="ltx_ref ltx_url ltx_font_typewriter">https://arxiv.org/abs/2004.05150</a>. </span> <span class="ltx_bibblock">arXiv preprint arXiv:2004.05150.</span>
*   <span class="ltx_tag ltx_role_refnum ltx_tag_bibitem">Borgeaud et&nbsp;al. (2022)</span> <span class="ltx_bibblock">Sebastian Borgeaud, Arthur Mensch, Jordan Hoffmann, Trevor Cai, Eliza Rutherford, Katie Millican, George&nbsp;Bm Van Den&nbsp;Driessche, Jean-Baptiste Lespiau, Bogdan Damoc, Aidan Clark, et&nbsp;al. </span> <span class="ltx_bibblock">Improving language models by retrieving from trillions of tokens. </span> <span class="ltx_bibblock">In <em id="bib.bib7.1.1" class="ltx_emph ltx_font_italic">International conference on machine learning</em>, pp. 2206–2240. PMLR, 2022. </span> <span class="ltx_bibblock">URL <a href="https://arxiv.org/abs/2112.04426" title="" class="ltx_ref ltx_url ltx_font_typewriter">https://arxiv.org/abs/2112.04426</a>.</span>
*   <span class="ltx_tag ltx_role_refnum ltx_tag_bibitem">Brown et&nbsp;al. (2020)</span> <span class="ltx_bibblock">Tom Brown, Benjamin Mann, Nick Ryder, Melanie Subbiah, Jared&nbsp;D Kaplan, Prafulla Dhariwal, Arvind Neelakantan, Pranav Shyam, Girish Sastry, Amanda Askell, Sandhini Agarwal, Ariel Herbert-Voss, Gretchen Krueger, Tom Henighan, Rewon Child, Aditya Ramesh, Daniel Ziegler, Jeffrey Wu, Clemens Winter, Chris Hesse, Mark Chen, Eric Sigler, Mateusz Litwin, Scott Gray, Benjamin Chess, Jack Clark, Christopher Berner, Sam McCandlish, Alec Radford, Ilya Sutskever, and Dario Amodei. </span> <span class="ltx_bibblock">Language Models are Few-Shot Learners. </span> <span class="ltx_bibblock">In H.&nbsp;Larochelle, M.&nbsp;Ranzato, R.&nbsp;Hadsell, M.F. Balcan, and H.&nbsp;Lin (eds.), <em id="bib.bib8.1.1" class="ltx_emph ltx_font_italic">Advances in Neural Information Processing Systems</em>, volume&nbsp;33, pp. 1877–1901. Curran Associates, Inc., 2020. </span> <span class="ltx_bibblock">URL <a href="https://proceedings.neurips.cc/paper_files/paper/2020/file/1457c0d6bfcb4967418bfb8ac142f64a-Paper.pdf" title="" class="ltx_ref ltx_url ltx_font_typewriter">https://proceedings.neurips.cc/paper_files/paper/2020/file/1457c0d6bfcb4967418bfb8ac142f64a-Paper.pdf</a>.</span>
*   <span class="ltx_tag ltx_role_refnum ltx_tag_bibitem">Bubeck et&nbsp;al. (2023)</span> <span class="ltx_bibblock">Sébastien Bubeck, Varun Chandrasekaran, Ronen Eldan, Johannes Gehrke, Eric Horvitz, Ece Kamar, Peter Lee, Yin&nbsp;Tat Lee, Yuanzhi Li, Scott Lundberg, et&nbsp;al. </span> <span class="ltx_bibblock">Sparks of Artificial General Intelligence: Early Experiments with GPT-4. </span> <span class="ltx_bibblock"><em id="bib.bib9.1.1" class="ltx_emph ltx_font_italic">arXiv preprint arXiv:2303.12712</em>, 2023. </span> <span class="ltx_bibblock">URL <a href="https://arxiv.org/abs/2303.12712" title="" class="ltx_ref ltx_url ltx_font_typewriter">https://arxiv.org/abs/2303.12712</a>.</span>
*   <span class="ltx_tag ltx_role_refnum ltx_tag_bibitem">Cao &amp; Wang (2022)</span> <span class="ltx_bibblock">Shuyang Cao and Lu&nbsp;Wang. </span> <span class="ltx_bibblock">HIBRIDS: Attention with hierarchical biases for structure-aware long document summarization. </span> <span class="ltx_bibblock">In <em id="bib.bib10.1.1" class="ltx_emph ltx_font_italic">Proceedings of the 60th Annual Meeting of the Association for Computational Linguistics (Volume 1: Long Papers)</em>, pp. 786–807, Dublin, Ireland, May 2022. Association for Computational Linguistics. </span> <span class="ltx_bibblock">doi: <span class="ltx_ref ltx_nolink ltx_Url ltx_ref_self">10.18653/v1/2022.acl-long.58</span>. </span> <span class="ltx_bibblock">URL <a href="https://aclanthology.org/2022.acl-long.58" title="" class="ltx_ref ltx_url ltx_font_typewriter">https://aclanthology.org/2022.acl-long.58</a>.</span>
*   <span class="ltx_tag ltx_role_refnum ltx_tag_bibitem">Chen et&nbsp;al. (2017)</span> <span class="ltx_bibblock">Danqi Chen, Adam Fisch, Jason Weston, and Antoine Bordes. </span> <span class="ltx_bibblock">Reading Wikipedia to Answer Open-Domain Questions. </span> <span class="ltx_bibblock">In <em id="bib.bib11.1.1" class="ltx_emph ltx_font_italic">Proceedings of the 55th Annual Meeting of the Association for Computational Linguistics (Volume 1: Long Papers)</em>, pp. 1870–1879, Vancouver, Canada, July 2017. Association for Computational Linguistics. </span> <span class="ltx_bibblock">doi: <span class="ltx_ref ltx_nolink ltx_Url ltx_ref_self">10.18653/v1/P17-1171</span>. </span> <span class="ltx_bibblock">URL <a href="https://aclanthology.org/P17-1171" title="" class="ltx_ref ltx_url ltx_font_typewriter">https://aclanthology.org/P17-1171</a>.</span>
*   <span class="ltx_tag ltx_role_refnum ltx_tag_bibitem">Chowdhery et&nbsp;al. (2022)</span> <span class="ltx_bibblock">Aakanksha Chowdhery, Sharan Narang, Jacob Devlin, Maarten Bosma, Gaurav Mishra, Adam Roberts, Paul Barham, Hyung&nbsp;Won Chung, Charles Sutton, Sebastian Gehrmann, et&nbsp;al. </span> <span class="ltx_bibblock">PaLM: Scaling Language Modeling with Pathways. </span> <span class="ltx_bibblock"><em id="bib.bib12.1.1" class="ltx_emph ltx_font_italic">arXiv preprint arXiv:2204.02311</em>, 2022. </span> <span class="ltx_bibblock">URL <a href="https://arxiv.org/abs/2204.02311" title="" class="ltx_ref ltx_url ltx_font_typewriter">https://arxiv.org/abs/2204.02311</a>.</span>
*   <span class="ltx_tag ltx_role_refnum ltx_tag_bibitem">Cohan &amp; Goharian (2017)</span> <span class="ltx_bibblock">Arman Cohan and Nazli Goharian. </span> <span class="ltx_bibblock">Contextualizing citations for scientific summarization using word embeddings and domain knowledge. </span> <span class="ltx_bibblock">In <em id="bib.bib13.1.1" class="ltx_emph ltx_font_italic">Proceedings of the 40th International ACM SIGIR Conference on Research and Development in Information Retrieval</em>, pp. 1133–1136, 2017. </span> <span class="ltx_bibblock">URL <a href="https://dl.acm.org/doi/abs/10.1145/3077136.3080740" title="" class="ltx_ref ltx_url ltx_font_typewriter">https://dl.acm.org/doi/abs/10.1145/3077136.3080740</a>.</span>
*   <span class="ltx_tag ltx_role_refnum ltx_tag_bibitem">Dai et&nbsp;al. (2019)</span> <span class="ltx_bibblock">Zihang Dai, Zhilin Yang, Yiming Yang, Jaime Carbonell, Quoc Le, and Ruslan Salakhutdinov. </span> <span class="ltx_bibblock">Transformer-XL: Attentive language models beyond a fixed-length context. </span> <span class="ltx_bibblock">In <em id="bib.bib14.1.1" class="ltx_emph ltx_font_italic">Proceedings of the 57th Annual Meeting of the Association for Computational Linguistics</em>, pp. 2978–2988, Florence, Italy, July 2019. Association for Computational Linguistics. </span> <span class="ltx_bibblock">doi: <span class="ltx_ref ltx_nolink ltx_Url ltx_ref_self">10.18653/v1/P19-1285</span>. </span> <span class="ltx_bibblock">URL <a href="https://aclanthology.org/P19-1285" title="" class="ltx_ref ltx_url ltx_font_typewriter">https://aclanthology.org/P19-1285</a>.</span>
*   <span class="ltx_tag ltx_role_refnum ltx_tag_bibitem">Dao et&nbsp;al. (2022)</span> <span class="ltx_bibblock">Tri Dao, Dan Fu, Stefano Ermon, Atri Rudra, and Christopher Ré. </span> <span class="ltx_bibblock">FlashAttention: Fast and memory-efficient exact attention with IO-Awareness. </span> <span class="ltx_bibblock"><em id="bib.bib15.1.1" class="ltx_emph ltx_font_italic">Advances in Neural Information Processing Systems</em>, 35:16344–16359, 2022. </span> <span class="ltx_bibblock">URL <a href="https://arxiv.org/abs/2205.14135" title="" class="ltx_ref ltx_url ltx_font_typewriter">https://arxiv.org/abs/2205.14135</a>.</span>
*   <span class="ltx_tag ltx_role_refnum ltx_tag_bibitem">Dasigi et&nbsp;al. (2021)</span> <span class="ltx_bibblock">Pradeep Dasigi, Kyle Lo, Iz&nbsp;Beltagy, Arman Cohan, Noah&nbsp;A. Smith, and Matt Gardner. </span> <span class="ltx_bibblock">A Dataset of Information-Seeking Questions and Answers Anchored in Research Papers. </span> <span class="ltx_bibblock">In <em id="bib.bib16.1.1" class="ltx_emph ltx_font_italic">Proceedings of the 2021 Conference of the North American Chapter of the Association for Computational Linguistics: Human Language Technologies</em>, pp. 4599–4610, Online, June 2021. Association for Computational Linguistics. </span> <span class="ltx_bibblock">doi: <span class="ltx_ref ltx_nolink ltx_Url ltx_ref_self">10.18653/v1/2021.naacl-main.365</span>. </span> <span class="ltx_bibblock">URL <a href="https://aclanthology.org/2021.naacl-main.365" title="" class="ltx_ref ltx_url ltx_font_typewriter">https://aclanthology.org/2021.naacl-main.365</a>.</span>
*   <span class="ltx_tag ltx_role_refnum ltx_tag_bibitem">Dong et&nbsp;al. (2023a)</span> <span class="ltx_bibblock">Mengxing Dong, Bowei Zou, Yanling Li, and Yu&nbsp;Hong. </span> <span class="ltx_bibblock">CoLISA: Inner Interaction via Contrastive Learning for Multi-choice Reading Comprehension. </span> <span class="ltx_bibblock">In <em id="bib.bib17.1.1" class="ltx_emph ltx_font_italic">Advances in Information Retrieval: 45th European Conference on Information Retrieval, ECIR 2023, Dublin, Ireland, April 2–6, 2023, Proceedings, Part I</em>, pp. 264–278. Springer, 2023a. </span> <span class="ltx_bibblock">URL <a href="https://link.springer.com/chapter/10.1007/978-3-031-28244-7_17" title="" class="ltx_ref ltx_url ltx_font_typewriter">https://link.springer.com/chapter/10.1007/978-3-031-28244-7_17</a>.</span>
*   <span class="ltx_tag ltx_role_refnum ltx_tag_bibitem">Dong et&nbsp;al. (2023b)</span> <span class="ltx_bibblock">Zican Dong, Tianyi Tang, Lunyi Li, and Wayne&nbsp;Xin Zhao. </span> <span class="ltx_bibblock">A survey on long text modeling with transformers. </span> <span class="ltx_bibblock"><em id="bib.bib18.1.1" class="ltx_emph ltx_font_italic">arXiv preprint arXiv:2302.14502</em>, 2023b. </span> <span class="ltx_bibblock">URL <a href="https://arxiv.org/abs/2302.14502" title="" class="ltx_ref ltx_url ltx_font_typewriter">https://arxiv.org/abs/2302.14502</a>.</span>
*   <span class="ltx_tag ltx_role_refnum ltx_tag_bibitem">Gao et&nbsp;al. (2023)</span> <span class="ltx_bibblock">Tianyu Gao, Howard Yen, Jiatong Yu, and Danqi Chen. </span> <span class="ltx_bibblock">Enabling large language models to generate text with citations. </span> <span class="ltx_bibblock"><em id="bib.bib19.1.1" class="ltx_emph ltx_font_italic">arXiv preprint arXiv:2305.14627</em>, 2023. </span> <span class="ltx_bibblock">URL <a href="https://arxiv.org/abs/2305.14627" title="" class="ltx_ref ltx_url ltx_font_typewriter">https://arxiv.org/abs/2305.14627</a>.</span>
*   <span class="ltx_tag ltx_role_refnum ltx_tag_bibitem">Guo et&nbsp;al. (2022)</span> <span class="ltx_bibblock">Mandy Guo, Joshua Ainslie, David Uthus, Santiago Ontanon, Jianmo Ni, Yun-Hsuan Sung, and Yinfei Yang. </span> <span class="ltx_bibblock">LongT5: Efficient text-to-text transformer for long sequences. </span> <span class="ltx_bibblock">In <em id="bib.bib20.1.1" class="ltx_emph ltx_font_italic">Findings of the Association for Computational Linguistics: NAACL 2022</em>, pp. 724–736, Seattle, United States, July 2022. Association for Computational Linguistics. </span> <span class="ltx_bibblock">doi: <span class="ltx_ref ltx_nolink ltx_Url ltx_ref_self">10.18653/v1/2022.findings-naacl.55</span>. </span> <span class="ltx_bibblock">URL <a href="https://aclanthology.org/2022.findings-naacl.55" title="" class="ltx_ref ltx_url ltx_font_typewriter">https://aclanthology.org/2022.findings-naacl.55</a>.</span>
*   <span class="ltx_tag ltx_role_refnum ltx_tag_bibitem">Guu et&nbsp;al. (2020)</span> <span class="ltx_bibblock">Kelvin Guu, Kenton Lee, Zora Tung, Panupong Pasupat, and Mingwei Chang. </span> <span class="ltx_bibblock">Retrieval Augmented Language Model Pre-Training. </span> <span class="ltx_bibblock">In <em id="bib.bib21.1.1" class="ltx_emph ltx_font_italic">International conference on machine learning</em>, pp. 3929–3938. PMLR, 2020. </span> <span class="ltx_bibblock">URL <a href="https://doi.org/10.48550/arXiv.2002.08909" title="" class="ltx_ref ltx_url ltx_font_typewriter">https://doi.org/10.48550/arXiv.2002.08909</a>.</span>
*   <span class="ltx_tag ltx_role_refnum ltx_tag_bibitem">Hoffmann et&nbsp;al. (2022)</span> <span class="ltx_bibblock">Jordan Hoffmann, Sebastian Borgeaud, Arthur Mensch, Elena Buchatskaya, Trevor Cai, Eliza Rutherford, Diego de&nbsp;Las Casas, Lisa&nbsp;Anne Hendricks, Johannes Welbl, Aidan Clark, et&nbsp;al. </span> <span class="ltx_bibblock">Training compute-optimal large language models. </span> <span class="ltx_bibblock"><em id="bib.bib22.1.1" class="ltx_emph ltx_font_italic">arXiv preprint arXiv:2203.15556</em>, 2022. </span> <span class="ltx_bibblock">URL <a href="https://arxiv.org/abs/2203.15556" title="" class="ltx_ref ltx_url ltx_font_typewriter">https://arxiv.org/abs/2203.15556</a>.</span>
*   <span class="ltx_tag ltx_role_refnum ltx_tag_bibitem">Izacard &amp; Grave (2022)</span> <span class="ltx_bibblock">Gautier Izacard and Edouard Grave. </span> <span class="ltx_bibblock">Distilling Knowledge from Reader to Retriever for Question Answering, 2022. </span> <span class="ltx_bibblock">URL <a href="https://arxiv.org/abs/2012.04584" title="" class="ltx_ref ltx_url ltx_font_typewriter">https://arxiv.org/abs/2012.04584</a>. </span> <span class="ltx_bibblock">arXiv preprint arXiv:2012.04584.</span>
*   <span class="ltx_tag ltx_role_refnum ltx_tag_bibitem">Izacard et&nbsp;al. (2022)</span> <span class="ltx_bibblock">Gautier Izacard, Patrick Lewis, Maria Lomeli, Lucas Hosseini, Fabio Petroni, Timo Schick, Jane Dwivedi-Yu, Armand Joulin, Sebastian Riedel, and Edouard Grave. </span> <span class="ltx_bibblock">Few-shot learning with retrieval augmented language models. </span> <span class="ltx_bibblock"><em id="bib.bib24.1.1" class="ltx_emph ltx_font_italic">arXiv preprint arXiv:2208.03299</em>, 2022. </span> <span class="ltx_bibblock">URL <a href="https://arxiv.org/abs/2208.03299" title="" class="ltx_ref ltx_url ltx_font_typewriter">https://arxiv.org/abs/2208.03299</a>.</span>
*   <span class="ltx_tag ltx_role_refnum ltx_tag_bibitem">Jiang et&nbsp;al. (2020)</span> <span class="ltx_bibblock">Zhengbao Jiang, Frank&nbsp;F Xu, Jun Araki, and Graham Neubig. </span> <span class="ltx_bibblock">How can we know what language models know? </span> <span class="ltx_bibblock"><em id="bib.bib25.1.1" class="ltx_emph ltx_font_italic">Transactions of the Association for Computational Linguistics</em>, 8:423–438, 2020. </span> <span class="ltx_bibblock">URL <a href="https://arxiv.org/abs/1911.12543" title="" class="ltx_ref ltx_url ltx_font_typewriter">https://arxiv.org/abs/1911.12543</a>.</span>
*   <span class="ltx_tag ltx_role_refnum ltx_tag_bibitem">Johnson et&nbsp;al. (2019)</span> <span class="ltx_bibblock">Jeff Johnson, Matthijs Douze, and Hervé Jégou. </span> <span class="ltx_bibblock">Billion-Scale Similarity Search with GPUs. </span> <span class="ltx_bibblock"><em id="bib.bib26.1.1" class="ltx_emph ltx_font_italic">IEEE Transactions on Big Data</em>, 7(3):535–547, 2019. </span> <span class="ltx_bibblock">URL <a href="https://arxiv.org/abs/1702.08734" title="" class="ltx_ref ltx_url ltx_font_typewriter">https://arxiv.org/abs/1702.08734</a>.</span>
*   <span class="ltx_tag ltx_role_refnum ltx_tag_bibitem">Kandpal et&nbsp;al. (2023)</span> <span class="ltx_bibblock">Nikhil Kandpal, Haikang Deng, Adam Roberts, Eric Wallace, and Colin Raffel. </span> <span class="ltx_bibblock">Large Language Models struggle to learn Long-Tail Knowledge. </span> <span class="ltx_bibblock">In <em id="bib.bib27.1.1" class="ltx_emph ltx_font_italic">International Conference on Machine Learning</em>, pp. 15696–15707. PMLR, 2023. </span> <span class="ltx_bibblock">URL <a href="https://proceedings.mlr.press/v202/kandpal23a/kandpal23a.pdf" title="" class="ltx_ref ltx_url ltx_font_typewriter">https://proceedings.mlr.press/v202/kandpal23a/kandpal23a.pdf</a>.</span>
*   <span class="ltx_tag ltx_role_refnum ltx_tag_bibitem">Karpukhin et&nbsp;al. (2020)</span> <span class="ltx_bibblock">Vladimir Karpukhin, Barlas Oguz, Sewon Min, Patrick Lewis, Ledell Wu, Sergey Edunov, Danqi Chen, and Wen-tau Yih. </span> <span class="ltx_bibblock">Dense Passage Retrieval for Open-Domain Question Answering. </span> <span class="ltx_bibblock">In <em id="bib.bib28.1.1" class="ltx_emph ltx_font_italic">Proceedings of the 2020 Conference on Empirical Methods in Natural Language Processing (EMNLP)</em>, pp. 6769–6781, Online, November 2020. Association for Computational Linguistics. </span> <span class="ltx_bibblock">doi: <span class="ltx_ref ltx_nolink ltx_Url ltx_ref_self">10.18653/v1/2020.emnlp-main.550</span>. </span> <span class="ltx_bibblock">URL <a href="https://aclanthology.org/2020.emnlp-main.550" title="" class="ltx_ref ltx_url ltx_font_typewriter">https://aclanthology.org/2020.emnlp-main.550</a>.</span>
*   <span class="ltx_tag ltx_role_refnum ltx_tag_bibitem">Khashabi et&nbsp;al. (2020)</span> <span class="ltx_bibblock">Daniel Khashabi, Sewon Min, Tushar Khot, Ashish Sabharwal, Oyvind Tafjord, Peter Clark, and Hannaneh Hajishirzi. </span> <span class="ltx_bibblock">UNIFIEDQA: Crossing format boundaries with a single QA system. </span> <span class="ltx_bibblock">In <em id="bib.bib29.1.1" class="ltx_emph ltx_font_italic">Findings of the Association for Computational Linguistics: EMNLP 2020</em>, pp. 1896–1907, Online, November 2020. Association for Computational Linguistics. </span> <span class="ltx_bibblock">doi: <span class="ltx_ref ltx_nolink ltx_Url ltx_ref_self">10.18653/v1/2020.findings-emnlp.171</span>. </span> <span class="ltx_bibblock">URL <a href="https://aclanthology.org/2020.findings-emnlp.171" title="" class="ltx_ref ltx_url ltx_font_typewriter">https://aclanthology.org/2020.findings-emnlp.171</a>.</span>
*   <span class="ltx_tag ltx_role_refnum ltx_tag_bibitem">Khattab &amp; Zaharia (2020)</span> <span class="ltx_bibblock">Omar Khattab and Matei Zaharia. </span> <span class="ltx_bibblock">ColBERT: Efficient and effective passage search via contextualized late interaction over bert. </span> <span class="ltx_bibblock">In <em id="bib.bib30.1.1" class="ltx_emph ltx_font_italic">Proceedings of the 43rd International ACM SIGIR conference on research and development in Information Retrieval</em>, pp. 39–48, 2020. </span> <span class="ltx_bibblock">URL <a href="https://arxiv.org/abs/2004.12832" title="" class="ltx_ref ltx_url ltx_font_typewriter">https://arxiv.org/abs/2004.12832</a>.</span>
*   <span class="ltx_tag ltx_role_refnum ltx_tag_bibitem">Kočiskỳ et&nbsp;al. (2018)</span> <span class="ltx_bibblock">Tomáš Kočiskỳ, Jonathan Schwarz, Phil Blunsom, Chris Dyer, Karl&nbsp;Moritz Hermann, Gábor Melis, and Edward Grefenstette. </span> <span class="ltx_bibblock">The NarrativeQA Reading Comprehension Challenge. </span> <span class="ltx_bibblock"><em id="bib.bib31.1.1" class="ltx_emph ltx_font_italic">Transactions of the Association for Computational Linguistics</em>, 6:317–328, 2018. </span> <span class="ltx_bibblock">URL <a href="https://arxiv.org/abs/1712.07040" title="" class="ltx_ref ltx_url ltx_font_typewriter">https://arxiv.org/abs/1712.07040</a>.</span>
*   <span class="ltx_tag ltx_role_refnum ltx_tag_bibitem">Lewis et&nbsp;al. (2020)</span> <span class="ltx_bibblock">Patrick Lewis, Ethan Perez, Aleksandra Piktus, Fabio Petroni, Vladimir Karpukhin, Naman Goyal, Heinrich Küttler, Mike Lewis, Wen-tau Yih, Tim Rocktäschel, et&nbsp;al. </span> <span class="ltx_bibblock">Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks. </span> <span class="ltx_bibblock"><em id="bib.bib32.1.1" class="ltx_emph ltx_font_italic">Advances in Neural Information Processing Systems</em>, 33:9459–9474, 2020. </span> <span class="ltx_bibblock">URL <a href="https://doi.org/10.48550/arXiv.2005.11401" title="" class="ltx_ref ltx_url ltx_font_typewriter">https://doi.org/10.48550/arXiv.2005.11401</a>.</span>
*   <span class="ltx_tag ltx_role_refnum ltx_tag_bibitem">Liu (2022)</span> <span class="ltx_bibblock">Jerry Liu. </span> <span class="ltx_bibblock">LlamaIndex, 2022. </span> <span class="ltx_bibblock">URL <a href="https://github.com/jerryjliu/llama_index" title="" class="ltx_ref ltx_url ltx_font_typewriter">https://github.com/jerryjliu/llama_index</a>.</span>
*   <span class="ltx_tag ltx_role_refnum ltx_tag_bibitem">Liu et&nbsp;al. (2023)</span> <span class="ltx_bibblock">Nelson&nbsp;F Liu, Kevin Lin, John Hewitt, Ashwin Paranjape, Michele Bevilacqua, Fabio Petroni, and Percy Liang. </span> <span class="ltx_bibblock">Lost in the middle: How language models use long contexts. </span> <span class="ltx_bibblock"><em id="bib.bib34.1.1" class="ltx_emph ltx_font_italic">arXiv preprint arXiv:2307.03172</em>, 2023. </span> <span class="ltx_bibblock">URL <a href="https://arxiv.org/abs/2307.03172" title="" class="ltx_ref ltx_url ltx_font_typewriter">https://arxiv.org/abs/2307.03172</a>.</span>
*   <span class="ltx_tag ltx_role_refnum ltx_tag_bibitem">Liu et&nbsp;al. (2021)</span> <span class="ltx_bibblock">Ye&nbsp;Liu, Kazuma Hashimoto, Yingbo Zhou, Semih Yavuz, Caiming Xiong, and Philip Yu. </span> <span class="ltx_bibblock">Dense hierarchical retrieval for open-domain question answering. </span> <span class="ltx_bibblock">In Marie-Francine Moens, Xuanjing Huang, Lucia Specia, and Scott Wen-tau Yih (eds.), <em id="bib.bib35.1.1" class="ltx_emph ltx_font_italic">Findings of the Association for Computational Linguistics: EMNLP 2021</em>, pp. 188–200, Punta Cana, Dominican Republic, November 2021. Association for Computational Linguistics. </span> <span class="ltx_bibblock">doi: <span class="ltx_ref ltx_nolink ltx_Url ltx_ref_self">10.18653/v1/2021.findings-emnlp.19</span>. </span> <span class="ltx_bibblock">URL <a href="https://aclanthology.org/2021.findings-emnlp.19" title="" class="ltx_ref ltx_url ltx_font_typewriter">https://aclanthology.org/2021.findings-emnlp.19</a>.</span>
*   <span class="ltx_tag ltx_role_refnum ltx_tag_bibitem">McInnes et&nbsp;al. (2018)</span> <span class="ltx_bibblock">Leland McInnes, John Healy, and James Melville. </span> <span class="ltx_bibblock">UMAP: Uniform Manifold Approximation and Projection for Dimension Reduction, 2018. </span> <span class="ltx_bibblock">URL <a href="https://arxiv.org/abs/1802.03426" title="" class="ltx_ref ltx_url ltx_font_typewriter">https://arxiv.org/abs/1802.03426</a>. </span> <span class="ltx_bibblock">arXiv preprint arXiv:1802.03426.</span>
*   <span class="ltx_tag ltx_role_refnum ltx_tag_bibitem">Min et&nbsp;al. (2021)</span> <span class="ltx_bibblock">Sewon Min, Kenton Lee, Ming-Wei Chang, Kristina Toutanova, and Hannaneh Hajishirzi. </span> <span class="ltx_bibblock">Joint passage ranking for diverse multi-answer retrieval. </span> <span class="ltx_bibblock">In Marie-Francine Moens, Xuanjing Huang, Lucia Specia, and Scott Wen-tau Yih (eds.), <em id="bib.bib37.1.1" class="ltx_emph ltx_font_italic">Proceedings of the 2021 Conference on Empirical Methods in Natural Language Processing</em>, pp. 6997–7008, Online and Punta Cana, Dominican Republic, November 2021. Association for Computational Linguistics. </span> <span class="ltx_bibblock">doi: <span class="ltx_ref ltx_nolink ltx_Url ltx_ref_self">10.18653/v1/2021.emnlp-main.560</span>. </span> <span class="ltx_bibblock">URL <a href="https://aclanthology.org/2021.emnlp-main.560" title="" class="ltx_ref ltx_url ltx_font_typewriter">https://aclanthology.org/2021.emnlp-main.560</a>.</span>
*   <span class="ltx_tag ltx_role_refnum ltx_tag_bibitem">Min et&nbsp;al. (2023)</span> <span class="ltx_bibblock">Sewon Min, Weijia Shi, Mike Lewis, Xilun Chen, Wen-tau Yih, Hannaneh Hajishirzi, and Luke Zettlemoyer. </span> <span class="ltx_bibblock">Nonparametric masked language modeling. </span> <span class="ltx_bibblock">In <em id="bib.bib38.1.1" class="ltx_emph ltx_font_italic">Findings of the Association for Computational Linguistics: ACL 2023</em>, pp. 2097–2118, Toronto, Canada, July 2023. Association for Computational Linguistics. </span> <span class="ltx_bibblock">doi: <span class="ltx_ref ltx_nolink ltx_Url ltx_ref_self">10.18653/v1/2023.findings-acl.132</span>. </span> <span class="ltx_bibblock">URL <a href="https://aclanthology.org/2023.findings-acl.132" title="" class="ltx_ref ltx_url ltx_font_typewriter">https://aclanthology.org/2023.findings-acl.132</a>.</span>
*   <span class="ltx_tag ltx_role_refnum ltx_tag_bibitem">Mitchell et&nbsp;al. (2022)</span> <span class="ltx_bibblock">Eric Mitchell, Charles Lin, Antoine Bosselut, Christopher&nbsp;D Manning, and Chelsea Finn. </span> <span class="ltx_bibblock">Memory-based model editing at scale. </span> <span class="ltx_bibblock">In <em id="bib.bib39.1.1" class="ltx_emph ltx_font_italic">International Conference on Machine Learning</em>, pp. 15817–15831. PMLR, 2022. </span> <span class="ltx_bibblock">URL <a href="https://proceedings.mlr.press/v162/mitchell22a/mitchell22a.pdf" title="" class="ltx_ref ltx_url ltx_font_typewriter">https://proceedings.mlr.press/v162/mitchell22a/mitchell22a.pdf</a>.</span>
*   <span class="ltx_tag ltx_role_refnum ltx_tag_bibitem">Mou et&nbsp;al. (2020)</span> <span class="ltx_bibblock">Xiangyang Mou, Mo&nbsp;Yu, Bingsheng Yao, Chenghao Yang, Xiaoxiao Guo, Saloni Potdar, and Hui Su. </span> <span class="ltx_bibblock">Frustratingly hard evidence retrieval for QA over books. </span> <span class="ltx_bibblock">In <em id="bib.bib40.1.1" class="ltx_emph ltx_font_italic">Proceedings of the First Joint Workshop on Narrative Understanding, Storylines, and Events</em>, pp. 108–113, Online, July 2020. Association for Computational Linguistics. </span> <span class="ltx_bibblock">doi: <span class="ltx_ref ltx_nolink ltx_Url ltx_ref_self">10.18653/v1/2020.nuse-1.13</span>. </span> <span class="ltx_bibblock">URL <a href="https://aclanthology.org/2020.nuse-1.13" title="" class="ltx_ref ltx_url ltx_font_typewriter">https://aclanthology.org/2020.nuse-1.13</a>.</span>
*   <span class="ltx_tag ltx_role_refnum ltx_tag_bibitem">Nair et&nbsp;al. (2023)</span> <span class="ltx_bibblock">Inderjeet Nair, Aparna Garimella, Balaji&nbsp;Vasan Srinivasan, Natwar Modani, Niyati Chhaya, Srikrishna Karanam, and Sumit Shekhar. </span> <span class="ltx_bibblock">A neural CRF-based hierarchical approach for linear text segmentation. </span> <span class="ltx_bibblock">In <em id="bib.bib41.1.1" class="ltx_emph ltx_font_italic">Findings of the Association for Computational Linguistics: EACL 2023</em>, pp. 883–893, Dubrovnik, Croatia, May 2023. Association for Computational Linguistics. </span> <span class="ltx_bibblock">doi: <span class="ltx_ref ltx_nolink ltx_Url ltx_ref_self">10.18653/v1/2023.findings-eacl.65</span>. </span> <span class="ltx_bibblock">URL <a href="https://aclanthology.org/2023.findings-eacl.65" title="" class="ltx_ref ltx_url ltx_font_typewriter">https://aclanthology.org/2023.findings-eacl.65</a>.</span>
*   <span class="ltx_tag ltx_role_refnum ltx_tag_bibitem">Newman et&nbsp;al. (2023)</span> <span class="ltx_bibblock">Benjamin Newman, Luca Soldaini, Raymond Fok, Arman Cohan, and Kyle Lo. </span> <span class="ltx_bibblock">A controllable qa-based framework for decontextualization. </span> <span class="ltx_bibblock"><em id="bib.bib42.1.1" class="ltx_emph ltx_font_italic">arXiv preprint arXiv:2305.14772</em>, 2023. </span> <span class="ltx_bibblock">URL <a href="https://arxiv.org/pdf/2305.14772.pdf" title="" class="ltx_ref ltx_url ltx_font_typewriter">https://arxiv.org/pdf/2305.14772.pdf</a>.</span>
*   <span class="ltx_tag ltx_role_refnum ltx_tag_bibitem">OpenAI (2023)</span> <span class="ltx_bibblock">OpenAI. </span> <span class="ltx_bibblock">GPT-4 Technical Report. </span> <span class="ltx_bibblock"><em id="bib.bib43.1.1" class="ltx_emph ltx_font_italic">ArXiv</em>, abs/2303.08774, 2023. </span> <span class="ltx_bibblock">URL <a href="https://arxiv.org/abs/2303.08774" title="" class="ltx_ref ltx_url ltx_font_typewriter">https://arxiv.org/abs/2303.08774</a>.</span>
*   <span class="ltx_tag ltx_role_refnum ltx_tag_bibitem">Pang et&nbsp;al. (2022)</span> <span class="ltx_bibblock">Richard&nbsp;Yuanzhe Pang, Alicia Parrish, Nitish Joshi, Nikita Nangia, Jason Phang, Angelica Chen, Vishakh Padmakumar, Johnny Ma, Jana Thompson, He&nbsp;He, and Samuel Bowman. </span> <span class="ltx_bibblock">QuALITY: Question Answering with Long Input Texts, Yes! </span> <span class="ltx_bibblock">In <em id="bib.bib44.1.1" class="ltx_emph ltx_font_italic">Proceedings of the 2022 Conference of the North American Chapter of the Association for Computational Linguistics: Human Language Technologies</em>, pp. 5336–5358, Seattle, United States, July 2022. Association for Computational Linguistics. </span> <span class="ltx_bibblock">URL <a href="https://aclanthology.org/2022.naacl-main.391" title="" class="ltx_ref ltx_url ltx_font_typewriter">https://aclanthology.org/2022.naacl-main.391</a>.</span>
*   <span class="ltx_tag ltx_role_refnum ltx_tag_bibitem">Petroni et&nbsp;al. (2019)</span> <span class="ltx_bibblock">Fabio Petroni, Tim Rocktäschel, Patrick Lewis, Anton Bakhtin, Yuxiang Wu, Alexander&nbsp;H Miller, and Sebastian Riedel. </span> <span class="ltx_bibblock">Language models as knowledge bases? </span> <span class="ltx_bibblock"><em id="bib.bib45.1.1" class="ltx_emph ltx_font_italic">arXiv preprint arXiv:1909.01066</em>, 2019. </span> <span class="ltx_bibblock">URL <a href="https://arxiv.org/abs/1909.01066" title="" class="ltx_ref ltx_url ltx_font_typewriter">https://arxiv.org/abs/1909.01066</a>.</span>
*   <span class="ltx_tag ltx_role_refnum ltx_tag_bibitem">Rae et&nbsp;al. (2021)</span> <span class="ltx_bibblock">Jack&nbsp;W Rae, Sebastian Borgeaud, Trevor Cai, Katie Millican, Jordan Hoffmann, Francis Song, John Aslanides, Sarah Henderson, Roman Ring, Susannah Young, et&nbsp;al. </span> <span class="ltx_bibblock">Scaling language models: Methods, Analysis &amp; Insights from Training Gopher. </span> <span class="ltx_bibblock"><em id="bib.bib46.1.1" class="ltx_emph ltx_font_italic">arXiv preprint arXiv:2112.11446</em>, 2021. </span> <span class="ltx_bibblock">URL <a href="https://arxiv.org/abs/2112.11446" title="" class="ltx_ref ltx_url ltx_font_typewriter">https://arxiv.org/abs/2112.11446</a>.</span>
*   <span class="ltx_tag ltx_role_refnum ltx_tag_bibitem">Ram et&nbsp;al. (2023)</span> <span class="ltx_bibblock">Ori Ram, Yoav Levine, Itay Dalmedigos, Dor Muhlgay, Amnon Shashua, Kevin Leyton-Brown, and Yoav Shoham. </span> <span class="ltx_bibblock">In-context retrieval-augmented language models. </span> <span class="ltx_bibblock"><em id="bib.bib47.1.1" class="ltx_emph ltx_font_italic">arXiv preprint arXiv:2302.00083</em>, 2023. </span> <span class="ltx_bibblock">URL <a href="https://arxiv.org/abs/2302.00083" title="" class="ltx_ref ltx_url ltx_font_typewriter">https://arxiv.org/abs/2302.00083</a>.</span>
*   <span class="ltx_tag ltx_role_refnum ltx_tag_bibitem">Reimers &amp; Gurevych (2019)</span> <span class="ltx_bibblock">Nils Reimers and Iryna Gurevych. </span> <span class="ltx_bibblock">Sentence-BERT: Sentence embeddings using Siamese BERT-networks. </span> <span class="ltx_bibblock">In <em id="bib.bib48.1.1" class="ltx_emph ltx_font_italic">Proceedings of the 2019 Conference on Empirical Methods in Natural Language Processing and the 9th International Joint Conference on Natural Language Processing (EMNLP-IJCNLP)</em>, pp. 3982–3992, Hong Kong, China, November 2019. Association for Computational Linguistics. </span> <span class="ltx_bibblock">doi: <span class="ltx_ref ltx_nolink ltx_Url ltx_ref_self">10.18653/v1/D19-1410</span>. </span> <span class="ltx_bibblock">URL <a href="https://aclanthology.org/D19-1410" title="" class="ltx_ref ltx_url ltx_font_typewriter">https://aclanthology.org/D19-1410</a>.</span>
*   <span class="ltx_tag ltx_role_refnum ltx_tag_bibitem">Roberts et&nbsp;al. (2020)</span> <span class="ltx_bibblock">Adam Roberts, Colin Raffel, and Noam Shazeer. </span> <span class="ltx_bibblock">How Much Knowledge Can You Pack Into the Parameters of a Language Model? </span> <span class="ltx_bibblock">In <em id="bib.bib49.1.1" class="ltx_emph ltx_font_italic">Proceedings of the 2020 Conference on Empirical Methods in Natural Language Processing (EMNLP)</em>, pp. 5418–5426, Online, November 2020. Association for Computational Linguistics. </span> <span class="ltx_bibblock">doi: <span class="ltx_ref ltx_nolink ltx_Url ltx_ref_self">10.18653/v1/2020.emnlp-main.437</span>. </span> <span class="ltx_bibblock">URL <a href="https://aclanthology.org/2020.emnlp-main.437" title="" class="ltx_ref ltx_url ltx_font_typewriter">https://aclanthology.org/2020.emnlp-main.437</a>.</span>
*   <span class="ltx_tag ltx_role_refnum ltx_tag_bibitem">Robertson et&nbsp;al. (2009)</span> <span class="ltx_bibblock">Stephen Robertson, Hugo Zaragoza, et&nbsp;al. </span> <span class="ltx_bibblock">The Probabilistic Relevance Framework: BM25 and Beyond. </span> <span class="ltx_bibblock"><em id="bib.bib50.1.1" class="ltx_emph ltx_font_italic">Foundations and Trends in Information Retrieval</em>, 3(4):333–389, 2009. </span> <span class="ltx_bibblock">URL <a href="https://doi.org/10.1561/1500000019" title="" class="ltx_ref ltx_url ltx_font_typewriter">https://doi.org/10.1561/1500000019</a>.</span>
*   <span class="ltx_tag ltx_role_refnum ltx_tag_bibitem">Robertson et&nbsp;al. (1995)</span> <span class="ltx_bibblock">Stephen&nbsp;E Robertson, Steve Walker, Susan Jones, Micheline&nbsp;M Hancock-Beaulieu, Mike Gatford, et&nbsp;al. </span> <span class="ltx_bibblock">Okapi at TREC-3. </span> <span class="ltx_bibblock"><em id="bib.bib51.1.1" class="ltx_emph ltx_font_italic">Nist Special Publication Sp</em>, 109:109, 1995. </span> <span class="ltx_bibblock">URL <a href="https://www.microsoft.com/en-us/research/publication/okapi-at-trec-3/" title="" class="ltx_ref ltx_url ltx_font_typewriter">https://www.microsoft.com/en-us/research/publication/okapi-at-trec-3/</a>.</span>
*   <span class="ltx_tag ltx_role_refnum ltx_tag_bibitem">Sachan et&nbsp;al. (2023)</span> <span class="ltx_bibblock">Devendra&nbsp;Singh Sachan, Mike Lewis, Dani Yogatama, Luke Zettlemoyer, Joelle Pineau, and Manzil Zaheer. </span> <span class="ltx_bibblock">Questions are all you need to train a dense passage retriever. </span> <span class="ltx_bibblock"><em id="bib.bib52.1.1" class="ltx_emph ltx_font_italic">Transactions of the Association for Computational Linguistics</em>, 11:600–616, 2023. </span> <span class="ltx_bibblock">doi: <span class="ltx_ref ltx_nolink ltx_Url ltx_ref_self">10.1162/tacl˙a˙00564</span>. </span> <span class="ltx_bibblock">URL <a href="https://aclanthology.org/2023.tacl-1.35" title="" class="ltx_ref ltx_url ltx_font_typewriter">https://aclanthology.org/2023.tacl-1.35</a>.</span>
*   <span class="ltx_tag ltx_role_refnum ltx_tag_bibitem">Schwarz (1978)</span> <span class="ltx_bibblock">Gideon Schwarz. </span> <span class="ltx_bibblock">Estimating the Dimension of a Model. </span> <span class="ltx_bibblock"><em id="bib.bib53.1.1" class="ltx_emph ltx_font_italic">The annals of statistics</em>, pp. 461–464, 1978. </span> <span class="ltx_bibblock">URL <a href="https://projecteuclid.org/journals/annals-of-statistics/volume-6/issue-2/Estimating-the-Dimension-of-a-Model/10.1214/aos/1176344136.full" title="" class="ltx_ref ltx_url ltx_font_typewriter">https://projecteuclid.org/journals/annals-of-statistics/volume-6/issue-2/Estimating-the-Dimension-of-a-Model/10.1214/aos/1176344136.full</a>.</span>
*   <span class="ltx_tag ltx_role_refnum ltx_tag_bibitem">Spärck&nbsp;Jones (1972)</span> <span class="ltx_bibblock">Karen Spärck&nbsp;Jones. </span> <span class="ltx_bibblock">A Statistical Interpretation of Term Specificity and its Application in Retrieval. </span> <span class="ltx_bibblock"><em id="bib.bib54.1.1" class="ltx_emph ltx_font_italic">Journal of documentation</em>, 28(1):11–21, 1972. </span> <span class="ltx_bibblock">URL <a href="https://doi.org/10.1108/eb026526" title="" class="ltx_ref ltx_url ltx_font_typewriter">https://doi.org/10.1108/eb026526</a>.</span>
*   <span class="ltx_tag ltx_role_refnum ltx_tag_bibitem">Sun et&nbsp;al. (2021)</span> <span class="ltx_bibblock">Simeng Sun, Kalpesh Krishna, Andrew Mattarella-Micke, and Mohit Iyyer. </span> <span class="ltx_bibblock">Do long-range language models actually use long-range context? </span> <span class="ltx_bibblock">In Marie-Francine Moens, Xuanjing Huang, Lucia Specia, and Scott Wen-tau Yih (eds.), <em id="bib.bib55.1.1" class="ltx_emph ltx_font_italic">Proceedings of the 2021 Conference on Empirical Methods in Natural Language Processing</em>, pp. 807–822, Online and Punta Cana, Dominican Republic, November 2021. Association for Computational Linguistics. </span> <span class="ltx_bibblock">doi: <span class="ltx_ref ltx_nolink ltx_Url ltx_ref_self">10.18653/v1/2021.emnlp-main.62</span>. </span> <span class="ltx_bibblock">URL <a href="https://aclanthology.org/2021.emnlp-main.62" title="" class="ltx_ref ltx_url ltx_font_typewriter">https://aclanthology.org/2021.emnlp-main.62</a>.</span>
*   <span class="ltx_tag ltx_role_refnum ltx_tag_bibitem">Sun et&nbsp;al. (2022)</span> <span class="ltx_bibblock">Zhiqing Sun, Xuezhi Wang, Yi&nbsp;Tay, Yiming Yang, and Denny Zhou. </span> <span class="ltx_bibblock">Recitation-augmented language models. </span> <span class="ltx_bibblock"><em id="bib.bib56.1.1" class="ltx_emph ltx_font_italic">arXiv preprint arXiv:2210.01296</em>, 2022. </span> <span class="ltx_bibblock">URL <a href="https://arxiv.org/abs/2210.01296" title="" class="ltx_ref ltx_url ltx_font_typewriter">https://arxiv.org/abs/2210.01296</a>.</span>
*   <span class="ltx_tag ltx_role_refnum ltx_tag_bibitem">Talmor et&nbsp;al. (2020)</span> <span class="ltx_bibblock">Alon Talmor, Yanai Elazar, Yoav Goldberg, and Jonathan Berant. </span> <span class="ltx_bibblock">oLMpics– on what language model pre-training captures. </span> <span class="ltx_bibblock"><em id="bib.bib57.1.1" class="ltx_emph ltx_font_italic">Transactions of the Association for Computational Linguistics</em>, 8:743–758, 2020. </span> <span class="ltx_bibblock">URL <a href="https://arxiv.org/abs/1912.13283" title="" class="ltx_ref ltx_url ltx_font_typewriter">https://arxiv.org/abs/1912.13283</a>.</span>
*   <span class="ltx_tag ltx_role_refnum ltx_tag_bibitem">Wang et&nbsp;al. (2023)</span> <span class="ltx_bibblock">Boxin Wang, Wei Ping, Peng Xu, Lawrence McAfee, Zihan Liu, Mohammad Shoeybi, Yi&nbsp;Dong, Oleksii Kuchaiev, Bo&nbsp;Li, Chaowei Xiao, et&nbsp;al. </span> <span class="ltx_bibblock">Shall we pretrain autoregressive language models with retrieval? a comprehensive study. </span> <span class="ltx_bibblock"><em id="bib.bib58.1.1" class="ltx_emph ltx_font_italic">arXiv preprint arXiv:2304.06762</em>, 2023. </span> <span class="ltx_bibblock">URL <a href="https://arxiv.org/abs/2304.06762" title="" class="ltx_ref ltx_url ltx_font_typewriter">https://arxiv.org/abs/2304.06762</a>.</span>
*   <span class="ltx_tag ltx_role_refnum ltx_tag_bibitem">Wu et&nbsp;al. (2021)</span> <span class="ltx_bibblock">Jeff Wu, Long Ouyang, Daniel&nbsp;M. Ziegler, Nisan Stiennon, Ryan Lowe, Jan Leike, and Paul Christiano. </span> <span class="ltx_bibblock">Recursively Summarizing Books with Human Feedback, 2021. </span> <span class="ltx_bibblock">URL <a href="https://arxiv.org/abs/2109.10862" title="" class="ltx_ref ltx_url ltx_font_typewriter">https://arxiv.org/abs/2109.10862</a>.</span>
*   <span class="ltx_tag ltx_role_refnum ltx_tag_bibitem">Yu et&nbsp;al. (2018)</span> <span class="ltx_bibblock">Adams&nbsp;Wei Yu, David Dohan, Minh-Thang Luong, Rui Zhao, Kai Chen, Mohammad Norouzi, and Quoc&nbsp;V. Le. </span> <span class="ltx_bibblock">QANet: Combining Local Convolution with Global Self-Attention for Reading Comprehension, 2018. </span> <span class="ltx_bibblock">URL <a href="https://arxiv.org/abs/1804.09541" title="" class="ltx_ref ltx_url ltx_font_typewriter">https://arxiv.org/abs/1804.09541</a>. </span> <span class="ltx_bibblock">arXiv preprint arXiv:1804.09541.</span>
*   <span class="ltx_tag ltx_role_refnum ltx_tag_bibitem">Yu et&nbsp;al. (2022)</span> <span class="ltx_bibblock">Wenhao Yu, Dan Iter, Shuohang Wang, Yichong Xu, Mingxuan Ju, Soumya Sanyal, Chenguang Zhu, Michael Zeng, and Meng Jiang. </span> <span class="ltx_bibblock">Generate rather than retrieve: Large Language Models are strong context generators, 2022. </span> <span class="ltx_bibblock">URL <a href="https://arxiv.org/abs/2209.10063" title="" class="ltx_ref ltx_url ltx_font_typewriter">https://arxiv.org/abs/2209.10063</a>.</span>
*   <span class="ltx_tag ltx_role_refnum ltx_tag_bibitem">Zhang et&nbsp;al. (2023)</span> <span class="ltx_bibblock">Shiyue Zhang, David Wan, and Mohit Bansal. </span> <span class="ltx_bibblock">Extractive is not faithful: An investigation of broad unfaithfulness problems in extractive summarization. </span> <span class="ltx_bibblock">In Anna Rogers, Jordan Boyd-Graber, and Naoaki Okazaki (eds.), <em id="bib.bib62.1.1" class="ltx_emph ltx_font_italic">Proceedings of the 61st Annual Meeting of the Association for Computational Linguistics (Volume 1: Long Papers)</em>, pp. 2153–2174, Toronto, Canada, July 2023. Association for Computational Linguistics. </span> <span class="ltx_bibblock">doi: <span class="ltx_ref ltx_nolink ltx_Url ltx_ref_self">10.18653/v1/2023.acl-long.120</span>. </span> <span class="ltx_bibblock">URL <a href="https://aclanthology.org/2023.acl-long.120" title="" class="ltx_ref ltx_url ltx_font_typewriter">https://aclanthology.org/2023.acl-long.120</a>.</span>

## <span class="ltx_tag ltx_tag_appendix">Appendix A </span> Scalability and Computational Efficiency of the Tree-Building Process

To assess the computational efficiency and cost-effectiveness of RAPTOR’s tree-building process, we conducted experiments on a consumer-grade laptop, specifically an Apple M1 Mac with 16GB of RAM. These experiments aimed to demonstrate the scalability and feasibility of RAPTOR on typical hardware. We varied the context length from 12,500 to 78,000 tokens and measured both the token expenditure and the time required to complete the tree-building process, from initial splitting and embedding to the construction of the final root node.

![Refer to caption](2401.18059v1/images/build_construction.png)

<span class="ltx_tag ltx_tag_figure">Figure 5: </span> Token cost as a function of document length for QASPER, NarrativeQA, and QuALITY. RAPTOR tree construction costs scale linearly with document length for each of the datasets.

#### Token Expenditure

We empirically investigated the relationship between the initial document length and the total number of tokens expended during the tree-building process, which includes both the prompt and completion tokens. The document lengths varied significantly across the three datasets examined: QuALITY, QASPER, and NarrativeQA. Figure [<span class="ltx_text ltx_ref_tag">5</span>](#A1.F5 "Figure 5 ‣ Appendix A Scalability and Computational Efficiency of the Tree-Building Process ‣ RAPTOR: Recursive Abstractive Processing for Tree-Organized Retrieval") illustrates a clear linear correlation between the initial document length and the total token expenditure, emphasizing that RAPTOR maintains a linear token scaling regardless of document complexity or length.

![Refer to caption](2401.18059v1/images/build_time.png)

<span class="ltx_tag ltx_tag_figure">Figure 6: </span> Build time as a function of document length for documents of up to 80,000 tokens. RAPTOR tree construction time scales linearly with document length for each of the datasets.

#### Build Time

We also empirically observed a consistent linear trend between the document length and the build time, as shown in Figure [<span class="ltx_text ltx_ref_tag">6</span>](#A1.F6 "Figure 6 ‣ Token Expenditure ‣ Appendix A Scalability and Computational Efficiency of the Tree-Building Process ‣ RAPTOR: Recursive Abstractive Processing for Tree-Organized Retrieval"). This suggests that RAPTOR scales linearly in terms of time, making it a viable solution for efficiently processing large corpora of varying lengths.

#### Conclusion

Overall, our empirical results indicate that RAPTOR scales both in terms of tokens expended and build time. Even as the complexity and volume of the input text grow, the cost of constructing the tree scales predictably and linearly. This demonstrates that RAPTOR is computationally efficient and well-suited for processing large and diverse corpora.

## <span class="ltx_tag ltx_tag_appendix">Appendix B </span> Ablation Study on Clustering Mechanism in RAPTOR

To assess the effectiveness of the clustering mechanism in our RAPTOR approach, we conducted an ablation study on the QuALITY dataset. This study compares RAPTOR’s performance with a balanced tree-style encoding and summarization of contiguous chunks, in contrast to our standard clustering method.

### <span class="ltx_tag ltx_tag_subsection">B.1 </span> Methodology

Both configurations in this ablation study utilized SBERT embeddings and UnifiedQA to maintain consistency in retrieval. For RAPTOR, we employed our typical clustering and summarization process. In contrast, the alternative setup involved creating a balanced tree by recursively encoding and summarizing contiguous text chunks. We determined the window size for this setup based on the average cluster size observed in RAPTOR, which is approximately 6.7 nodes. Hence, we chose a window size of 7 nodes. The collapsed tree approach was applied for retrieval in both models.

### <span class="ltx_tag ltx_tag_subsection">B.2 </span> Results & Discussion

The results of the ablation study are presented in table [<span class="ltx_text ltx_ref_tag">9</span>](#A2.T9 "Table 9 ‣ B.2 Results & Discussion ‣ Appendix B Ablation Study on Clustering Mechanism in RAPTOR ‣ RAPTOR: Recursive Abstractive Processing for Tree-Organized Retrieval"). The results from this ablation study clearly indicate an improvement in accuracy when employing RAPTOR’s clustering mechanism over the recency-based tree approach. This finding substantiates our hypothesis that the clustering strategy in RAPTOR is more effective in capturing homogeneous content for summarization, thereby enhancing the overall retrieval performance.

<span class="ltx_tag ltx_tag_table">Table 9: </span> Ablation study results comparing RAPTOR with a recency-based tree approach

<span id="A2.T9.1.1.1.1.1" class="ltx_text ltx_font_bold">Configuration</span>

<span id="A2.T9.1.1.1.2.1" class="ltx_text ltx_font_bold">Accuracy</span>

<span id="A2.T9.1.2.1.1.1" class="ltx_text ltx_font_bold">RAPTOR + SBERT embeddings + UnifiedQA</span>

<span id="A2.T9.1.2.1.2.1" class="ltx_text ltx_font_bold">56.6%</span>

Recency-based tree + SBERT embeddings + UnifiedQA

55.8%

## <span class="ltx_tag ltx_tag_appendix">Appendix C </span> Dataset Statistics and Compression Ratios

The average ratio of the summary length to the sum of child node lengths across all datasets is 0.28, indicating a 72% compression rate. On average, the summary length is 131 tokens, and the average child node length is 86 tokens. Below are the detailed statistics for all three datasets:

<span class="ltx_tag ltx_tag_table">Table 10: </span> Statistics of Average Summary Length and Child Node Length Across Datasets

<span id="A3.T10.1.1.1.1.1" class="ltx_text ltx_font_bold">Dataset</span>

<span id="A3.T10.1.1.1.2.1" class="ltx_inline-block ltx_align_top"><span id="A3.T10.1.1.1.2.1.1" class="ltx_p" style="width:56.9pt;"><span id="A3.T10.1.1.1.2.1.1.1" class="ltx_text ltx_font_bold ltx_align_center">Avg. Summary Length (tokens)</span></span></span>

<span id="A3.T10.1.1.1.3.1" class="ltx_inline-block ltx_align_top"><span id="A3.T10.1.1.1.3.1.1" class="ltx_p" style="width:56.9pt;"><span id="A3.T10.1.1.1.3.1.1.1" class="ltx_text ltx_font_bold ltx_align_center">Avg. Child Node Text Length (tokens)</span></span></span>

<span id="A3.T10.1.1.1.4.1" class="ltx_inline-block ltx_align_top"><span id="A3.T10.1.1.1.4.1.1" class="ltx_p" style="width:56.9pt;"><span id="A3.T10.1.1.1.4.1.1.1" class="ltx_text ltx_font_bold ltx_align_center">Avg. # of Child Nodes Per Parent</span></span></span>

<span id="A3.T10.1.1.1.5.1" class="ltx_inline-block ltx_align_top"><span id="A3.T10.1.1.1.5.1.1" class="ltx_p" style="width:56.9pt;"><span id="A3.T10.1.1.1.5.1.1.1" class="ltx_text ltx_font_bold ltx_align_center">Avg. Compression Ratio (%)</span></span></span>

All Datasets

131

85.6

6.7

.28

QuALITY

124.4

87.9

5.7

.28

NarrativeQA

129.7

85.5

6.8

.27

QASPER

145.9

86.2

5.7

.35

## <span class="ltx_tag ltx_tag_appendix">Appendix D </span> Summarization Prompt

Table [<span class="ltx_text ltx_ref_tag">11</span>](#A4.T11 "Table 11 ‣ Appendix D Summarization Prompt ‣ RAPTOR: Recursive Abstractive Processing for Tree-Organized Retrieval") shows the prompt used for summarization.

<span class="ltx_tag ltx_tag_table">Table 11: </span> Prompt for Summarization

<span id="A4.T11.1.1.1.1.1" class="ltx_text ltx_font_bold">Role</span>

<span id="A4.T11.1.1.1.2.1" class="ltx_inline-block ltx_align_top"><span id="A4.T11.1.1.1.2.1.1" class="ltx_p" style="width:284.5pt;"><span id="A4.T11.1.1.1.2.1.1.1" class="ltx_text ltx_font_bold">Content</span></span></span>

system

<span id="A4.T11.1.2.1.2.1" class="ltx_inline-block ltx_align_top"><span id="A4.T11.1.2.1.2.1.1" class="ltx_p" style="width:284.5pt;">You are a Summarizing Text Portal</span></span>

user

<span id="A4.T11.1.3.2.2.1" class="ltx_inline-block ltx_align_top"><span id="A4.T11.1.3.2.2.1.1" class="ltx_p" style="width:284.5pt;">Write a summary of the following, including as many key details as possible: {context}:</span></span>

## <span class="ltx_tag ltx_tag_appendix">Appendix E </span> Hallucination Analysis

To assess the quality and accuracy of the summarizations within our RAPTOR model, we conducted an analysis focusing on hallucinations in the generated summaries. The summaries were generated by <span id="A5.p1.1.1" class="ltx_text ltx_font_typewriter">gpt-3.5-turbo</span> and subsequently annotated to quantify the rates of hallucinations, to examine whether such inaccuracies propagate to parent nodes, and to evaluate their impact on question-answering (QA) tasks.

### <span class="ltx_tag ltx_tag_subsection">E.1 </span> Methodology

We randomly sampled 150 nodes across 40 stories and evaluated them for hallucinations. This sampling strategy provides a broad view of the model’s performance across different contexts. Each node was annotated by hand, and determined if it contained a hallucination.

### <span class="ltx_tag ltx_tag_subsection">E.2 </span> Findings

Out of the 150 nodes sampled, 4% (6 nodes) contained some form of hallucination. Most commonly, these hallucinations originated from the model adding minor information possibly from its training data that was not present in the text being summarized, or from incorrectly extrapolating some information when creating the summary.

<span id="A5.SS2.p2.1.1" class="ltx_text ltx_font_bold">Example:</span>

<span id="A5.SS2.p3.1.1" class="ltx_text ltx_font_italic">Text of the child nodes:</span>

> ”And you will come with me to my people? We may live here among them, and you will be a great warrior–oh, when Jor dies you may even be chief, for there is none so mighty as my warrior…”But your father will not permit it–Jor, my father, High Chief of the Galus, will not permit it, for like me you are cos-ata-lo. Oh, Co-Tan, if we but could!… Bradley noticed that she spoke in English–broken English like Co-Tan’s but equally appealing.

<span id="A5.SS2.p4.1.1" class="ltx_text ltx_font_italic">Summary found in the parent of that node:</span>

> The protagonist, Bradley, is being asked by Co-Tan to stay with her people and become a great warrior, but he refuses and must return to his own country. Tom Billings of Santa Monica arrives and tells them he came to search for a man named Bowen J. Tyler, Jr. Ajor, Co-Tan’s sister, is excited about the possibility of going to Tom’s country to see strange and wonderful things…

The hallucination here is that the summary states that Jr. Ajor and Co-Tan are sisters, but does not explicitly mention or imply this.

Upon reviewing all parent nodes, we found that hallucinations did not propagate to higher layers. Generally, the hallucinations were minor and did not alter the thematic interpretation of the text.

### <span class="ltx_tag ltx_tag_subsection">E.3 </span> Impact on QA Tasks

In our findings, hallucinations had no discernible impact on the performance of QA tasks. This suggests that hallucination is not a major concerns for the summarization component in our RAPTOR architecture.

## <span class="ltx_tag ltx_tag_appendix">Appendix F </span> Pseudocode for Retrieval Methods

<span class="ltx_tag ltx_tag_float"><span id="alg1.2.1.1" class="ltx_text ltx_font_bold">Algorithm 1</span> </span> Tree Traversal Algorithm

<span id="alg1.l1.1" class="ltx_text ltx_font_bold">function</span> <span id="alg1.l1.2" class="ltx_text ltx_font_smallcaps">TraverseTree</span>(<math id="alg1.l1.m1" class="ltx_Math" alttext="\text{tree},\text{query},k" display="inline" intent=":literal"><semantics><mrow><mtext>tree</mtext><mo>,</mo><mtext>query</mtext><mo>,</mo><mi>k</mi></mrow><annotation encoding="application/x-tex">\text{tree},\text{query},k</annotation></semantics></math>)

  <math id="alg1.l2.m1" class="ltx_Math" alttext="S_{\text{current}}\leftarrow\text{tree.layer}[0]" display="inline" intent=":literal"><semantics><mrow><msub><mi>S</mi><mtext>current</mtext></msub><mo stretchy="false">←</mo><mrow><mtext>tree.layer</mtext><mo lspace="0em" rspace="0em">​</mo><mrow><mo stretchy="false">[</mo><mn>0</mn><mo stretchy="false">]</mo></mrow></mrow></mrow><annotation encoding="application/x-tex">S_{\text{current}}\leftarrow\text{tree.layer}[0]</annotation></semantics></math>

  <span id="alg1.l3.1" class="ltx_text ltx_font_bold">for</span> <span id="alg1.l3.2" class="ltx_text ltx_markedasmath">layer in range(tree.num_layers)</span> <span id="alg1.l3.3" class="ltx_text ltx_font_bold">do</span>

   <math id="alg1.l4.m1" class="ltx_Math" alttext="top_{k}\leftarrow[]" display="inline" intent=":literal"><semantics><mrow><mrow><mi>t</mi><mo lspace="0em" rspace="0em">​</mo><mi>o</mi><mo lspace="0em" rspace="0em">​</mo><msub><mi>p</mi><mi>k</mi></msub></mrow><mo stretchy="false">←</mo><mrow><mo stretchy="false">[</mo><mo stretchy="false">]</mo></mrow></mrow><annotation encoding="application/x-tex">top_{k}\leftarrow[]</annotation></semantics></math>

   <span id="alg1.l5.1" class="ltx_text ltx_font_bold">for</span> <math id="alg1.l5.m1" class="ltx_Math" alttext="\text{node in }S_{\text{current}}" display="inline" intent=":literal"><semantics><mrow><mtext>node in&nbsp;</mtext><mo lspace="0em" rspace="0em">​</mo><msub><mi>S</mi><mtext>current</mtext></msub></mrow><annotation encoding="application/x-tex">\text{node in }S_{\text{current}}</annotation></semantics></math> <span id="alg1.l5.2" class="ltx_text ltx_font_bold">do</span>

     <math id="alg1.l6.m1" class="ltx_Math" alttext="score\leftarrow\text{dot\_product(query, node)}" display="inline" intent=":literal"><semantics><mrow><mrow><mi>s</mi><mo lspace="0em" rspace="0em">​</mo><mi>c</mi><mo lspace="0em" rspace="0em">​</mo><mi>o</mi><mo lspace="0em" rspace="0em">​</mo><mi>r</mi><mo lspace="0em" rspace="0em">​</mo><mi>e</mi></mrow><mo stretchy="false">←</mo><mtext>dot_product(query, node)</mtext></mrow><annotation encoding="application/x-tex">score\leftarrow\text{dot\_product(query, node)}</annotation></semantics></math>

     <math id="alg1.l7.m1" class="ltx_Math" alttext="\text{top\_k.append}((\text{node, score}))" display="inline" intent=":literal"><semantics><mrow><mtext>top_k.append</mtext><mo lspace="0em" rspace="0em">​</mo><mrow><mo stretchy="false">(</mo><mrow><mo stretchy="false">(</mo><mtext>node, score</mtext><mo stretchy="false">)</mo></mrow><mo stretchy="false">)</mo></mrow></mrow><annotation encoding="application/x-tex">\text{top\_k.append}((\text{node, score}))</annotation></semantics></math>

   <span id="alg1.l8.1" class="ltx_text ltx_font_bold">end</span> <span id="alg1.l8.2" class="ltx_text ltx_font_bold">for</span>

   <math id="alg1.l9.m1" class="ltx_Math" alttext="S_{\text{layer}}\leftarrow\text{sorted(top\_k)[:k].nodes}" display="inline" intent=":literal"><semantics><mrow><msub><mi>S</mi><mtext>layer</mtext></msub><mo stretchy="false">←</mo><mtext>sorted(top_k)[:k].nodes</mtext></mrow><annotation encoding="application/x-tex">S_{\text{layer}}\leftarrow\text{sorted(top\_k)[:k].nodes}</annotation></semantics></math>

   <math id="alg1.l10.m1" class="ltx_Math" alttext="S_{\text{current}}\leftarrow S_{\text{layer}}" display="inline" intent=":literal"><semantics><mrow><msub><mi>S</mi><mtext>current</mtext></msub><mo stretchy="false">←</mo><msub><mi>S</mi><mtext>layer</mtext></msub></mrow><annotation encoding="application/x-tex">S_{\text{current}}\leftarrow S_{\text{layer}}</annotation></semantics></math>

  <span id="alg1.l11.1" class="ltx_text ltx_font_bold">end</span> <span id="alg1.l11.2" class="ltx_text ltx_font_bold">for</span>

  <span id="alg1.l12.1" class="ltx_text ltx_font_bold">return</span> <math id="alg1.l12.m1" class="ltx_Math" alttext="S_{0}\cup S_{1}\cup S_{2}\cup\ldots\cup S_{k}" display="inline" intent=":literal"><semantics><mrow><msub><mi>S</mi><mn>0</mn></msub><mo>∪</mo><msub><mi>S</mi><mn>1</mn></msub><mo>∪</mo><msub><mi>S</mi><mn>2</mn></msub><mo>∪</mo><mi mathvariant="normal">…</mi><mo>∪</mo><msub><mi>S</mi><mi>k</mi></msub></mrow><annotation encoding="application/x-tex">S_{0}\cup S_{1}\cup S_{2}\cup\ldots\cup S_{k}</annotation></semantics></math>

<span id="alg1.l13.1" class="ltx_text ltx_font_bold">end</span> <span id="alg1.l13.2" class="ltx_text ltx_font_bold">function</span>

<span class="ltx_tag ltx_tag_float"><span id="alg2.2.1.1" class="ltx_text ltx_font_bold">Algorithm 2</span> </span> Collapsed Tree Algorithm

<span id="alg2.l1.1" class="ltx_text ltx_font_bold">function</span> <span id="alg2.l1.2" class="ltx_text ltx_font_smallcaps">CollapsedTree</span>(<math id="alg2.l1.m1" class="ltx_Math" alttext="\text{tree},\text{query},k,\text{max\_tokens}" display="inline" intent=":literal"><semantics><mrow><mtext>tree</mtext><mo>,</mo><mtext>query</mtext><mo>,</mo><mi>k</mi><mo>,</mo><mtext>max_tokens</mtext></mrow><annotation encoding="application/x-tex">\text{tree},\text{query},k,\text{max\_tokens}</annotation></semantics></math>)

  <math id="alg2.l2.m1" class="ltx_Math" alttext="\text{tree}\leftarrow\text{flatten(tree)}" display="inline" intent=":literal"><semantics><mrow><mtext>tree</mtext><mo stretchy="false">←</mo><mtext>flatten(tree)</mtext></mrow><annotation encoding="application/x-tex">\text{tree}\leftarrow\text{flatten(tree)}</annotation></semantics></math> <span id="alg2.l2.1" class="ltx_text" style="float:right;"><math id="alg2.l2.1.m1" class="ltx_Math" alttext="\triangleright" display="inline" intent=":literal"><semantics><mo>⊳</mo><annotation encoding="application/x-tex">\triangleright</annotation></semantics></math> Flatten tree into 1D</span>

  <math id="alg2.l3.m1" class="ltx_Math" alttext="\text{top\_nodes}\leftarrow[]" display="inline" intent=":literal"><semantics><mrow><mtext>top_nodes</mtext><mo stretchy="false">←</mo><mrow><mo stretchy="false">[</mo><mo stretchy="false">]</mo></mrow></mrow><annotation encoding="application/x-tex">\text{top\_nodes}\leftarrow[]</annotation></semantics></math>

  <span id="alg2.l4.1" class="ltx_text ltx_font_bold">for</span> <span id="alg2.l4.2" class="ltx_text ltx_markedasmath">node in tree</span> <span id="alg2.l4.3" class="ltx_text ltx_font_bold">do</span>

   <math id="alg2.l5.m1" class="ltx_math_unparsed" alttext="\text{top\_nodes.append}((\text{node, dot\_product(query, node))}" display="inline" intent=":literal"><semantics><mrow><mtext>top_nodes.append</mtext><mrow><mo stretchy="false">(</mo><mrow><mo stretchy="false">(</mo><mtext>node, dot_product(query, node))</mtext></mrow></mrow></mrow><annotation encoding="application/x-tex">\text{top\_nodes.append}((\text{node, dot\_product(query, node))}</annotation></semantics></math>

  <span id="alg2.l6.1" class="ltx_text ltx_font_bold">end</span> <span id="alg2.l6.2" class="ltx_text ltx_font_bold">for</span>

  <math id="alg2.l7.m1" class="ltx_Math" alttext="\text{top\_nodes}\leftarrow\text{sorted(top\_nodes)}" display="inline" intent=":literal"><semantics><mrow><mtext>top_nodes</mtext><mo stretchy="false">←</mo><mtext>sorted(top_nodes)</mtext></mrow><annotation encoding="application/x-tex">\text{top\_nodes}\leftarrow\text{sorted(top\_nodes)}</annotation></semantics></math>

  <math id="alg2.l8.m1" class="ltx_Math" alttext="\text{result}\leftarrow[]" display="inline" intent=":literal"><semantics><mrow><mtext>result</mtext><mo stretchy="false">←</mo><mrow><mo stretchy="false">[</mo><mo stretchy="false">]</mo></mrow></mrow><annotation encoding="application/x-tex">\text{result}\leftarrow[]</annotation></semantics></math>

  <math id="alg2.l9.m1" class="ltx_Math" alttext="\text{total\_tokens}\leftarrow 0" display="inline" intent=":literal"><semantics><mrow><mtext>total_tokens</mtext><mo stretchy="false">←</mo><mn>0</mn></mrow><annotation encoding="application/x-tex">\text{total\_tokens}\leftarrow 0</annotation></semantics></math>

  <span id="alg2.l10.1" class="ltx_text ltx_font_bold">for</span> <span id="alg2.l10.2" class="ltx_text ltx_markedasmath">node in top_nodes</span> <span id="alg2.l10.3" class="ltx_text ltx_font_bold">do</span>

   <span id="alg2.l11.1" class="ltx_text ltx_font_bold">if</span> <math id="alg2.l11.m1" class="ltx_Math" alttext="\text{total\_tokens}+\text{node.token\_size}&lt;\text{max\_tokens}" display="inline" intent=":literal"><semantics><mrow><mrow><mtext>total_tokens</mtext><mo>+</mo><mtext>node.token_size</mtext></mrow><mo>&lt;</mo><mtext>max_tokens</mtext></mrow><annotation encoding="application/x-tex">\text{total\_tokens}+\text{node.token\_size}&lt;\text{max\_tokens}</annotation></semantics></math> <span id="alg2.l11.2" class="ltx_text ltx_font_bold">then</span>

     <span id="alg2.l12.1" class="ltx_text ltx_markedasmath">result.append(node)</span>

   <span id="alg2.l13.1" class="ltx_text ltx_font_bold">end</span> <span id="alg2.l13.2" class="ltx_text ltx_font_bold">if</span>

   <math id="alg2.l14.m1" class="ltx_Math" alttext="\text{total\_tokens}\leftarrow\text{total\_tokens}+\text{node.token\_size}" display="inline" intent=":literal"><semantics><mrow><mtext>total_tokens</mtext><mo stretchy="false">←</mo><mrow><mtext>total_tokens</mtext><mo>+</mo><mtext>node.token_size</mtext></mrow></mrow><annotation encoding="application/x-tex">\text{total\_tokens}\leftarrow\text{total\_tokens}+\text{node.token\_size}</annotation></semantics></math>

  <span id="alg2.l15.1" class="ltx_text ltx_font_bold">end</span> <span id="alg2.l15.2" class="ltx_text ltx_font_bold">for</span>

  <span id="alg2.l16.1" class="ltx_text ltx_font_bold">return</span> <span id="alg2.l16.2" class="ltx_text ltx_markedasmath">result</span>

<span id="alg2.l17.1" class="ltx_text ltx_font_bold">end</span> <span id="alg2.l17.2" class="ltx_text ltx_font_bold">function</span>

<span id="A6.T12.1.1.1.1.1" class="ltx_text ltx_font_bold">Question: What is the central theme of the story?</span>

<span id="A6.T12.1.2.1.1.1" class="ltx_text ltx_font_bold">RAPTOR</span>

<span id="A6.T12.1.2.1.2.1" class="ltx_inline-block ltx_align_top"><span id="A6.T12.1.2.1.2.1.1" class="ltx_p" style="width:313.0pt;">Fairy Godmother helps Cinderella attend a ball by transforming her rags… Cinderella impresses the Prince at the ball… she loses track of time and has to run home alone in the darkness. The Prince is unable to find Cinderella and goes in search of her … She forgave her sisters, and treated them always very kindly, and the Prince had great cause to be glad that he had found the glass slipper.</span></span>

<span id="A6.T12.1.3.2.1.1" class="ltx_text ltx_font_bold">DPR</span>

<span id="A6.T12.1.3.2.2.1" class="ltx_inline-block ltx_align_top"><span id="A6.T12.1.3.2.2.1.1" class="ltx_p" style="width:313.0pt;">Two mice were turned into footmen; four grasshoppers into white horses. Next, the Fairy touched Cinderella’s rags, and they became rich satin robes, trimmed with point lace. … Alas! the clock had struck Eleven. She found no coach, only a pumpkin, and the rat and mice ran quickly away when they saw her; while all her fine dress turned to rags, and she had to run home alone…They told her a beautiful Princess had been at the ball, with whom the Prince was delighted. They did not know it was Cinderella.</span></span>

<span id="A6.T12.1.4.3.1.1" class="ltx_text ltx_font_bold">Question: How does Cinderella find a happy ending?</span>

<span id="A6.T12.1.5.4.1.1" class="ltx_text ltx_font_bold">RAPTOR</span>

<span id="A6.T12.1.5.4.2.1" class="ltx_inline-block ltx_align_top"><span id="A6.T12.1.5.4.2.1.1" class="ltx_p" style="width:313.0pt;">The story of Cinderella involves her godmother, a fairy, who transforms a pumpkin into a grand coach with her wand and allows Cinderella to attend the ball. However, Cinderella must return home before the clock strikes eleven or her dress will turn back into rags… Cinderella impresses the Prince at the ball but leaves before he can find out who she is… The Prince searched for the owner of a lost glass slipper and found it belonged to Cinderella. She forgave her sisters and the Prince was glad to have found her.</span></span>

<span id="A6.T12.1.6.5.1.1" class="ltx_text ltx_font_bold">DPR</span>

<span id="A6.T12.1.6.5.2.1" class="ltx_inline-block ltx_align_top"><span id="A6.T12.1.6.5.2.1.1" class="ltx_p" style="width:313.0pt;">the clock had struck Eleven… The Prince was very much surprised when he missed Cinderella again, and leaving the ball, went in search of her… Fairy touched Cinderella’s rags, and they became rich satin robes, trimmed with point lace… Her old shoes became a charming pair of glass slippers, which shone like diamonds. “Now go to the ball, my love,” she said, “and enjoy yourself. But remember, you must leave the room before the clock strikes eleven. If you do not your dress will return to its original rags.”</span></span>

<span class="ltx_tag ltx_tag_table">Table 12: </span> Relevant excerpts from text retrieved by RAPTOR and DPR for the questions on the fairytale Cinderella.

## <span class="ltx_tag ltx_tag_appendix">Appendix G </span> Qualitative Analysis

To qualitatively examine RAPTOR’s retrieval process, we test it on thematic, multi-hop questions about a 1500-word version of the fairytale Cinderella. We compare the context retrieved by RAPTOR with the context retrieved by Dense Passage Retrieval (DPR). Figure [<span class="ltx_text ltx_ref_tag">4</span>](#S4.F4 "Figure 4 ‣ Datasets ‣ 4 Experiments ‣ RAPTOR: Recursive Abstractive Processing for Tree-Organized Retrieval") in the main paper details the retrieval process within RAPTOR’s tree structure for two questions. The nodes that RAPTOR selects for each question are highlighted, while the leaf nodes that DPR selects for the same question are indicated with arrows. This comparison illustrates the advantage of RAPTOR’s tree structure. RAPTOR selects nodes from different layers depending on the level of granularity required by the question at hand. Further, the information that would be retrieved by DPR is more often than not included in the context retrieved by RAPTOR, either directly as a leaf node or indirectly as part of a summary from a higher layer.

”The first question we examine is “How does Cinderella find a happy ending?”, a multi-hop question best answered by synthesizing information from various text segments. To control for the language model’s potential familiarity with the Cinderella story, we instructed it to rely solely on the retrieved information for its answers. Table [<span class="ltx_text ltx_ref_tag">13</span>](#A8.T13 "Table 13 ‣ Appendix H NarrativeQA Evaluation Script ‣ RAPTOR: Recursive Abstractive Processing for Tree-Organized Retrieval") shows the text retrieved by both RAPTOR and DPR for this question. RAPTOR’s context succinctly describes Cinderella’s journey to happiness, while DPR’s leaf nodes primarily focus on her initial transformation. The difference in retrieved information significantly impacts downstream tasks. When GPT-4 is provided with RAPTOR’s context, it generates a detailed answer: “Cinderella finds a happy ending when the Prince searches for the owner of the lost glass slipper and discovers it belongs to Cinderella. They eventually marry, transforming Cinderella’s life for the better.” In contrast, using DPR’s context, GPT-4 states: “Based on the given context, it is not possible to determine how Cinderella finds a happy ending, as the text lacks information about the story’s conclusion.”

The second question we examine is “What is the central theme of the story?”, a thematic question that requires holistic understanding of the entire text. The text retrieved by RAPTOR and DPR for this question is shown in Table [<span class="ltx_text ltx_ref_tag">13</span>](#A8.T13 "Table 13 ‣ Appendix H NarrativeQA Evaluation Script ‣ RAPTOR: Recursive Abstractive Processing for Tree-Organized Retrieval"). The text retrieved by RAPTOR contains short descriptions of all the major parts of the story, whereas the text retrieved by DPR contains detailed descriptions of a narrow subset of the story. Again, the difference in retrieval mechanisms affects the performance of GPT-4 when answering the question. Given DPR’s context, it outputs “The central theme of the story is transformation and the power of inner beauty, as Cinderella, a kind and humble girl, is magically transformed into a beautiful princess, capturing the attention and admiration of the Prince and others at the ball.” This answer only takes into account the first portion of the story, up until Cinderella first meets the prince. In contrast, given RAPTOR’s context, GPT-4 outputs “The central theme of the story is transformation and overcoming adversity, as Cinderella, with the help of her Fairy Godmother, transforms from a mistreated and downtrodden girl into a beautiful and confident young woman who ultimately finds happiness and love with the Prince.” This is a more complete answer, demonstrating a comprehensive understanding of the story.

This qualitative analysis indicates that RAPTOR outperforms prior retrieval mechanisms because the information that it retrieves is more relevant and exhaustive, allowing for better performance on downstream tasks.

We also created a 2600-word story along with questions about its narrative and theme. An excerpt from the story is present below and the full PDF of this story is linked [here](https://raptor-appendix-g.tiiny.site). For questions like “What is the central theme of the story?”, an upper-level node is retrieved which includes the sentence: “This story is about the power of human connection… inspiring and uplifting each other as they pursued their passions.” This summary, not explicitly present in the original text, almost directly answers the question.

<span id="A7.p6.1.1" class="ltx_text ltx_font_bold">Excerpt from ”The Eager Writer”:</span>

> ”Ethan’s passion for writing had always been a part of him. As a child, he would often scribble stories and poems in his notebook, and as he grew older, his love for writing only intensified. His evenings were often spent in the dim light of his room, typing away at his laptop. He had recently taken a job as a content writer for an online marketing firm to pay the bills, but his heart still longed for the world of storytelling. However, like many aspiring writers, he struggled to find a foothold in the industry. He took a job as a content writer for an online marketing firm, but it was growing increasingly evident to him that this was not the path he wanted to pursue. It was during this time that he stumbled upon the Pathways app. The app offered a platform for people in similar professions to connect and share knowledge, and he saw it as an opportunity to finally connect with others who shared his passion for writing. Ethan saw an opportunity to meet others who shared his passion and could offer guidance and mentorship. He quickly signed up and was surprised by the number of writers he found on the platform, from well establish professionals to beginners just starting out in the business.”

## <span class="ltx_tag ltx_tag_appendix">Appendix H </span> NarrativeQA Evaluation Script

We made several modifications to AllenNLP’s evaluation script<span id="footnote3" class="ltx_note ltx_role_footnote"><sup class="ltx_note_mark">3</sup><span class="ltx_note_outer"><span class="ltx_note_content"><sup class="ltx_note_mark">3</sup><span class="ltx_tag ltx_tag_note">3</span><a href="2401.18059v1/docs.allennlp.org/models/main/models/rc/tools/narrativeqa/" title="" class="ltx_ref ltx_url ltx_font_typewriter">docs.allennlp.org/models/main/models/rc/tools/narrativeqa/</a></span></span></span> to better fit our evaluation needs:

*   <span class="ltx_tag ltx_tag_item">•</span>

    <span id="A8.I1.i1.p1.1.1" class="ltx_text ltx_font_bold">Added Smoothing:</span> Smoothing was incorporated to handle cases where BLEU score is zero, due to no n-gram matches occurring in the reference text. A BLEU score of zero skews the results, leading to an overly harsh evaluation for rare or novel phrases. By adding a smoothing function, we prevent the BLEU scores from dropping to zero, providing a more fair evaluation.

*   <span class="ltx_tag ltx_tag_item">•</span>

    <span id="A8.I1.i2.p1.1.1" class="ltx_text ltx_font_bold">Modified BLEU-4 Weighting:</span> The original script applied a weight of 1 to the highest order n-gram (4-gram) and 0 to the rest in its BLEU-4 calculation (i.e., weights=(0, 0, 0, 1)). This approach may overly focus on 4-gram matches while neglecting lower-order matches. To provide a more balanced evaluation, we evenly distributed the weight across all n-gram levels, changing the weights for the BLEU-4 calculation to (0.25, 0.25, 0.25, 0.25).

*   <span class="ltx_tag ltx_tag_item">•</span>

    <span id="A8.I1.i3.p1.1.1" class="ltx_text ltx_font_bold">Tokenization before Mapping in METEOR Calculation:</span> The original script utilized a simple split and map method for METEOR calculation. We fixed this by first tokenizing the text and then mapping the tokens. This amendment improves the accuracy of the METEOR calculation by taking into account the correct linguistic boundaries of words.

<span id="A8.T13.1.1.1.1.1" class="ltx_text ltx_font_bold">Question: What is the central theme of the story?</span>

<span id="A8.T13.1.2.1.1.1" class="ltx_text ltx_font_bold">RAPTOR</span>

<span id="A8.T13.1.2.1.2.1" class="ltx_inline-block ltx_align_top"><span id="A8.T13.1.2.1.2.1.1" class="ltx_p" style="width:313.0pt;">Fairy Godmother helps Cinderella attend a ball by transforming her rags… Cinderella impresses the Prince at the ball… she loses track of time and has to run home alone in the darkness. The Prince is unable to find Cinderella and goes in search of her … She forgave her sisters, and treated them always very kindly, and the Prince had great cause to be glad that he had found the glass slipper.</span></span>

<span id="A8.T13.1.3.2.1.1" class="ltx_text ltx_font_bold">DPR</span>

<span id="A8.T13.1.3.2.2.1" class="ltx_inline-block ltx_align_top"><span id="A8.T13.1.3.2.2.1.1" class="ltx_p" style="width:313.0pt;">Two mice were turned into footmen; four grasshoppers into white horses. Next, the Fairy touched Cinderella’s rags, and they became rich satin robes, trimmed with point lace. … Alas! the clock had struck Eleven. She found no coach, only a pumpkin, and the rat and mice ran quickly away when they saw her; while all her fine dress turned to rags, and she had to run home alone…They told her a beautiful Princess had been at the ball, with whom the Prince was delighted. They did not know it was Cinderella.</span></span>

<span id="A8.T13.1.4.3.1.1" class="ltx_text ltx_font_bold">Question: How does Cinderella find a happy ending?</span>

<span id="A8.T13.1.5.4.1.1" class="ltx_text ltx_font_bold">RAPTOR</span>

<span id="A8.T13.1.5.4.2.1" class="ltx_inline-block ltx_align_top"><span id="A8.T13.1.5.4.2.1.1" class="ltx_p" style="width:313.0pt;">The story of Cinderella involves her godmother, a fairy, who transforms a pumpkin into a grand coach with her wand and allows Cinderella to attend the ball. However, Cinderella must return home before the clock strikes eleven or her dress will turn back into rags… Cinderella impresses the Prince at the ball but leaves before he can find out who she is… The Prince searched for the owner of a lost glass slipper and found it belonged to Cinderella. She forgave her sisters and the Prince was glad to have found her.</span></span>

<span id="A8.T13.1.6.5.1.1" class="ltx_text ltx_font_bold">DPR</span>

<span id="A8.T13.1.6.5.2.1" class="ltx_inline-block ltx_align_top"><span id="A8.T13.1.6.5.2.1.1" class="ltx_p" style="width:313.0pt;">the clock had struck Eleven… The Prince was very much surprised when he missed Cinderella again, and leaving the ball, went in search of her… Fairy touched Cinderella’s rags, and they became rich satin robes, trimmed with point lace… Her old shoes became a charming pair of glass slippers, which shone like diamonds. “Now go to the ball, my love,” she said, “and enjoy yourself. But remember, you must leave the room before the clock strikes eleven. If you do not your dress will return to its original rags.”</span></span>

<span class="ltx_tag ltx_tag_table">Table 13: </span> Relevant excerpts from text retrieved by RAPTOR and DPR for the questions on the fairytale Cinderella.

## <span class="ltx_tag ltx_tag_appendix">Appendix I </span> Analysis of Different Layers on RAPTOR’s Performance

### <span class="ltx_tag ltx_tag_subsection">I.1 </span> How do different Layers impact performance ?

In this section, we present a detailed breakdown of RAPTOR’s retrieval performance when querying different layers of the hierarchical tree structure for various stories. These tables validate the utility of RAPTOR’s multi-layered structure for diverse query requirements.

![Refer to caption](2401.18059v1/images/RAPTOR_layer_ablation.png)

<span class="ltx_tag ltx_tag_figure">Figure 7: </span> Histogram showing the percentage of nodes retrieved from different layers of the RAPTOR tree across three datasets (NarrativeQA, Quality, and Qasper) using three retrievers (SBERT, BM25, and DPR). The data indicate that a substantial portion of the nodes contributing to the final retrieval comes from non-leaf layers, with a notable percentage from the first and second layers, highlighting the importance of RAPTOR’s hierarchical summarization in the retrieval process.

<span class="ltx_tag ltx_tag_table">Table 14: </span> Performance of RAPTOR when querying different layers of the tree for Story 2.

<span id="A9.T14.1.1.1.1.1" class="ltx_text ltx_font_bold">Layers Queried / Start Layer</span>

<span id="A9.T14.1.1.1.2.1" class="ltx_text ltx_font_bold">Layer 0 (Leaf Nodes)</span>

<span id="A9.T14.1.1.1.3.1" class="ltx_text ltx_font_bold">Layer 1</span>

<span id="A9.T14.1.1.1.4.1" class="ltx_text ltx_font_bold">Layer 2</span>

1 layer

58.8

47.1

41.1

2 layers

\-

<span id="A9.T14.1.3.2.3.1" class="ltx_text ltx_font_bold">64.7</span>

52.9

3 layers

\-

\-

47.1

<span class="ltx_tag ltx_tag_table">Table 15: </span> Performance of RAPTOR when querying different layers of the tree for Story 3.

<span id="A9.T15.1.1.1.1.1" class="ltx_text ltx_font_bold">Layers Queried / Start Layer</span>

<span id="A9.T15.1.1.1.2.1" class="ltx_text ltx_font_bold">Layer 0 (Leaf Nodes)</span>

<span id="A9.T15.1.1.1.3.1" class="ltx_text ltx_font_bold">Layer 1</span>

<span id="A9.T15.1.1.1.4.1" class="ltx_text ltx_font_bold">Layer 2</span>

1 layer

66.6

61.1

61.1

2 layers

\-

66.6

66.6

3 layers

\-

\-

<span id="A9.T15.1.4.3.4.1" class="ltx_text ltx_font_bold">83.3</span>

<span class="ltx_tag ltx_tag_table">Table 16: </span> Performance of RAPTOR when querying different layers of the tree for Story 4.

<span id="A9.T16.1.1.1.1.1" class="ltx_text ltx_font_bold">Layers Queried / Start Layer</span>

<span id="A9.T16.1.1.1.2.1" class="ltx_text ltx_font_bold">Layer 0 (Leaf Nodes)</span>

<span id="A9.T16.1.1.1.3.1" class="ltx_text ltx_font_bold">Layer 1</span>

1 layer

<span id="A9.T16.1.2.1.2.1" class="ltx_text ltx_font_bold">94.7</span>

84.2

2 layers

\-

89.4

<span class="ltx_tag ltx_tag_table">Table 17: </span> Performance of RAPTOR when querying different layers of the tree for Story 5.

<span id="A9.T17.1.1.1.1.1" class="ltx_text ltx_font_bold">Layers Queried / Start Layer</span>

<span id="A9.T17.1.1.1.2.1" class="ltx_text ltx_font_bold">Layer 0 (Leaf Nodes)</span>

<span id="A9.T17.1.1.1.3.1" class="ltx_text ltx_font_bold">Layer 1</span>

1 layer

57.9

47.3

2 layers

\-

<span id="A9.T17.1.3.2.3.1" class="ltx_text ltx_font_bold">68.4</span>

### <span class="ltx_tag ltx_tag_subsection">I.2 </span> Which Layers do Retrieved Nodes come from ?

We further conduct an ablation study across all three datasets and across three different retrievers with RAPTOR with the collapsed tree retrieval to examine the layers from which the retrieved nodes originate. We observe that between 18.5% to 57% of the retrieved nodes come from non-leaf nodes. As illustrated in Figure [<span class="ltx_text ltx_ref_tag">7</span>](#A9.F7 "Figure 7 ‣ I.1 How do different Layers impact performance ? ‣ Appendix I Analysis of Different Layers on RAPTOR’s Performance ‣ RAPTOR: Recursive Abstractive Processing for Tree-Organized Retrieval"), the retrieval pattern across layers reveals the importance of RAPTOR’s multi-layered tree structure. Notably, a significant percentage of the nodes retrieved by RAPTOR using the DPR retriever for the NarrativeQA dataset come from the first and second layers of the tree, as opposed to the leaf nodes. This pattern is consistent across the other datasets and retrievers, albeit with varying percentages.

<span class="ltx_tag ltx_tag_table">Table 18: </span> Percentage of nodes from non-leaf nodes across different datasets and retrievers

<span id="A9.T18.1.1.1.1.1" class="ltx_text ltx_font_bold">Dataset</span>

<span id="A9.T18.1.1.1.2.1" class="ltx_text ltx_font_bold">DPR</span>

<span id="A9.T18.1.1.1.3.1" class="ltx_text ltx_font_bold">SBERT</span>

<span id="A9.T18.1.1.1.4.1" class="ltx_text ltx_font_bold">BM25</span>

NarrativeQA

57.36%

36.78%

34.96%

Quality

32.28%

24.41%

32.36%

Qasper

22.93%

18.49%

22.76%

<span class="ltx_tag ltx_tag_table">Table 19: </span> Percentage of nodes from different layers with DPR as the retriever

<span id="A9.T19.1.1.1.1.1" class="ltx_text ltx_font_bold">Layer</span>

<span id="A9.T19.1.1.1.2.1" class="ltx_text ltx_font_bold">NarrativeQA</span>

<span id="A9.T19.1.1.1.3.1" class="ltx_text ltx_font_bold">Quality</span>

<span id="A9.T19.1.1.1.4.1" class="ltx_text ltx_font_bold">Qasper</span>

0

42.64%

67.71%

77.07%

1

45.00%

29.43%

21.88%

2

10.57%

2.85%

1.05%

3

1.78%

\-

\-

4

0.003%

\-

\-

<span class="ltx_tag ltx_tag_table">Table 20: </span> Percentage of nodes from different layers with SBERT as the retriever

<span id="A9.T20.1.1.1.1.1" class="ltx_text ltx_font_bold">Layer</span>

<span id="A9.T20.1.1.1.2.1" class="ltx_text ltx_font_bold">NarrativeQA</span>

<span id="A9.T20.1.1.1.3.1" class="ltx_text ltx_font_bold">Quality</span>

<span id="A9.T20.1.1.1.4.1" class="ltx_text ltx_font_bold">Qasper</span>

0

63.22%

75.59%

81.51%

1

31.51%

22.78%

17.84%

2

4.85%

1.63%

0.65%

3

0.42%

\-

\-

<span class="ltx_tag ltx_tag_table">Table 21: </span> Percentage of nodes from different layers with BM25 as the retriever

<span id="A9.T21.1.1.1.1.1" class="ltx_text ltx_font_bold">Layer</span>

<span id="A9.T21.1.1.1.2.1" class="ltx_text ltx_font_bold">NarrativeQA</span>

<span id="A9.T21.1.1.1.3.1" class="ltx_text ltx_font_bold">Quality</span>

<span id="A9.T21.1.1.1.4.1" class="ltx_text ltx_font_bold">Qasper</span>

0

65.04%

67.64%

77.24%

1

28.79%

28.85%

21.57%

2

5.36%

3.51%

1.19%

3

0.81%

\-

\-

BETA

[](javascript:toggleReadingMode\(\); "Disable reading mode, show header and footer")