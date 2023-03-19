<template>
    <div>
        <PageHeader pageTitle="Votes"></PageHeader>
        <div class="container">
            <div class="row mt-3">
                <div class="col-12">
                    <h4>Parliament votes on bills and amendments many time before they become law.</h4>
                    <p>There are four types of votes that can happen:
                        <ul>
                        <li>
                            <FontAwesomeIcon :icon="['fas', 'person']">
                            </FontAwesomeIcon> <strong>Personal votes: </strong> MPs' votes were cast and recorded
                            individually.
                        </li>
                        <li>
                            <FontAwesomeIcon :icon="['fas', 'people-group']">
                            </FontAwesomeIcon> <strong>Split-party votes: </strong> Votes which are conducted as a party vote,
                            but one or more parties opts to split their vote across multiple positions. The position of
                            each MP within those parties is recorded individually.
                        </li>
                        <li>
                            <FontAwesomeIcon :icon="['fas', 'people-group']">
                            </FontAwesomeIcon> <strong>Party votes: </strong> Parties cast one vote on behalf of all their
                            MPs.
                        </li>
                        <li>
                            <FontAwesomeIcon :icon="['fas', 'microphone-lines']">
                            </FontAwesomeIcon> <strong>Voice votes: </strong> MPs shout "aye" or "no", and the Speaker or Chairperson determines the result based on what they hear. The positions of individual MPs or parties aren't recorded. Any MP can ask for a party or personal vote to be conducted after a voice vote. Voice votes aren't shown on WhereTheyStand
                        </li>
                    </ul>
                    </p>
                    <p>Currently, WhereTheyStand only contains records of "reading votes" (votes for a bill's first, second
                        or third reading). Over time, this will be expanded to include other votes, like those during the
                        Committee of the whole House stage.</p>
                </div>
        </div>

    </div>
</div></template>