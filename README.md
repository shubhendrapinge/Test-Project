# Test Project
To find the word count for top 10 words in a file and display in a JSON format.
The following npm packages are required for the code to run:
1. https://www.npmjs.com/package/request
2. https://www.npmjs.com/package/http

The code is implemented as follows:
1. Reading the file from http://norvig.com/big.txt for text.
2. Splitting the text by spaces to create an array of words.
3. Getting the top 10 words by occurences.
4. Collecting data for each word using an API provided.
5. Publishing a JSON output containing the following:
   - Word: text 
   - Output :
        - Count of Occurrence in that Particular Document
        - Synonyms
        - Pos
