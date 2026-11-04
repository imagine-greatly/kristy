url: https://www.frontiersin.org/journals/public-health/articles/10.3389/fpubh.2025.1575136/full
fetched: 2026-11-04 01:39 UTC
type: article
tool: agent-reach read (jina backend)
title: Applying the Nova food classification to food product databases using discriminative ingredients: a methodological proposal

---

## Abstract

**Background:**

Growing interest in the Nova food classification system surged among various stakeholders, driven primarily by compelling evidence linking the consumption of ultra-processed foods (UPFs) to negative health outcomes. This growing interest underscores the potential value of identifying clear markers to classify UPFs, particularly to support research and regulatory efforts.

**Objective:**

To propose replicable methods to identify UPFs, by testing the sensitivity and specificity of these methods using a large sample of packaged foods from the 2017 Brazilian Food Labels Database.

**Methods:**

We created five scenarios to identify UPFs using substances of rare culinary use and food additives typically found in UPFs and compared them with the Nova food classification process based on the product name and food categories, considered the classic method to identify UPFs. We estimated the proportion of foods and beverages identified as UPFs using the different scenarios based on the presence of discriminative ingredients. We used a diagnostic test and a receiver operating characteristic (ROC) to understand which of the five scenarios performed better compared to the classic method to identify UPFs. Finally, we conducted a sensitivity analysis to test the role of vitamins and minerals in identifying UPFs.

**Results:**

We found variations in UPFs prevalence from 47 to 72% across the five scenarios, compared to 70% using the classic method to identify UPFs in Brazilian packaged foods. The scenario using food additives of a sole cosmetic function and substances of rare culinary use (scenario 3) identified a 65% UPF, while maintaining reasonable sensitivity and specificity, and the best-performing ROC curve. There was no significant difference in identifying UPFs when comparing the addition of vitamins and minerals to the food additives with sole cosmetic function.

**Conclusion:**

This study shows that using ingredient-based criteria, specifically cosmetic additives and substances of rare culinary use, can reliably identify UPFs, offering reproducibility, and supporting its use in research and policy applications.

## 1 Introduction

Over the past two decades, the Nova food classification system has transformed dietary assessment research by shifting the focus from nutrient-based analyses to consideration of the extent and purpose of industrial processing of foods and beverages (1). This system classifies foods into 4 major groups: unprocessed and minimally processed foods, processed culinary ingredients, processed foods, and ultra-processed foods (UPFs). The latter are defined as industrial formulations, typically made of food components that have been either modified or recombined, with little or no whole foods, as well as industrial substances and food additives aimed at increasing durability and enhancing or modifying sensory characteristics such as color, taste, odor and texture of foods (2).

Over the years, the Nova food classification has proved associated higher consumption of UPFs with adverse health outcomes, including weight gain (3), type 2 diabetes (4), cardiometabolic diseases (5), cerebrovascular disease (5), cancer (6), premature deaths (7), and all-cause mortality (5). The Nova food classification has proven valuable for monitoring dietary patterns in predicting the nutritional quality of diets and in identifying the increasing consumption of UPFs over time in diverse populations around the world (8–12) and has been widely used. The Nova food classification has been applied to observational studies (13, 14), cohort studies (15–17), and randomized trials (18) to assess the link between UPFs consumption and health outcomes.

However, despite the widespread adoption of Nova, its implementation in both research and policy remains largely reliant on product names, descriptions, or broad food categories rather than on objective, reproducible criteria grounded in product characteristics. While many governments, international agencies and academic groups have been implementing or proposing policies such as mandatory front-of-pack nutrition labeling regulations, marketing restrictions, and taxation policies that can consider the level of processing (19–21), there is growing interest in developing a more standardized and replicable approach.

The Nova food classification system itself describes two ingredient groups that are exclusively found in UPFs: substances of rare culinary use (e.g., hydrolyzed proteins, interesterified oils, and protein isolates) and food additives with cosmetic function (e.g., non-sugar sweeteners, flavor enhancers, colors, emulsifiers, thickeners, and anti-foaming agents). Still, only a limited number of studies have explored the utility of these markers for developing ingredient-level methods to identify UPFs (22, 23). As emphasized by Popkin et al. (22), there is an urgent need for more robust criteria grounded in ingredient-level markers to distinguish UPFs, what would enhance classification precision, support regulatory decision-making, and ultimately contribute to the development of more effective public health policies.

This study addresses this gap by evaluating the performance of different methods for identifying UPFs, combining the use of substances of rare culinary use and food additives with cosmetics function in a large database of products sold in Brazil.

## 2 Materials and methods

### 2.1 Data source

In this cross-sectional study, we used data from the 2017 Brazilian Food Labels Database (24). This database is among the most comprehensive resources with detailed information on the food composition of packaged foods sold in Brazil, with primary data collection (24). It includes the food products sold by the top five food retailers in Brazil, which collectively hold 69.7% of the national grocery retail market share (25). More detailed information on how the data were collected is available elsewhere (24). The database has been used in other nutrition-related studies (26, 27).

The 2017 Brazilian Food Labels Database contains 11,434 foods and beverages. Because we wanted to use the list of ingredients to classify foods and beverages according to the Nova food classification, foods and beverages that did not provide the list of ingredients (_n_ = 1,574) on their package were excluded, totaling 9,860 unique products. It is important to note that in the Brazilian legislation, products that contain only one ingredient are exempted to show the list of ingredients on the package, i.e., in this case, the products that were excluded were fresh (e.g., rice beans, fresh fruits and vegetables) or culinary ingredient with only one ingredient (e.g., sugar, salt, oil) (28).

### 2.2 Scenarios to identify ultra-processed foods

For the purpose of the study, we created five scenarios to identify UPFs, according to the latest Nova food classification published in 2019, based mainly on the presence of food substances never or rarely used in kitchens, and food additives. Although excessive amounts of added sugar, fat, and sodium are often present in UPFs, the study focused on the presence of ingredients that are exclusive to UPFs, namely, food substances not commonly used in culinary preparations and cosmetic additives, as they represent the core criteria used to distinguish UPFs from other food groups in the Nova classification.

