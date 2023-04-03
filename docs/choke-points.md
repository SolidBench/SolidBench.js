# Choke points

Next to the short and complex queries from LDBC SNB,
we introduce a set of *discover* query templates to cover more linking structure-related choke points.

The additional choke points related to *linking structures* within data vaults we introduce are the following:

- **CP L.1: Traversal of 1 hop (1)**: Following one link to one other document.
- **CP L.2: Traversal of 1 hop (n)**: Following one link to multiple other document.
- **CP L.3: Traversal of 2 hops (1:1)**: Following one link to another document, and one link to another documents.
- **CP L.4: Traversal of 2 hops (1:n)**: Following one link to another document, and multiple links to other documents.
- **CP L.5: Traversal of 3 hops (n:1:1)**: Following multiple links to other documents, one link from the next document, and one other link.
- **CP L.6: Traversal of 3 hops (n:1:n)**: Following multiple links to other documents, one link from the next document, and multiple other link.
- **CP L.7: Fragmentation variability in vaults**: Handling the variability of data fragmentation across different data vaults.
- **CP L.8: Index delegation**: The potential of deferring subqueries to an index (such as the type index).
- **CP L.9: Noise**: The ability to filter out HTTP requests that are irrelevant to the query.

The discover queries we introduce are listed below:

- D1: All posts of a person
- D2: All messages of a person
- D3: Top tags in messages from a person
- D4: Top locations in comments from a person
- D5: All IPs a person has messaged from
- D6: All fora a person messaged on
- D7: All moderators in fora a person messaged on
- D8: Other messages created by people that a person likes messages from

The correlation of these choke points to the discover queries is summarized below.

| Choke Point | D1 | D2 | D3 | D4 | D5 | D6 | D7 | D8 |
| ----------- | -- | -- | -- | -- | -- | -- | -- | -- |
| L.1         | ✓  | ✓  |    |    |    |    |    |    |
| L.2         |    |    |    |    | ✓  |    |    |    |
| L.3         |    |    |    |    |    | ✓  |    |    |
| L.4         |    |    | ✓  | ✓  |    |    |    |    |
| L.5         |    |    |    |    |    |    | ✓  |    |
| L.6         |    |    |    |    |    |    |    | ✓  |
| L.7         | ✓  | ✓  | ✓  | ✓  | ✓  | ✓  | ✓  | ✓  |
| L.8         | ✓  | ✓  |    | ✓  |    |    |    | ✓  |
| L.9         | ✓  | ✓  | ✓  | ✓  | ✓  | ✓  | ✓  | ✓  |
