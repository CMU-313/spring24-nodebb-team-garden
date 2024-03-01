# Feature: Make a post anonymous
## How to use the feature:
- start by logging in
- Making a post anonymous:
    - make a new post (may not work with old posts)
    - click the post drop down button to access the post tools
    - click the anonymize button in the post tools list
- Changing an anonymous post to no longer be anonymous:
    - go to an existing post that is anonymous
    - click the post drop down button to access the post tools
    - click the deanonymize button in the post tools list
- Note: if dropdown or anonymize option is not appearing, rebuild NodeBB, refresh the page, or try making a new reply to the post

## Testing:
- Link: test/posts.js, lines 640-679
    - We are testing editing the anonymous tag on newly created posts
    - These automated tests are sufficient because they check that the anonymous tag can be changed to be true and false using the post.edit API call, which is the same logic that is used in public/src/client/topic/postTools.js to anonymize/deanonymize posts. The reason we do not use postTools.js directly to test is because it uses requireJS's define, which is not supported by mocha natively.
- Visual testing:
    - To visual test our feature, follow the steps above. Ensure that the following are true:
        - when post is anonymous:
            - username is "Anonymous"
            - profile picture is gone
            - button in post dropdown says "deanonymize"
        - when post is not anonymous:
            - username is username
            - profile picture is there
            - button in post dropdown says "anonymize"
        - when anonymize/deanonymize button is clicked, window automatically reloads to reflect changes