The food substances never or rarely used in kitchens (hereafter referred to as substances of rare culinary use, i.e., any material that is produced as a secondary result during the manufacturing or production process of food items), including high-fructose corn syrup, hydrogenated or interesterified oils, and hydrolyzed proteins (2). We also included added sugars, carbohydrates, modified oils, protein and fiber sources based on the definitions proposed by Zancheta et al. (2) ([Supplementary Table 3](https://www.frontiersin.org/journals/public-health/articles/10.3389/fpubh.2025.1575136/full#SM1)).

To identify and classify food additives we used the information available in the 2023 Codex Alimentarius (29). The names of food additives were translated from English to Portuguese according to the National Health Surveillance Agency (ANVISA) standards, to align with the database language (30). Because food additives can have more than one function, we identified and distinguished food additives with sole a cosmetic function from food additives that could also have other functions. We excluded vitamins and minerals that can be used as food coloring from the search but used them in exploratory analysis to be described ([Supplementary Table 5](https://www.frontiersin.org/journals/public-health/articles/10.3389/fpubh.2025.1575136/full#SM1)).

In agreement with the latest proposed definition of UPFs (1), we considered food additives with cosmetic functions the following: flavors, flavor enhancers, food colorings, emulsifiers, emulsifying salts, sweeteners, thickeners, and anti-foaming, bulking, carbonating, foaming, gelling and glazing agents ([Supplementary Table 1](https://www.frontiersin.org/journals/public-health/articles/10.3389/fpubh.2025.1575136/full#SM1)). Besides looking for food additives that serve a cosmetic function in the list of ingredients, we also checked for non-technical terms for flavorings, such as ‘natural flavoring,’ as referenced in Brazilian legislation (RDC No. 2) ([Supplementary Table 2](https://www.frontiersin.org/journals/public-health/articles/10.3389/fpubh.2025.1575136/full#SM1)). According to this regulation, it is not required to list each specific substance that makes up the flavorings on the ingredient list. Instead, the label can use general terms such as ‘natural flavorings’. The five proposed scenarios, detailed in [Table 1](https://www.frontiersin.org/journals/public-health/articles/10.3389/fpubh.2025.1575136/full#tab1), are described below:

Table 1

| Scenario | Key criterion |
| --- | --- |
| Scenario 1 | Food substances of rare culinary use |
| Scenario 2 | Food additives with sole cosmetic function |
| Scenario 3 | Substances of rare culinary use and/or food additives with sole cosmetic function |
| Scenario 4 | Food additive that can serve as an additive of cosmetic function |
| Scenario 5 | Food substances of rare culinary use and/or food additive that can serve as an additive of cosmetic function |
| Classic method | Food names and categories |

Scenarios for ultra-processed food classification.

#### 2.2.1 Scenario 1: presence of at least one substance of rare culinary use

This scenario identifies UPFs based solely on the presence of substances of rare culinary use. Scenario 1 was included as a first analytical step to explore the potential of these substances as early markers of UPFs. This approach allows us to examine how individual ingredient groups contribute to UPF classification when applied progressively.

#### 2.2.2 Scenario 2: presence of at least one food additive with sole cosmetic function

Scenario 2 identifies UPFs based solely on the presence of food additives with cosmetic function. Recent studies, such as Zancheta et al. (31), underscore their significance as markers of ultra-processing, aligning with the Nova classification’s emphasis on the purpose of processing (2). This scenario is particularly relevant for policy initiatives, such as front-of-pack labeling, that aim to regulate products based on sensory-enhancing additives.

#### 2.2.3 Scenario 3: presence of at least one substance of rare culinary use and/or a food additive with sole cosmetic function

Scenario 3 identifies UPFs based on the presence of substances of rare culinary use and/or a food additive with sole cosmetic additive, recognizing their complementary roles in the industrial processing of UPFs. The rationale for this scenario is grounded on the definition provided by the developers of the Nova food classification for identifying UPFs through the evaluation of ingredient combinations. This approach considers both the nature of the ingredients, which are rarely used in culinary practices, and the intended purpose of food additives, which is to modify the sensory characteristics of food products, standardizing the ultra-processing construct (2).

#### 2.2.4 Scenario 4: presence of at least one food additive that can serve as an additive with cosmetic function

Scenario 4 explores the multifunctional roles of food additives, acknowledging that many additives, while officially claimed to serve one purpose, may also fulfill other functions that align with ultra-processing characteristics. For instance, food additives listed as preservatives may simultaneously enhance sensory attributes like texture or color, complicating their classification as UPF markers (2, 31). For example, sodium nitrite, sulfur dioxide, and sodium benzoate, in addition to their preservative roles, can also affect color, appearance, or flavor (29). This scenario broadens the scope to include these multifunctional food additives, aiming to assess whether their inclusion impacts the identification of UPFs compared to more narrowly defined criteria.

#### 2.2.5 Scenario 5: presence of at least one substance of rare culinary use and/or a food additive that can serve as an additive of cosmetic function

Scenario 5 adopts the most inclusive approach, combining all potential indicators of ultra-processing, including food substances of rare culinary use and/or food additive that can serve as an additive of cosmetic function.

### 2.3 Classic method: identification of ultra-processed foods using the food description

The classic method for identifying UPFs relies on food names and categories to classify products. This approach is widely used in dietary intake studies, such as studies using the Brazil’s Household Budget Survey (POF) and international surveys like NHANES (9, 32). While it enables population-level consumption assessment, it may not reflect specific product characteristics such as the presence of cosmetic additives or substances of rare culinary use. In this study, the classic method is used as a ‘gold standard’ to evaluate the performance of alternative scenarios based on ingredient composition.

All the discriminative ingredient terms used to identify food substances of rare culinary use and food additives in the five proposed scenarios are available in [Supplementary Table 4](https://www.frontiersin.org/journals/public-health/articles/10.3389/fpubh.2025.1575136/full#SM1).

### 2.4 Statistical analysis

We estimated the prevalence of UPFs in the Brazilian Food Labels Database using the five proposed scenarios and the classic method to identify UPFs, overall and by food category (31). Subsequently, we conducted diagnostic tests to assess the sensitivity, specificity, positive predictive value, and negative predictive value for each scenario in comparison with the classic method to identify UPFs. Then, we developed the receiver operating characteristic (ROC) curve to evaluate the performance of the scenarios. The ROC curve is a graphical representation of a binary classifier’s performance, plotted by sensitivity (true positive rate) against 1 – specificity (false positive rate). Its effectiveness is primarily gauged by the Area Under the Curve (AUC), with values closer to 1 indicating better performance. A superior model’s ROC curve approaches the top-left corner, reflecting a high sensitivity without a significant increase in false positives. The curve’s initial steepness and its concave shape towards the top-left are also signs of a robust classifier, indicating an effective balance between sensitivity and specificity. In essence, the closer and more bowed the curve towards the top-left, the better the model is at distinguishing between the two classes.

Finally, in the sensitivity analysis, we assessed the proportion of UPFs identified, including vitamins and minerals, in scenarios 2 and 3. We compared these proportions among the scenarios using a proportion test and repeated the diagnostic test (sensitivity, specificity, positive predictive value, and negative predictive value).

Analyses were performed with Stata/MP 16.1, College Station, TX: StataCorp LLC.

## 3 Results

The prevalence of UPFs in the Brazilian food supply across the five scenarios ranged from 47.1% (95% confidence interval, CI: 46.1–48.1) in scenario 1 to 71.7% (95% CI: 70.8–72.6) in scenario 5, compared with 70.5% (95% CI: 69.6–71.3) using the classic method to identify UPFs ([Figure 1](https://www.frontiersin.org/journals/public-health/articles/10.3389/fpubh.2025.1575136/full#fig1)).

Figure 1

[Table 2](https://www.frontiersin.org/journals/public-health/articles/10.3389/fpubh.2025.1575136/full#tab2) shows that some food categories show consistently low prevalence of UPFs across all the scenarios. Canned vegetables (e.g., canned corn with salt and sugar, canned peas in brine) have a prevalence of 2.3% in Scenario 1, increasing to 13.9% in Scenario 5, with none of the products classified as UPFs under the classic method. Packaged fruits and vegetables (e.g., pre-cut pineapple with preservative, vacuum-packed cooked beets) show no or low (1.3%) prevalence of UPFs across all scenarios. Nuts and seeds (e.g., cashews, sunflower seeds) have 11.1 and 16.7% of products classified as UPFs under both Scenario 1 and Scenario 5, respectively, and 11% under the classic method ([Table 2](https://www.frontiersin.org/journals/public-health/articles/10.3389/fpubh.2025.1575136/full#tab2)).

Table 2

| Food category | Total | Ultra-processed food identification |
| --- | --- | --- |
| Scenario 1 | Scenario 2 | Scenario 3 | Scenario 4 | Scenario 5 | Classic method |
| _n_ | % | _n_ | % | _n_ | % | _n_ | % | _n_ | % | _n_ | % |
| Breakfast cereals and granola bars | 308 | 233 | 75.6 | 230 | 74.7 | 270 | 87.7 | 285 | 92.5 | 294 | 95.5 | 308 | 100.0 |
| Bakery products | 594 | 431 | 72.6 | 304 | 51.2 | 486 | 81.8 | 451 | 75.9 | 509 | 85.7 | 594 | 100.0 |
| Convenience foods | 795 | 390 | 49.1 | 447 | 56.2 | 549 | 69.1 | 514 | 64.7 | 586 | 73.7 | 795 | 100.0 |
| Unsweetened dairy products | 174 | 6 | 3.4 | 0 | 0.0 | 6 | 3.4 | 49 | 28.2 | 50 | 28.7 | 2 | 1.1 |
| Sweetened dairy products | 483 | 459 | 95.0 | 432 | 89.4 | 476 | 98.6 | 465 | 96.3 | 476 | 98.6 | 483 | 100.0 |
| Salty snacks | 356 | 140 | 39.3 | 239 | 67.1 | 257 | 72.2 | 261 | 73.3 | 272 | 76.4 | 346 | 97.2 |
| Cookies | 747 | 524 | 70.1 | 589 | 78.8 | 660 | 88.4 | 665 | 89.0 | 682 | 91.3 | 747 | 100.0 |
| Canned vegetables | 345 | 8 | 2.3 | 25 | 7.2 | 29 | 8.4 | 44 | 12.8 | 48 | 13.9 | 0 | 0.0 |
| Oils and fats | 294 | 23 | 7.8 | 68 | 23.1 | 73 | 24.8 | 100 | 34.0 | 103 | 35.0 | 46 | 15.6 |
| Sauces and dressings | 791 | 286 | 36.2 | 427 | 54.0 | 489 | 61.8 | 500 | 63.2 | 542 | 68.5 | 751 | 94.9 |
| Coffee and tea | 68 | 0 | 0.0 | 30 | 44.1 | 30 | 44.1 | 30 | 44.1 | 30 | 44.1 | 5 | 7.4 |
| Candies and desserts | 1,218 | 960 | 78.8 | 998 | 81.9 | 1,144 | 93.9 | 1,108 | 91.0 | 1,167 | 95.8 | 1,210 | 99.3 |
| Cereals, beans, other grain products | 463 | 25 | 5.4 | 73 | 15.8 | 91 | 19.7 | 108 | 23.3 | 119 | 25.7 | 62 | 13.4 |
| Packaged fruits and vegetables | 299 | 0 | 0.0 | 4 | 1.3 | 4 | 1.3 | 4 | 1.3 | 4 | 1.3 | 0 | 0.0 |
| Meat, poultry, seafood, and egg | 49 | 0 | 0.0 | 0 | 0.0 | 0 | 0.0 | 3 | 6.1 | 3 | 6.1 | 0 | 0.0 |
| Sugar and other non-caloric sweeteners | 66 | 14 | 21.2 | 37 | 56.1 | 41 | 62.1 | 42 | 63.6 | 42 | 63.6 | 44 | 66.7 |
| Processed meats | 810 | 381 | 47.0 | 530 | 65.4 | 572 | 70.6 | 577 | 71.2 | 594 | 73.3 | 617 | 76.2 |
| Juices | 144 | 41 | 28.5 | 34 | 23.6 | 55 | 38.2 | 36 | 25.0 | 55 | 38.2 | 46 | 31.9 |
| Nectars | 160 | 92 | 57.5 | 131 | 81.9 | 137 | 85.6 | 140 | 87.5 | 143 | 89.4 | 160 | 100.0 |
| Fruit-flavored drinks | 220 | 138 | 62.7 | 214 | 97.3 | 216 | 98.2 | 217 | 98.6 | 218 | 99.1 | 220 | 100.0 |
| Sodas | 106 | 26 | 24.5 | 104 | 98.1 | 104 | 98.1 | 105 | 99.1 | 105 | 99.1 | 106 | 100.0 |
| Other beverages | 286 | 141 | 49.3 | 219 | 76.6 | 238 | 83.2 | 249 | 87.1 | 259 | 90.6 | 269 | 94.1 |
| Nuts and seeds | 72 | 8 | 11.1 | 8 | 11.1 | 12 | 16.7 | 8 | 11.1 | 12 | 16.7 | 8 | 11.1 |
| Cheeses | 607 | 109 | 18.0 | 174 | 28.7 | 241 | 39.7 | 500 | 82.4 | 509 | 83.9 | 126 | 20.8 |
| Fruit preserve | 405 | 208 | 51.4 | 104 | 25.7 | 231 | 57.0 | 214 | 52.8 | 248 | 61.2 | 1 | 0.2 |

Prevalence of ultra-processed foods (UPFs) by scenarios of UPFs identification by food category.

Brazilian Food Labels Database, 2017.

*Scenario 1: Presence of at least one substances of rare culinary use; Scenario 2: Presence of at least one food additive with sole cosmetic function; Scenario 3: Presence of at least one substances of rare culinary use and/or a food additive with sole cosmetic function; Scenario 4: Presence of at least one food additive that can serve as an additive with cosmetic function; Scenario 5: Presence of at least one substances of rare culinary use or a food additive that can serve as an additive of cosmetic function; Classic method to identify UPF: Frequently used method to identify UPFs by food names and food categories.

Some food categories exhibit a prevalence of UPFs greater than 60% across all methods. Breakfast cereals and granola bars (e.g., strawberry yogurt-flavored cereal bars) have a prevalence of 75.6% in Scenario 1, rising to 95.5% in Scenario 5, and reaching 100% in the classic method. Sweetened dairy products (e.g., fermented dairy drink; flavored Greek yogurt; yogurt with fruit preparation) show an UPFs prevalence of 95.0% in Scenario 1, 98.6% in Scenario 5, and 100% in the classic method. Fruit-flavored drinks (e.g., concentrated orange juice; pineapple-flavored drink powder; liquid fruit-flavored drink concentrate) are classified as UPFs in 62.7% of products under Scenario 1, rising to 99.1% in Scenario 5, and 100% in the classic method ([Table 2](https://www.frontiersin.org/journals/public-health/articles/10.3389/fpubh.2025.1575136/full#tab2)).

Other food category that has low variability across scenarios include juices with 28.5% UPFs prevalence in Scenario 1, 38.2% in Scenario 5, and 31.9% under the classic method. In contrast, some food categories show higher variability in the prevalence of UPFs between Scenario 1, Scenario 5, and the classic method. For instance, unsweetened dairy products (e.g., skim yogurt; instant whole milk powder) are classified as UPFs in 3.4% of cases under Scenario 1, increases to 28.7% in Scenario 5, while the classic method classifies 1.1% as UPF. Similarly, cheeses (e.g., mozzarella cheese; cream cheese spread) show variability, with 18.0% classified as UPFs in Scenario 1, rising to 83.9% in Scenario 5, and 20.8% under the classic method. Convenience foods (e.g., frozen pizza, instant noodles) show an increase trend across scenarios, with 49.1% classified as UPFs in Scenario 1, 73.7% in Scenario 5, and 100% in the classic method, like salty snacks, with 39.3% classified as UPFs in Scenario 1, 76.4% in Scenario 5, and nearly all (97.2%) under the classic method. Then, fruit preserves (e.g., strawberry jam, guava paste) show different values, with 51.4% classified as UPFs in Scenario 1, rising to 61.2% in Scenario 5, but dropping to just 0.2% in the classic method, as well as coffee and tea (e.g., coffee beans or instant coffee, dried herbs for tea), not identified as UPF in Scenario 1, with a prevalence 44.1% being considered UPF in Scenario 5 and 7.4% in the classic method ([Table 2](https://www.frontiersin.org/journals/public-health/articles/10.3389/fpubh.2025.1575136/full#tab2)).

Using a diagnostic test to compare the five scenarios of UPFs identification with the classic method to identify UPFs, we found increased sensitivity from scenario 1 (61.8%) to scenario 5 (86.9%), and decreased specificity (from 87.9% in scenario 1 to 64.5% in scenario 5) ([Table 3](https://www.frontiersin.org/journals/public-health/articles/10.3389/fpubh.2025.1575136/full#tab3)).

Table 3

| Statistical metrics | Scenario 1 | Scenario 2 | Scenario 3 | Scenario 4 | Scenario 5 |
| --- | --- | --- | --- | --- | --- |
| Sensitivity | 61.8% | 71.3% | 82.6% | 82.3% | 86.9% |
| Specificity | 87.9% | 83.9% | 76.8% | 67.2% | 64.5% |
| Positive predictive value | 92.4% | 91.3% | 89.4% | 85.7% | 85.4% |
| Negative predictive value | 49.1% | 55.1% | 64.9% | 61.5% | 67.4% |

Diagnostic tests comparing the identification of ultra-processed foods (UPFs) using the five scenarios and Classic method.

Brazilian Food Labels Database, 2017.

*Scenario 1: Presence of at least one substances of rare culinary use; Scenario 2: Presence of at least one food additive with sole cosmetic function; Scenario 3: Presence of at least one substances of rare culinary use and/or a food additive with sole cosmetic function; Scenario 4: Presence of at least one food additive that can serve as an additive with cosmetic function; Scenario 5: Presence of at least one substances of rare culinary use and/or a food additive that can serve as an additive of cosmetic function; Classic method to identify UPFs: Frequently used method to identify UPFs by food names and food categories.

The area under the curve (AUC) for scenarios 1, 2, 3, 4, and 5 was 0.748, 0.776, 0.797, 0.748, and 0.757, respectively. Scenario 3, that captured 65% of the products as UPFs (95% CI: 64.1–66.0), had the highest AUC, indicating better performance compared to the classic method used to identify UPFs ([Figure 2](https://www.frontiersin.org/journals/public-health/articles/10.3389/fpubh.2025.1575136/full#fig2)).

Figure 2

In the sensitivity analysis, the addition of vitamins and minerals that can serve as food additives with a cosmetic function showed no statistical differences compared with the analogous scenarios for which they were not included (scenarios 2 and 3) ([Supplementary Table 6](https://www.frontiersin.org/journals/public-health/articles/10.3389/fpubh.2025.1575136/full#SM1)).

## 4 Discussion

In this study, we found that the choice of food classification method can significantly influence the estimated prevalence of UPFs in the Brazilian food supply. Across five different scenarios using UPF markers, the prevalence rates varied by approximately 25 percentage points compared to a 70% prevalence observed with the widely used classic method, which relies on food names and categories. Among the tested approaches, Scenario 3, which incorporates the presence of either substances of rare culinary use or food additives with sole cosmetic functions, stood out for effectively identifying a high proportion of UPFs. This scenario also demonstrated satisfactory classification performance when evaluated against the ROC curve, aligning closely with the results of the classic method.

The scenario based solely on the presence of substances of rare culinary use ensures high specificity by focusing on a well-defined characteristic of UPFs. However, it underestimates UPF prevalence by excluding other critical markers, such as food additives. Other studies in Brazil and in the U. S. (22, 23, 31) emphasize the importance of food additives as markers of ultra-processing, aligning with the Nova classification’s emphasis on the purpose of processing. Scenario 3 addresses this limitation by identifying UPFs based on the presence of substances of rare culinary use and/or food additives with solely cosmetic functions, recognizing their complementary roles in industrial processing. This approach balances specificity and sensibility, aligning more closely with the classic method for UPF identification.

An illustrative example of the strengths of Scenario 3 can be seen in its application to dairy products. In a study conducted in Chile by Zancheta et al. (31), approximately 30% of dairy products were classified as UPFs when all potential cosmetic additives, regardless of their sole cosmetic function, were included. In contrast, Scenario 3 in the current study, which focused only on food additives with sole cosmetic functions, showed a proportion of 3%.

Complementing these findings, Zancheta et al. (31) applied three scenarios to assess how different UPF classification methods influenced health outcomes: (i) classic Nova approach based on food names and categories; (ii) ingredient-based approach including all additives with potential cosmetic functions; and (iii) approach including only additives with solely cosmetic functions. The findings showed that the prevalence of UPFs and their associations with health outcomes, particularly measures of adiposity such as BMI and waist circumference, varied depending on the scenario used. For example, stronger associations with adiposity indicators were observed when broader additive criteria (i.e., including all potential cosmetic additives) were used (31).

The comparison between scenarios could aid future studies employing the Nova classification and assist in shaping public policies that need to distinguish UPFs from other foods and beverages. In view of the urgency of having standardized and replicable methods to identify UPFs, other studies have used the list of ingredients with this purpose, especially to assess UPFs consumption (31), and more recently to identify the presence of nutrients of public health concern in the food supply (22, 23). The reliance on discriminatory ingredients, such as a combination of substances of rare culinary use and/or food additives, introduces a level of detail and complexity in the classification process that adds to the literature on how to best operationalize the UPFs construct to be used in policies that require no or very low uncertainty in the definition of UPFs. The fact that Scenario 3 aligned more closely with the classic method to identify UPFs suggests that this scenario may provide more accurate UPFs estimates.

Although the list of ingredients does not provide information about the food matrix, using discriminatory ingredients that correspond to substances of rare culinary use and food additives with the function of altering the food or beverage’s physical characteristic allows for a more systematized method to identify UPFs (2), and can help evaluators to reach a consensus on the identification of these foods (33).

The findings showed that certain categories are more likely to consist solely of UPFs, like breakfast cereals and granola, sweetened dairy products, and fruit-flavored drinks. A different study using this same Brazilian food and beverage database found that 100% of sweet cookies, savory biscuits, margarine, cakes, sweet pies, chocolate, dairy beverages, and ice cream contained at least one cosmetic additive or exceeded recommended levels of critical nutrients like sugars, salt, oils, and fats. These results collectively emphasize the ubiquity of ultra-processing markers, such as cosmetic additives or excessive nutrients, in certain product groups (23). For other food categories, such as coffee and tea, and fruit preserve, there were discrepancies between scenarios. They could be considered fresh or minimally processed/processed by name and food group, but they may contain markers of ultra-processing in the list of ingredients, such as food additives with cosmetic function.

Regarding the trade-off between sensitivity and specificity in the diagnostic test comparing all the five scenarios with the classic method to identify UPFs, while an increase in sensitivity from scenario 1 to scenario 5 is promising in accurately identifying true positive cases (decreasing the false negative UPFs), there is an expected decrease in specificity, due to increasing false positive UPFs. We highlight that even with a more conservative approach to identify UPFs, scenario 3 demonstrated a sensitivity of 82.6% and a specificity of 76.8%. This means that using the criteria of at least one food additive with sole cosmetic function, or a substance of rare culinary use to identify UPFs, resulted in high sensitivity, while maintaining an acceptable level of specificity.

Finally, sensitivity analysis further tested the inclusion of vitamins and minerals, which can serve dual purposes, such as fortification or cosmetic enhancement, with the label not clearly indicating whether the primary intent is fortification or cosmetic function. The analysis revealed no significant differences in UPF classification when these components were added to scenarios 2 and 3, suggesting that these multifunctional additives do not substantially influence the identification process.

The present study is not free of limitations that should be considered in the interpretation of the findings. First, we used the information declared in the food package to identify markers of UPFs. The use of the list of ingredients poses some difficulties. For instance, functional classes of food additives are not always displayed, and many additives may have more than one function (34). To address this, we proposed different scenarios, including those that identify food additives with a sole cosmetic function. The presence of compound ingredients (such as chocolate, cookies, cheese, etc.) also represents a challenge and potentially leads to an underestimation of the presence of both food substances and cosmetic additives in food products. Another limitation is the use of 2017 food label data; however, as the study focused on testing methods for identifying UPFs, the dataset remains suitable despite possible product changes over time. Finally, while local food regulations and labeling practices should be considered when applying the scenarios in other contexts, some markers of ultra-processing, such as ingredients of rare culinary use, are widely recognized across countries (23). Additionally, we used food additives listed in the Codex Alimentarius (29), an internationally recognized standard that is updated annually, and these updates should be taken into account when applying or adapting the approach.

This study’s key strengths include the use of a large and representative database (2017 Brazilian Food Labels Database), which provides detailed ingredient information for nearly 10,000 food products. The study employs an extensive list of substances and food additives from the Codex Alimentarius, enabling a detailed and systematic classification of UPFs. By proposing five distinct scenarios, the study evaluates different methods for UPFs identification. The study offers a standardized and replicable methodology that has practical implications for research and public health policies targeting UPFs. Furthermore, considering that the UPF classification is a technical and socially constructed concept (2), this work contributes to advancing methodological clarity while also creating space for further discussions, to explore how such classifications are interpreted and applied by different stakeholders.

In conclusion, the results showed that the use of substances of rare culinary along with food additives with sole cosmetic function is a potentially replicable method to identify UPFs. This approach can helps different stakeholders, such as researchers, advocates, and regulatory measures to inform the designing of policies that require precise definitions of UPFs. It also emphasizes the importance of considering the diverse nature of food categories, as certain products may require tailored criteria for accurate classification according to the Nova food system.

## Statements

### Data availability statement

The original contributions presented in the study are included in the article/[Supplementary material](https://www.frontiersin.org/journals/public-health/articles/10.3389/fpubh.2025.1575136/full#SM1), further inquiries can be directed to the corresponding author.

### Author contributions

MG: Conceptualization, Data curation, Formal analysis, Investigation, Methodology, Software, Visualization, Writing – original draft. BN: Conceptualization, Data curation, Formal analysis, Investigation, Methodology, Software, Visualization, Writing – original draft. AD: Conceptualization, Supervision, Visualization, Writing – review & editing. CZ: Formal analysis, Methodology, Writing – review & editing. LB: Methodology, Writing – review & editing. EM: Conceptualization, Methodology, Writing – review & editing. CB: Conceptualization, Methodology, Supervision, Writing – review & editing.

### Funding

The author(s) declare that financial support was received for the research and/or publication of this article. This research was funded by Bloomberg Philanthropies through a sub award agreement between the University of North Carolina at Chapel Hill and the Medicine Faculty Foundation (FFM), grant number 5104695. The funder has no role in the study design, data collection and analysis, decision to publish, or preparation of the manuscript.

### Conflict of interest

The authors declare that the research was conducted in the absence of any commercial or financial relationships that could be construed as a potential conflict of interest.

### Generative AI statement

The authors declare that no Gen AI was used in the creation of this manuscript.

### Publisher’s note

All claims expressed in this article are solely those of the authors and do not necessarily represent those of their affiliated organizations, or those of the publisher, the editors and the reviewers. Any product that may be evaluated in this article, or claim that may be made by its manufacturer, is not guaranteed or endorsed by the publisher.

### Supplementary material

The Supplementary material for this article can be found online at: [https://www.frontiersin.org/articles/10.3389/fpubh.2025.1575136/full#supplementary-material](https://www.frontiersin.org/journals/public-health/articles/10.3389/fpubh.2025.1575136/full#supplementary-material)

## References

*   1.

Scrinis G Monteiro C. From ultra-processed foods to ultra-processed dietary patterns. _Nature Food_. (2022) 3:671–3. doi: 10.1038/s43016-022-00599-4

    *   [Pubmed Abstract](https://pubmed.ncbi.nlm.nih.gov/37118150)
    *   [CrossRef](https://doi.org/10.1038/s43016-022-00599-4)
    *   [Google Scholar](http://scholar.google.com/scholar_lookup?author=G.%2BScrinis&author=C.%2BMonteiro&publication_year=2022&title=From%2Bultra-processed%2Bfoods%2Bto%2Bultra-processed%2Bdietary%2Bpatterns&journal=Nature+Food&volume=3&pages=671-3)
    *   [View reference in article](https://www.frontiersin.org/journals/public-health/articles/10.3389/fpubh.2025.1575136/full#ref1a)

*   2.

Monteiro CA Cannon G Levy RB Moubarac JC Louzada ML Rauber F et al. Ultra-processed foods: what they are and how to identify them. _Public Health Nutr_. (2019) 22:936–41. doi: 10.1017/s1368980018003762

    *   [Pubmed Abstract](https://pubmed.ncbi.nlm.nih.gov/30744710)
    *   [CrossRef](https://doi.org/10.1017/s1368980018003762)
    *   [Google Scholar](http://scholar.google.com/scholar_lookup?author=CA.%2BMonteiro&author=G.%2BCannon&author=RB.%2BLevy&author=JC.%2BMoubarac&author=ML.%2BLouzada&author=F.%2BRauber&publication_year=2019&title=Ultra-processed%2Bfoods%3A%2Bwhat%2Bthey%2Bare%2Band%2Bhow%2Bto%2Bidentify%2Bthem&journal=Public+Health+Nutr&volume=22&pages=936-41)
    *   [View reference in article](https://www.frontiersin.org/journals/public-health/articles/10.3389/fpubh.2025.1575136/full#ref2a)

*   3.

Askari M Heshmati J Shahinfar H Tripathi N Daneshzad E. Ultra-processed food and the risk of overweight and obesity: a systematic review and meta-analysis of observational studies. _Int J Obes_. (2020) 44:2080–91. doi: 10.1038/s41366-020-00650-z

    *   [Pubmed Abstract](https://pubmed.ncbi.nlm.nih.gov/32796919)
    *   [CrossRef](https://doi.org/10.1038/s41366-020-00650-z)
    *   [Google Scholar](http://scholar.google.com/scholar_lookup?author=M.%2BAskari&author=J.%2BHeshmati&author=H.%2BShahinfar&author=N.%2BTripathi&author=E.%2BDaneshzad&publication_year=2020&title=Ultra-processed%2Bfood%2Band%2Bthe%2Brisk%2Bof%2Boverweight%2Band%2Bobesity%3A%2Ba%2Bsystematic%2Breview%2Band%2Bmeta-analysis%2Bof%2Bobservational%2Bstudies&journal=Int+J+Obes&volume=44&pages=2080-91)
    *   [View reference in article](https://www.frontiersin.org/journals/public-health/articles/10.3389/fpubh.2025.1575136/full#ref3a)

*   4.

Costa de Miranda R Rauber F Levy RB. Impact of ultra-processed food consumption on metabolic health. _Curr Opin Lipidol_. (2021) 32:24–37. doi: 10.1097/MOL.0000000000000728

    *   [Pubmed Abstract](https://pubmed.ncbi.nlm.nih.gov/33315618)
    *   [CrossRef](https://doi.org/10.1097/MOL.0000000000000728)
    *   [Google Scholar](http://scholar.google.com/scholar_lookup?author=R.%2BCosta%2Bde%2BMiranda&author=F.%2BRauber&author=RB.%2BLevy&publication_year=2021&title=Impact%2Bof%2Bultra-processed%2Bfood%2Bconsumption%2Bon%2Bmetabolic%2Bhealth&journal=Curr+Opin+Lipidol&volume=32&pages=24-37)
    *   [View reference in article](https://www.frontiersin.org/journals/public-health/articles/10.3389/fpubh.2025.1575136/full#ref4a)

*   5.

Pagliai G Dinu M Madarena MP Bonaccio M Iacoviello L Sofi F. Consumption of ultra-processed foods and health status: a systematic review and meta-analysis. _Br J Nutr_. (2020) 125:2688. doi: 10.1017/s0007114520002688

    *   [Pubmed Abstract](https://pubmed.ncbi.nlm.nih.gov/32792031)
    *   [CrossRef](https://doi.org/10.1017/s0007114520002688)
    *   [Google Scholar](http://scholar.google.com/scholar_lookup?author=G.%2BPagliai&author=M.%2BDinu&author=MP.%2BMadarena&author=M.%2BBonaccio&author=L.%2BIacoviello&author=F.%2BSofi&publication_year=2020&title=Consumption%2Bof%2Bultra-processed%2Bfoods%2Band%2Bhealth%2Bstatus%3A%2Ba%2Bsystematic%2Breview%2Band%2Bmeta-analysis&journal=Br+J+Nutr&volume=125)
    *   [View reference in article](https://www.frontiersin.org/journals/public-health/articles/10.3389/fpubh.2025.1575136/full#ref5a)

*   6.

Fiolet T Srour B Sellem L Kesse-Guyot E Allès B Méjean C et al. Consumption of ultra-processed foods and cancer risk: results from Nutri net-santé prospective cohort. _BMJ_. (2018) 360:k322. doi: 10.1136/bmj.k322

    *   [CrossRef](https://doi.org/10.1136/bmj.k322)
    *   [Google Scholar](http://scholar.google.com/scholar_lookup?author=T.%2BFiolet&author=B.%2BSrour&author=L.%2BSellem&author=E.%2BKesse-Guyot&author=B.%2BAll%C3%A8s&author=C.%2BM%C3%A9jean&publication_year=2018&title=Consumption%2Bof%2Bultra-processed%2Bfoods%2Band%2Bcancer%2Brisk%3A%2Bresults%2Bfrom%2BNutri%2Bnet-sant%C3%A9%2Bprospective%2Bcohort&journal=BMJ&volume=360)
    *   [View reference in article](https://www.frontiersin.org/journals/public-health/articles/10.3389/fpubh.2025.1575136/full#ref6a)

*   7.

Nilson EAF Ferrari G Louzada MLC Levy RB Monteiro CA Rezende LFM. Premature deaths attributable to the consumption of Ultraprocessed foods in Brazil. _Am J Prev Med_. (2023) 64:129–36. doi: 10.1016/j.amepre.2022.08.013

    *   [Pubmed Abstract](https://pubmed.ncbi.nlm.nih.gov/36528353)
    *   [CrossRef](https://doi.org/10.1016/j.amepre.2022.08.013)
    *   [Google Scholar](http://scholar.google.com/scholar_lookup?author=EAF.%2BNilson&author=G.%2BFerrari&author=MLC.%2BLouzada&author=RB.%2BLevy&author=CA.%2BMonteiro&author=LFM.%2BRezende&publication_year=2023&title=Premature%2Bdeaths%2Battributable%2Bto%2Bthe%2Bconsumption%2Bof%2BUltraprocessed%2Bfoods%2Bin%2BBrazil&journal=Am+J+Prev+Med&volume=64&pages=129-36)
    *   [View reference in article](https://www.frontiersin.org/journals/public-health/articles/10.3389/fpubh.2025.1575136/full#ref7a)

*   8.

Baker P Machado P Santos T Sievert K Backholer K Hadjikakou M et al. Ultra-processed foods and the nutrition transition: global, regional and national trends, food systems transformations and political economy drivers. _Obes Rev_. (2020) 21:e13126. doi: 10.1111/obr.13126

    *   [Pubmed Abstract](https://pubmed.ncbi.nlm.nih.gov/32761763)
    *   [CrossRef](https://doi.org/10.1111/obr.13126)
    *   [Google Scholar](http://scholar.google.com/scholar_lookup?author=P.%2BBaker&author=P.%2BMachado&author=T.%2BSantos&author=K.%2BSievert&author=K.%2BBackholer&author=M.%2BHadjikakou&publication_year=2020&title=Ultra-processed%2Bfoods%2Band%2Bthe%2Bnutrition%2Btransition%3A%2Bglobal%2C%2Bregional%2Band%2Bnational%2Btrends%2C%2Bfood%2Bsystems%2Btransformations%2Band%2Bpolitical%2Beconomy%2Bdrivers&journal=Obes+Rev&volume=21)
    *   [View reference in article](https://www.frontiersin.org/journals/public-health/articles/10.3389/fpubh.2025.1575136/full#ref8a)

*   9.

Juul F Parekh N Martinez-Steele E Monteiro CA Chang VW. Ultra-processed food consumption among US adults from 2001 to 2018. _Am J Clin Nutr_. (2022) 115:211–21. doi: 10.1093/ajcn/nqab305

    *   [Pubmed Abstract](https://pubmed.ncbi.nlm.nih.gov/34647997)
    *   [CrossRef](https://doi.org/10.1093/ajcn/nqab305)
    *   [Google Scholar](http://scholar.google.com/scholar_lookup?author=F.%2BJuul&author=N.%2BParekh&author=E.%2BMartinez-Steele&author=CA.%2BMonteiro&author=VW.%2BChang&publication_year=2022&title=Ultra-processed%2Bfood%2Bconsumption%2Bamong%2BUS%2Badults%2Bfrom%2B2001%2Bto%2B2018&journal=Am+J+Clin+Nutr&volume=115&pages=211-21)
    *   [View reference in article](https://www.frontiersin.org/journals/public-health/articles/10.3389/fpubh.2025.1575136/full#ref9a)

*   10.

Juul F Hemmingsson E. Trends in consumption of ultra-processed foods and obesity in Sweden between 1960 and 2010. _Public Health Nutr_. (2015) 18:3096–107. doi: 10.1017/s1368980015000506

    *   [Pubmed Abstract](https://pubmed.ncbi.nlm.nih.gov/25804833)
    *   [CrossRef](https://doi.org/10.1017/s1368980015000506)
    *   [Google Scholar](http://scholar.google.com/scholar_lookup?author=F.%2BJuul&author=E.%2BHemmingsson&publication_year=2015&title=Trends%2Bin%2Bconsumption%2Bof%2Bultra-processed%2Bfoods%2Band%2Bobesity%2Bin%2BSweden%2Bbetween%2B1960%2Band%2B2010&journal=Public+Health+Nutr&volume=18&pages=3096-107)

*   11.

Louzada MLdC Ricardo CZ Steele EM Levy RB Cannon G Monteiro CA. The share of ultra-processed foods determines the overall nutritional quality of diets in Brazil. _Public Health Nutr_. (2018) 21:94–102. doi: 10.1017/S1368980017001434

    *   [CrossRef](https://doi.org/10.1017/S1368980017001434)
    *   [Google Scholar](http://scholar.google.com/scholar_lookup?author=.%2BLouzada%2BMLdC&author=CZ.%2BRicardo&author=EM.%2BSteele&author=RB.%2BLevy&author=G.%2BCannon&author=CA.%2BMonteiro&publication_year=2018&title=The%2Bshare%2Bof%2Bultra-processed%2Bfoods%2Bdetermines%2Bthe%2Boverall%2Bnutritional%2Bquality%2Bof%2Bdiets%2Bin%2BBrazil&journal=Public+Health+Nutr&volume=21&pages=94-102)

*   12.

Cediel G Reyes M Corvalán C Levy RB Uauy R Monteiro CA. Ultra-processed foods drive to unhealthy diets: evidence from Chile. _Public Health Nutr_. (2021) 24:1698–707. Epub 2020/04/27. doi: 10.1017/S1368980019004737

    *   [Pubmed Abstract](https://pubmed.ncbi.nlm.nih.gov/32338229)
    *   [CrossRef](https://doi.org/10.1017/S1368980019004737)
    *   [Google Scholar](http://scholar.google.com/scholar_lookup?author=G.%2BCediel&author=M.%2BReyes&author=C.%2BCorval%C3%A1n&author=RB.%2BLevy&author=R.%2BUauy&author=CA.%2BMonteiro&publication_year=2021&title=Ultra-processed%2Bfoods%2Bdrive%2Bto%2Bunhealthy%2Bdiets%3A%2Bevidence%2Bfrom%2BChile&journal=Public+Health+Nutr&volume=24&pages=1698-707)
    *   [View reference in article](https://www.frontiersin.org/journals/public-health/articles/10.3389/fpubh.2025.1575136/full#ref12a)

*   13.

Lane MM Davis JA Beattie S Gómez-Donoso C Loughman A O'Neil A et al. Ultraprocessed food and chronic non-communicable diseases: a systematic review and meta-analysis of 43 observational studies. _Obes Rev_. (2021) 22:e13146. doi: 10.1111/obr.13146

    *   [Pubmed Abstract](https://pubmed.ncbi.nlm.nih.gov/33167080)
    *   [CrossRef](https://doi.org/10.1111/obr.13146)
    *   [Google Scholar](http://scholar.google.com/scholar_lookup?author=MM.%2BLane&author=JA.%2BDavis&author=S.%2BBeattie&author=C.%2BG%C3%B3mez-Donoso&author=A.%2BLoughman&author=A.%2BO%27Neil&publication_year=2021&title=Ultraprocessed%2Bfood%2Band%2Bchronic%2Bnon-communicable%2Bdiseases%3A%2Ba%2Bsystematic%2Breview%2Band%2Bmeta-analysis%2Bof%2B43%2Bobservational%2Bstudies&journal=Obes+Rev&volume=22)
    *   [View reference in article](https://www.frontiersin.org/journals/public-health/articles/10.3389/fpubh.2025.1575136/full#ref13a)

*   14.

Srour B Kordahi MC Bonazzi E Deschasaux-Tanguy M Touvier M Chassaing B. Ultra-processed foods and human health: from epidemiological evidence to mechanistic insights. _Lancet Gastroenterol Hepatol_. (2022) 7:1128–40. doi: 10.1016/S2468-1253(22)00169-8

    *   [Pubmed Abstract](https://pubmed.ncbi.nlm.nih.gov/35952706)
    *   [CrossRef](https://doi.org/10.1016/S2468-1253(22)00169-8)
    *   [Google Scholar](http://scholar.google.com/scholar_lookup?author=B.%2BSrour&author=MC.%2BKordahi&author=E.%2BBonazzi&author=M.%2BDeschasaux-Tanguy&author=M.%2BTouvier&author=B.%2BChassaing&publication_year=2022&title=Ultra-processed%2Bfoods%2Band%2Bhuman%2Bhealth%3A%2Bfrom%2Bepidemiological%2Bevidence%2Bto%2Bmechanistic%2Binsights&journal=Lancet+Gastroenterol+Hepatol&volume=7&pages=1128-40)
    *   [View reference in article](https://www.frontiersin.org/journals/public-health/articles/10.3389/fpubh.2025.1575136/full#ref14a)

*   15.

Gómez-Donoso C Sánchez-Villegas A Martínez-González MA Gea A Mendonça RD Lahortiga-Ramos F et al. Ultra-processed food consumption and the incidence of depression in a Mediterranean cohort: the SUN project. _Eur J Nutr_. (2020) 59:1093–103. doi: 10.1007/s00394-019-01970-1

    *   [Pubmed Abstract](https://pubmed.ncbi.nlm.nih.gov/31055621)
    *   [CrossRef](https://doi.org/10.1007/s00394-019-01970-1)
    *   [Google Scholar](http://scholar.google.com/scholar_lookup?author=C.%2BG%C3%B3mez-Donoso&author=A.%2BS%C3%A1nchez-Villegas&author=MA.%2BMart%C3%ADnez-Gonz%C3%A1lez&author=A.%2BGea&author=RD.%2BMendon%C3%A7a&author=F.%2BLahortiga-Ramos&publication_year=2020&title=Ultra-processed%2Bfood%2Bconsumption%2Band%2Bthe%2Bincidence%2Bof%2Bdepression%2Bin%2Ba%2BMediterranean%2Bcohort%3A%2Bthe%2BSUN%2Bproject&journal=Eur+J+Nutr&volume=59&pages=1093-103)
    *   [View reference in article](https://www.frontiersin.org/journals/public-health/articles/10.3389/fpubh.2025.1575136/full#ref15a)

*   16.

Blanco-Rojo R Sandoval-Insausti H López-Garcia E Graciani A Ordovás JM Banegas JR et al. Consumption of ultra-processed foods and mortality: a National Prospective Cohort in Spain. _Mayo Clin Proc_. (2019) 94:2178–88. doi: 10.1016/j.mayocp.2019.03.035

    *   [Pubmed Abstract](https://pubmed.ncbi.nlm.nih.gov/31623843)
    *   [CrossRef](https://doi.org/10.1016/j.mayocp.2019.03.035)
    *   [Google Scholar](http://scholar.google.com/scholar_lookup?author=R.%2BBlanco-Rojo&author=H.%2BSandoval-Insausti&author=E.%2BL%C3%B3pez-Garcia&author=A.%2BGraciani&author=JM.%2BOrdov%C3%A1s&author=JR.%2BBanegas&publication_year=2019&title=Consumption%2Bof%2Bultra-processed%2Bfoods%2Band%2Bmortality%3A%2Ba%2BNational%2BProspective%2BCohort%2Bin%2BSpain&journal=Mayo+Clin+Proc&volume=94&pages=2178-88)

*   17.

Levy RB Rauber F Chang K Louzada MLC Monteiro CA Millett C et al. Ultra-processed food consumption and type 2 diabetes incidence: a prospective cohort study. _Clin Nutr_. (2021) 40:3608–14. doi: 10.1016/j.clnu.2020.12.018

    *   [Pubmed Abstract](https://pubmed.ncbi.nlm.nih.gov/33388205)
    *   [CrossRef](https://doi.org/10.1016/j.clnu.2020.12.018)
    *   [Google Scholar](http://scholar.google.com/scholar_lookup?author=RB.%2BLevy&author=F.%2BRauber&author=K.%2BChang&author=MLC.%2BLouzada&author=CA.%2BMonteiro&author=C.%2BMillett&publication_year=2021&title=Ultra-processed%2Bfood%2Bconsumption%2Band%2Btype%2B2%2Bdiabetes%2Bincidence%3A%2Ba%2Bprospective%2Bcohort%2Bstudy&journal=Clin+Nutr&volume=40&pages=3608-14)
    *   [View reference in article](https://www.frontiersin.org/journals/public-health/articles/10.3389/fpubh.2025.1575136/full#ref17a)

*   18.

Hall KD Ayuketah A Brychta R Cai H Cassimatis T Chen KY et al. Ultra-processed diets cause excess calorie intake and weight gain: an inpatient randomized controlled trial of ad libitum food intake. _Cell Metab_. (2019) 30:67–77.e3. doi: 10.1016/j.cmet.2019.05.008

    *   [Pubmed Abstract](https://pubmed.ncbi.nlm.nih.gov/31105044)
    *   [CrossRef](https://doi.org/10.1016/j.cmet.2019.05.008)
    *   [Google Scholar](http://scholar.google.com/scholar_lookup?author=KD.%2BHall&author=A.%2BAyuketah&author=R.%2BBrychta&author=H.%2BCai&author=T.%2BCassimatis&author=KY.%2BChen&publication_year=2019&title=Ultra-processed%2Bdiets%2Bcause%2Bexcess%2Bcalorie%2Bintake%2Band%2Bweight%2Bgain%3A%2Ban%2Binpatient%2Brandomized%2Bcontrolled%2Btrial%2Bof%2Bad%2Blibitum%2Bfood%2Bintake&journal=Cell+Metab&volume=30&pages=67-77.e3)
    *   [View reference in article](https://www.frontiersin.org/journals/public-health/articles/10.3389/fpubh.2025.1575136/full#ref18a)

*   19.

Colombia. Minsalud (2020) _Colombia tendrá etiquetado nutricional en los alimentos envasados [Colombia will have nutrition labelling on packaged foods]_

    *   [Google Scholar](http://scholar.google.com/scholar_lookup?publication_year=2020&journal=Colombia+tendr%C3%A1+etiquetado+nutricional+en+los+alimentos+envasados+%5BColombia+will+have+nutrition+labelling+on+packaged+foods%5D)
    *   [View reference in article](https://www.frontiersin.org/journals/public-health/articles/10.3389/fpubh.2025.1575136/full#ref19a)

*   20.

Brasil. Ministério da Saúde (2014). _Guia alimentar para a população brasileir_ a

    *   [Google Scholar](http://scholar.google.com/scholar_lookup?publication_year=2014&journal=Guia+alimentar+para+a+popula%C3%A7%C3%A3o+brasileir)

*   21.

Lamonatto Taglietti R Paz Arruda Teo CR. _Recomendações alimentares e nutricionais para o Programa Nacional de Alimentação Escolar: uma análise da história recente_, vol. 16 DEMETRA: Alimentação, Nutrição, and Saúde (2021).

    *   [Google Scholar](http://scholar.google.com/scholar_lookup?author=R.%2BLamonatto%2BTaglietti&author=CR.%2BPaz%2BArruda%2BTeo&publication_year=2021&journal=Recomenda%C3%A7%C3%B5es+alimentares+e+nutricionais+para+o+Programa+Nacional+de+Alimenta%C3%A7%C3%A3o+Escolar%3A+uma+an%C3%A1lise+da+hist%C3%B3ria+recente&volume=16)
    *   [View reference in article](https://www.frontiersin.org/journals/public-health/articles/10.3389/fpubh.2025.1575136/full#ref21a)

*   22.

Popkin BM Miles DR Taillie LS Dunford EK. A policy approach to identifying food and beverage products that are ultra-processed and high in added salt, sugar and saturated fat in the United States: a cross-sectional analysis of packaged foods. _Lancet Reg Health Am_. (2024) 32:100713. doi: 10.1016/j.lana.2024.100713

    *   [Pubmed Abstract](https://pubmed.ncbi.nlm.nih.gov/38495314)
    *   [CrossRef](https://doi.org/10.1016/j.lana.2024.100713)
    *   [Google Scholar](http://scholar.google.com/scholar_lookup?author=BM.%2BPopkin&author=DR.%2BMiles&author=LS.%2BTaillie&author=EK.%2BDunford&publication_year=2024&title=A%2Bpolicy%2Bapproach%2Bto%2Bidentifying%2Bfood%2Band%2Bbeverage%2Bproducts%2Bthat%2Bare%2Bultra-processed%2Band%2Bhigh%2Bin%2Badded%2Bsalt%2C%2Bsugar%2Band%2Bsaturated%2Bfat%2Bin%2Bthe%2BUnited%2BStates%3A%2Ba%2Bcross-sectional%2Banalysis%2Bof%2Bpackaged%2Bfoods&journal=Lancet+Reg+Health+Am&volume=32)
    *   [View reference in article](https://www.frontiersin.org/journals/public-health/articles/10.3389/fpubh.2025.1575136/full#ref22a)

*   23.

Canella DS Pereira Montera VS Oliveira N Mais LA Andrade GC Martins APB. Food additives and PAHO’S nutrient profile model as contributors’ elements to the identification of ultra-processed food products. _Sci Rep_. (2023) 13:13698. doi: 10.1038/s41598-023-40650-3

    *   [Pubmed Abstract](https://pubmed.ncbi.nlm.nih.gov/37648698)
    *   [CrossRef](https://doi.org/10.1038/s41598-023-40650-3)
    *   [Google Scholar](http://scholar.google.com/scholar_lookup?author=DS.%2BCanella&author=VS.%2BPereira%2BMontera&author=N.%2BOliveira&author=LA.%2BMais&author=GC.%2BAndrade&author=APB.%2BMartins&publication_year=2023&title=Food%2Badditives%2Band%2BPAHO%E2%80%99S%2Bnutrient%2Bprofile%2Bmodel%2Bas%2Bcontributors%E2%80%99%2Belements%2Bto%2Bthe%2Bidentification%2Bof%2Bultra-processed%2Bfood%2Bproducts&journal=Sci+Rep&volume=13)
    *   [View reference in article](https://www.frontiersin.org/journals/public-health/articles/10.3389/fpubh.2025.1575136/full#ref23a)

*   24.

Duran AC Ricardo CZ Mais LA Bortoletto Martins AP. Role of different nutrient profiling models in identifying targeted foods for front-of-package food labelling in Brazil. _Public Health Nutr_. (2020) 24:5056. doi: 10.1017/S1368980019005056

    *   [Pubmed Abstract](https://pubmed.ncbi.nlm.nih.gov/32515717)
    *   [CrossRef](https://doi.org/10.1017/S1368980019005056)
    *   [Google Scholar](http://scholar.google.com/scholar_lookup?author=AC.%2BDuran&author=CZ.%2BRicardo&author=LA.%2BMais&author=AP.%2BBortoletto%2BMartins&publication_year=2020&title=Role%2Bof%2Bdifferent%2Bnutrient%2Bprofiling%2Bmodels%2Bin%2Bidentifying%2Btargeted%2Bfoods%2Bfor%2Bfront-of-package%2Bfood%2Blabelling%2Bin%2BBrazil&journal=Public+Health+Nutr&volume=24)
    *   [View reference in article](https://www.frontiersin.org/journals/public-health/articles/10.3389/fpubh.2025.1575136/full#ref24a)

*   25.

Retail P. _Brazil: Retail Sales 2013–2022_. Frankfurt, Germany: Planet Retail (2020).

    *   [Google Scholar](http://scholar.google.com/scholar_lookup?publication_year=2020&journal=Brazil%3A+Retail+Sales+2013%E2%80%932022)
    *   [View reference in article](https://www.frontiersin.org/journals/public-health/articles/10.3389/fpubh.2025.1575136/full#ref25a)

*   26.

Fagundes Grilo M Taillie LS Zancheta Ricardo C Amaral Mais L Bortoletto Martins AP Duran AC. Prevalence of low-calorie sweeteners and related front-of-package claims in the Brazilian packaged food supply. _J Acad Nutr Diet_. (2021). doi: 10.1016/j.jand.2021.12.009

    *   [CrossRef](https://doi.org/10.1016/j.jand.2021.12.009)
    *   [Google Scholar](http://scholar.google.com/scholar_lookup?author=M.%2BFagundes%2BGrilo&author=LS.%2BTaillie&author=C.%2BZancheta%2BRicardo&author=L.%2BAmaral%2BMais&author=AP.%2BBortoletto%2BMartins&author=AC.%2BDuran&publication_year=2021&title=Prevalence%2Bof%2Blow-calorie%2Bsweeteners%2Band%2Brelated%2Bfront-of-package%2Bclaims%2Bin%2Bthe%2BBrazilian%2Bpackaged%2Bfood%2Bsupply&journal=J+Acad+Nutr+Diet)
    *   [View reference in article](https://www.frontiersin.org/journals/public-health/articles/10.3389/fpubh.2025.1575136/full#ref26a)

*   27.

Ricardo CZ Peroseni IM Mais LA Martins APB Duran AC. Trans fat labeling information on Brazilian packaged foods. _Nutrients_. (2019) 11:2130. doi: 10.3390/nu11092130

    *   [Pubmed Abstract](https://pubmed.ncbi.nlm.nih.gov/31500088)
    *   [CrossRef](https://doi.org/10.3390/nu11092130)
    *   [Google Scholar](http://scholar.google.com/scholar_lookup?author=CZ.%2BRicardo&author=IM.%2BPeroseni&author=LA.%2BMais&author=APB.%2BMartins&author=AC.%2BDuran&publication_year=2019&title=Trans%2Bfat%2Blabeling%2Binformation%2Bon%2BBrazilian%2Bpackaged%2Bfoods&journal=Nutrients&volume=11)
    *   [View reference in article](https://www.frontiersin.org/journals/public-health/articles/10.3389/fpubh.2025.1575136/full#ref27a)

*   28.

Brasil. Ministério da Saúde. Agência Nacional de Vigilância Sanitária. _Resolução da Diretoria Colegiada-RDC no 429, de 8 de outubro de 2020_ Dispõem Sobre a Rotulagem Nutricional de Alimentos Embalados.

    *   [Google Scholar](http://scholar.google.com/scholar_lookup?journal=Resolu%C3%A7%C3%A3o+da+Diretoria+Colegiada-RDC+no+429%2C+de+8+de+outubro+de+2020)
    *   [View reference in article](https://www.frontiersin.org/journals/public-health/articles/10.3389/fpubh.2025.1575136/full#ref28a)

*   29.

Alimentarius C. _Codex general standard for food additives (GSFA) online database_. (2023).

    *   [Google Scholar](http://scholar.google.com/scholar_lookup?author=C.%2BAlimentarius&publication_year=2023&journal=Codex+general+standard+for+food+additives+%28GSFA%29+online+database)
    *   [View reference in article](https://www.frontiersin.org/journals/public-health/articles/10.3389/fpubh.2025.1575136/full#ref29a)

*   30.

ANVISA. _Instrução Normativa-IN No. 211, de 1 de março de 2023 (Publicada no DOU No 46, de 8 de março de 2023)_ (2023)

    *   [Google Scholar](http://scholar.google.com/scholar_lookup?publication_year=2023&journal=Instru%C3%A7%C3%A3o+Normativa-IN+No.+211%2C+de+1+de+mar%C3%A7o+de+2023+%28Publicada+no+DOU+No+46%2C+de+8+de+mar%C3%A7o+de+2023%29)
    *   [View reference in article](https://www.frontiersin.org/journals/public-health/articles/10.3389/fpubh.2025.1575136/full#ref30a)

*   31.

Zancheta RC Duran AC Grilo MF Rebolledo N Díaz-Torrente X Reyes M et al. Impact of the use of food ingredients and additives on the estimation of ultra-processed foods and beverages. _Front Nutr_. (2023) 9:1046463. doi: 10.3389/fnut.2022.1046463

    *   [CrossRef](https://doi.org/10.3389/fnut.2022.1046463)
    *   [Google Scholar](http://scholar.google.com/scholar_lookup?author=RC.%2BZancheta&author=AC.%2BDuran&author=MF.%2BGrilo&author=N.%2BRebolledo&author=X.%2BD%C3%ADaz-Torrente&author=M.%2BReyes&publication_year=2023&title=Impact%2Bof%2Bthe%2Buse%2Bof%2Bfood%2Bingredients%2Band%2Badditives%2Bon%2Bthe%2Bestimation%2Bof%2Bultra-processed%2Bfoods%2Band%2Bbeverages&journal=Front+Nutr&volume=9)
    *   [View reference in article](https://www.frontiersin.org/journals/public-health/articles/10.3389/fpubh.2025.1575136/full#ref31a)

*   32.

Louzada M Cruz GLD Silva K Grassi AGF Andrade GC Rauber F et al. Consumption of ultra-processed foods in Brazil: distribution and temporal evolution 2008-2018. _Rev Saude Publica_. (2023) 57:4744. doi: 10.11606/s1518-8787.2023057004744

    *   [CrossRef](https://doi.org/10.11606/s1518-8787.2023057004744)
    *   [Google Scholar](http://scholar.google.com/scholar_lookup?author=M.%2BLouzada&author=GLD.%2BCruz&author=K.%2BSilva&author=AGF.%2BGrassi&author=GC.%2BAndrade&author=F.%2BRauber&publication_year=2023&title=Consumption%2Bof%2Bultra-processed%2Bfoods%2Bin%2BBrazil%3A%2Bdistribution%2Band%2Btemporal%2Bevolution%2B2008-2018&journal=Rev+Saude+Publica&volume=57)
    *   [View reference in article](https://www.frontiersin.org/journals/public-health/articles/10.3389/fpubh.2025.1575136/full#ref32a)

*   33.

Braesco V Souchon I Sauvant P Haurogné T Maillot M Féart C et al. Ultra-processed foods: how functional is the NOVA system?_Eur J Clin Nutr_. (2022) 76:1245–53. doi: 10.1038/s41430-022-01099-1

    *   [Pubmed Abstract](https://pubmed.ncbi.nlm.nih.gov/35314769)
    *   [CrossRef](https://doi.org/10.1038/s41430-022-01099-1)
    *   [Google Scholar](http://scholar.google.com/scholar_lookup?author=V.%2BBraesco&author=I.%2BSouchon&author=P.%2BSauvant&author=T.%2BHaurogn%C3%A9&author=M.%2BMaillot&author=C.%2BF%C3%A9art&publication_year=2022&title=Ultra-processed%2Bfoods%3A%2Bhow%2Bfunctional%2Bis%2Bthe%2BNOVA%2Bsystem%3F&journal=Eur+J+Clin+Nutr&volume=76&pages=1245-53)
    *   [View reference in article](https://www.frontiersin.org/journals/public-health/articles/10.3389/fpubh.2025.1575136/full#ref33a)

*   34.

Commission JFWCA _Codex general standard for food additives (GSFA) online database_ (2017)

    *   [Google Scholar](http://scholar.google.com/scholar_lookup?publication_year=2017&journal=Codex+general+standard+for+food+additives+%28GSFA%29+online+database)
    *   [View reference in article](https://www.frontiersin.org/journals/public-health/articles/10.3389/fpubh.2025.1575136/full#ref34a)

Keywords

ultra-processed foods, methodology, classification, food substances, food additives

Citation

Grilo MF, Nunes BS, Duran AC, Zancheta Ricardo C, Baraldi LG, Martinez Steele E and Borges CA (2025) Applying the Nova food classification to food product databases using discriminative ingredients: a methodological proposal. _Front. Public Health_ 13:1575136. doi: [10.3389/fpubh.2025.1575136](http://dx.doi.org/10.3389/fpubh.2025.1575136)

Received

11 February 2025

Accepted

09 June 2025

Published

01 July 2025

Corrected

04 August 2025

Volume

13 - 2025

Edited by

Ilce Medina-Meza, Michigan State University, United States

Reviewed by

Damilola Olajide, University of Nottingham, United Kingdom

Viktorija Kesaite, University of Cambridge, United Kingdom

Updates

Copyright

© 2025 Grilo, Nunes, Duran, Zancheta Ricardo, Baraldi, Martinez Steele and Borges.

This is an open-access article distributed under the terms of the [Creative Commons Attribution License (CC BY)](http://creativecommons.org/licenses/by/4.0/). The use, distribution or reproduction in other forums is permitted, provided the original author(s) and the copyright owner(s) are credited and that the original publication in this journal is cited, in accordance with accepted academic practice. No use, distribution or reproduction is permitted which does not comply with these terms.

*****Correspondence:**** Mariana Fagundes Grilo, [marianafg@gwu.edu](mailto:marianafg@gwu.edu)

**†**These authors have contributed equally to this work and share first authorship

Disclaimer

All claims expressed in this article are solely those of the authors and do not necessarily represent those of their affiliated organizations, or those of the publisher, the editors and the reviewers. Any product that may be evaluated in this article or claim that may be made by its manufacturer is not guaranteed or endorsed by the publisher.