/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheet}
 */
export class SimpleActorSheet extends ActorSheet {

    /** @inheritdoc */
    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            classes: ["twofourxx", "sheet", "actor"],
            template: "systems/twofourxx/templates/actor-sheet.html",
            tabs: [{navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "description"}],
            scrollY: [".biography", ".items", ".attributes"],
            dragDrop: [{dragSelector: ".item-list .item", dropSelector: null}]
        });
    }

    /* -------------------------------------------- */

    /** @override */
    getData() {
        // Retrieve the data structure from the base sheet. You can inspect or log
        // the context variable to see the structure, but some key properties for
        // sheets are the actor object, the data object, whether or not it's
        // editable, the items array, and the effects array.
        const context = super.getData();

        // Use a safe clone of the actor data for further operations.
        const actorData = context.data;

        // Add the actor's data to context.data for easier access, as well as flags.
        context.system = actorData.system;
        context.flags = actorData.flags;

        // Add roll data for TinyMCE editors.
        // context.rollData = context.actor.getRollData();

        return context;
    }


    /* -------------------------------------------- */

    /** @inheritdoc */
    activateListeners(html) {
        super.activateListeners(html);

        // Everything below here is only needed if the sheet is editable
        if ( !this.isEditable ) return;

        html.find(".rollable").on("click", this._onSkillRoll.bind(this));

    }


    /**
     * Listen for roll buttons on items.
     * @param {MouseEvent} event    The originating left click event
     */
    async _onSkillRoll(event) {
        let button = $(event.currentTarget);
        const li = button.parent(".item");
        const dice_select = li.children('#' + li[0].id + '_dice')
        const dice_value = '1' + dice_select[0].options[dice_select[0].selectedIndex].value;
        const skill_name = li.children('#' + li[0].id + '_name')[0].value;
        let r = new Roll(dice_value, this.actor.getRollData());
        await r.evaluate();

        // 24XX is very simple, regardless of dice used:
        // 1-2 Disaster
        // 3-4 Setback
        // 5+  Success
        let outcome = "disaster";
        if (r.total <= 2) {
            outcome = "disaster";
        } else if (r.total <= 4) {
            outcome = "setback";
        } else { // >5
            outcome = "success";
        }

        return r.toMessage({
            user: game.user.id,
            speaker: ChatMessage.getSpeaker({actor: this.actor}),
            flavor: `<span class="outcome ${outcome}"><h2 class="dice-value">${dice_value}</h2><h3>${skill_name}</h3></span>`
        });
    }

    /* -------------------------------------------- */

    /** @inheritdoc */
    _getSubmitData(updateData) {
        let formData = super._getSubmitData(updateData);
        return formData;
    }
}