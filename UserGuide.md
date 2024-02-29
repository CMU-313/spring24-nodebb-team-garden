# Feature: Make a post anonymous
## How to use the feature:
- Making a post anonymous:
    - make a new post or open an existing post
    - click the post drop down button to access the post tools
    - click the anonymize button in the post tools list
- Changing an anonymous post to no longer be anonymous:
    - go to an existing post that is anonymous
    - click the post drop down button to access the post tools
    - click the deanonymize button in the post tools list

## Testing:
- Link: 'tests/posts.js', lines 639 - 662
    - This test asserts that when a post's is_anonymous field receives an updated value, the system is able to successfully store that value and return it via apiPost.get()
    - #TODO write your test lines/goals here

    - These tests are sufficient because the main functionality of this feature is the addition of the is_anonymous tag on every post in the database. As long as it can be proven that the tag is successfully updating and saving 
    + what you guys are doing..
        - #TODO
    , then setting the tag to 'true' will never allow users (except for a post's author) to see a post's author, since it's never rendered