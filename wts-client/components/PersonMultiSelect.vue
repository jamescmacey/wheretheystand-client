<template>
    <div>
        <div class="col-12 p-2" id="list">
            <span v-if="selected.length == 0">
            All
            </span>
            <span v-for="entity in selected" :key="enttiy.id" class="inline-entity">
                <span v-if="entity.colour" class="party-dot" :style="{ backgroundColor: entity.colour }"></span>
                    {{ entity.display_name }}
            </span>
        </div>
        
        <a v-if="selected.length < max_selection" id="add" href="#">
            <span v-if="selected.length == 0">
                refine
            </span>
            <span v-else>
                add
            </span>
        </a>
    </div>
</template>

<style scoped>
#add {
    text-decoration: none;
}

#add:hover {
    text-decoration: underline;
}

#list {
    background-color: rgb(231, 231, 231);
    border-radius: var(--wts-card-border-radius)
}
.inline-entity {
    background-color: rgba(161, 213, 237, 0.3);
    padding: 0px 3px;
    border-radius: 2px;
    display: inline-block;
    cursor: pointer;
}

span.party-dot {
    height: 0.8em;
    width: 0.8em;
    border-radius: 50%;
    display: inline-block;
    margin-right: 2px;
}


</style>

<script>
export default {
    name: 'PersonMultiSelect',
    props: {
        max_selection: {
            type: Number,
            default: 10
        },
    },
    data () {
        return {
            selected: []
        }
    },
    computed: {
        
    }
}

</script>