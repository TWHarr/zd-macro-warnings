# ZD Macro Warning

A small app to warn you that you're sending a macro that the user has seen within the last year.

# Basic Functionality
The basic idea behind this app is that when a ticket is pulled up, we record all the tags on it. When an agent chooses a macro, the macro applies a custom tag that is specific to that macro.

We then record all the tags on the ticket and compare it against the initial tags. Any new tags are passed to the Zendesk search API, where we check to see if those tags have ever been used on any tickets this player submitted in the last year. If they have, we warn the agent. If the agent confirms they are going to change the macro, we adjust the tagging to indicate that. If the agent confirms they plan to send the macro anyways, we make a note of it so that we can check CSAT later on.

# Setup

* Edit all your macros to add a tag to the ticket when applied. They should all start with the same prefix. I recommend using "macro" as a prefix. So for example, all our macros apply tags such as "macro__refund_purchase"
* Install this app from Labs.
* Once installed, you'll see a settings page that will ask for your macro prefix.
* You're good to go!


Please submit bug reports to tharrison@kixeye.com. Pull requests are welcome.
