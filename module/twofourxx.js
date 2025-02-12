import init, { add_numbers } from "../twofourxx.js";
const { HTMLField, NumberField, SchemaField, StringField } = foundry.data.fields;

/* -------------------------------------------- */
/*  Actor Models                                */
/* -------------------------------------------- */

class ActorDataModel extends foundry.abstract.TypeDataModel {
    static defineSchema() {
        // All Actors have resources.
        return {
            resources: new SchemaField({
                health: new SchemaField({
                    min: new NumberField({ required: true, integer: true, min: 0, initial: 0 }),
                    value: new NumberField({ required: true, integer: true, min: 0, initial: 10 }),
                    max: new NumberField({ required: true, integer: true, min: 0, initial: 10 })
                }),
                power: new SchemaField({
                    min: new NumberField({ required: true, integer: true, min: 0, initial: 0 }),
                    value: new NumberField({ required: true, integer: true, min: 0, initial: 1 }),
                    max: new NumberField({ required: true, integer: true, min: 0, initial: 3 })
                })
            })
        };
    }
}

class ImportantActorDataModel extends ActorDataModel {
    static defineSchema() {
        // Only important Actors have a background and hair color.
        return {
            ...super.defineSchema(),
            background: new SchemaField({
                biography: new HTMLField({ required: true, blank: true }),
                hairColor: new StringField({ required: true, blank: true })
            })
        };
    }
}

export class HeroDataModel extends ImportantActorDataModel {
    static defineSchema() {
        return {
            ...super.defineSchema(),
            goodness: new SchemaField({
                value: new NumberField({ required: true, integer: true, min: 0, initial: 5 }),
                max: new NumberField({ required: true, integer: true, min: 0, initial: 10 })
            }),
            level: new NumberField({ required: true, integer: true, min: 0, initial: 0, max: 30 })
        };
    }
}

export class VillainDataModel extends ImportantActorDataModel {
    static defineSchema() {
        return {
            ...super.defineSchema(),
            wickedness: new SchemaField({
                value: new NumberField({ required: true, integer: true, min: 0, initial: 5 }),
                max: new NumberField({ required: true, integer: true, min: 0, initial: 100 })
            })
        };
    }
}
export class SystemActor extends Actor {
    async applyDamage(damage) {
        // Always take a minimum of 1 damage, and round to the nearest integer.
        damage = Math.round(Math.max(1, damage));

        // Update the health.
        const { value } = this.system.resources.health;
        await this.update({ "system.resources.health.value": value - damage });

        // Log a message.
        await ChatMessage.implementation.create({
            content: `${this.name} took ${damage} damage!`
        });
    }
}

export class SystemItem extends Item {
    get isFree() {
        return this.price < 1;
    }
}

CONFIG.Actor.documentClass = SystemActor;
CONFIG.Item.documentClass = SystemItem;

Hooks.on("ready", async () => {
    await init(); // Initialize WASM module
    console.log("WASM Loaded: 10 + 20 =", add_numbers(10, 20));
});
